// @ts-check
// Preguntas frecuentes por página. Cada lista alimenta el acordeón visible y
// los datos estructurados FAQPage de esa misma página, así que nunca difieren.
import { SERVICIOS } from './oferta.mjs';
import { precioTexto } from '../html.mjs';

const p = (id) => precioTexto(SERVICIOS[id].precio);

/** @typedef {{ q: string, a: string }} Pregunta */

/** @type {Record<string, Pregunta[]>} */
export const FAQ = {
  inicio: [
    { q: '¿Cuánto cuesta empezar?',
      a: `La conversación de evaluación, de 20 minutos, no tiene costo. Si el proceso es pequeño y está bien delimitado, la Automatización Express parte en ${p('express').principal} ${p('express').detalle}, con alcance y precio fijo acordados antes de partir. Si son varios procesos o no está claro por dónde empezar, el diagnóstico cuesta ${p('diagnostico').principal} + IVA y se descuenta si avanzas al piloto.` },
    { q: '¿Qué pasa con los datos de mi empresa?',
      a: 'Firmamos confidencialidad antes de ver cualquier información. Antes de construir te decimos por escrito qué datos salen de tu red —por ejemplo, hacia un modelo de IA— y cuáles no. Si la información no debe salir, se procesa en tus equipos.' },
    { q: '¿Quién se queda con lo que se construye?',
      a: 'Lo desarrollado a medida para tu empresa queda en tu poder una vez pagado, y así queda en el contrato. Nuestras herramientas y plantillas previas siguen siendo nuestras, con licencia de uso para tu empresa.' },
    { q: '¿Y si la IA se equivoca?',
      a: 'Se equivoca, y por eso diseñamos para eso: datos dudosos marcados para revisión, validaciones que impiden continuar con información incompleta y una persona que aprueba antes de que algo tenga efecto.' },
    { q: '¿Tenemos que cambiar los sistemas que usamos?',
      a: 'No. Trabajamos sobre lo que ya usas: Excel, Word, PDF, correo, WhatsApp, Drive, tu ERP o tu AutoCAD. Si en algún caso conviene cambiar algo, te lo justificamos con números.' },
    { q: '¿Trabajan con empresas chicas?',
      a: 'Sí, y muchas veces rinde más, porque las decisiones son rápidas. Usa la calculadora con tus números: si el ahorro anual es chico, te vamos a recomendar una Automatización Express y no un proyecto más grande.' },
    { q: '¿Cuánto se demora?',
      a: 'Una Automatización Express suele tomar entre una y dos semanas. Un diagnóstico, una semana. Un piloto, entre tres y cuatro semanas. Te decimos la fecha real de inicio antes de cotizar, porque trabajamos con pocos proyectos en paralelo.' },
    { q: '¿Emiten factura?',
      a: 'Sí. Los valores para empresas son netos y se les suma IVA. Los proyectos se cotizan en UF para que el valor no se desactualice entre la propuesta y la firma.' },
  ],

  express: [
    { q: '¿Qué procesos caben en una Automatización Express?',
      a: 'Procesos pequeños, repetitivos y bien delimitados: pasar datos de PDF a Excel, generar documentos desde un formulario, consolidar planillas, armar un informe periódico o clasificar información. No todo cabe: si el proceso toca varios sistemas o nadie lo tiene escrito, te vamos a recomendar un diagnóstico.' },
    { q: '¿Cómo se define el precio final?',
      a: 'En la primera conversación revisamos el proceso con ejemplos reales. Después te enviamos por escrito el alcance, el precio fijo y el plazo. No partimos ni cobramos nada antes de que lo apruebes.' },
    { q: '¿Qué pasa si después quiero más?',
      a: 'La Express es una forma de conocernos con bajo riesgo. Si funciona y hay más procesos, el camino natural es un diagnóstico para ordenar las siguientes oportunidades.' },
    { q: '¿Dónde queda funcionando?',
      a: 'En tus equipos o en cuentas de tu empresa, según el caso. Te entregamos un instructivo de uso y corregimos las fallas de lo entregado durante 30 días.' },
  ],

  datos: [
    { q: '¿Necesito un ERP o un sistema especial?',
      a: 'No. Muchas empresas parten con Excel, exportaciones de su sistema de ventas o archivos CSV. El primer trabajo es ordenar y consolidar lo que ya tienes.' },
    { q: '¿Qué pasa si mis datos están desordenados?',
      a: 'Es lo normal. Limpiar y consolidar es parte del trabajo. Si los datos no alcanzan para una decisión confiable, te lo decimos antes de construir un tablero que no sirva.' },
    { q: '¿Tienen que usar Power BI?',
      a: 'No necesariamente. Usamos la herramienta que tenga más sentido para tu empresa: Power BI si ya lo tienen, u otra alternativa si es más simple de mantener.' },
    { q: '¿Mis datos de ventas y costos quedan expuestos?',
      a: 'Firmamos confidencialidad antes de verlos y te decimos por escrito dónde se almacenan y qué se procesa fuera de tu empresa. Cuando corresponde, todo queda en tus cuentas.' },
    { q: '¿Pueden predecir la demanda?',
      a: 'Cuando hay suficiente historia y los datos son consistentes, sí se pueden construir pronósticos útiles. Si no la hay, te lo decimos y partimos por lo que sí da resultado: stock crítico, rotación y márgenes.' },
  ],

  diagnostico: [
    { q: '¿Y si el diagnóstico concluye que no conviene automatizar?',
      a: 'Te lo decimos por escrito y explicamos qué haría falta antes. El informe siempre incluye un capítulo sobre lo que no conviene automatizar todavía. Esa conclusión también sirve: evita invertir en un proyecto que no iba a rendir.' },
    { q: '¿Cuánto tiempo le quita a mi equipo?',
      a: 'Unas dos horas de quien decide y cerca de seis horas repartidas del equipo que ejecuta el proceso, observándolo mientras trabaja normalmente. La idea es medir el proceso como ocurre, no interrumpirlo.' },
    { q: '¿De dónde sale el costo por hora?',
      a: 'Lo entrega tu empresa. Un número que sale de ustedes no se discute después; uno que estimamos nosotros, sí. Todos los supuestos quedan escritos en el informe para que alguien de finanzas pueda revisarlos.' },
    { q: '¿Qué pasa con la información que vean?',
      a: 'Firmamos confidencialidad antes de ver un solo dato. Te decimos por escrito qué información se procesa fuera de tu empresa y cuál no.' },
    { q: 'Somos una empresa chica. ¿Igual sirve?',
      a: 'Si es un solo proceso y está claro, probablemente te conviene más una Automatización Express. El diagnóstico sirve cuando hay varios procesos o no está claro por dónde empezar.' },
    { q: '¿Quién hace el diagnóstico?',
      a: 'Lo lidera directamente el fundador de ANVAR TECH, que viene de operaciones de retail. Por eso el proceso se mira desde las horas de las personas y no desde la herramienta.' },
  ],

  automatizacion: [
    { q: '¿Y si la IA se equivoca?',
      a: 'Se equivoca, y por eso todo lo que construimos tiene revisión humana antes de que algo tenga efecto. En el caso C-01, cuando la lectura de un precio es dudosa, la fila queda marcada para revisión y no se puede generar el documento sin revisarla.' },
    { q: '¿Esto va a dejar a alguien sin trabajo?',
      a: 'Lo que automatizamos es la parte mecánica: digitar, copiar, repetir. La revisión, el criterio y la decisión siguen siendo de las personas. Un piloto planteado como reducción de personal suele fracasar, porque el equipo no lo adopta.' },
    { q: '¿Quién se queda con el código?',
      a: 'Tu empresa. Lo desarrollado a medida queda en tu poder una vez pagado y así queda en el contrato. Cuando corresponde, todo corre en cuentas de tu empresa y no en las nuestras.' },
    { q: '¿Qué pasa si ANVAR TECH no está disponible más adelante?',
      a: 'Entregamos un manual técnico escrito para que otra persona pueda tomar el sistema, las cuentas quedan a nombre de tu empresa y el respaldo se prueba restaurándolo. La continuidad no depende de nosotros.' },
    { q: '¿Tenemos que cambiar nuestros sistemas?',
      a: 'No. Trabajamos sobre lo que ya usas. Si al final conviene cambiar algo, te lo justificamos con números.' },
    { q: '¿Cómo se paga una implementación?',
      a: 'Por etapas: un anticipo, pagos contra entregables y el saldo contra recepción. Siempre en UF y con el alcance escrito antes de empezar.' },
  ],

  capacitacion: [
    { q: 'La mitad del equipo no sabe nada de IA. ¿Sirve igual?',
      a: 'Sí. Como cada persona trabaja sobre una tarea propia, el nivel se ajusta solo: quien ya usa IA resuelve algo difícil y quien nunca la ha usado resuelve algo simple. Nadie queda aburrido ni perdido.' },
    { q: '¿Necesitamos comprar licencias antes?',
      a: 'No para el taller. Se trabaja con versiones gratuitas y con lo que ya tengan. Si después conviene pagar alguna licencia, lo decimos en el informe de cierre con la razón concreta.' },
    { q: '¿Qué pasa con la información confidencial?',
      a: 'Es parte del programa. Antes del taller preguntamos a la jefatura qué información no puede salir de la empresa, lo explicamos en los primeros minutos y la empresa queda con esa política escrita.' },
    { q: '¿Puede ser en línea?',
      a: 'Se puede, pero rinde menos: la hora de práctica funciona porque recorremos la sala y vemos quién está atascado. Si el equipo está distribuido, lo adaptamos.' },
    { q: '¿Qué viene después del taller?',
      a: 'Muchas veces nada, y está bien: el equipo queda usando mejor sus herramientas. Si durante el taller aparece un proceso que conviene automatizar, lo anotamos en el informe con su número.' },
  ],

  personal: [
    { q: '¿Necesito saber de computación?',
      a: 'No. Trabajamos sobre los programas que ya usas —Word, Excel, correo, WhatsApp— y con tus propios archivos. No hay que instalar ni programar nada.' },
    { q: '¿Esto no lo puedo aprender gratis en internet?',
      a: 'Una parte sí. La diferencia es que acá trabajamos con tu documento, tu planilla y tu forma de escribir, y en 90 minutos queda funcionando en tu computador. Lo que casi nunca está en los tutoriales es dónde se equivoca la IA y qué no subir.' },
    { q: '¿Es en línea o presencial?',
      a: 'Las dos. Por videollamada funciona igual de bien, porque compartes pantalla y el teclado lo manejas tú. Presencial, dentro de la Región Metropolitana.' },
    { q: '¿Con cuál de los tres parto?',
      a: 'Casi siempre con la Sesión Despegue. Es la forma de probar si te sirve sin comprometerte a nada.' },
    { q: '¿Y si no era para mí?',
      a: 'Si dentro de la primera hora te das cuenta de que no te sirve, te devolvemos el dinero.' },
  ],
};
