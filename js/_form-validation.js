// Contiene toda la lógica de validación del formulario.
import { DOM } from './_dom-elements.js';
import { getFormStepNum, updateFormView } from './_ui-helpers.js';

export function validateField(field) {
    const formGroup = field.closest('.form-group, .radio-group');
    const errorDiv = formGroup.querySelector('.error-message');
    if (!formGroup) return true;

    let fieldIsValid = true;
    if (!field.hasAttribute('required')) return true;

    const isRadio = field.type === 'radio';
    const isInvalidText = !isRadio && (!field.checkValidity() || field.value.trim() === '');
    const isInvalidRadio = isRadio && !document.querySelector(`input[name="${field.name}"]:checked`);

    if (isInvalidText || isInvalidRadio) {
        fieldIsValid = false;
        formGroup.classList.add('input-error');
        if (errorDiv) errorDiv.classList.add('visible');
    } else {
        formGroup.classList.remove('input-error');
        if (errorDiv) errorDiv.classList.remove('visible');
    }
    
    return fieldIsValid;
}

export function isCurrentStepValid() {
    const formStepsNum = getFormStepNum();
    const currentStep = DOM.formSteps[formStepsNum];
    const fields = currentStep.querySelectorAll('input[required], select[required]');
    for (const field of fields) {
        const conditionalParent = field.closest('.conditional-isapre-fields, #afp-details');
        if (conditionalParent && !conditionalParent.classList.contains('is-visible')) continue;
        if (!validateField(field)) return false;
    }
    return true;
}

export function isFullFormValid() {
    let isAllValid = true;
    let firstInvalidField = null;
    let firstInvalidStep = -1;

    DOM.formSteps.forEach((step, index) => {
        const fields = step.querySelectorAll('input[required], select[required]');
        for (const field of fields) {
            const conditionalParent = field.closest('.conditional-isapre-fields, #afp-details');
            if (conditionalParent && !conditionalParent.classList.contains('is-visible')) continue;
            
            if (!validateField(field)) {
                isAllValid = false;
                if (firstInvalidField === null) {
                    firstInvalidField = field;
                    firstInvalidStep = index;
                }
            }
        }
    });
    
    if (!isAllValid && firstInvalidStep !== -1) {
        setFormStepNum(firstInvalidStep); // Necesitamos una forma de actualizar el estado
        updateFormView('prev'); 
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isAllValid;
}