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
import React, { useState }  from 'react';
import Modal from '../../../../editor/ui/modal/Modal';
import '../../../../editor/config/config-modal.css'


// polyfill upcoming structural components
const Title = Modal.Title || (({children}) => <h2>{children}</h2>);
const Body = Modal.Body || (({children}) => <div>{children}</div>);
const Footer = Modal.Footer || (({children}) => <div>{children}</div>);

/**
 * Configuration modal of the editor which displays a set of given configTabs. used to display customized tabs of the
 * plugins to allow them the configurations of their plugin configurations during runtime.
 *
 * @param onClose Function called when the modal is closed.
 * @returns {JSX.Element} The modal as React component
 * @constructor
 */
export default function ArtifactWizardModal({onClose}) {
    const [uploadFile, setUploadFile] = useState(null);
    const [textInput, setTextInput] = useState('');

    const onSubmit = () => {
        // Process the uploaded file or text input here
        console.log('Uploaded file:', uploadFile);
        console.log('Text input:', textInput);
    
        // Call close callback
        onClose();
      };

    return (
        <Modal onClose={onClose}>
            <Title>Artifact Wizard</Title>
        
            <Body>
                <div className="qwm-spaceAbove">
                    <h3>Artifact Upload</h3>
                    <table>
                        <tbody>
                        <tr className="spaceUnder">
                            <td align="right">Upload Artifact:</td>
                            <td align="left">
                            <input
                                type="file"
                                id="fileUpload"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                            />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <h3>Reference Docker Image</h3>
                    <table>
                        <tbody>
                        <tr className="spaceUnder">
                            <td align="right">Image ID:</td>
                            <td align="left">
                            <input
                                type="string"
                                id="textInput"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                            />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
          </Body>
    
          <Footer>
            <div id="wizardFormButtons">
              <button type="button" className="qwm-btn qwm-btn-primary" form="configForm" onClick={onSubmit}>
                Confirm
              </button>
              <button type="button" className="qwm-btn qwm-btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </Footer>
        </Modal>
      );
    }