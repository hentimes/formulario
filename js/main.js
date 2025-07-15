import { loadModules } from './_module-loader.js';
import { DOM, setElements } from './_dom-elements.js';
import {
    initModals,
    initStepNavigation,
    initFormEventListeners,
    initDynamicFields,
    initFormSubmission,
    loadProgress,
    handleFieldInteraction,
    updateActionButtonState
} from './_form-logic.js';
import { openModal } from './_ui-helpers.js';

function initializeFormApp() {
    
    setElements();

    // Las funciones de inicialización que configuran los listeners
    initModals();
    initStepNavigation();
    initFormEventListeners(handleFieldInteraction);
    initDynamicFields();
    initFormSubmission();
    
    // Carga el progreso y abre el modal
    loadProgress();
    openModal('formModal');
    updateActionButtonState();
}

document.addEventListener('DOMContentLoaded', () => {
    loadModules().then(initializeFormApp).catch(error => {
        console.error("No se pudo inicializar la aplicación:", error);
    });
});