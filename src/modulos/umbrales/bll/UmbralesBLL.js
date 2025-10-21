import * as UmbralesDAL from '../dal/UmbralesDAL';

export class UmbralesBLL {
    // Usado por el ABM para cargar la configuración actual
    async obtenerUmbralesCompletos() {
        const umbrales = await UmbralesDAL.getUmbralesCompletos();
        
        // Encontrar el valor clave (rango_min de Precaución) para el frontend
        const umbralCriticoObj = umbrales.find(u => u.nombre_nivel === 'Precaución');
        
        return {
            umbrales,
            precaucion_min: umbralCriticoObj ? umbralCriticoObj.rango_min : 2.50,
            precaucion_max: umbralCriticoObj ? umbralCriticoObj.rango_max : 3.99,
        };
    }

    // Usado por PlanesMejoraBLL para obtener el umbral de filtrado
    async obtenerUmbralCritico() {
        return await UmbralesDAL.getUmbralCritico();
    }

    // Usado por el ABM para guardar la nueva configuración
    async guardarUmbrales(umbralesData) {
        const { precaucion_min, precaucion_max } = umbralesData;

        // Validación de negocio BLL
        if (precaucion_min >= precaucion_max) {
            throw new Error("El mínimo de Precaución debe ser menor que el máximo.");
        }
        if (precaucion_min < 0 || precaucion_max > 5.0) {
            throw new Error("Los valores deben estar en el rango de 0.00 a 5.00.");
        }
        
        // El DAL se encarga de la lógica transaccional y los cálculos interdependientes
        return await UmbralesDAL.actualizarUmbrales(umbralesData);
    }
}
