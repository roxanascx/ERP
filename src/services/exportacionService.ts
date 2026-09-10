// Servicio para manejar exportaciones de datos contables

import type { AsientoContable } from '../types/libroDiario';

export interface ExportConfig {
  fileName?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  includeMetadata?: boolean;
}

export class ExportacionService {
  /**
   * Exporta asientos contables a Excel.
   *
   * NO IMPLEMENTADO. Hace falta una libreria de generacion de XLSX que no esta
   * en el proyecto. La version anterior esperaba 1,5 s y llamaba a una funcion
   * vacia, de modo que el boton parecia funcionar y nunca descargaba nada.
   * Ahora falla de forma visible para que el usuario lo sepa.
   */
  static async exportarAsientosExcel(
    _asientos: AsientoContable[],
    _config: ExportConfig = {}
  ): Promise<void> {
    throw new Error('La exportación a Excel aún no está implementada.');
  }

  /**
   * Exporta asientos contables a PDF.
   *
   * NO IMPLEMENTADO, por el mismo motivo que la exportacion a Excel.
   */
  static async exportarAsientosPDF(
    _asientos: AsientoContable[],
    _config: ExportConfig = {}
  ): Promise<void> {
    throw new Error('La exportación a PDF aún no está implementada.');
  }

  /**
   * Aplana los asientos al formato de columnas de la exportacion.
   * De momento no lo llama nadie: se conserva porque describe el formato que
   * necesitara la exportacion cuando se implemente.
   */
  private static prepararDatosAsientos(asientos: AsientoContable[], includeMetadata: boolean) {
    const datos: any[] = [];

    asientos.forEach(asiento => {
      asiento.detalles.forEach((detalle, index) => {
        const fila: any = {
          // Datos del asiento
          'Número Asiento': asiento.numero,
          'Fecha': asiento.fecha,
          'Descripción Asiento': asiento.descripcion,
          'Estado': asiento.estado || 'borrador',
          
          // Datos del detalle
          'Línea': index + 1,
          'Código Cuenta': detalle.codigoCuenta,
          'Denominación Cuenta': detalle.denominacionCuenta,
          'Debe': detalle.debe || 0,
          'Haber': detalle.haber || 0
        };

        if (includeMetadata) {
          fila['Fecha Creación'] = asiento.fechaCreacion || '';
          fila['Usuario Creación'] = asiento.usuarioCreacion || '';
          fila['Fecha Modificación'] = asiento.fechaModificacion || '';
        }

        datos.push(fila);
      });
    });

    return datos;
  }

  /**
   * Calcula resumen de datos para mostrar en exportaciones
   */
  static calcularResumenAsientos(asientos: AsientoContable[]) {
    const resumen = {
      totalAsientos: asientos.length,
      totalLineas: asientos.reduce((sum, asiento) => sum + asiento.detalles.length, 0),
      totalDebe: 0,
      totalHaber: 0,
      asientosBalanceados: 0,
      asientosDesbalanceados: 0,
      estadisticasPorEstado: {} as Record<string, number>
    };

    asientos.forEach(asiento => {
      const totalesAsiento = asiento.detalles.reduce(
        (acc, detalle) => ({
          debe: acc.debe + (detalle.debe || 0),
          haber: acc.haber + (detalle.haber || 0)
        }), 
        { debe: 0, haber: 0 }
      );

      resumen.totalDebe += totalesAsiento.debe;
      resumen.totalHaber += totalesAsiento.haber;

      // Verificar si está balanceado (tolerancia de 0.01)
      if (Math.abs(totalesAsiento.debe - totalesAsiento.haber) < 0.01) {
        resumen.asientosBalanceados++;
      } else {
        resumen.asientosDesbalanceados++;
      }

      // Estadísticas por estado
      const estado = asiento.estado || 'borrador';
      resumen.estadisticasPorEstado[estado] = (resumen.estadisticasPorEstado[estado] || 0) + 1;
    });

    return resumen;
  }
}

export default ExportacionService;
