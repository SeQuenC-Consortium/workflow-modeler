import {
  black,
  getRoundRectPath, getStrokeColor
} from 'bpmn-js/lib/draw/BpmnRenderUtil';

import {
  is,
} from 'bpmn-js/lib/util/ModelUtil';

import {
  createLine,
} from 'diagram-js/lib/util/RenderUtil';

import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer';

import buttonIcon from 'raw-loader!../resources/show-deployment-button.svg';
import { drawTaskSVG } from '../../../editor/util/RenderUtilities';
import * as config from '../framework-config/config-manager';
import NotificationHandler from '../../../editor/ui/notifications/NotificationHandler';
import { append as svgAppend, attr as svgAttr, create as svgCreate, select } from 'tiny-svg';

const HIGH_PRIORITY = 14001;
const TASK_BORDER_RADIUS = 2;
const SERVICE_TASK_TYPE = 'bpmn:ServiceTask';
const NODE_TEMPLATE_TYPE = 'opentosca:NodeTemplate';
const RELATIONSHIP_TEMPLATE_TYPE = 'opentosca:RelationshipTemplate';
const DEPLOYMENT_GROUP_ID = 'deployment';

export default class OpenToscaRenderer extends BpmnRenderer {
  constructor (config, eventBus, styles, pathMap, canvas, textRenderer) {
    super(config, eventBus, styles, pathMap, canvas, textRenderer, HIGH_PRIORITY);

    // define render functions for planqk extension elements
    this.openToscaHandlers = {
      [SERVICE_TASK_TYPE]: function (self, parentGfx, element) {
        const task = self.renderer('bpmn:Task')(parentGfx, element);
        self.maybeAddShowDeploymentModelButton(parentGfx, element);
        return task;
      },
      [NODE_TEMPLATE_TYPE]: function (self, parentGfx, element) {
        const groupDef = svgCreate('g');
        svgAttr(groupDef, { transform: `matrix(1, 0, 0, 1, ${element.x}, ${element.y})` });
        const rect = svgCreate('rect', {
          width: element.width,
          height: element.height,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          stroke: '#777777',
          strokeWidth: 2,
          strokeDasharray: 4,
          fill: '#DDDDDD'
        });

        svgAppend(groupDef, rect);

        const text = textRenderer.createText(element.name, {
          box: {
            width: element.width,
            height: element.height,
          },
          align: 'center-middle'
        });
        svgAppend(groupDef, text);
        parentGfx.append(groupDef);
      },
      [RELATIONSHIP_TEMPLATE_TYPE]: function (self, parentGfx, element) {
        const line = createLine(element.waypoints, styles.computeStyle({}, ['no-fill'], {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          stroke: '#777777',
          strokeWidth: 2,
          strokeDasharray: 4
        }), 5);
        parentGfx.prepend(line);
      }
    };
  }

  drawRelationshipTemplate (parentGfx, element) {
    super.drawConnectionSegments(parentGfx, element.waypoints, {
      markerEnd: super.marker('sequenceflow-end', '#000000', '#000000'),
      stroke: '#000000'
    });
  }

  maybeAddShowDeploymentModelButton (parentGfx, element) {
    let deploymentModelUrl = element.businessObject.get('opentosca:deploymentModelUrl');
    if (!deploymentModelUrl) return;
    if (deploymentModelUrl.startsWith('{{ wineryEndpoint }}')) {
      deploymentModelUrl = deploymentModelUrl.replace('{{ wineryEndpoint }}', config.getWineryEndpoint());
    }
    console.log('render:', deploymentModelUrl);
    const button = drawTaskSVG(parentGfx, {
      transform: 'matrix(0.3, 0, 0, 0.3, 85, 65)',
      svg: buttonIcon
    }, null, true);
    button.style['pointer-events'] = 'all';
    button.style['cursor'] = 'pointer';
    button.addEventListener('click', (e) => {
      element.showDeploymentModel = !element.showDeploymentModel;
      e.preventDefault();
      if (element.showDeploymentModel) {
        this.showDeploymentModel(parentGfx, element, deploymentModelUrl);
      } else {
        select(parentGfx, '#' + DEPLOYMENT_GROUP_ID).remove();
      }
    });
    if (element.showDeploymentModel) {
      this.showDeploymentModel(parentGfx, element, deploymentModelUrl);
    }
  }

  async showDeploymentModel (parentGfx, element, deploymentModelUrl) {
    if (!element.deploymentModelTopology || element.loadedDeploymentModelTopology !== deploymentModelUrl) {
      try {
        const topology = await fetch(deploymentModelUrl.replace('?csar', 'topologytemplate'))
          .then(res => res.json());
        element.loadedDeploymentModelTopology = deploymentModelUrl;
        element.deploymentModelTopology = topology;
      } catch (e) {
        element.showDeploymentModel = false;
        console.error(element.showDeploymentModel);
        NotificationHandler.getInstance().displayNotification({
          type: 'warning',
          title: 'Could not load topology',
          content: 'An unexpected error occurred during loading the deployments models topology.',
          duration: 2000
        });
      }
    }
    const groupDef = svgCreate('g', { id: DEPLOYMENT_GROUP_ID });
    parentGfx.append(groupDef);

    const { nodeTemplates, relationshipTemplates } = element.deploymentModelTopology;

    let ySubtract = Math.min(...nodeTemplates.map(({ y }) => y)) - 80;
    // Center horizontal around
    let xSubtract = Math.min(...nodeTemplates.map(({ x }) => x));
    const xMax = Math.max(...nodeTemplates.map(({ x }) => x));
    xSubtract = xSubtract + (xMax - xSubtract) / 2;

    const positions = new Map();
    for (let nodeTemplate of nodeTemplates) {
      const position = {
        x: parseInt(nodeTemplate.x) - xSubtract,
        y: parseInt(nodeTemplate.y) - ySubtract,
      };
      this.drawShape(groupDef, {
        type: NODE_TEMPLATE_TYPE,
        name: nodeTemplate.name,
        properties: nodeTemplate.properties,
        width: 90,
        height: 60,
        ...position
      });
      positions.set(nodeTemplate.id, position);
    }

    for (let relationshipTemplate of relationshipTemplates) {
      const start = positions.get(relationshipTemplate.sourceElement.ref);
      const end = positions.get(relationshipTemplate.targetElement.ref);
      const center = ({ x, y }) => ({ x: x + 45, y: y + 30 });

      this.drawConnection(groupDef, {
        type: RELATIONSHIP_TEMPLATE_TYPE,
        waypoints: [
          center(start),
          center(end)
        ]
      });
    }
  }

  renderer (type) {
    return this.handlers[type];
  }

  canRender (element) {
    // only return true if handler for rendering is registered
    return this.openToscaHandlers[element.type];
  }

  drawShape (parentNode, element) {
    if (element.type in this.openToscaHandlers) {
      const h = this.openToscaHandlers[element.type];
      return h(this, parentNode, element);
    }
    return super.drawShape(parentNode, element);
  }

  drawConnection (parentNode, element) {
    if (element.type in this.openToscaHandlers) {
      const h = this.openToscaHandlers[element.type];
      return h(this, parentNode, element);
    }
    return super.drawConnection(parentNode, element);
  }

  getShapePath (shape) {
    if (is(shape, SERVICE_TASK_TYPE)) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }

    return super.getShapePath(shape);
  }
}

OpenToscaRenderer.$inject = [
  'config',
  'eventBus',
  'styles',
  'pathMap',
  'canvas',
  'textRenderer'
];



