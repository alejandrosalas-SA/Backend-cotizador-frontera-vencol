import CotizacionService from '../../services/cotizacion.service.js';

class CotizacionController {
    async calcular(req, res, next) {
        try {
            const { nro_version_buscada, ...vehiculoData } = req.body;
            const result = await CotizacionService.calcularCotizacion(vehiculoData, nro_version_buscada);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new CotizacionController();
