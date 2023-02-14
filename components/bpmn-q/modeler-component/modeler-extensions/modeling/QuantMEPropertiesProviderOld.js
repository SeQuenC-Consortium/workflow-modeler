/**
 * Copyright (c) 2021 Institute of Architecture of Application Systems -
 * University of Stuttgart
 *
 * This program and the accompanying materials are made available under the
 * terms the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';
// import CamundaPropertiesProvider from 'bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider';
import * as consts from '../quantme/Constants';
import { ServiceTaskDelegateProps } from './service-tasks/ServiceTaskDelegateProps';

let QuantMEPropertyEntryHandler = require('./properties-provider/QuantMEPropertyEntryHandler');

/**
 * This class extends the default PropertiesActivator with the properties of the newly introduced QuantME task types
 */
export default class QuantMEPropertiesProvider extends PropertiesActivator {
  constructor(eventBus, canvas, bpmnFactory, elementRegistry, elementTemplates, translate) {
    super(eventBus);
    this.camundaPropertiesProvider = new CamundaPropertiesProvider(eventBus, canvas, bpmnFactory, elementRegistry, elementTemplates, translate);
    this.bpmnFactory = bpmnFactory;
    this.translate = translate;

    // subscribe to config updates to retrieve the currently defined Winery endpoint
    const self = this;
    eventBus.on('config.updated', function(config) {
      self.wineryEndpoint = config.wineryEndpoint;
    });
  }

  getTabs(element) {
    const tabs = this.camundaPropertiesProvider.getTabs(element);

    // add properties of QuantME tasks to panel
    if (element.type && element.type.startsWith('quantme:')) {
      handleQuantMETasks(element, tabs, this.translate);
    }

    // update ServiceTasks with the deployment extension
    if (element.type && element.type === 'bpmn:ServiceTask') {
      handleServiceTask(element, tabs, this.translate, this.bpmnFactory, this.wineryEndpoint);
    }

    return tabs;
  }
}

/**
 * Find an element in the given list by id
 *
 * @param list the list with elements to search for
 * @param id the id of the searched element
 * @return {{element: *, index: number}|null} the element and its id in the list if found, null otherwise
 */
function findById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return { element: list[i], index: i };
    }
  }
  return null;
}

/**
 * Update the given set of property panel tabs with the ServiceTask extension
 *
 * @param element the element the properties tabs should be generated for
 * @param tabs the set of tabs generated by the CamundaPropertiesProvider for the given element
 * @param translate the translate object required to translate the labels
 * @param bpmnFactory the bpmn factory object to create new elements
 * @param wineryEndpoint the endpoint of the Winery instance to retrieve deployment models from
 * @return the updated set of tabs with the ServiceTask extension
 */
function handleServiceTask(element, tabs, translate, bpmnFactory, wineryEndpoint) {

  // search general tab
  let generalTabWithId = findById(tabs, 'general');
  if (generalTabWithId == null) {
    console.log('Unable to find \'general\' tab for element: ', element);
    return tabs;
  }
  const generalTab = generalTabWithId.element;

  // search details group
  let detailsGroupWithId = findById(generalTab.groups, 'details');
  if (detailsGroupWithId == null) {
    console.log('Unable to find \'general\' tab for element: ', element);
    return tabs;
  }
  const detailsGroup = detailsGroupWithId.element;

  // reset entries from the details group
  detailsGroup.entries = [];

  // add new entries comprising the extension
  ServiceTaskDelegateProps(detailsGroup, element, bpmnFactory, translate, wineryEndpoint);
}

/**
 * Update the given set of property panel tabs with the QuantME specific properties
 *
 * @param element the element the properties tabs should be generated for
 * @param tabs the set of tabs generated by the CamundaPropertiesProvider for the given element
 * @param translate the translate object required to translate the labels
 * @return the updated set of tabs with the added QuantME specific properties
 */
function handleQuantMETasks(element, tabs, translate) {

  // search for general tab in properties to add QuantME properties
  let generalTabWithId = findById(tabs, 'general');

  if (generalTabWithId == null) {
    console.log('Unable to find \'general\' tab for element: ', element);
    return tabs;
  }
  const generalTab = generalTabWithId.element;
  const generalTabId = generalTabWithId.index;

  // add required properties to general tab
  const quantMEGroup = {
    id: 'quantme',
    label: translate('QuantME Properties'),
    entries: []
  };
  addQuantMEEntries(quantMEGroup, element, translate);
  generalTab.groups.push(quantMEGroup);
  tabs[generalTabId] = generalTab;

  return tabs;
}

/**
 * Add the property entries for the QuantME attributes to the given group
 *
 * @param group the group to add the entries to
 * @param element the QuantME element
 * @param translate utility to translate
 */
function addQuantMEEntries(group, element, translate) {
  switch (element.type) {
  case consts.QUANTUM_COMPUTATION_TASK:
    addQuantumComputationTaskEntries(group, translate);
    break;
  case consts.QUANTUM_CIRCUIT_LOADING_TASK:
    addQuantumCircuitLoadingTaskEntries(group, translate);
    break;
  case consts.DATA_PREPARATION_TASK:
    addDataPreparationTaskEntries(group, translate);
    break;
  case consts.ORACLE_EXPANSION_TASK:
    addOracleExpansionTaskEntries(group, translate);
    break;
  case consts.QUANTUM_CIRCUIT_EXECUTION_TASK:
    addQuantumCircuitExecutionTaskEntries(group, translate);
    break;
  case consts.READOUT_ERROR_MITIGATION_TASK:
    addReadoutErrorMitigationTaskEntries(group, translate);
    break;
  case consts.QUANTUM_HARDWARE_SELECTION_SUBPROCESS:
    addHardwareSelectionSubprocessEntries(group, translate);
    break;
  default:
    console.log('Unsupported QuantME element of type: ', element.type);
  }
}

function addQuantumComputationTaskEntries(group, translate) {

  // add algorithm and provider attributes
  QuantMEPropertyEntryHandler.AlgorithmEntry(group, translate);
  QuantMEPropertyEntryHandler.addProviderEntry(group, translate);
}

function addQuantumCircuitLoadingTaskEntries(group, translate) {

  // add quantumCircuit and url attributes
  QuantMEPropertyEntryHandler.addQuantumCircuitEntry(group, translate);
  QuantMEPropertyEntryHandler.addUrlEntry(group, translate);
}

function addDataPreparationTaskEntries(group, translate) {

  // add encodingSchema and programmingLanguage attributes
  QuantMEPropertyEntryHandler.addEncodingSchemaEntry(group, translate);
  QuantMEPropertyEntryHandler.addProgrammingLanguageEntry(group, translate);
}

function addOracleExpansionTaskEntries(group, translate) {

  // add oracleId, oracleCircuit, oracleFunction and programmingLanguage attributes
  QuantMEPropertyEntryHandler.addOracleIdEntry(group, translate);
  QuantMEPropertyEntryHandler.addOracleCircuitEntry(group, translate);
  QuantMEPropertyEntryHandler.addOracleURLEntry(group, translate);
  QuantMEPropertyEntryHandler.addProgrammingLanguageEntry(group, translate);
}

function addQuantumCircuitExecutionTaskEntries(group, translate) {

  // add provider, qpu, shots and programmingLanguage attributes
  QuantMEPropertyEntryHandler.addProviderEntry(group, translate);
  QuantMEPropertyEntryHandler.addQpuEntry(group, translate);
  QuantMEPropertyEntryHandler.addShotsEntry(group, translate);
  QuantMEPropertyEntryHandler.addProgrammingLanguageEntry(group, translate);
}

function addReadoutErrorMitigationTaskEntries(group, translate) {

  // add provider, qpu, mitigation method, calibration method, shots, method-specific and restriction attributes
  QuantMEPropertyEntryHandler.addProviderEntry(group, translate);
  QuantMEPropertyEntryHandler.addQpuEntry(group, translate);
  QuantMEPropertyEntryHandler.addMitigationMethodEntry(group, translate);
  QuantMEPropertyEntryHandler.addCalibrationMethodEntry(group, translate);
  QuantMEPropertyEntryHandler.addShotsEntry(group, translate);
  QuantMEPropertyEntryHandler.addDNNHiddenLayersEntry(group, translate);
  QuantMEPropertyEntryHandler.addNeighborhoodRangeEntry(group, translate);
  QuantMEPropertyEntryHandler.addObjectiveFunctionEntry(group, translate);
  QuantMEPropertyEntryHandler.addOptimizerEntry(group, translate);
  QuantMEPropertyEntryHandler.addMaxAgeEntry(group, translate);
  QuantMEPropertyEntryHandler.addMaxCMSizeEntry(group, translate);
  QuantMEPropertyEntryHandler.addMaxREMCostsEntry(group, translate);

}

function addHardwareSelectionSubprocessEntries(group, translate) {

  // add providers, simulatorsAllowed, and selectionStrategy attributes
  QuantMEPropertyEntryHandler.addProvidersEntry(group, translate);
  QuantMEPropertyEntryHandler.addSimulatorsAllowedEntry(group, translate);
  QuantMEPropertyEntryHandler.addSelectionStrategyEntry(group, translate);
}

QuantMEPropertiesProvider.$inject = [
  'eventBus',
  'canvas',
  'bpmnFactory',
  'elementRegistry',
  'elementTemplates',
  'translate'
];
