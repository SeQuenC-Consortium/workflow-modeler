import {HeaderButton} from '@bpmn-io/properties-panel';
import {useService} from 'bpmn-js-properties-panel';
import React from 'react';
import ArtifactWizardModal from './ArtifactWizardModal';
import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import './artifact-modal.css';

/**
 * Entry to display the button which opens the Artifact Wizard, a dialog which allows to upload
 */
export function ArtifactUpload(props) {
    const {element} = props;
    const translate = useService('translate');

    const onClick = () => {
        // render config button and pop-up menu
        console.log("Button Clicked");
        const mainDiv = document.getElementById("main-div");
        const existingDiv = document.getElementById("wizard-div");
        if (existingDiv) {
            existingDiv.parentNode.removeChild(existingDiv);
          }
        const wizardDiv = document.createElement("div");
        wizardDiv.id = "wizard-div";
        mainDiv.appendChild(wizardDiv);
        const root = createRoot(document.getElementById("wizard-div"));
        root.render(<Modal/>);
    };

    return HeaderButton({
        element,
        id: 'artifact-upload-button',
        text: translate('Upload Artifact'),
        description: translate('Upload Artifact'),
        className: "qwm-artifact-upload-btn",
        children: translate('Upload Artifact'),
        onClick,
    });
}

function Modal() {
    const [showModal, setShowModal] = useState(true);

    function handleWizardClosed() {
        setShowModal(false);
    }

    return (
        <div>
            {showModal && (
                <ArtifactWizardModal onClose={handleWizardClosed}/>
            )}
        </div>
    );
}