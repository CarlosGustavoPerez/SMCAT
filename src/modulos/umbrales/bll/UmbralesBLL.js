// src/modulos/umbrales/bll/UmbralesBLL.js

import * as UmbralesDAL from '../dal/UmbralesDAL';

export class UmbralesBLL {
    async obtenerUmbralesCompletos() {
        const umbrales = await UmbralesDAL.getUmbralesCompletos();
        const umbralCriticoObj = umbrales.find(u => u.nombre_nivel === 'Precaución');
        return {
            umbrales,
            precaucion_min: umbralCriticoObj ? umbralCriticoObj.rango_min : 2.50,
            precaucion_max: umbralCriticoObj ? umbralCriticoObj.rango_max : 3.99,
        };
    }
    async obtenerUmbralCritico() {
        return await UmbralesDAL.getUmbralCritico();
    }
    async guardarUmbrales(umbralesData) {
        const { precaucion_min, precaucion_max } = umbralesData;
        if (precaucion_min >= precaucion_max) {
            throw new Error("El mínimo de Precaución debe ser menor que el máximo.");
        }
        if (precaucion_min < 0 || precaucion_max > 5.0) {
            throw new Error("Los valores deben estar en el rango de 0.00 a 5.00.");
        }
        return await UmbralesDAL.actualizarUmbrales(umbralesData);
    }
}
