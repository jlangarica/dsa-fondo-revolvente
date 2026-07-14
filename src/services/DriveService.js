/**
 * Servicio de Gestión de Archivos e Infraestructura de Carpetas en Google Drive
 */
const DriveService = {
    /**
     * Crea el expediente en Drive titulado con el Folio de Sello y guarda el PDF original
     * @param {string} base64Data Flujo binario del PDF
     * @param {string} folioSello Folio extraído por la IA (Ej: "0241")
     * @param {string} unidadNombre Nombre del servicio solicitante
     * @return {Object} IDs de referencia para la Base de Datos
     */
    guardarOficioEnExpediente: function (base64Data, folioSello, unidadNombre) {
        // ID de la carpeta Raíz Institucional del Fondo Revolvente
        const CARPETA_RAIZ_ID = "16NBgfwxvMNrKsbJ52qWA3u7uHDGxYExS";
        const carpetaRaiz = DriveApp.getFolderById(CARPETA_RAIZ_ID);

        const añoActual = new Date().getFullYear().toString();

        // 1. Validar u organizar subcarpeta del Año Fiscal Vigente
        let carpetaAño;
        const busquedaAño = carpetaRaiz.getFoldersByName(añoActual);
        if (busquedaAño.hasNext()) {
            carpetaAño = busquedaAño.next();
        } else {
            carpetaAño = carpetaRaiz.createFolder(añoActual);
        }

        // 2. Definir nomenclatura estandarizada del Folio DSA
        const identificadorFolio = `DSA-${añoActual}-${folioSello.padStart(4, '0')}`; // Resultado: DSA-2026-0241
        const nombreCarpetaExpediente = `${identificadorFolio}_${unidadNombre.replace(/[^a-zA-Z0-9]/g, '_')}`;

        // 3. Crear la carpeta única del trámite si no existe
        let carpetaExpediente;
        const busquedaExpediente = carpetaAño.getFoldersByName(nombreCarpetaExpediente);
        if (busquedaExpediente.hasNext()) {
            carpetaExpediente = busquedaExpediente.next();
        } else {
            carpetaExpediente = carpetaAño.createFolder(nombreCarpetaExpediente);
        }

        // 4. Convertir la cadena Base64 a un Blob de archivo PDF nativo
        const tipoMime = MimeType.PDF;
        const bytesDocumento = Utilities.base64Decode(base64Data);
        const blobPdf = Utilities.newBlob(bytesDocumento, tipoMime, `Master_Scan_${identificadorFolio}.pdf`);

        // 5. Almacenar el archivo físico en la carpeta del expediente
        const archivoGuardado = carpetaExpediente.createFile(blobPdf);

        // Aplicar políticas de seguridad: Permitir que el archivo sea visible pero no editable por la red
        archivoGuardado.setViewerLeaveAllowed(false);

        return {
            folioInstitucional: identificadorFolio,
            folderDriveId: carpetaExpediente.getId(),
            fileDriveId: archivoGuardado.getId(),
            urlVisualizacion: archivoGuardado.getUrl()
        };
    }
};