/**
 * Copyright (c) 2023 Institute of Architecture of Application Systems -
 * University of Stuttgart
 *
 * This program and the accompanying materials are made available under the
 * terms the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-unused-vars */
import React, {useState} from 'react';
import Modal from '../../../../editor/ui/modal/Modal';
import './artifact-modal.css';
import '../../../../editor/config/config-modal.css';
import { createArtifactTemplateWithFile, createServiceTemplateWithNodeAndArtifact, getNodeTypeQName, getArtifactTemplateInfo, insertTopNodeTag} from '../../winery-manager/winery-handler';
import { set } from 'min-dash';
import NotificationHandler from '../../../../editor/ui/notifications/NotificationHandler';


// polyfill upcoming structural components
const Title = Modal.Title;
const Body = Modal.Body;
const Footer = Modal.Footer;


const jquery = require('jquery');
/**
 * Configuration modal of the editor which displays a set of given configTabs. used to display customized tabs of the
 * plugins to allow them the configurations of their plugin configurations during runtime.
 *
 * @param onClose Function called when the modal is closed.
 * @returns {JSX.Element} The modal as React component
 * @constructor
 */
export default function ArtifactWizardModal(props) {
    const [uploadFile, setUploadFile] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [selectedTab, setSelectedTab] = useState("artifact");
    const [selectedOption, setSelectedOption] = useState("");
    const [selectedOptionName, setSelectedOptionName] = useState("");
    const [options, setOptions] = useState([]);
    const [artifactTypes, setArtifactTypes] = useState([]);
    const [acceptTypes, setAcceptTypes] = useState('');
    const {onClose, element, wineryEndpoint} = props;

    console.log(element);

    async function updateArtifactSelect() {
      jquery.ajax({
          url: wineryEndpoint + "/artifacttypes/?includeVersions=true",
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          success: function(response) {
            var newOptions = [];
            for (var i = 0; i < response.length; i++) {
              if (response[i].name.includes("WAR") || response[i].name.includes("PythonArchive")) {
                newOptions.push(<ArtifactSelectItem value={response[i].qName} name={response[i].name}/>); // Add the option to the select element
              }
              setOptions(newOptions);
              setArtifactTypes(response);
            }
          },
      });
  }

  const allowedFileTypes = {
    zip: '.tar.gz',
    war: '.war',
  };

  async function createServiceTemplate() {
    const notificationId = NotificationHandler.getInstance().displayNotification({
        type: 'info',
        title: 'Uploading Artifact...',
        content: 'Uploading artifact for ' + element.id,
        duration: 1000*60*60 // very long time out because this notification gets closed after the API calls are finished
    });
    console.log(notificationId);
    const taskName = element.businessObject.name ? element.businessObject.name : "";
    const artifactTemplateAddress = await createArtifactTemplateWithFile(taskName + "ArtifactTemplate" + "-" + element.id, selectedOption, uploadFile);
    const artifactTemplateInfo = await getArtifactTemplateInfo(artifactTemplateAddress);
    const artifactTemplateQName = artifactTemplateInfo.serviceTemplateOrNodeTypeOrNodeTypeImplementation[0].type;
    const nodeTypeQName = await getNodeTypeQName(selectedOption);
    const serviceTemplateAddress = await createServiceTemplateWithNodeAndArtifact(taskName + "ServiceTemplate" + "-" + element.id, nodeTypeQName, taskName + "Node" + "-" + element.id, artifactTemplateQName, taskName + "Artifact" + "-"  + element.id, selectedOption);
    element.businessObject.deploymentModelUrl = "{{ wineryEndpoint }}/servicetemplates/" + serviceTemplateAddress + "?csar";
    const number = await insertTopNodeTag(serviceTemplateAddress, nodeTypeQName);

    NotificationHandler.getInstance().closeNotification(notificationId);
    setTimeout(function(){NotificationHandler.getInstance().displayNotification({
      type: 'info',
      title: 'Service Template Created',
      content: 'Service Template including Nodetype with attatched Deployment Artifact of chosen type was successfully created.',
      duration: 4000
    });}, 200); // Timeout is needed here because there is a shared global list of notifications that does not get updated immediately
    document.getElementById("properties").style.display = 'none';
    setTimeout(function(){
      document.getElementById("properties").style.display = 'block';
    },1);

  }


    const onSubmit = () => {
        // Process the uploaded file or text input here
        console.log('Uploaded file:', uploadFile);
        console.log('Text input:', textInput);
        if (selectedTab === "artifact") {
          if (uploadFile !== null && selectedOption !== "") {
            createServiceTemplate();
            onClose();
          } else {
            onClose();
            setTimeout(function(){
              NotificationHandler.getInstance().displayNotification({
                type: 'error',
                title: 'No file selected!',
                content: 'Please select a file to create an artifact!',
                duration: 4000
              });
            },300);

          }
        }

        // Call close callback
        
    };

    const handleOptionChange = (e) => {
      console.log(e.target);
      setSelectedOption(e.target.value);
      setSelectedOptionName(artifactTypes.find(x => x.qName === e.target.value).name);
      if (e.target.value.includes("WAR")) {
        setAcceptTypes(allowedFileTypes.war);
      } else if (e.target.value.includes("PythonArchive")) {
        setAcceptTypes(allowedFileTypes.zip);
      }
    };

    const isOptionSelected = selectedOption !== "";

    if (artifactTypes.length === 0) {
      updateArtifactSelect();
    }
    

    return (
        <Modal onClose={onClose}>
            <Title>Artifact Wizard</Title>

            <Body>
                <div className="qwm-spaceAbove">
                    <div className="tabButtonsContainer ">
                        <div
                            className={`tab ${selectedTab === "artifact" ? "active" : ""}`}
                            onClick={() => setSelectedTab("artifact")}
                        >
                            Local File
                        </div>
                        <div
                            className={`tab ${selectedTab === "docker" ? "active" : ""}`}
                            onClick={() => setSelectedTab("docker")}
                        >
                            Docker Image
                        </div>
                    </div>

                    {selectedTab === "artifact" && (
                        <div className={`tab-content ${selectedTab === "artifact" ? "active" : ""} wizard-tab-content`}>
                            <div className='wizard-artifact-div'>
                              <div className='wizard-artifact-selector'>
                                <label  className="wizard-properties-panel-label">Select an Option:</label>
                                <select id= "wizard-artifact-select" value={selectedOption} onChange={handleOptionChange} className="wizard-properties-panel-input">
                                  <option value="" disabled={isOptionSelected}>-- Select --</option>
                                  {options}
                                </select>
                              </div>
                              {isOptionSelected && (
                                <div className="wizard-file-upload">
                                  <div>
                                    <label className="wizard-properties-panel-label">{`Upload ${selectedOptionName.charAt(0).toUpperCase() + selectedOptionName.slice(1)}:`}</label>
                                    <input
                                      className=".wizard-file-upload-button"
                                      type="file"
                                      id="fileUpload"
                                      accept={acceptTypes}
                                      onChange={(e) => setUploadFile(e.target.files[0])}
                                    />
                                  </div>
                                </div>
                              )}
                              </div>
                      </div>
                    )}
                    {selectedTab === "docker" && (
                        <div className={`tab-content ${selectedTab === "docker" ? "active" : ""} wizard-tab-content`}>
                            <label>Image ID:</label>
                            <input
                                type="string"
                                className="dockerimage-input"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </Body>

            <Footer>
                <div id="wizardFormButtons">
                    <button type="button" className="qwm-btn qwm-btn-primary" form="configForm" onClick={onSubmit}>
                        Create
                    </button>
                    <button type="button" className="qwm-btn qwm-btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </Footer>
        </Modal>
    );
}

function ArtifactSelectItem(props) {
  const {value, name} = props;
  return (
    <option value={value}>{name}</option>
  )
}
