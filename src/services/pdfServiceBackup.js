// Backup del servicio de PDF original
// Este archivo contiene la versión anterior antes de las correcciones

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { convertColorToHex } from '../utils/colorConverter';

export const generateReportePDF = async (reporte, carroceria = {}, usuario = {}, prioridad = {}, severidad = {}, imagenAnalizada = {}) => {
  try {
    console.log('Iniciando generación de PDF...');
    console.log('Datos recibidos:', { reporte, carroceria, usuario, prioridad, severidad, imagenAnalizada });
    
    // Validar datos requeridos
    if (!reporte || !reporte.id) {
      throw new Error('Datos del reporte no válidos');
    }
    
    // Validar y convertir color dominante si existe
    let imagenAnalizadaConvertida = { ...imagenAnalizada };
    if (imagenAnalizada?.color_dominante) {
      try {
        const colorConvertido = convertColorToHex(imagenAnalizada.color_dominante);
        console.log('Color dominante convertido:', {
          original: imagenAnalizada.color_dominante,
          convertido: colorConvertido
        });
        // Actualizar el color convertido
        imagenAnalizadaConvertida.color_dominante = colorConvertido;
      } catch (error) {
        console.error('Error convirtiendo color dominante:', error);
        // Usar un color de fallback seguro
        imagenAnalizadaConvertida.color_dominante = '#808080';
      }
    }
    
    // Asegurar que no haya colores problemáticos en imperfecciones
    if (imagenAnalizadaConvertida?.imperfecciones) {
      imagenAnalizadaConvertida.imperfecciones = imagenAnalizadaConvertida.imperfecciones.map(imp => ({
        ...imp,
        // Asegurar que las coordenadas sean números válidos
        x: Number(imp.x) || 0,
        y: Number(imp.y) || 0
      }));
    }
    
    // Crear un elemento temporal para el PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.top = '0';
    pdfContainer.style.width = '800px';
    pdfContainer.style.backgroundColor = 'white';
    pdfContainer.style.padding = '40px';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';
    pdfContainer.style.color = 'black';
    
    // Validar que el color convertido sea válido antes de generar el HTML
    if (imagenAnalizadaConvertida?.color_dominante) {
      if (!imagenAnalizadaConvertida.color_dominante.startsWith('#')) {
        console.warn('Color aún no válido después de conversión, forzando fallback');
        imagenAnalizadaConvertida.color_dominante = '#808080';
      }
      
      // Validar que el color sea un hex válido
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexRegex.test(imagenAnalizadaConvertida.color_dominante)) {
        console.warn('Color hex no válido, forzando fallback');
        imagenAnalizadaConvertida.color_dominante = '#808080';
      }
    }
    
    console.log('Objeto imagenAnalizadaConvertida final:', imagenAnalizadaConvertida);
    
    // Generar el HTML del PDF
    pdfContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #059669; font-size: 28px; margin: 0;">REPORTE DE INSPECCIÓN</h1>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0;">Sistema de Control de Calidad</p>
      </div>

      <div style="border: 2px solid #059669; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h2 style="color: #059669; font-size: 20px; margin: 0 0 15px 0; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">
          Información del Reporte
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <p style="margin: 8px 0;"><strong>ID del Reporte:</strong> ${reporte.id}</p>
            <p style="margin: 8px 0;"><strong>Estado:</strong> ${reporte.status || 'Sin estado'}</p>
            <p style="margin: 8px 0;"><strong>Fecha de Creación:</strong> ${new Date(reporte.createdAt).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          <div>
            <p style="margin: 8px 0;"><strong>Usuario:</strong> ${usuario?.nombre || '-'}</p>
            <p style="margin: 8px 0;"><strong>Prioridad:</strong> ${prioridad?.nombre || '-'}</p>
            <p style="margin: 8px 0;"><strong>Severidad:</strong> ${severidad?.nombre || '-'}</p>
          </div>
        </div>
      </div>

      <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h2 style="color: #3b82f6; font-size: 20px; margin: 0 0 15px 0; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">
          Información de la Carrocería
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <p style="margin: 8px 0;"><strong>Folio:</strong> ${carroceria?.folio || '-'}</p>
            <p style="margin: 8px 0;"><strong>Número de Parte:</strong> ${carroceria?.no_parte || '-'}</p>
            <p style="margin: 8px 0;"><strong>Panel:</strong> ${carroceria?.panel || '-'}</p>
          </div>
          <div>
            <p style="margin: 8px 0;"><strong>Lote:</strong> ${carroceria?.lote || '-'}</p>
            <p style="margin: 8px 0;"><strong>Color:</strong> ${carroceria?.color || '-'}</p>
            <p style="margin: 8px 0;"><strong>Estado:</strong> ${carroceria?.estado ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>
        <div style="margin-top: 15px;">
          <p style="margin: 8px 0;"><strong>Descripción:</strong></p>
          <p style="margin: 8px 0; padding: 10px; background-color: #f9fafb; border-radius: 4px;">
            ${carroceria?.descripcion || 'Sin descripción disponible'}
          </p>
        </div>
      </div>

      <div style="border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h2 style="color: #10b981; font-size: 20px; margin: 0 0 15px 0; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">
          Descripción del Reporte
        </h2>
        <p style="margin: 8px 0; padding: 15px; background-color: #f0fdf4; border-radius: 4px; border-left: 4px solid #10b981;">
          ${reporte.descripcion || 'Sin descripción disponible'}
        </p>
      </div>

      ${imagenAnalizadaConvertida?.imperfecciones ? `
        <div style="border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h2 style="color: #f59e0b; font-size: 20px; margin: 0 0 15px 0; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">
            Análisis de Imperfecciones
          </h2>
          
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <h3 style="color: #f59e0b; font-size: 16px; margin: 0 0 10px 0;">Resumen</h3>
                <p style="margin: 8px 0;"><strong>Total de imperfecciones:</strong> ${imagenAnalizadaConvertida.imperfecciones.length}</p>
                <p style="margin: 8px 0;"><strong>Densidad:</strong> ${imagenAnalizadaConvertida.imperfecciones.length > 20 ? 'Alta' : imagenAnalizadaConvertida.imperfecciones.length > 10 ? 'Media' : 'Baja'}</p>
                <p style="margin: 8px 0;"><strong>Estado:</strong> Requiere atención</p>
              </div>
              <div>
                <h3 style="color: #f59e0b; font-size: 16px; margin: 0 0 10px 0;">Distribución</h3>
                <p style="margin: 8px 0;"><strong>Rango X:</strong> ${Math.min(...imagenAnalizadaConvertida.imperfecciones.map(i => i.x))} - ${Math.max(...imagenAnalizadaConvertida.imperfecciones.map(i => i.x))}</p>
                <p style="margin: 8px 0;"><strong>Rango Y:</strong> ${Math.min(...imagenAnalizadaConvertida.imperfecciones.map(i => i.y))} - ${Math.max(...imagenAnalizadaConvertida.imperfecciones.map(i => i.y))}</p>
              </div>
            </div>
          </div>
          
          <h3 style="color: #f59e0b; font-size: 16px; margin: 0 0 15px 0;">Coordenadas Detalladas</h3>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 10px; max-height: 300px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #fbbf24; color: #92400e;">
                  <th style="border: 1px solid #d97706; padding: 8px; text-align: center;">#</th>
                  <th style="border: 1px solid #d97706; padding: 8px; text-align: center;">Coordenada X</th>
                  <th style="border: 1px solid #d97706; padding: 8px; text-align: center;">Coordenada Y</th>
                  <th style="border: 1px solid #d97706; padding: 8px; text-align: center;">ID</th>
                </tr>
              </thead>
              <tbody>
                ${imagenAnalizadaConvertida.imperfecciones.map((imperfeccion, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#fef3c7' : '#fde68a'};">
                    <td style="border: 1px solid #d97706; padding: 6px; text-align: center; font-weight: bold;">${index + 1}</td>
                    <td style="border: 1px solid #d97706; padding: 6px; text-align: center;">${imperfeccion.x}</td>
                    <td style="border: 1px solid #d97706; padding: 6px; text-align: center;">${imperfeccion.y}</td>
                    <td style="border: 1px solid #d97706; padding: 6px; text-align: center; font-size: 9px;">${imperfeccion._id?.slice(-6) || index}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      ${imagenAnalizadaConvertida?.color_dominante ? `
        <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h2 style="color: #8b5cf6; font-size: 20px; margin: 0 0 15px 0; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">
            Análisis de Color
          </h2>
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #d1d5db; background-color: ${imagenAnalizadaConvertida.color_dominante || '#808080'};"></div>
            <span style="font-size: 16px;"><strong>Color Dominante:</strong> ${imagenAnalizadaConvertida.color_dominante || 'No disponible'}</span>
          </div>
        </div>
      ` : ''}
    `;

    // Agregar al DOM temporalmente
    document.body.appendChild(pdfContainer);
    console.log('Contenedor agregado al DOM');

    // Convertir a canvas
    console.log('Convirtiendo HTML a canvas...');
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    console.log('Canvas generado exitosamente');

    // Remover del DOM
    document.body.removeChild(pdfContainer);
    console.log('Contenedor removido del DOM');

    // Crear PDF
    console.log('Creando PDF...');
    const imgData = canvas.toDataURL('image/png');
    console.log('Imagen convertida a data URL');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    console.log('Dimensiones del PDF:', { imgWidth, imgHeight, pageHeight });

    let position = 0;

    // Primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    console.log('Primera página agregada');

    // Páginas adicionales si es necesario
    let pageCount = 1;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      pageCount++;
    }
    console.log(`PDF creado con ${pageCount} páginas`);

    // Descargar PDF
    const fileName = `Reporte_${reporte.id}_${carroceria?.folio || 'Carroceria'}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Descargando PDF:', fileName);
    pdf.save(fileName);
    console.log('PDF descargado exitosamente');

    return true;
  } catch (error) {
    console.error('Error generando PDF:', error);
    console.error('Stack trace:', error.stack);
    
    // Información adicional para debugging
    if (error.message.includes('color function')) {
      console.error('Error relacionado con colores. Color dominante:', imagenAnalizada?.color_dominante);
    }
    
    throw new Error(`No se pudo generar el PDF: ${error.message}`);
  }
};
