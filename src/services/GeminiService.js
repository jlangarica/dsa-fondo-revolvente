/**
 * Servicio de Inteligencia Artificial Optimizado para Extracción Dual (Oficio + Negativa)
 */
function analizarPdfConGemini(base64Data) {
    if (!base64Data) {
        throw new Error("Seguridad DSA: No se recibió flujo de datos binarios del archivo PDF.");
    }

    const apiKey = ConfigService.getGeminiApiKey();
    const endpointBase = ConfigService.getGeminiEndpoint();
    const url = `${endpointBase}?key=${apiKey}`;

    // JSON Schema Dual para separar DOC-1 y DOC-2 en la misma llamada cognitiva
    const jsonSchema = {
        type: "OBJECT",
        properties: {
            folio_extrahido_sello: {
                type: "STRING",
                description: "Busca el sello físico tintado de RECIBI. Extrae exclusivamente el número entero del campo FOLIO. Ej: '0241'"
            },
            doc1_oficio: {
                type: "OBJECT",
                properties: {
                    no_oficio: { type: "STRING", description: "Clave oficial del oficio. Ej: AHCGFAA/COEΡ/189/2026" },
                    fecha_oficio: { type: "STRING", description: "Fecha del oficio en formato YYYY-MM-DD." },
                    unidad_solicitante_cod: { type: "STRING", description: "Código de la unidad de control o UC si aparece. Ej: 4038" },
                    observaciones_justificacion: { type: "STRING", description: "Motivo o texto descriptivo de la solicitud." },
                    articulos: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                codigo_art: { type: "STRING" },
                                descripcion: { type: "STRING" },
                                cantidad: { type: "INTEGER" },
                                tiempo_entrega: { type: "STRING" }
                            },
                            required: ["codigo_art", "cantidad"]
                        }
                    }
                },
                required: ["no_oficio", "articulos"]
            },
            doc2_negativa: {
                type: "OBJECT",
                description: "Datos exclusivos de la hoja o sección de NEGATIVA DE INSUMO del almacén.",
                properties: {
                    existe_negativa: { type: "BOOLEAN", description: "Coloca true si el documento incluye la hoja de Negativa de Insumo." },
                    fecha_negativa: { type: "STRING", description: "Fecha de emisión de la negativa (YYYY-MM-DD)." },
                    jefe_almacen_nombre: { type: "STRING", description: "Nombre de quien firma la negativa de almacén." }
                },
                required: ["existe_negativa"]
            }
        },
        required: ["folio_extrahido_sello", "doc1_oficio", "doc2_negativa"]
    };

    const payload = {
        contents: [{
            parts: [
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: base64Data
                    }
                },
                {
                    text: "Actúa como un auditor experto de la DSA del Hospital Civil. Analiza el archivo provisto. En las páginas encontrarás el Oficio Solicitud y la Negativa de Insumo del Almacén. 1. Localiza el sello de recibido de la Div. de Servs. Admos. y extrae el número de FOLIO. 2. Separa los datos de la solicitud de artículos de los datos de la negativa del almacén conforme al esquema estructurado. Requiero exactitud matemática."
                }
            ]
        }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: jsonSchema,
            temperature: 0.0
        }
    };

    const opciones = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    };

    try {
        const respuesta = UrlFetchApp.fetch(url, opciones);
        if (respuesta.getResponseCode() !== 200) {
            throw new Error(`Error Gemini: ${respuesta.getContentText()}`);
        }
        return JSON.parse(JSON.parse(respuesta.getContentText()).candidates[0].content.parts[0].text);
    } catch (error) {
        throw new Error(`Fallo en extracción OCR: ${error.message}`);
    }
}