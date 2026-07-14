/**
 * main.js - Entry Point Oficial del Servidor Google Apps Script
 */

function doGet(e) {
    return HtmlService.createHtmlOutputFromFile('ui/Index')
        .setTitle('DSA Control Panel')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Función puente RPC para procesar la carga inicial del Oficio y la Negativa
 * @param {string} base64Data Cadena binaria del PDF en Base64
 * @param {string} unidadNombreAlterna Nombre de la UC de respaldo si falla el OCR
 * @return {Object} Respuesta estandarizada JSON
 */
function procesarCargaOficioInicial(base64Data, unidadNombreAlterna) {
    // Enruta directamente la petición al controlador correspondiente
    return RequestController.procesarYRegistrarCompraInicial(base64Data, unidadNombreAlterna);
}

/**
 * Endpoint para alimentar los desplegables nativos de la UI premium
 */
function obtenerDatosIniciales() {
    return {
        tramites: [{ id_tramite: 1, tipo_tramite: "Compra por Fondo Revolvente" }],
        unidades: [
            { id_uc: 1, uc_cod: "4038", uc_denominacion: "Coordinación de Enseñanza e Investigación" }
        ],
        servicios: [{ id_servicio: 1, nombre: "División de Pediatría" }],
        usuarios: [{ id_usuario: 10, nombre: "Mtra. Miriam Elena Pérez Grajeda" }],
        estatus: [{ id_estatus_tramite: 1, estatus_tramite: "EN_REVISION_INICIAL" }],
        catalogo: [
            { codigo_art: "2141002079", descripcion: "TONER IMPRESORA NEGRO HP 36A LASERJET (CB436A)", precio_sin_iva: 1450.00 }
        ],
        pacientes: [{ id_paciente: 1, nombre_completo: "Suministro General Institucional" }]
    };
}