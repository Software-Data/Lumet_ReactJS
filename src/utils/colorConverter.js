/**
 * Utilidad para convertir colores a formato hexadecimal válido
 * Maneja formatos modernos como oklch que no son soportados por jsPDF
 */

export const convertColorToHex = (color) => {
  if (!color) return '#808080';
  
  // Si ya es un hex válido, retornarlo
  if (color.startsWith('#')) {
    return color;
  }
  
  // Manejar formato oklch específicamente
  if (color.startsWith('oklch')) {
    console.log('Color oklch detectado, convirtiendo a fallback:', color);
    // Intentar extraer valores de oklch y convertir a un color similar
    try {
      const match = color.match(/oklch\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => v.trim());
        if (values.length >= 3) {
          const lightness = parseFloat(values[0]);
          
          // Validar que la luminosidad sea un número válido
          if (!isNaN(lightness) && lightness >= 0 && lightness <= 1) {
            // Convertir a un color similar basado en la luminosidad
            if (lightness > 0.7) return '#ffffff'; // Blanco para alta luminosidad
            if (lightness > 0.5) return '#c0c0c0'; // Gris claro para luminosidad media-alta
            if (lightness > 0.3) return '#808080'; // Gris medio para luminosidad media
            return '#404040'; // Gris oscuro para baja luminosidad
          }
        }
      }
    } catch (e) {
      console.log('Error parseando oklch:', e);
    }
    return '#808080'; // Fallback a gris medio
  }
  
  // Manejar otros formatos modernos
  if (color.startsWith('hwb') || color.startsWith('lab') || color.startsWith('lch')) {
    console.log('Color moderno detectado, convirtiendo a fallback:', color);
    return '#808080';
  }
  
  // Si es un color CSS válido, intentar convertirlo
  try {
    // Crear un elemento temporal para usar el contexto de canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    
    // Si el color es válido, extraer el valor
    if (ctx.fillStyle !== 'rgba(0, 0, 0, 0)') {
      return ctx.fillStyle;
    }
  } catch (error) {
    console.log('Error convirtiendo color:', color, error);
  }
  
  // Fallback a un color por defecto
  return '#808080';
};

/**
 * Función para validar si un color es compatible con jsPDF
 */
export const isColorCompatible = (color) => {
  if (!color) return false;
  
  // Colores compatibles
  const compatibleFormats = ['#', 'rgb', 'rgba', 'hsl', 'hsla'];
  
  return compatibleFormats.some(format => color.startsWith(format));
};

/**
 * Función para obtener un color de fallback basado en el color original
 */
export const getFallbackColor = (color, fallback = '#808080') => {
  if (!color) return fallback;
  
  // Si es oklch, intentar extraer la luminosidad
  if (color.startsWith('oklch')) {
    try {
      const match = color.match(/oklch\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => v.trim());
        if (values.length >= 3) {
          const lightness = parseFloat(values[0]);
          
          // Mapear luminosidad a colores de fallback
          if (lightness > 0.8) return '#ffffff';
          if (lightness > 0.6) return '#d0d0d0';
          if (lightness > 0.4) return '#a0a0a0';
          if (lightness > 0.2) return '#707070';
          return '#404040';
        }
      }
    } catch (e) {
      console.log('Error parseando oklch para fallback:', e);
    }
  }
  
  return fallback;
};
