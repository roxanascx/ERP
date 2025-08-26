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
   * Exporta asientos contables a Excel
   */
  static async exportarAsientosExcel(
    asientos: AsientoContable[], 
    config: ExportConfig = {}
  ): Promise<void> {
    const {
      fileName = `libro_diario_${new Date().toISOString().split('T')[0]}.xlsx`,
      sheetName = 'Libro Diario',
      // includeHeaders = true,
      includeMetadata = true
    } = config;

    try {
      // Preparar datos para exportación
      const datosParaExportar = this.prepararDatosAsientos(asientos, includeMetadata);
      
      // Aquí se implementaría la lógica de exportación usando una librería como xlsx
      // Por ahora, simulamos el proceso
      console.log('📊 Exportando a Excel:', {
        asientos: asientos.length,
        fileName,
        sheetName,
        datos: datosParaExportar.slice(0, 3) // Solo mostrar los primeros 3 para debug
      });

      // Simular proceso de exportación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En una implementación real, aquí descargaríamos el archivo
      this.descargarSimulado(fileName, 'excel');
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('No se pudo exportar a Excel');
    }
  }

  /**
   * Exporta asientos contables a PDF
   */
  static async exportarAsientosPDF(
    asientos: AsientoContable[], 
    config: ExportConfig = {}
  ): Promise<void> {
    const {
      fileName = `libro_diario_${new Date().toISOString().split('T')[0]}.pdf`,
      includeMetadata = true
    } = config;

    try {
      // Preparar datos para PDF
      const datosParaExportar = this.prepararDatosAsientos(asientos, includeMetadata);
      
      console.log('📄 Exportando a PDF:', {
        asientos: asientos.length,
        fileName,
        datos: datosParaExportar.slice(0, 3)
      });

      // Simular proceso de exportación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En una implementación real, aquí generaríamos y descargaríamos el PDF
      this.descargarSimulado(fileName, 'pdf');
      
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      throw new Error('No se pudo exportar a PDF');
    }
  }

  /**
   * Prepara los datos de asientos para exportación
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
   * Simula la descarga de archivo (para demo)
   */
  private static descargarSimulado(fileName: string, _tipo: 'excel' | 'pdf') {
    console.log(`📁 Simulando descarga de archivo: ${fileName}`);
    
    // En una implementación real, aquí crearíamos el blob y trigger de descarga
    // const blob = new Blob([contenido], { type: mimeType });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = fileName;
    // a.click();
    // URL.revokeObjectURL(url);
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
