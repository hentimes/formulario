import { DOM } from './_dom-elements.js';
import { openModal, closeModal, updateFormView, showFilePreview, getFormStepNum, setFormStepNum } from './_ui-helpers.js';
import { isCurrentStepValid, isFullFormValid, validateField } from './_form-validation.js';
import { comunasRegiones, LOCAL_STORAGE_KEY } from './_config.js';

// --- ¡MUY IMPORTANTE! Pega aquí la URL de tu Google Apps Script ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw8XscMMxGzuMBcuCcKLXjZ4dE7T2TtlZFk4ksLF6HGDl4rtitUU8q38d972g2WVtOr/exec';
// --------------------------------------------------------------------

// --- Función de Lógica Movida a su Lugar Correcto ---
export function updateActionButtonState() {
    const currentStep = DOM.formSteps[getFormStepNum()];
    if (!currentStep) return;
    const actionBtn = currentStep.querySelector('.next-btn, .submit-btn');
    if (actionBtn) {
        actionBtn.disabled = !isCurrentStepValid();
    }
}

const debounce = (func, delay = 300) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => { func.apply(this, args); }, delay);
    };
};

export const saveProgress = debounce(() => {
    const formData = new FormData(DOM.leadForm);
    const data = Object.fromEntries(formData.entries());
    ['anualidad_isapre', 'evaluar_afp'].forEach(name => {
        const radioChecked = DOM.leadForm.querySelector(`input[name="${name}"]:checked`);
        if (radioChecked) data[name] = radioChecked.value;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}, 400);

export function loadProgress() {
    try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!savedData) return;
        const data = JSON.parse(savedData);
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const field = DOM.leadForm.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'radio') {
                        const radioToSelect = DOM.leadForm.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (radioToSelect) radioToSelect.checked = true;
                    } else {
                        field.value = data[key];
                        if (field.type === 'range') field.dispatchEvent(new Event('input'));
                    }
                }
            }
        }
        document.getElementById('sistema_actual').dispatchEvent(new Event('change'));
        document.getElementById('comuna').dispatchEvent(new Event('change'));
        document.querySelector('input[name="evaluar_afp"]:checked')?.dispatchEvent(new Event('change'));
    } catch (error) {
        console.error("Error al cargar el progreso:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
}

function formatRut(rut) {
    rut = rut.replace(/[^\dkK]/g, '');
    rut = rut.replace(/^0+/, '');
    if (rut.length > 1) {
        let body = rut.slice(0, -1);
        let dv = rut.slice(-1).toUpperCase();
        body = new Intl.NumberFormat('de-DE').format(body);
        return `${body}-${dv}`;
    }
    return rut.toUpperCase();
}

function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
}

export function initModals() {
    document.body.addEventListener('click', e => {
        const targetId = e.target.id;
        if (targetId === 'continue-btn') {
            if (!document.getElementById('consent-checkbox').checked) return;
            document.getElementById('welcome-step').classList.add('hidden');
            document.getElementById('main-form-container').classList.remove('hidden');
            setFormStepNum(0);
            updateFormView();
        } else if (e.target.closest('#main-close-btn')) {
            openModal('exitConfirmModal');
        } else if (targetId === 'exit-confirm-continue' || targetId === 'isapre-warning-accept') {
            closeModal(e.target.closest('.modal').id);
        } else if (targetId === 'exit-confirm-exit' || targetId === 'finalizar-btn') {
            closeModal('formModal');
            closeModal('exitConfirmModal');
        }
    });
    const consentCheckbox = document.getElementById('consent-checkbox');
    if (consentCheckbox) {
      consentCheckbox.addEventListener('change', () => { 
        document.getElementById('continue-btn').disabled = !consentCheckbox.checked; 
      });
    }
}

export function initStepNavigation() {
    DOM.leadForm.addEventListener('click', (e) => {
        if (e.target.matches('.next-btn')) {
            if (isCurrentStepValid()) {
                let currentStep = getFormStepNum();
                if (currentStep < DOM.formSteps.length - 1) {
                    setFormStepNum(currentStep + 1);
                    updateFormView('next');
                }
            } else {
                const firstError = DOM.formSteps[getFormStepNum()].querySelector('.input-error, .radio-group.input-error');
                firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        if (e.target.matches('.prev-btn')) {
            let currentStep = getFormStepNum();
            if (currentStep > 0) {
                setFormStepNum(currentStep - 1);
                updateFormView('prev');
            }
        }
    });
}

export function handleFieldInteraction(e) {
    const field = e.target;
    if (field.type === 'file') {
        handleFileUpload(field);
    } else {
        validateField(field);
    }
    updateActionButtonState();
    saveProgress();
}

export function initFormEventListeners() {
    DOM.leadForm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const currentStep = DOM.formSteps[getFormStepNum()];
            const actionBtn = currentStep.querySelector('.next-btn, .submit-btn');
            if (actionBtn && !actionBtn.disabled) {
                actionBtn.click();
            }
        }
    });
    DOM.leadForm.addEventListener('input', handleFieldInteraction);
    DOM.leadForm.addEventListener('change', handleFieldInteraction);
    const modalBody = document.querySelector('.modal-body');
    modalBody.addEventListener('scroll', () => {
        document.querySelector('.modal-header').classList.toggle('scrolled', modalBody.scrollTop > 0);
    });
    window.addEventListener('beforeunload', () => {
        const progress = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (progress && Object.keys(JSON.parse(progress)).length > 2) { 
            const data = JSON.parse(progress);
            data.status = 'Abandonado';
            
            const urlParams = new URLSearchParams(window.location.search);
            data.fuente = urlParams.get('fuente') || '';
            data.campana = urlParams.get('campana') || '';

            const formData = new FormData();
            for(const key in data) {
                formData.append(key, data[key]);
            }

            if (WEB_APP_URL && !WEB_APP_URL.includes('PEGA_AQUÍ')) {
                navigator.sendBeacon(WEB_APP_URL, formData);
            }
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    });
}

export function initDynamicFields() {
    DOM.leadForm.addEventListener('input', (e) => {
        if (e.target.id === 'rut') e.target.value = formatRut(e.target.value);
        if (e.target.id === 'estatura') DOM.estaturaOutput.textContent = `${parseFloat(e.target.value).toFixed(2)} m`;
        if (e.target.id === 'peso') DOM.pesoOutput.textContent = `${e.target.value} Kg`;
    });
    DOM.leadForm.addEventListener('change', e => {
        if (e.target.id === 'sistema_actual') {
            const isapreDetails = document.getElementById('isapre-details');
            const isIsapre = e.target.value === 'Isapre';
            isapreDetails.classList.toggle('is-visible', isIsapre);
            isapreDetails.querySelectorAll('select, input[type="radio"]').forEach(field => field.required = isIsapre);
        }
        if (e.target.closest('#anualidad-isapre-group') && e.target.value === 'No') {
            const isapreName = document.getElementById('isapre_especifica').value;
            if (isapreName) {
                const msg = isapreName === 'Otra' ? `Recuerde que debe tener al menos un año en "Tu Isapre actual".` : `Recuerde que debe tener al menos un año en "${isapreName}".`;
                document.getElementById('isapre-warning-text').textContent = msg;
                openModal('isapreWarningModal');
            }
        }
        if (e.target.closest('#afp-radio-group')) {
            const afpDetails = document.getElementById('afp-details');
            const wantsAfpChange = e.target.value === 'Si';
            afpDetails.classList.toggle('is-visible', wantsAfpChange);
            document.getElementById('afp_actual').required = wantsAfpChange;
        }
        if (e.target.id === 'comuna') {
            document.getElementById('region').value = comunasRegiones[e.target.value] || '';
        }
    });
    const comunaSelect = document.getElementById('comuna');
    Object.keys(comunasRegiones).sort().forEach(comuna => {
        const option = document.createElement('option');
        option.value = comuna;
        option.textContent = comuna;
        comunaSelect.appendChild(option);
    });
}

export function handleFileUpload(fileInput) {
    const errorDiv = document.getElementById('error-pdf_file');
    const file = fileInput.files[0];
    errorDiv.textContent = '';
    errorDiv.classList.remove('visible');
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        errorDiv.textContent = `El archivo es demasiado grande (máx. 5 MB).`;
        errorDiv.classList.add('visible');
        fileInput.value = '';
        return;
    }
    if (file.type !== "application/pdf") {
        errorDiv.textContent = 'Solo se permiten archivos PDF.';
        errorDiv.classList.add('visible');
        fileInput.value = '';
        return;
    }
    showFilePreview(file);
}

async function sendDataToGoogleScript(formData) {
    if (!WEB_APP_URL || WEB_APP_URL.includes('PEGA_AQUÍ')) {
        console.error("URL de Google Apps Script no configurada.");
        return { success: false };
    }
    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            body: formData,
        });
        return { success: true };
    } catch (error) {
        console.error("Error de red al enviar datos:", error);
        return { success: false };
    }
}

export function initFormSubmission() {
    DOM.leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submissionErrorDiv = document.getElementById('submission-error');
        const submitButton = DOM.leadForm.querySelector('.submit-btn');
        submissionErrorDiv.classList.remove('visible');

        if (!isFullFormValid()) return;

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        const formData = new FormData(DOM.leadForm);
        
        const urlParams = new URLSearchParams(window.location.search);
        formData.append('fuente', urlParams.get('fuente') || '');
        formData.append('campana', urlParams.get('campana') || '');

        if (DOM.pdfFileInput.files.length > 0) {
            const file = DOM.pdfFileInput.files[0];
            const extension = file.name.slice(file.name.lastIndexOf("."));
            const rutValue = DOM.rutInput.value.replace(/\./g, "").replace("-", "");
            formData.append('nombre_archivo_pdf', `${getFormattedDateTime()}_${rutValue}${extension}`);
        }
        
        localStorage.removeItem(LOCAL_STORAGE_KEY);

        const { success } = await sendDataToGoogleScript(formData);

        if (success) {
            document.getElementById('main-form-container').classList.add('hidden');
            document.getElementById('thank-you-step').classList.remove('hidden');
        } else {
            submissionErrorDiv.textContent = 'Hubo un error al enviar el formulario. Por favor, inténtelo de nuevo más tarde.';
            submissionErrorDiv.classList.add('visible');
        }

        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Obtener Análisis';
    });
}