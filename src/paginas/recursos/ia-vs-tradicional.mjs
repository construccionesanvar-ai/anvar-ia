// @ts-check
// Guía: IA o automatización tradicional (reglas, scripts, RPA). Con los
// casos reales como ejemplo de combinación.
import { FUENTES } from '../../datos/whatsapp.mjs';
import { guia } from './_guia.mjs';

export default guia({
  ruta: '/recursos/ia-vs-automatizacion-tradicional',
  fuente: FUENTES.guideAi,
  tituloSeo: 'IA o automatización tradicional: cuándo usar cada una | ANVAR TECH',
  og: { titulo: 'IA o automatización tradicional: cuándo usar cada una', bajada: 'Reglas, scripts, RPA e IA resuelven problemas distintos', etiqueta: 'Guía práctica' },
  lead: 'Reglas, scripts, RPA e inteligencia artificial resuelven problemas distintos. Elegir mal encarece el proyecto o lo vuelve poco confiable. Cómo decidir, con ejemplos de procesos reales.',
  corto: '<p>Usa <b>reglas y código</b> para todo lo que se puede describir con precisión: calcular, validar, copiar, generar documentos. Usa <b>RPA</b> solo cuando un sistema no tiene otra forma de conectarse. Usa <b>IA</b> cuando la entrada es desordenada —texto libre, PDF variables, imágenes— y siempre con una regla o una persona que revise lo que produce. En la práctica, las mejores soluciones combinan las tres.</p>',
  secciones: [
    { id: 'definiciones', titulo: 'Qué es cada una, en una frase', html: `
      <ul>
        <li><b>Reglas y fórmulas:</b> instrucciones fijas del tipo "si pasa esto, haz esto". Siempre dan el mismo resultado con los mismos datos.</li>
        <li><b>Scripts o programas:</b> reglas escritas en código que pueden leer archivos, generar documentos y conectarse con sistemas. Son la base de casi toda automatización seria.</li>
        <li><b>RPA</b> (automatización robótica de procesos): un programa que imita lo que haría una persona en la pantalla, con clics y teclado, en sistemas que no tienen otra forma de conectarse.</li>
        <li><b>Inteligencia artificial:</b> modelos que interpretan lenguaje, documentos o imágenes. Son flexibles, pero trabajan por probabilidad: pueden equivocarse con seguridad aparente.</li>
      </ul>` },
    { id: 'tabla', titulo: 'Cuándo usar cada una', html: `
      <div class="tabla-envoltorio" tabindex="0" role="region" aria-label="Cuándo usar cada enfoque">
      <table class="tabla">
        <thead><tr><th scope="col">Enfoque</th><th scope="col">Úsalo cuando</th><th scope="col">Ejemplo</th><th scope="col">Riesgo principal</th></tr></thead>
        <tbody>
          <tr><td>Reglas y fórmulas</td><td data-label="Úsalo cuando">La lógica se puede escribir completa</td><td data-label="Ejemplo">Calcular el total de una cotización con la lista de precios</td><td data-label="Riesgo">Casos que nadie previó</td></tr>
          <tr><td>Scripts</td><td data-label="Úsalo cuando">Hay archivos, documentos o sistemas de por medio</td><td data-label="Ejemplo">Generar ocho documentos Word desde un formulario</td><td data-label="Riesgo">Que nadie sepa mantenerlo</td></tr>
          <tr><td>RPA</td><td data-label="Úsalo cuando">Un sistema antiguo no tiene API ni exportación</td><td data-label="Ejemplo">Cargar datos en un sistema que solo se usa por pantalla</td><td data-label="Riesgo">Se rompe cuando cambia la pantalla</td></tr>
          <tr><td>IA</td><td data-label="Úsalo cuando">La entrada es desordenada o está en lenguaje natural</td><td data-label="Ejemplo">Entender un pedido escrito en un correo</td><td data-label="Riesgo">Respuestas plausibles pero incorrectas</td></tr>
        </tbody>
      </table>
      </div>` },
    { id: 'combinacion', titulo: 'La combinación que funciona: la IA interpreta, las reglas deciden, una persona aprueba', html: `
      <p>En los tres casos que hemos construido, la IA nunca trabaja sola:</p>
      <ul>
        <li><b><a href="/casos/automatizacion-documental-retail">C-01, automatización documental:</a></b> un reconocimiento de texto local lee la boleta; las validaciones impiden generar documentos incompletos; los datos dudosos quedan marcados para que una persona los revise.</li>
        <li><b><a href="/casos#venta-en-linea">C-02, venta en línea:</a></b> un modelo de lenguaje recomienda el servicio según el problema que describe el cliente; el precio sale de una fuente única y el pago lo procesa una plataforma de pagos, no la IA.</li>
        <li><b><a href="/automatizacion-autocad">C-03, planos en AutoCAD:</a></b> la IA traduce una instrucción en español a operaciones; un programa aplica solo operaciones permitidas sobre una nueva versión del archivo; el profesional revisa cada versión.</li>
      </ul>
      <p>El patrón se repite: la IA en la entrada, donde hay que interpretar; el código en el medio, donde hay que ser exacto; una persona al final, donde hay que responder por el resultado.</p>` },
    { id: 'cuando-no-ia', titulo: 'Cuándo no usar IA', html: `
      <ul>
        <li><b>Para calcular montos.</b> Una fórmula no se equivoca; un modelo de lenguaje puede redondear o inventar. Lo explicamos en detalle en <a href="/automatizar-cotizaciones">automatizar cotizaciones</a>.</li>
        <li><b>Cuando una regla alcanza.</b> Si la lógica cabe en diez "si pasa esto, haz esto", la IA solo agrega costo por uso y un margen de error que no existía.</li>
        <li><b>Para decisiones sin revisión</b> con efecto legal, comercial o financiero.</li>
        <li><b>Con datos que no deben salir de tu empresa</b>, salvo que el modelo corra en tu infraestructura o el proveedor garantice por contrato cómo trata la información. Antes de construir, debe quedar escrito qué datos se envían y a quién.</li>
      </ul>` },
    { id: 'rpa', titulo: 'Una advertencia sobre RPA', html: `
      <p>RPA es tentador porque parece no requerir integración: el robot usa el sistema igual que una persona. El costo aparece después. Cada vez que cambia una pantalla, un botón o un mensaje, el robot se detiene. Si el sistema tiene una API, una exportación o acceso a la base de datos, casi siempre es mejor usar eso. RPA queda para los sistemas antiguos que no ofrecen nada más.</p>` },
    { id: 'como-elegir', titulo: 'Cinco preguntas para elegir', html: `
      <ol>
        <li>¿Puedo escribir la lógica completa? Si sí, reglas o código.</li>
        <li>¿La entrada viene ordenada, en columnas y formatos fijos? Si sí, no necesitas IA para leerla.</li>
        <li>¿El sistema tiene API o exportación? Si sí, no necesitas RPA.</li>
        <li>¿Qué pasa si el resultado sale mal? Si el costo es alto, una persona aprueba antes.</li>
        <li>¿Qué datos salen de mi empresa y a dónde? Debe quedar escrito antes de construir.</li>
      </ol>` },
  ],
  cta: {
    titulo: '¿No sabes qué enfoque necesita tu proceso?',
    texto: 'Es lo primero que definimos. En 20 minutos te decimos si tu proceso se resuelve con reglas, si la IA aporta algo o si conviene combinar.',
    botones: [
      { href: '#evaluar', texto: 'Evaluar mi proceso', etiqueta: 'ia-evaluar' },
      { href: '/automatizar-excel', texto: 'Ver automatizar Excel', variante: 'secundario', etiqueta: 'ia-excel' },
    ],
  },
  relacionados: ['/automatizar-cotizaciones', '/automatizar-excel', '/casos/automatizacion-documental-retail', '/recursos/procesos-que-no-deberias-automatizar'],
});
