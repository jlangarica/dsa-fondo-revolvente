/**
 * ResponseHandler.js - Estandarizador de Respuestas del Servidor
 */
const ResponseHandler = {
    success: function (data) {
        return {
            status: "SUCCESS",
            error: null,
            data: data,
            timestamp: new Date().toISOString()
        };
    },

    error: function (message) {
        return {
            status: "ERROR",
            error: message,
            data: null,
            timestamp: new Date().toISOString()
        };
    }
};