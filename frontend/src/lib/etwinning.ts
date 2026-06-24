export interface ProyectoETwinning {
  titulo: string;
  descripcion: string;
  enlace?: string;
  sello?: string; // 'quality' | 'national'
}

export interface CursoETwinning {
  curso: string;
  proyectos: ProyectoETwinning[];
}

export const cursosETwinning: CursoETwinning[] = [
  {
    curso: '2025-26',
    proyectos: [
      {
        titulo: 'Roots & Voices: Discovering Andújar and Modena through Local Heritage',
        descripcion: 'Descubrimiento del patrimonio local de Andújar y Módena (Italia) a través de la colaboración entre centros.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/roots-voices-discovering-andujar-and-modena-through-local-heritage/twinspace',
      },
      {
        titulo: 'Taste the Nation',
        descripcion: 'Proyecto gastronómico y cultural que explora la identidad nacional a través de la cocina.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/taste-nation/twinspace',
      },
      {
        titulo: 'P.E.A.C.E. P.A.I.X. P.A.Z.',
        descripcion: 'Educación para la paz, la empatía y la convivencia intercultural entre centros europeos.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/peace-paix-paz-politeness-empathy-awareness-culture-exchange-building-skills-life/twinspace',
      },
      {
        titulo: 'Mythological Cold Case Lab',
        descripcion: 'Laboratorio mitológico que trabaja habilidades para la vida a partir de casos de la mitología clásica.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/mythological-cold-case-lab-failure-life-skills-resolution/twinspace',
      },
    ],
  },
  {
    curso: '2024-25',
    proyectos: [
      {
        titulo: 'Preservar el agua para proteger la vida',
        descripcion: 'Proyecto medioambiental sobre la conservación del agua y su impacto en los ecosistemas europeos.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/preservar-el-agua-proteger-la-vida-preserver-leau-proteger-la-vie/twinspace',
      },
      {
        titulo: 'S.L.O.W. Tourist',
        descripcion: 'Turismo sostenible y responsable como alternativa al turismo de masas.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/slow-tourist/twinspace',
      },
      {
        titulo: 'E.P.I.C. Europe',
        descripcion: 'Exploración de pioneros e inmigrantes a lo largo de la historia europea, inspirado en la Antigüedad clásica.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/epic-europe-exploring-pioneers-and-immigrants-challenges-across-europe-lets-be-inspired-antiquity-celebrate-xenophilia-unites-us-europe/twinspace',
      },
    ],
  },
  {
    curso: '2023-24',
    proyectos: [
      {
        titulo: 'Funny Memes of Latin Quotes',
        descripcion: 'Uso del humor y los memes para acercar las citas latinas clásicas al alumnado actual.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/funny-memes-latin-quotes/twinspace',
      },
      {
        titulo: 'The Assemblywomen: Women\'s Voices from Ancient to Modern Times',
        descripcion: 'Voces femeninas desde la Grecia clásica hasta hoy. Proyecto reconocido con Sello de Calidad eTwinning.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/assemblywomen-womens-voices-ancient-modern-times/twinspace',
        sello: 'quality',
      },
      {
        titulo: 'Mens Sana in Corpore Sano',
        descripcion: 'Salud física y mental en centros educativos de España, Francia y Alemania. Reconocido con Sello de Calidad eTwinning.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/mens-sana-corpore-sano-10/twinspace',
        sello: 'quality',
      },
      {
        titulo: 'Healthier, Happier Together',
        descripcion: 'Bienestar colectivo y hábitos saludables compartidos entre centros europeos.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/healthier-happier-together/twinspace',
      },
      {
        titulo: 'S.L.O.W. — Sustainable Life Outdoor Wellness',
        descripcion: 'Continuación del proyecto SLOW sobre vida sostenible y bienestar al aire libre.',
        enlace: 'https://school-education.ec.europa.eu/en/etwinning/projects/slow-sustainable-life-outdoor-wellness/twinspace',
      },
    ],
  },
  {
    curso: '2022-23',
    proyectos: [
      {
        titulo: 'SLOW — Sustainable Life Outdoor Wellness',
        descripcion: 'Vida sostenible y bienestar al aire libre. Proyecto con movilidad a Italia (Lago de Garda).',
        enlace: 'https://school-education.ec.europa.eu/es/etwinning/projects/slow-sustainable-life-outdoor-wellness/twinspace?type=1',
      },
      {
        titulo: 'CAME, SAW, LIVED — We travel with Julius Caesar through Italy and Spain',
        descripcion: 'Viaje con Julio César por Italia y España. Colaboración con el IES Al-Ándalus (Almería) y Vibo Valentia (Italia).',
        enlace: 'https://school-education.ec.europa.eu/es/etwinning/projects/came-saw-lived-we-travel-julius-caesar-through-italy-and-spain/twinspace?type=1',
      },
      {
        titulo: 'PACEM — Peaceful Actresses Classical European Mythology',
        descripcion: 'Mitología clásica europea vista a través de personajes femeninos pacificadores.',
        enlace: 'https://school-education.ec.europa.eu/es/etwinning/projects/pacem-peaceful-actresses-classical-european-mythology/twinspace?type=1',
      },
    ],
  },
  {
    curso: 'Anteriores',
    proyectos: [
      { titulo: 'NOVI ANTIQUI LUDI', descripcion: 'Juegos clásicos adaptados al aula contemporánea.', enlace: 'https://twinspace.etwinning.net/73485' },
      { titulo: 'Innovative Integration of Logic and Intelligence Games', descripcion: 'Integración innovadora de juegos de lógica e inteligencia en la enseñanza.', enlace: 'https://twinspace.etwinning.net/68968' },
      { titulo: 'Searching for the Labours of Hercules', descripcion: 'Búsqueda de los trabajos de Hércules en la cultura europea.', enlace: 'https://twinspace.etwinning.net/5893/home' },
      { titulo: 'Familia Europaea I', descripcion: 'La familia en las diferentes culturas y tradiciones europeas.', enlace: 'https://twinspace.etwinning.net/55170/home' },
      { titulo: 'DREAM — DRama dancE Arts Music for a Multicultural Europe', descripcion: 'Artes escénicas para una Europa multicultural.', enlace: 'https://twinspace.etwinning.net/70914/home' },
      { titulo: 'Europe(an) matters — A survey on attitudes towards Europe', descripcion: 'Encuesta sobre actitudes del alumnado europeo hacia la Unión Europea.', enlace: 'https://twinspace.etwinning.net/51545/home' },
      { titulo: "Myth'arts: Myths in Art and Littérature", descripcion: 'Los mitos grecolatinos en el arte y la literatura europeos.', enlace: 'https://twinspace.etwinning.net/96548/home' },
      { titulo: 'MAGISTER CHEF — Cooking as in Classical Times', descripcion: 'Cocina clásica grecolatina como herramienta educativa.', enlace: 'https://twinspace.etwinning.net/129409/home' },
      { titulo: 'THE ART OF GAME / THE GAME OF ART', descripcion: 'Juego y arte como vehículos de aprendizaje intercultural.', enlace: 'https://twinspace.etwinning.net/127233/home' },
      { titulo: 'Sustainable Me – My Power as a Consumer', descripcion: 'El poder del consumidor sostenible en la sociedad actual.', enlace: 'https://twinspace.etwinning.net/134015/home' },
      { titulo: 'Sustainable CLOCK — Sustainable Cities Lifestyle Resources Cooking', descripcion: 'Ciudades sostenibles y recursos para un estilo de vida responsable.', enlace: 'https://twinspace.etwinning.net/137549/home' },
      { titulo: "Let's play with Οἰδίπους", descripcion: 'Edipo como pretexto para explorar la tragedia griega y la psicología humana.', enlace: 'https://twinspace.etwinning.net/206866/home' },
      { titulo: 'FAMA VOLAT — Fake News from Classical World to Nowadays', descripcion: 'Las fake news desde la Antigüedad hasta nuestros días.', enlace: 'https://twinspace.etwinning.net/201540/home' },
    ],
  },
];
