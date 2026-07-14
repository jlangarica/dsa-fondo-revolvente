/**
 * Orquestador del Registro Inicial de Expedientes
 */
function procesarYRegistrarCompraInicial(base64Data, unidadNombreAlterna) {
    try {
        // 1. Ejecutar análisis cognitivo multimodal con Gemini
        const datosExtraidos = analizarPdfConGemini(base64Data);

        const folioAsignar = datosExtraidos.folio_extrahido_sello || "0000";
        const servicioSolicitante = unidadNombreAlterna || datosExtraidos.doc1_oficio.unidad_solicitante_cod || "General";

        // 2. Almacenar el documento físico en Drive indexado con su número de folio real
        const resultadoDrive = DriveService.guardarOficioEnExpediente(base64Data, folioAsignar, servicioSolicitante);

        // 3. Estructurar el payload unificado de respuesta para la UI
        return {
            status: "SUCCESS",
            folioGenerado: resultadoDrive.folioInstitucional,
            driveFolderId: resultadoDrive.folderDriveId,
            driveFileId: resultadoDrive.fileDriveId,
            urlDocumento: resultadoDrive.urlVisualizacion,
            datosFormularioMapeados: {
                folio_dsa: resultadoDrive.folioInstitucional,
                no_oficio: datosExtraidos.doc1_oficio.no_oficio,
                fecha_recepcion: datosExtraidos.doc1_oficio.fecha_oficio,
                observaciones: datosExtraidos.doc1_oficio.observaciones_justificacion,
                negativa_validada_previas: datosExtraidos.doc2_negativa.existe_negativa,
                fecha_negativa: datosExtraidos.doc2_negativa.fecha_negativa,
                articulos: datosExtraidos.doc1_oficio.articulos
            }
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: `Error en el pipeline de registro: ${error.toString()}`
        };
    }
}