const translations = {
  en: {
    // Nav
    navStory: 'Story',
    navGallery: 'Gallery',
    navCustomize: 'Customize',
    navInquire: 'Inquire',

    // Hero
    heroEyebrow: 'Custom Book Edition',
    heroTitle1: 'Your words',
    heroAmpersand: '&',
    heroTitle1b: 'memories',
    heroTitleConnector: '',
    heroTitle2: 'gain a new dimension.',
    heroSub1: 'Every element engineered to transform',
    heroSub2: 'the act of opening into something unforgettable.',
    heroCta: 'Customize yours',
    heroLearn: 'Learn more',

    // Story
    storyEyebrow: 'The Product',
    storyTitle1: 'At first glance, a refined',
    storyTitle2: 'rectangular form.',
    storyBody: 'Minimal. Precise. Magnetically sealed. The exterior reveals nothing of what lies within - only the quiet confidence of something worth waiting for.',

    // Moment
    momentEyebrow: 'The Moment',
    momentTitle1: 'The true magic begins',
    momentTitle2: 'the moment it is',
    momentTitle3: 'opened.',
    momentBody: 'As the magnetic closure releases, the structure unfolds horizontally in a controlled, almost theatrical motion. The walls gently fall away, guided by fine straps - elevating the book upward.',

    // Gallery
    galleryEyebrow: 'The Product',
    galleryTitle1: 'Choreographed',
    galleryTitleConnector: 'to ',
    galleryTitle2: 'perfection.',
    galleryBody: 'Every angle tells a story of precision engineering and refined craft.',
    galleryCaptions: [
      'Closed - Linen-wrapped exterior with magnetic seal',
      'Opening - Covers fall to reveal the interior',
      'Revealed - Book elevated by ribbon straps',
      'Detail - Burgundy interior with gold accents',
      'Composition - Velvet cover with open book and flowers',
      'Editorial - Full collection arrangement',
    ],

    // Statement
    statement1: 'It is not just packaging.',
    statement2: 'It is choreography.',

    // Customize
    customizeEyebrow: 'Configure',
    customizeTitle: 'Configure your collector\'s edition',
    customizeBody: 'Create a unique book of exceptional quality, protected by premium packaging.',

    // Specs
    specsEyebrow: 'Specs & Features',
    specs: [
      { icon: '⟁', title: 'Magnetic Closure', desc: 'Precision-engineered neodymium magnets create a satisfying, secure seal.' },
      { icon: '⧖', title: 'Guided Straps', desc: 'Fine ribbon straps control the unfolding and elevate the contents with intention.' },
      { icon: '◇', title: 'Complete Customization', desc: 'Every detail - from colors to materials - tailored to your exact vision.' },
      { icon: '⬡', title: 'Bespoke Dimensions', desc: 'Engineered to fit your exact product, down to the millimeter.' },
      { icon: '◎', title: 'Premium Materials', desc: 'Soft-touch papers, linen cloths, raw fibers, and specialty substrates.' },
      { icon: '⊞', title: 'Structural Integrity', desc: 'Rigid board construction with reinforced corners for lasting durability.' },
    ],

    // Closing
    closingEyebrow: 'Personal',
    closingTitle1: 'A packaging experience',
    closingTitleConnector: 'that feels ',
    closingTitle2: 'deeply personal.',
    closingBody: 'Crafted not just for a product - but for the person receiving it.',

    // CTA
    ctaTitle: 'Begin your story.',
    ctaBody1: 'Every project starts with a conversation.',
    ctaBody2: 'Tell us your vision, and we\'ll craft something extraordinary.',
    ctaButton: 'Get in Touch',

    // Footer
    footerCopy: '© 2026 Unfold. Premium Custom Packaging.',

    // Typewriter
    typewriterPhrases: [
      'Everyone loves stories.',
      'Imagination is the only limit.',
      'Design your own narrative.',
    ],

    // Scroll text lines
    scrollLines: [
      'PRECISION · CRAFTSMANSHIP · ELEGANCE · DETAIL · PRECISION · CRAFTSMANSHIP · ELEGANCE · DETAIL · ',
      'MAGNETIC · CLOSURE · BESPOKE · LUXURY · MAGNETIC · CLOSURE · BESPOKE · LUXURY · ',
      'UNFOLD · EXPERIENCE · TRANSFORM · REVEAL · UNFOLD · EXPERIENCE · TRANSFORM · REVEAL · ',
    ],

    // Magnetic filings hint
    filingsHint: 'Move your cursor',

    // Customizer
    custVariantClosed: 'Closed',
    custVariantOpen: 'Open',
    cfgPreviewPackaging: 'Packaging',
    cfgPreviewBook: 'Book',

    // Configurator Steps
    cfgStep1Title: 'Book Format & Volume',
    cfgStep1Desc: 'Choose the right size for your project and the number of copies.',
    cfgBookFormat: 'Book format:',
    cfgFormat_pocket: 'Pocket',
    cfgFormat_standard: 'Standard',
    cfgFormat_landscape: 'Landscape (A4)',
    cfgPageCount: 'Number of pages:',
    cfgPages: 'pages',
    cfgManuscript: 'Text file:',
    cfgUploadManuscript: 'Upload manuscript in selected size (PDF)',
    cfgQuantity: 'Quantity:',
    cfgPieces: 'pieces',

    cfgStep2Title: 'Interior Illustrations',
    cfgStep2Desc: 'Personalize pages with visual art. Select the package and creation method.',
    cfgIllustrationPkg: 'Illustration packages:',
    cfgIllPkg_none: 'No illustrations / Own illustrations',
    cfgIllPkg_standard: 'Set 3–5 illustrations (Standard)',
    cfgIllPkg_premium: 'Set 6–10 illustrations (Premium)',
    cfgIllPkg_collection: 'Set 11–15 illustrations (Collection)',
    cfgIllSourceOwn: 'Source:',
    cfgUploadIllustrations: 'Attach illustrations / Photos',
    cfgIllSource: 'Illustration source:',
    cfgIllSrc_ai: 'AI Generation',
    cfgIllSrcDesc_ai: 'Created via AI according to your theme.',
    cfgIllSrc_designer: 'Custom Design',
    cfgIllSrcDesc_designer: 'Made by a professional designer.',
    cfgVisualSpecs: 'Visual specifications:',
    cfgVisualSpecsPlaceholder: 'Describe the technical task or desired style...',
    cfgUploadReference: 'Upload 3 reference photos for style',

    cfgStep3Title: 'Interior Configuration',
    cfgPaperType: 'Paper type:',
    'cfgPaper_offset-ivory': 'Offset Ivory (90g)',
    'cfgPaper_offset-white': 'Offset White (90g)',
    'cfgPaper_coated-matt': 'Coated Matt (90g)',
    'cfgPaper_coated-gloss': 'Coated Gloss (90g)',
    cfgPrintType: 'Print:',
    cfgPrint_color: 'Color',
    cfgPrint_bw: 'Black & White',
    cfgFont: 'Font:',
    cfgFontPreviewText: 'Every story begins with a single word',

    cfgStep4Title: 'Cover & Premium Packaging',
    cfgStep4Desc: 'The final step for a luxury finished product.',
    cfgCoverMaterial: 'Cover material:',
    cfgCover_printed: 'Hard cover, printed design',
    cfgCoverDesc_printed: 'Full-color printed artwork on rigid board',
    cfgCover_velvet: 'Hard cover, velvet material, embroidered design',
    cfgCoverDesc_velvet: 'Soft-touch velvet with embroidered elements',
    cfgCoverCustom: 'Cover personalization:',
    cfgCoverCustomPlaceholder: 'Add cover text or instructions...',
    cfgUploadCoverRef: 'Upload reference images / design elements',
    cfgFinish: 'Packaging texture:',
    cfgFinish_matte: 'Soft-Touch Matte',
    cfgFinishDesc_matte: 'Velvety smooth surface with zero sheen',
    cfgFinish_linen: 'Linen Cloth',
    cfgFinishDesc_linen: 'Woven textile texture with visible cross-weave',
    cfgFinish_foil: 'Gold Foil Stamp',
    cfgFinishDesc_foil: 'Hot-stamped metallic lettering and accents',
    cfgFinish_emboss: 'Blind Emboss',
    cfgFinishDesc_emboss: 'Raised letterforms pressed into the surface',
    cfgAmbalajSection: 'Packaging',
    cfgAmbalajColor1: 'Primary color:',
    cfgAmbalajColor2: 'Secondary color:',
    cfgAmbalajStrap: 'Strap color:',
    cfgPkgStep1Title: 'Packaging Format',
    cfgPkgStep1Desc: 'Select the packaging size and quantity.',
    cfgPkgSize: 'Packaging size:',

    cfgSummaryTitle: 'Summary',
    cfgPricingTitle: 'Pricing Options',
    cfgPricingDesc: 'Reference prices based on standard configuration.',
    cfgPricingOption1Name: 'Printed Cover',
    cfgPricingOption1Desc: 'Standard format, 248 pages, 1 piece, 3–5 illustrations, offset ivory, black & white, Minion Pro, hard cover, printed design',
    cfgPricingOption2Name: 'Velvet Cover',
    cfgPricingOption2Desc: 'Standard format, 248 pages, 1 piece, 3–5 illustrations, offset ivory, black & white, Minion Pro, hard cover, velvet material, embroidered design',
    cfgPricingCustomName: 'Your Configuration',
    cfgPricingCustomPrice: 'Custom',
    cfgPricingCustomDesc: 'Based on the options you selected above — let\'s connect to establish the right price for your unique edition.',
    cfgPricingCustomCta: 'Get in Touch',    cfgPricingMatchBadge: 'Your selection',
    cfgPricingMatchMsg: 'Your configuration matches this option \u2014 the price shown applies to your edition.',  },

  ro: {
    // Nav
    navStory: 'Povestea',
    navGallery: 'Galerie',
    navCustomize: 'Personalizare',
    navInquire: 'Contact',

    // Hero
    heroEyebrow: 'Ediție de carte personalizată',
    heroTitle1: 'Cuvintele',
    heroAmpersand: '&',
    heroTitle1b: 'amintirile tale',
    heroTitleConnector: '',
    heroTitle2: 'prind o nouă dimensiune.',
    heroSub1: 'Fiecare element este conceput să transforme',
    heroSub2: 'actul deschiderii într-o experiență de neuitat.',
    heroCta: 'Personalizează',
    heroLearn: 'Află mai multe',

    // Story
    storyEyebrow: 'Produsul',
    storyTitle1: 'La prima vedere, o formă',
    storyTitle2: 'rectangulară rafinată.',
    storyBody: 'Minimalist. Precis. Sigilat magnetic. Exteriorul nu dezvăluie nimic din ceea ce ascunde - doar încrederea tăcută a ceva pentru care merită să aștepți.',

    // Moment
    momentEyebrow: 'Momentul',
    momentTitle1: 'Adevărata magie începe la',
    momentTitle3: 'deschidere',
    // momentTitle3: 'deschis.',
    momentBody: 'Aceasta prinde viață printr-o mișcare calmă, totul se desfășoară lin, ca într-un mic spectacol. Pereții cad ușor, ghidați de curele fine, și ridică cartea în sus.',

    // Gallery
    galleryEyebrow: 'Produsul',
    galleryTitle1: 'Coregrafiat',
    galleryTitleConnector: 'până la ',
    galleryTitle2: 'perfecțiune.',
    galleryBody: 'Fiecare unghi spune o poveste despre inginerie de precizie și meșteșug rafinat.',
    galleryCaptions: [
      'Închis - Exterior învelit în pânză de in cu sigiliu magnetic',
      'Deschidere - Coperțile cad dezvăluind interiorul',
      'Dezvăluit - Cartea ridicată de curele din panglică',
      'Detaliu - Interior vișiniu cu accente aurii',
      'Compoziție - Copertă de catifea cu carte deschisă și flori',
      'Editorial - Aranjament complet al colecției',
    ],

    // Statement
    statement1: 'Nu este doar ambalaj.',
    statement2: 'Este pasiune.',

    // Customize
    customizeEyebrow: 'Configurare',
    customizeTitle: 'Configurează ediția ta de colecție',
    customizeBody: 'Creează o carte unică, de o calitate excepțională, protejată de un ambalaj premium.',

    // Specs
    specsEyebrow: 'Specificații & Caracteristici',
    specs: [
      { icon: '⟁', title: 'Închidere magnetică', desc: 'Magneți din neodim amplasați cu precizie ce creează un sigiliu satisfăcător și sigur.' },
      { icon: '⧖', title: 'Curele ghidate', desc: 'Curele fine din panglică controlează verticalizarea conținutului cu intenție.' },
      { icon: '◇', title: 'Personalizare completă', desc: 'Fiecare detaliu - de la culori la materiale - adaptat exact viziunii tale.' },
      { icon: '⬡', title: 'Dimensiuni la comandă', desc: 'Proiectat să se potrivească exact produsului tău, până la milimetru.' },
      { icon: '◎', title: 'Materiale premium', desc: 'Hârtii soft-touch, pânzeturi de in, fibre brute și substraturi speciale.' },
      { icon: '⊞', title: 'Integritate structurală', desc: 'Construcție din carton rigid cu colțuri armate pentru durabilitate.' },
    ],

    // Closing
    closingEyebrow: 'Personal',
    closingTitle1: 'O experiență de ambalare',
    closingTitleConnector: 'care se simte ',
    closingTitle2: 'profund personală.',
    closingBody: 'Creat nu doar pentru un produs - ci pentru persoana care îl primește.',

    // CTA
    ctaTitle: 'Începe-ți povestea.',
    ctaBody1: 'Fiecare proiect începe cu o conversație.',
    ctaBody2: 'Spune-ne viziunea ta și vom crea ceva extraordinar.',
    ctaButton: 'Contactează-ne',

    // Footer
    footerCopy: '© 2026 Unfold. Ambalaj Premium Personalizat.',

    // Typewriter
    typewriterPhrases: [
      'Tuturor le plac poveștile.',
      'Imaginația este singura limită.',
      'Creează-ți propria narațiune.',
    ],

    // Scroll text lines
    scrollLines: [
      'PRECIZIE · MEȘTEȘUG · ELEGANȚĂ · DETALIU · PRECIZIE · MEȘTEȘUG · ELEGANȚĂ · DETALIU · ',
      'MAGNETIC · ÎNCHIDERE · PERSONALIZAT · LUX · MAGNETIC · ÎNCHIDERE · PERSONALIZAT · LUX · ',
      'FINEȚE · EXPERIENȚĂ · TRANSFORMARE · DEZVĂLUIRE · FINEȚE · EXPERIENȚĂ · TRANSFORMARE · DEZVĂLUIRE · ',
    ],

    // Magnetic filings hint
    filingsHint: 'Mișcă cursorul',

    // Customizer
    custVariantClosed: 'Închis',
    custVariantOpen: 'Deschis',
    cfgPreviewPackaging: 'Ambalaj',
    cfgPreviewBook: 'Carte',

    // Configurator Steps
    cfgStep1Title: 'Formatul și volumul cărții',
    cfgStep1Desc: 'Alege dimensiunea potrivită pentru proiectul tău și numărul de exemplare.',
    cfgBookFormat: 'Formatul cărții:',
    cfgFormat_pocket: 'Pocket',
    cfgFormat_standard: 'Standard',
    cfgFormat_landscape: 'Landscape (A4)',
    cfgPageCount: 'Număr de pagini:',
    cfgPages: 'pagini',
    cfgManuscript: 'Fișier text:',
    cfgUploadManuscript: 'Încarcă manuscrisul în dimensiunea selectată (PDF)',
    cfgQuantity: 'Cantitate:',
    cfgPieces: 'bucăți',

    cfgStep2Title: 'Ilustrații pentru interiorul cărții',
    cfgStep2Desc: 'Personalizează paginile cu artă vizuală. Selectează pachetul și metoda de creație.',
    cfgIllustrationPkg: 'Pachete de ilustrații:',
    cfgIllPkg_none: 'Fără ilustrații / Ilustrații personale',
    cfgIllPkg_standard: 'Set 3–5 ilustrații (Standard)',
    cfgIllPkg_premium: 'Set 6–10 ilustrații (Premium)',
    cfgIllPkg_collection: 'Set 11–15 ilustrații (Colecție)',
    cfgIllSourceOwn: 'Sursa:',
    cfgUploadIllustrations: 'Atașează ilustrații / Fotografii',
    cfgIllSource: 'Sursa ilustrațiilor:',
    cfgIllSrc_ai: 'Generare AI',
    cfgIllSrcDesc_ai: 'Create prin inteligență artificială conform tematicii tale.',
    cfgIllSrc_designer: 'Design personalizat',
    cfgIllSrcDesc_designer: 'Realizate de un designer profesionist.',
    cfgVisualSpecs: 'Specificații vizuale:',
    cfgVisualSpecsPlaceholder: 'Descrie sarcina tehnică sau stilul dorit...',
    cfgUploadReference: 'Încarcă 3 fotografii de referință pentru stil',

    cfgStep3Title: 'Configurarea conținutului interior',
    cfgPaperType: 'Tipul hârtiei:',
    'cfgPaper_offset-ivory': 'Offset Ivory (90g)',
    'cfgPaper_offset-white': 'Offset White (90g)',
    'cfgPaper_coated-matt': 'Cretată Matt (90g)',
    'cfgPaper_coated-gloss': 'Cretată Gloss (90g)',
    cfgPrintType: 'Tipar:',
    cfgPrint_color: 'Color',
    cfgPrint_bw: 'Alb-Negru',
    cfgFont: 'Font:',
    cfgFontPreviewText: 'Fiecare poveste începe cu un singur cuvânt',

    cfgStep4Title: 'Coperta și ambalajul premium',
    cfgStep4Desc: 'Ultimul pas pentru un produs finit de lux.',
    cfgCoverMaterial: 'Material pentru copertă:',
    cfgCover_printed: 'Copertă tare, design imprimat',
    cfgCoverDesc_printed: 'Imprimare full-color pe carton rigid',
    cfgCover_velvet: 'Copertă tare, material catifea, design brodat',
    cfgCoverDesc_velvet: 'Catifea soft-touch cu elemente brodate',
    cfgCoverCustom: 'Personalizarea copertei:',
    cfgCoverCustomPlaceholder: 'Adaugă textul pentru copertă sau instrucțiuni...',
    cfgUploadCoverRef: 'Încarcă imagini de referință / elemente pentru design',
    cfgFinish: 'Textura ambalajului:',
    cfgFinish_matte: 'Mat Soft-Touch',
    cfgFinishDesc_matte: 'Suprafață catifelată fără luciu',
    cfgFinish_linen: 'Pânză de In',
    cfgFinishDesc_linen: 'Textură textilă țesută cu împletitură vizibilă',
    cfgFinish_foil: 'Ștanțare Folie Aurie',
    cfgFinishDesc_foil: 'Litere și accente metalice ștanțate la cald',
    cfgFinish_emboss: 'Embosare Oarbă',
    cfgFinishDesc_emboss: 'Forme de litere în relief presate în suprafață',
    cfgAmbalajSection: 'Ambalaj',
    cfgAmbalajColor1: 'Culoare primară:',
    cfgAmbalajColor2: 'Culoare secundară:',
    cfgAmbalajStrap: 'Culoare curele:',
    cfgPkgStep1Title: 'Formatul ambalajului',
    cfgPkgStep1Desc: 'Selectează dimensiunea ambalajului și cantitatea.',
    cfgPkgSize: 'Dimensiunea ambalajului:',

    cfgSummaryTitle: 'Rezumat',
    cfgPricingTitle: 'Opțiuni de preț',
    cfgPricingDesc: 'Prețuri de referință pentru configurația standard.',
    cfgPricingOption1Name: 'Copertă imprimată',
    cfgPricingOption1Desc: 'Format standard, 248 pagini, 1 bucată, 3–5 ilustrații, offset ivory, alb-negru, Minion Pro, copertă tare, design imprimat',
    cfgPricingOption2Name: 'Copertă catifea',
    cfgPricingOption2Desc: 'Format standard, 248 pagini, 1 bucată, 3–5 ilustrații, offset ivory, alb-negru, Minion Pro, copertă tare, material catifea, design brodat',
    cfgPricingCustomName: 'Configurația ta',
    cfgPricingCustomPrice: 'Personalizat',
    cfgPricingCustomDesc: 'Pe baza opțiunilor selectate mai sus — hai să stabilim împreună prețul potrivit pentru ediția ta unică.',
    cfgPricingCustomCta: 'Contactează-ne',
  },
}

export default translations
