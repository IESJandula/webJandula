import { deselectScripts } from "astro/virtual-modules/transitions-swap-functions.js";

export const proyectos = [

    {
        nombre: "Proyecto LINCE (Shell Eco-Marathon)",
        resumen: "Diseño y construcción de un vehículo prototipo ultraeficiente para la competición Shell Eco-Marathon.",
        descripcion: "El Proyecto LINCE 3.0 es una iniciativa de innovación educativa que participa en la Shell Eco-Marathon, una competición internacional de vehículos de bajo consumo.",
        caracteristicas: [
            "Diseño y construcción de un vehículo prototipo ultraeficiente",
            "Participación de alumnado de múltiples especialidades (Tecnología, Mecatrónica...)",
            "Trabajo colaborativo interdisciplinar",
            "Participación en la Shell Eco-Marathon"
        ],
        etiquetas: ["Eficiencia Energética", "Innovación Educativa"],
        categoria: "Innovación Tecnológica",
        portada: "/images/proyects/pilota_lince_miriam-31.jpeg",
        images: [
            "/images/proyects/T2M3DY7SIJHWFCBABLZ6QXZTDI.jpg",
            "/images/proyects/fotonoticia_20230523144928_1200.jpg",
        ]
    },
    {
        nombre: "Biblioteca Escolar",
        resumen: "Un espacio de aprendizaje, investigación y disfrute de la lectura.",
        descripcion: "La **Biblioteca Escolar** es un espacio de aprendizaje, investigación y disfrute de la lectura. Funciona como un centro dinamizador de la cultura literaria y la competencia informacional.",
        caracteristicas: [
            "Gestión del fondo bibliográfico (libros, revistas, recursos digitales)",
            "Préstamo de documentos al alumnado y profesorado",
            "Organización de actividades de promoción de la lectura",
            "Apoyo a proyectos de investigación del alumnado",
            "Formación en alfabetización mediática e informacional"
        ],
        etiquetas: ["Biblioteca", "Lectura", "Investigación"],
        categoria: "Cultura y Educación",
        portada: "/images/proyects/bibliojandula.png",
        images: [

        ]
    },
    {
        nombre: "Aula de Jaque",
        resumen: "Un espacio de aprendizaje del ajedrez para fomentar el pensamiento crítico y la resolución de problemas.",
        descripcion: "El programa Aula de Jaque (INVESTIGA Y DESCUBRE) promueve el aprendizaje del ajedrez como herramienta educativa para el desarrollo del pensamiento lógico, la concentración y la resolución de problemas.",
        caracteristicas: [
            "Talleres de iniciación y perfeccionamiento en ajedrez",
            "Participación en torneos escolares locales y provinciales",
            "Actividades de ajedrez adaptadas a diferentes niveles",
            "Colaboración con entidades locales de ajedrez"
        ],
        etiquetas: ["Ajedrez", "Lógica", "Matemáticas"],
        categoria: "Deportes y Juegos",
        portada: "/images/proyects/Aula_de_Jaque.png",
        images: []
    },
    {
        nombre: "Concurso de Relato Corto",
        resumen: "Un concurso literario para fomentar la creatividad y la expresión escrita entre el alumnado.",
        descripcion: "El Concurso de Relato Corto del IES Jándula es una actividad de promoción de la escritura creativa y la expresión literaria.",
        caracteristicas: [],
        etiquetas: ["Literatura", "Creatividad", "Expresión Escrita"],
        categoria: "Cultura y Educación",
        portada: "/images/proyects/relato_corto.png",
        images: []
    },
    {
        nombre: `Revista "Pasa Página"`,
        resumen: "Una revista escolar dedicada a la difusión de la cultura y la literatura.",
        descripcion: "La Revista \"Pasa Página\" es una publicación periódica que busca difundir la cultura y la literatura entre el alumnado del IES Jándula.",
        caracteristicas: ["Cuentos y poesía del alumnado",
            "Artículos de opinión y reportajes",
            "Entrevistas a personas relevantes del centro o la comunidad",
            "Cómics y trabajos artísticos",
            "Noticias de actualidad escolar"],
        etiquetas: ["Literatura", "Cultura", "Expresión Escrita"],
        categoria: "Cultura y Educación",
        portada: "/images/proyects/pasa_pagina.png",
        images: []
    },
    {
        nombre: "Competiciones Matemáticas",
        resumen: "Participación en competiciones matemáticas para fomentar el interés por las matemáticas y el desarrollo del pensamiento lógico.",
        descripcion: `El IES Jándula participa en diversas competiciones matemáticas a nivel local, regional y nacional para fomentar el interés por las matemáticas y el desarrollo del pensamiento lógico entre el alumnado.\n\nTiene como objetivo estimular el interés por las matemáticas, desarrollar estrategias de resolución de problemas e identificar talento matemático precoz`,
        caracteristicas: [
            "Participación en competiciones matemáticas a nivel local, regional y nacional",
            "Workshops de resolución de problemas matemáticos",
            "Actividades de divulgación matemática"
        ],
        etiquetas: ["Matemáticas", "Lógica", "Resolución de Problemas"],
        categoria: "Cultura y Educación",
        portada: "/images/proyects/competicionesMatematicas.png",
        images: []
    },
    {
        nombre: "Escuelas Deportivas",
        resumen: "Programas de actividades deportivas para fomentar la actividad física y el trabajo en equipo entre el alumnado.",
        descripcion: "Las Escuelas Deportivas del IES Jándula ofrecen programas de actividades deportivas para fomentar la actividad física, el trabajo en equipo y la promoción de hábitos saludables entre el alumnado.\n\nLas actividades disponibles son: fútbol, baloncesto, balonmano, voleibol, pádel, atletismo y otras disciplinas según disponibilidad y demanda",
        caracteristicas: ["Carácter voluntario y gratuito",
            "Sesiones en horario extraescolar",
            "Grupos por niveles de experiencia",
            "Participación en competiciones escolares locales y provinciales",
            "Énfasis en valores de juego limpio, compañerismo e inclusión"
        ],
        etiquetas: ["Deporte", "Actividad Física", "Trabajo en Equipo"],
        categoria: "Deportes y Juegos",
        portada: "/images/proyects/escuelasDeportivas.png",
        images: []
    },
    {
        nombre: "Recreos Inclusivos",
        resumen: "Actividades lúdicas y deportivas durante los recreos para fomentar la inclusión y la convivencia entre el alumnado.",
        descripcion: "El programa Recreos Inclusivos busca garantizar que el tiempo de descanso sea un espacio seguro, lúdico e integrador para todo el alumnado.\n\nSe organizan actividades lúdicas y deportivas durante los recreos para fomentar la inclusión, la convivencia y el desarrollo de habilidades sociales entre el alumnadoo con discapacidadidades más sosegadas",
        caracteristicas: [
            "Reducir la conflictividad en patios",
            "Fomentar la integración de alumnado en riesgo de exclusión",
            "Mejorar el clima y la convivencia general",
            "Promover la autonomía y el respeto a la diversidad"
        ],
        etiquetas: ["Inclusión", "Convivencia", "Habilidades Sociales"],
        categoria: "Cultura y Educación",
        portada: "/images/proyects/recreosInclusivos.png",
        images: []
    }










]