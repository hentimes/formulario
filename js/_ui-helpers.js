// Funciones dedicadas a la manipulación de la interfaz de usuario (UI).
import { DOM } from './_dom-elements.js';

let formStepsNum = 0; // Estado local para el paso actual

export function getFormStepNum() {
    return formStepsNum;
}

export function setFormStepNum(num) {
    formStepsNum = num;
}

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('is-visible');
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('is-visible');
        if (modalId === 'formModal') {
            document.getElementById('welcome-step').classList.remove('hidden');
            document.getElementById('main-form-container').classList.add('hidden');
            document.getElementById('thank-you-step').classList.add('hidden');
            DOM.leadForm.reset();
            localStorage.removeItem('formProgress'); // Usar la constante si se importa
            DOM.consentCheckbox.checked = false;
            DOM.continueBtn.disabled = true;
            formStepsNum = 0;
            updateFormView();
            document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
            document.querySelectorAll('.error-message.visible').forEach(el => el.classList.remove('visible'));
            const submissionError = document.getElementById('submission-error');
            if (submissionError) submissionError.classList.remove('visible');
            const header = document.querySelector('.modal-header');
            if(header) header.classList.remove('scrolled');
        }
    }
}

export function updateProgressbar() {
    DOM.progressSteps.forEach((step, idx) => {
        step.classList.toggle("active", idx <= formStepsNum);
    });
    const progressPercentage = formStepsNum === 0 ? 0 : (formStepsNum / (DOM.progressSteps.length - 1)) * 100;
    DOM.progressLine.style.width = `${progressPercentage}%`;
}

export function updateFormView(direction = 'next') {
    DOM.formSteps.forEach(step => {
        step.classList.remove("active", "slide-in-right", "slide-in-left");
    });
    
    const currentStep = DOM.formSteps[formStepsNum];
    currentStep.classList.add("active");
    if (direction === 'next') {
        currentStep.classList.add('slide-in-right');
    } else {
        currentStep.classList.add('slide-in-left');
    }
    
    currentStep.querySelector("input, select")?.focus();
    updateProgressbar();
    // La actualización del botón se deja en la lógica principal
}

export function showFilePreview(file) {
    const previewWrapper = document.getElementById('file-preview');
    const uploadLabel = document.querySelector('.file-upload-label');
    const errorDiv = document.getElementById('error-pdf_file');

    errorDiv.classList.remove('visible');
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    
    previewWrapper.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = 'fas fa-file-pdf';
    const text = document.createElement('span');
    text.textContent = `${file.name} (${fileSize} MB)`;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-file-btn';
    removeBtn.setAttribute('aria-label', 'Eliminar archivo');
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', () => {
        document.getElementById('pdf_file').value = '';
        previewWrapper.classList.add('hidden');
        previewWrapper.innerHTML = '';
        uploadLabel.classList.remove('hidden');
    });

    previewWrapper.append(icon, text, removeBtn);
    previewWrapper.classList.remove('hidden');
    uploadLabel.classList.add('hidden');
}