/**
 * Detecta el tipo de archivo basado en la extensión del nombre del archivo
 */
export function detectFileType(fileName: string): string {
  if (!fileName) return 'UNKNOWN';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'UNKNOWN';
  
  // Mapeo de extensiones a tipos de archivo
  const fileTypeMap: Record<string, string> = {
    // Documentos PDF
    'pdf': 'PDF',
    
    // Documentos de Word
    'doc': 'DOC',
    'docx': 'DOCX',
    
    // Presentaciones
    'ppt': 'PPT',
    'pptx': 'PPTX',
    
    // Hojas de cálculo
    'xls': 'XLS',
    'xlsx': 'XLSX',
    
    // Archivos de texto
    'txt': 'TXT',
    'rtf': 'RTF',
    
    // Imágenes
    'jpg': 'JPG',
    'jpeg': 'JPEG',
    'png': 'PNG',
    'gif': 'GIF',
    'svg': 'SVG',
    
    // Otros formatos comunes
    'zip': 'ZIP',
    'rar': 'RAR',
    'csv': 'CSV',
    'json': 'JSON',
    'xml': 'XML'
  };
  
  return fileTypeMap[extension] || extension.toUpperCase();
}

/**
 * Verifica si un tipo de archivo es válido para el sistema
 */
export function isValidFileType(fileType: string): boolean {
  const validTypes = [
    'PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 
    'XLS', 'XLSX', 'TXT', 'RTF', 'CSV'
  ];
  
  return validTypes.includes(fileType);
}

/**
 * Obtiene una descripción amigable del tipo de archivo
 */
export function getFileTypeDescription(fileType: string): string {
  const descriptions: Record<string, string> = {
    'PDF': 'Documento PDF',
    'DOC': 'Documento de Word (legacy)',
    'DOCX': 'Documento de Word',
    'PPT': 'Presentación de PowerPoint (legacy)',
    'PPTX': 'Presentación de PowerPoint',
    'XLS': 'Hoja de cálculo de Excel (legacy)',
    'XLSX': 'Hoja de cálculo de Excel',
    'TXT': 'Archivo de texto',
    'RTF': 'Texto enriquecido',
    'CSV': 'Valores separados por comas'
  };
  
  return descriptions[fileType] || `Archivo ${fileType}`;
}