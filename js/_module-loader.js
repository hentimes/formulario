// Carga los módulos HTML de forma asíncrona.

export async function loadModules() {
    const modulePaths = {
        'form-modal-placeholder': '/templates/_form-modal.html',
        'isapre-warning-modal-placeholder': '/templates/_warning-isapre.html',
        'exit-confirm-modal-placeholder': '/templates/_warning-exit.html'
    };

    const modulePromises = Object.entries(modulePaths).map(async ([placeholderId, path]) => {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            const placeholder = document.getElementById(placeholderId);
            if (placeholder) {
                placeholder.innerHTML = html;
            } else {
                console.warn(`El placeholder con id "${placeholderId}" no fue encontrado.`);
            }
        } catch (error) {
            console.error(`Error al cargar el módulo desde "${path}":`, error);
            throw error;
        }
    });

    try {
        await Promise.all(modulePromises);
    } catch (error) {
        document.body.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Error al cargar los componentes de la página. Por favor, recargue.</p>';
        throw new Error("La carga de módulos falló.");
    }
}