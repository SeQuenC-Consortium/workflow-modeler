import {
  getServiceTaskLikeBusinessObject
} from './ImplementationTypeUtils';
import {getExtensionElementsList} from "./ExtensionElementsUtil";
import {getImplementationType} from "./ImplementationTypeHelperExtension";

export function areConnectorsSupported(element) {
  const businessObject = getServiceTaskLikeBusinessObject(element);
  return businessObject && getImplementationType(businessObject) === 'connector';
}

export function getConnectors(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Connector');
}

export function getConnector(element) {
  const businessObject = getServiceTaskLikeBusinessObject(element);
  const connectors = getConnectors(businessObject);

  return connectors[0];
}