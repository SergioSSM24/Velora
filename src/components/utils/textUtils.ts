/**
 * Normaliza texto removiendo acentos y convirtiéndolo a minúsculas
 * para búsquedas que no distingan acentos
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remueve los caracteres de acento
}

/**
 * Verifica si un texto contiene otro texto sin distinguir acentos
 */
export function textIncludes(haystack: string, needle: string): boolean {
  return normalizeText(haystack).includes(normalizeText(needle));
}