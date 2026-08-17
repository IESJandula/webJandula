import Facebook from "@components/Facebook.astro";
import Instagram from "@components/Instagram.astro";
import Youtube from "@components/Youtube.astro";
import LinkedIn from "@components/Linkedin.astro";


export const socialLinks = [
    {name: 'Facebook', href: 'https://www.facebook.com/IESJandula.es/', component: Facebook},
    {name: 'Instagram', href: 'https://www.instagram.com/iesjandula.es/', component: Instagram},
    {name: 'YouTube', href: 'https://www.youtube.com/@iesjandula4043', component: Youtube},
    {name: 'LinkedIn', href: 'https://www.linkedin.com/company/ies-j%C3%A1ndula', component: LinkedIn},
];

export const caminosindex = [

{ nombre: "ESO",
  descripcion: "Educación Secundaria Obligatoria (ESO) es la etapa educativa que proporciona una base sólida para su futuro académico y profesional.",
  image:"/images/eso.jpg",
  color: "blue-500",
  url: "/oferta#eso"
},
{ nombre: "Bachillerato",
  descripcion: "El Bachillerato es la etapa educativa que sigue a la Educación Secundaria Obligatoria y precede a la Educación Superior.",
  image:"/images/bachillerato.jpg",
  color: "green-500",
  url: "/oferta#bachillerato"
},
{ nombre: "Ciclos Formativos",
  descripcion: "Los Ciclos Formativos son programas de formación profesional que preparan a los estudiantes para el mercado laboral.",
  image:"/images/ciclos.jpg",
  color: "purple-500",
  url: "/oferta#ciclos"
}

]

export const contacto = {
    titulo: "Contacto",
  email: "secretaria@iesjandula.es",
    emailsecretaria:"secretaria@iesjandula.es",
    telefono: "953 53 95 08",
    horario: "Lunes a viernes, 09:00 - 14:00",
    direccion: "c/ San Vicente de Paúl, s/n, 23740 Andújar (Jaén)",
    mapaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1173.2632267711915!2d-4.042029490604833!3d38.035557813658876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6c3111d9f50ab7%3A0x38480c8b0a73be65!2sInstituto%20de%20Educaci%C3%B3n%20Secundaria%20%22J%C3%A1ndula%22!5e0!3m2!1ses!2ses!4v1774342903927!5m2!1ses!2ses"
};


export const ciclos = [
{
    nivel: "Grado Básico",
    nombre: "Técnico Básico en Informática y Comunicaciones",
    familia: "Informática",
    duracion: "2 años",
    turno: "Mañana",
    descripcion: "Realizar operaciones auxiliares de montaje y mantenimiento de sistemas microinformáticos, periféricos y redes de comunicación de datos.",
    imagen: {
      url: "/images/basica.jpg",
      alternativeText: "Imagen representativa del ciclo formativo de Grado Básico en Informática y Comunicaciones"
    },
    enlace: "https://todofp.es/que-estudiar/familias-profesionales/informatica-comunicaciones/informatica-comunicaciones.html",
    asignaturas: {
      primero: [
        "Montaje y mantenimiento de sistemas y componentes informáticos",
        "Operaciones auxiliares para la configuración y la explotación",
        "Itinerario personal para la empleabilidad I",
        "Comunicación y Ciencias Sociales I ",
        "Ciencias Aplicadas I",
        "Tutoría"
      ],
      segundo: [
        "Instalación y mantenimiento de redes para transmisión de datos",
        "Equipos eléctricos y electrónicos",
        "Proyecto intermodular de aprendizaje colaborativo",
        "Comunicación y Ciencias Sociales II",
        "Ciencias Aplicadas II",
        "Tutoría"
      ]
    }
  },
  {
    nivel: "Grado Medio",
    nombre: "Sistemas Microinformáticos y Redes (SMR)",
    familia: "Informática",
    duracion: "2 años",
    turno: "Mañana",
    descripcion: "Instalación, configuración y mantenimiento de sistemas microinformáticos, aislados o en red, así como redes locales en pequeños entornos.",
    imagen: {
      url: "/images/redes.jpg",
      alternativeText: "Imagen representativa del ciclo formativo de Grado Medio en Sistemas Microinformáticos y Redes"
    },
    enlace:"https://www.todofp.es/que-estudiar/familias-profesionales/informatica-comunicaciones/sistemas-microniformaticos-redes.html",
    asignaturas: {
      primero: [
        "Técnicas de equitación",
        "Guía ecuestre",
        "Guía de baja y media montaña",
        "Guía de bicicleta",
        "Técnicas de tiempo libre",
        "Técnicas de natación",
        "Itinerario personal para la empleabilidad I",
        "Digitalización aplicada al sistema productivo",
        "Sostenibilidad aplicada al sistema productivo"
      ],
      segundo: [
        "Atención a grupos",
        "Organización de itinerarios",
        "Socorrismo en el medio natural",
        "Guía en el medio natural acuático",
        "Maniobras con cuerdas",
        "Itinerario personal para la empleabilidad II",
        "Inglés profesional (GM)",
        "Proyecto intermodular",
        "Optativa"
      ]
    }
  },
  {
    nivel: "Grado Medio",
    nombre: "Guía en el Medio Natural y de Tiempo Libre",
    familia: "Actividades Físicas",
    duracion: "2 años",
    turno: "Mañana",
    descripcion: "Organizar itinerarios y guiar grupos por entornos naturales, medio acuático e instalaciones de ocio y aventura.",
    imagen: {
      url: "/images/med.jpg",
      alternativeText: "Imagen representativa del ciclo formativo de Grado Medio en Guía en el Medio Natural y de Tiempo Libre"
    },
    enlace:"https://todofp.es/que-estudiar/familias-profesionales/actividades-fisicas-deportivas/guia-medio-natural-tiempo-libre.html",
    bilingue: "Inglés",
    asignaturas: {
      primero: [
        "Técnicas de equitación",
        "Guía ecuestre",
        "Guía de baja y media montaña",
        "Guía de bicicleta",
        "Técnicas de tiempo libre",
        "Técnicas de natación",
        "Itinerario personal para la empleabilidad I",
        "Digitalización aplicada al sistema productivo",
        "Sostenibilidad aplicada al sistema productivo"
      ],
      segundo: [
        "Atención a grupos",
        "Organización de itinerarios",
        "Socorrismo en el medio natural",
        "Guía en el medio natural acuático",
        "Maniobras con cuerdas",
        "Itinerario personal para la empleabilidad II",
        "Inglés profesional (GM)",
        "Proyecto intermodular",
        "Optativa"
      ]
    }
  },
  {
    nivel: "Grado Superior",
    nombre: "Mecatrónica Industrial",
    familia: "Industrial",
    duracion: "2 años",
    turno: "Mañana",
    descripcion: "Configurar y optimizar sistemas mecatrónicos industriales, así como planificar, supervisar y ejecutar su montaje y mantenimiento.",
    imagen: {
      url: "/images/meca.jpg",
      alternativeText: "Imagen representativa del ciclo formativo de Grado Superior en Mecatrónica Industrial",
    },
    enlace:"https://todofp.es/que-estudiar/familias-profesionales/instalacion-mantenimiento/mecatronica-industrial.html",
    asignaturas: {
      primero: [
        "Sistemas mecánicos",
        "Sistemashidráulicos y neumáticos",
        "Sistemas eléctricos y electrónicos",
        "Elementos de máquinas",
        "Procesos de fabricación",
        "Representación gráfica de sistemas mecatrónicos",
        "Itinerario personal para la empleabilidad I",
        "Digitalización aplicada al sistema productivo",
        "Sostenibilidad aplicada al sistema productivo"
      ],
      segundo: [
        "Configuración de sistemas mecatrónicos",
        "Procesos y gestión de mantenimiento y calidad",
        "Integración de sistemas",
        "Simulación de sistemas mecatrónicos",
        "Itinerario personal para la empleabilidad II",
        "Inglés profesional (GS)",
        "Proyecto intermodular",
        "Optativa"
      ]
    }
  },
  {
    nivel: "Grado Superior",
    nombre: "Desarrollo de Aplicaciones Multiplataforma (DAM)",
    familia: "Informática",
    duracion: "2 años",
    turno: "Mañana",
    descripcion: "Desarrollar, implantar, documentar y mantener aplicaciones informáticas multiplataforma, utilizando tecnologías y entornos de desarrollo específicos.",
    imagen: {
      url: "/images/dam.jpg",
      alternativeText: "Imagen representativa del ciclo formativo de Grado Superior en Desarrollo de Aplicaciones Multiplataforma"
    },
    enlace:"https://todofp.es/que-estudiar/familias-profesionales/informatica-comunicaciones/des-aplicaciones-multiplataforma.html",
    bilingue: "Inglés",
        asignaturas: {
      primero: [
        "Lenguajes de marcas y sistemas de gestión de la información",
        "Sistemas informáticos",
        "Bases de datos",
        "Entornos de desarrollo",
        "Programación",
        "Itinerario personal para la empleabilidad I",
        "Digitalización aplicada al sistema productivo",
        "Sostenibilidad aplicada al sistema productivo"
      ],
      segundo: [
        "Acceso a datos",
        "Desarrollo de interfaces",
        "Programación multimedia y de dispositivos móviles",
        "Programación de servicios y procesos",
        "Sistemas de gestión empresarial",
        "Itinerario personal para la empleabilidad II",
        "Inglés profesional (GS)",
        "Proyecto intermodular",
        "Optativa"
      ]
    }
  },
  {
    nivel: "Grado Superior",
    nombre: "Desarrollo de Aplicaciones Web (DAW)",
    familia: "Informática",
    duracion: "2 años",
    turno: "Tarde",
    descripcion: "Desarrollar, implantar, y mantener aplicaciones web, con independencia del modelo empleado y utilizando tecnologías específicas.",
    imagen: {
      url: "/images/daw.jpg",
      alternativeText: "Imagen representativa del ciclo formativo de Grado Superior en Desarrollo de Aplicaciones Web"
    },
    enlace:"https://todofp.es/que-estudiar/familias-profesionales/informatica-comunicaciones/des-aplicaciones-web.html",
        asignaturas: {
      primero: [
        "Lenguajes de marcas y sistemas de gestión de la información",
        "Sistemas informáticos",
        "Bases de datos",
        "Entornos de desarrollo",
        "Programación",
        "Itinerario personal para la empleabilidad I",
        "Digitalización aplicada al sistema productivo",
        "Sostenibilidad aplicada al sistema productivo"
      ],
      segundo: [
        "Desarrollo web en entorno cliente",
        "Desarrollo web en entorno servidor",
        "Despliegue de aplicaciones web",
        "Diseño de interfaces web",
        "Itinerario personal para la empleabilidad II",
        "Inglés profesional (GS)",
        "Proyecto intermodular",
        "Optativa"
      ]
    }
  },
  
]; 

export const departamentos = [
  { nombre: 'Biología y Geología', jefe: 'Francisco Bejarano Casado' },
  { nombre: 'Geografía e Historia', jefe: 'Isabel María Ruiz González' },
  { nombre: 'Cultura Clásica', jefe: 'Santiago Guijarro Cano' },
  { nombre: 'Formación, Evaluación e Innovación Educativa (FEIE)', jefe: 'Manuel Amaro Parrado' },
  { nombre: 'Dibujo', jefe: 'Ana Navarro Frías' },
  { nombre: 'Economía', jefe: 'José Luis Meco Benítez' },
  { nombre: 'Educación Física', jefe: 'Antonio José Ortiz Muñoz' },
  { nombre: 'Extraescolares', jefe: 'Ana Belén Mauro Cledera' },
  { nombre: 'Filosofía', jefe: 'Sonia Racionero Rubio' },
  { nombre: 'Física y Química', jefe: 'María Aránzazu González Mármol' },
  { nombre: 'Francés', jefe: 'Yésica Pasadas Campos' },
  { nombre: 'Informática', jefe: 'Vicente Serrano Martínez' },
  { nombre: 'Inglés', jefe: 'Segundo Catalán Cubillas' },
  { nombre: 'Lengua Castellana y Literatura', jefe: 'María Dolores Solís Perales' },
  { nombre: 'Matemáticas', jefe: 'José María Luque Arias' },
  { nombre: 'Orientación', jefe: 'Inmaculada Relaño Gutiérrez' },
  { nombre: 'Proyectos Internacionales', jefe: 'Pedro J. Jurado Santiago' },
  { nombre: 'Tecnología', jefe: 'Manuel Barbero Alcalde' }
]


export const equipodirectivo = [
  { cargo: 'Directora', nombre: 'María Aránzazu González Mármol' },
  { cargo: 'Vicedirector', nombre: 'Manuel Arroyo Juan' },
  { cargo: 'Secretario', nombre: 'Rafael Delgado Cubilla' },
  { cargo: 'Jefe de Estudios', nombre: 'Francisco Martínez Ruiz' },
  { cargo: 'Jefe de Estudios Adjunto', nombre: 'José María Luque Alias' },
  { cargo: 'Jefa de Estudios Adjunta', nombre: 'Irene Juárez Ruiz' },
];

export const horariosCentro = [
  {
    turno: 'Turno de Mañana',
    horario: '08:00 - 14:30',
    detalle: 'Recreo: 11:00 - 11:30'
  },
  {
    turno: 'Turno de Tarde',
    horario: '15:00 - 21:00'
  }
];

export const calendarioEscolar = {
  curso: '2026-27',
  descripcion: 'El calendario se ajusta a la normativa de la Junta de Andalucía.',
  url: 'https://www.juntadeandalucia.es/educacion/portals/web/ced/calendario-escolar'
};

export const documentos = [
  {
    titulo: 'Plan de Centro',
    descripcion: [
      'Integra el Proyecto Educativo de Centro (PEC), el Reglamento de Organización y Funcionamiento (ROF) y el Proyecto de Gestión.',
      'Documento oficial aprobado por el Consejo Escolar.',
      'Disponible en Secretaría a petición de la comunidad educativa.'
    ]
  },
  {
    titulo: 'Plan de Mejora y Memoria de Autoevaluación',
    descripcion: [
      'Establece objetivos anuales de mejora.',
      'Recoge resultados de evaluaciones internas y externas.',
      'Propone actuaciones de seguimiento y evaluación.'
    ]
  },
  {
    titulo: 'Programaciones Didácticas',
    descripcion: [
      'Elaboradas por cada departamento.',
      'Definen objetivos, contenidos, metodología y criterios de evaluación.'
    ]
  },
  {
    titulo: 'Plan de Convivencia',
    descripcion: [
      'Define estrategias de prevención de conflictos.',
      'Establece protocolos de actuación ante conductas inadecuadas.',
      'Promueve la educación en valores y la resolución pacífica de conflictos.'
    ]
  },
  {
    titulo: 'Plan de Igualdad de Género',
    descripcion: [
      'Trabaja por la igualdad efectiva entre hombres y mujeres.',
      'Coordina actuaciones de coeducación y prevención de violencia de género.'
    ]
  },
  {
    titulo: 'Plan Digital de Centro (PAD)',
    descripcion: [
      'Responsable: Coordinador de Transformación Digital Educativa (TDE).',
      'Define objetivos de digitalización y competencia digital.',
      'Propone proyectos de innovación tecnológica.'
    ]
  },
  {
    titulo: 'Biblioteca Escolar',
    descripcion: [
      'Responsable: Coordinación de Biblioteca.',
      'Promueve el hábito de lectura y el uso de la biblioteca escolar.'
    ]
  },
];

