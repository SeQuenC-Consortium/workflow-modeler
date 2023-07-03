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
export function ArtifactUpload({element, wineryEndpoint}) {
    const translate = useService('translate');
    const onClick = () => {
        // render config button and pop-up menu
        console.log("Button Clicked");
        const root = createRoot(document.getElementById("wizardDiv"));
        root.render(<WizardModal element={element} wineryEndpoint={wineryEndpoint}/>);
    };

    return HeaderButton({
        element,
        id: 'deployment-data-button',
        text: translate('Deployment Data'),
        description: 'ArtifactWizard',
        className: "wizard-button",
        children: 'Artifact Wizard',
        onClick,
    });
}

export function WizardModal(props) {
    const [showModal, setShowModal] = useState(true);
    const {element, wineryEndpoint} = props;

    function handleWizardClosed() {
        setShowModal(false);
    }

    return (
        <div>
            {showModal && (
                <ArtifactWizardModal onClose={handleWizardClosed} element={element} wineryEndpoint={wineryEndpoint}/>
            )}
        </div>
    );
}