// @ts-check
// Página que se está generando. El build la fija antes de renderizar cada
// página, así los componentes saben su ruta y el origen del lead (fuente)
// sin tener que recibirlo por parámetro en cada llamada.

export const PAGINA = { ruta: '/', fuente: 'home' };

/** @param {{ ruta: string, fuente: string }} p */
export function fijarPagina(p) {
  PAGINA.ruta = p.ruta;
  PAGINA.fuente = p.fuente;
}
