import {HeaderButton} from '@bpmn-io/properties-panel';
import {useService} from 'bpmn-js-properties-panel';
import React from 'react';
import ArtifactWizardModal from './ArtifactWizardModal';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';

/**
 * Entry to display the button which opens the Artifact Wizard, a dialog which allows to upload 
 */
export function ArtifactUpload(props) {
    const {element} = props;
    const translate = useService('translate');

    const onClick = () => {
        // render config button and pop-up menu
        console.log("Button Clicked");
        const root = createRoot(document.getElementById("wizardDiv"));
        root.render(<Modal />);
      };

    
    return HeaderButton({
        element,
        id: 'deployment-data-button',
        text: translate('Deployment Data'),
        description: 'ArtifactWizard',
        style: { padding: '3px 6px 2px',  margin: '2px 32px 6px 12px'},
        className: "qwm-properties-btn",
        children: 'Artifact Wizard',
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
          <ArtifactWizardModal onClose={handleWizardClosed} />
        )}
      </div>
    );
  }



    
