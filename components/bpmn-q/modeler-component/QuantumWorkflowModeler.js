// import "./modeler-canvas/ModelerCanvas.js";
import "./css/modeler.css"
import BpmnModeler from "bpmn-js/lib/Modeler";
import BpmnPalletteModule from "bpmn-js/lib/features/palette";
import customModdleExtension from "./custom.json";
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';

class QuantumWorkflowModeler extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // const shadowRoot = this.attachShadow({mode: 'open'});
        this.innerHTML = `<div id="canvas" style="height: 100%; width: 100%">
        
                          </div>`;
        // const modeler = this.getAttribute('modeler')
        // const containerId = '#properties-panel';// this.getAttribute('container')
        // const $modelerContainer = document.querySelector('#modeler-container');
        // const $propertiesContainer = document.querySelector('#properties-container');

        const diagramXML = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">\n' +
            '  <bpmn2:process id="Process_1" isExecutable="false">\n' +
            '    <bpmn2:startEvent id="StartEvent_1"/>\n' +
            '  </bpmn2:process>\n' +
            '  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n' +
            '    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">\n' +
            '      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">\n' +
            '        <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>\n' +
            '      </bpmndi:BPMNShape>\n' +
            '    </bpmndi:BPMNPlane>\n' +
            '  </bpmndi:BPMNDiagram>\n' +
            '</bpmn2:definitions>';

        // const test = BpmnJS()

        const modelerContainerId = '#canvas' //this.getAttribute('modeler-container');
        const propertiesContainerId = this.getAttribute('properties-container');

        const modeler = new BpmnModeler({
            container: modelerContainerId,
            BpmnPalletteModule,
            moddleExtensions: {
                custom: customModdleExtension
            },
            keyboard: {
                bindTo: document
            }
        });

        async function openDiagram(xml) {

            try {

                await modeler.importXML(xml);

                // container
                //     .removeClass('with-error')
                //     .addClass('with-diagram');
            } catch (err) {

                // container
                //     .removeClass('with-diagram')
                //     .addClass('with-error');
                //
                // container.find('.error pre').text(err.message);

                console.error(err);
            }
        }

        openDiagram(diagramXML)

        // const propertiesPanel = new PropertiesPanel({
        //     container: propertiesContainerId,
        //     modeler
        // });

        // modeler.importXML(diagramXML);
    }
}

window.customElements.define('quantum-workflow', QuantumWorkflowModeler);