// Centraliza las referencias a elementos del DOM para un fácil acceso y mantenimiento.

// Objeto que contendrá todos los elementos. Se exporta para ser usado en otros módulos.
export const DOM = {};

/**
 * Busca y asigna todos los elementos del DOM necesarios una vez que han sido cargados.
 * Esta función debe llamarse después de que los módulos HTML están en la página.
 */
export function setElements() {
    DOM.leadForm = document.getElementById('leadForm');
    DOM.formSteps = document.querySelectorAll(".form-step");
    DOM.progressSteps = document.querySelectorAll(".progress-step");
    DOM.progressLine = document.querySelector(".progress-bar .progress-line-fg");
    DOM.consentCheckbox = document.getElementById('consent-checkbox');
    DOM.continueBtn = document.getElementById('continue-btn');

    DOM.rutInput = document.getElementById('rut');
    DOM.estaturaSlider = document.getElementById('estatura');
    DOM.estaturaOutput = document.getElementById('estatura-output');
    DOM.pesoSlider = document.getElementById('peso');
    DOM.pesoOutput = document.getElementById('peso-output');
    
    DOM.pdfFileInput = document.getElementById('pdf_file');
}