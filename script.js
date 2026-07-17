const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');

if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    });
  });
}

const languageContainer = document.querySelector('.language');
if (languageContainer && !languageContainer.querySelector('[data-language="es"]')) {
  const spanishButton = document.createElement('button');
  spanishButton.className = 'lang';
  spanishButton.dataset.language = 'es';
  spanishButton.type = 'button';
  spanishButton.textContent = 'ES';
  spanishButton.setAttribute('aria-pressed', 'false');
  languageContainer.appendChild(spanishButton);
}

const translations = {
  'Work': { fr: 'Projets', es: 'Proyectos' },
  'Services': { fr: 'Services', es: 'Servicios' },
  'About': { fr: 'À propos', es: 'Nosotros' },
  'Contact': { fr: 'Contact', es: 'Contacto' },
  'Available for new projects': { fr: 'Disponible pour de nouveaux projets', es: 'Disponible para nuevos proyectos' },
  'I turn ideas into digital experiences people remember.': {
    en: 'We build digital experiences that help businesses launch, grow and scale.',
    fr: 'Nous créons des expériences numériques qui aident les entreprises à se lancer, grandir et évoluer.',
    es: 'Creamos experiencias digitales que ayudan a las empresas a lanzar, crecer y escalar.'
  },
  'Websites, mobile apps, visual identities, data dashboards and AI-powered solutions—designed with clarity and built for growth.': {
    en: 'From strategy and design to development, launch and six months of maintenance, Ederito delivers complete digital solutions as part of Zanara Labs LLC.',
    fr: 'De la stratégie et du design au développement, au lancement et à six mois de maintenance, Ederito fournit des solutions numériques complètes au sein de Zanara Labs LLC.',
    es: 'Desde la estrategia y el diseño hasta el desarrollo, el lanzamiento y seis meses de mantenimiento, Ederito ofrece soluciones digitales completas como parte de Zanara Labs LLC.'
  },
  'Explore my work': { en: 'Explore our work', fr: 'Découvrir nos projets', es: 'Ver nuestros proyectos' },
  'Start a project': { fr: 'Démarrer un projet', es: 'Iniciar un proyecto' },
  'I respond in less than 24 hours.': { en: 'We respond in less than 24 hours.', fr: 'Nous répondons en moins de 24 heures.', es: 'Respondemos en menos de 24 horas.' },
  'Digital product': { fr: 'Produit numérique', es: 'Producto digital' },
  'From idea to launch': { fr: 'De l’idée au lancement', es: 'De la idea al lanzamiento' },
  'Selected projects': { fr: 'Projets sélectionnés', es: 'Proyectos seleccionados' },
  'Real products. Real brands. Built with intention.': { fr: 'De vrais produits. De vraies marques. Conçus avec intention.', es: 'Productos reales. Marcas reales. Creados con intención.' },
  'A selection of mobile, web and brand experiences I have created and developed.': {
    en: 'A selection of mobile, web and brand experiences we have created and developed.',
    fr: 'Une sélection d’expériences mobiles, web et de marque que nous avons conçues et développées.',
    es: 'Una selección de experiencias móviles, web y de marca que hemos diseñado y desarrollado.'
  },
  'A Caribbean-inspired social connection platform built to help people form authentic romantic, social and professional relationships. I shaped the product experience, interface, backend workflows and launch ecosystem.': {
    fr: 'Une plateforme de connexion sociale d’inspiration caribéenne, conçue pour favoriser des relations amoureuses, sociales et professionnelles authentiques. J’ai façonné l’expérience produit, l’interface, les processus backend et l’écosystème de lancement.',
    es: 'Una plataforma de conexión social inspirada en el Caribe, creada para fomentar relaciones románticas, sociales y profesionales auténticas. Diseñé la experiencia de producto, la interfaz, los flujos de backend y el ecosistema de lanzamiento.'
  },
  'View live website ↗': { fr: 'Voir le site ↗', es: 'Ver sitio web ↗' },
  'A premium bilingual media presence created for Haitian culture, events, sports, promotions and brand collaborations.': {
    fr: 'Une présence média bilingue et haut de gamme dédiée à la culture haïtienne, aux événements, au sport, aux promotions et aux collaborations de marque.',
    es: 'Una presencia mediática bilingüe y premium dedicada a la cultura haitiana, los eventos, el deporte, las promociones y las colaboraciones de marca.'
  },
  'A bold launch experience for an upcoming going-out platform, positioning events, social discovery and shared experiences in one product.': {
    fr: 'Une expérience de lancement audacieuse pour une plateforme de sorties, réunissant événements, découverte sociale et expériences partagées dans un seul produit.',
    es: 'Una experiencia de lanzamiento audaz para una plataforma de salidas que reúne eventos, descubrimiento social y experiencias compartidas en un solo producto.'
  },
  'Capabilities': { fr: 'Expertises', es: 'Capacidades' },
  'One partner for design, technology and launch.': { en: 'One partner from strategy to launch—and beyond.', fr: 'Un seul partenaire de la stratégie au lancement—et au-delà.', es: 'Un solo socio desde la estrategia hasta el lanzamiento—y más allá.' },
  'Websites & digital platforms': { fr: 'Sites web et plateformes numériques', es: 'Sitios web y plataformas digitales' },
  'Premium business websites, portfolios, media platforms, booking flows and responsive landing pages.': {
    fr: 'Sites professionnels haut de gamme, portfolios, plateformes média, systèmes de réservation et pages d’atterrissage responsives.',
    es: 'Sitios empresariales premium, portafolios, plataformas de medios, sistemas de reservas y páginas de aterrizaje responsivas.'
  },
  'Mobile application development': { fr: 'Développement d’applications mobiles', es: 'Desarrollo de aplicaciones móviles' },
  'iOS and Android products with authentication, databases, payments, messaging and custom workflows.': {
    fr: 'Produits iOS et Android avec authentification, bases de données, paiements, messagerie et fonctionnalités sur mesure.',
    es: 'Productos para iOS y Android con autenticación, bases de datos, pagos, mensajería y flujos personalizados.'
  },
  'Brand identity & campaign design': { fr: 'Identité de marque et campagnes', es: 'Identidad de marca y campañas' },
  'Logos, visual systems, flyers, social media assets and launch campaigns that feel consistent and recognizable.': {
    fr: 'Logos, systèmes visuels, flyers, contenus sociaux et campagnes de lancement cohérents et reconnaissables.',
    es: 'Logotipos, sistemas visuales, flyers, contenido para redes y campañas de lanzamiento coherentes y reconocibles.'
  },
  'Data, Tableau & AI solutions': { fr: 'Données, Tableau et solutions IA', es: 'Datos, Tableau y soluciones de IA' },
  'Business dashboards, automated insights and thoughtful AI integrations that make products and decisions smarter.': {
    fr: 'Tableaux de bord professionnels, analyses automatisées et intégrations IA utiles pour améliorer les produits et la prise de décision.',
    es: 'Paneles empresariales, análisis automatizados e integraciones de IA útiles para mejorar productos y decisiones.'
  },
  'About Eder': { en: 'About Ederito', fr: 'À propos d’Ederito', es: 'Sobre Ederito' },
  'Business-minded. Design-led. Grounded in service.': { en: 'Business-minded. Design-led. Built to support growth.', fr: 'Esprit d’entreprise. Guidé par le design. Conçu pour soutenir la croissance.', es: 'Mentalidad empresarial. Guiado por el diseño. Creado para impulsar el crecimiento.' },
  'Read the University of the Ozarks feature ↗': { fr: 'Lire l’article de l’University of the Ozarks ↗', es: 'Leer el artículo de University of the Ozarks ↗' },
  '“Design should do more than look good—it should move an idea, a business and a community forward.”': { fr: '« Le design doit faire plus qu’être beau : il doit faire avancer une idée, une entreprise et une communauté. »', es: '«El diseño debe hacer más que verse bien: debe impulsar una idea, un negocio y una comunidad.»' },
  'Let’s work together': { fr: 'Travaillons ensemble', es: 'Trabajemos juntos' },
  'Have an idea? Let’s make it real.': { fr: 'Vous avez une idée ? Donnons-lui vie.', es: '¿Tienes una idea? Hagámosla realidad.' },
  'Tell me what you are building, what you need, and when you would like to launch. I respond in less than 24 hours.': {
    en: 'Tell us what you are building, what you need and when you would like to launch. We respond in less than 24 hours.',
    fr: 'Parlez-nous de votre projet, de vos besoins et de votre date de lancement. Nous répondons en moins de 24 heures.',
    es: 'Cuéntanos qué estás creando, qué necesitas y cuándo quieres lanzar. Respondemos en menos de 24 horas.'
  },
  'Your name': { fr: 'Votre nom', es: 'Tu nombre' },
  'Email': { fr: 'E-mail', es: 'Correo electrónico' },
  'What do you need?': { fr: 'De quoi avez-vous besoin ?', es: '¿Qué necesitas?' },
  'Tell me about your project': { en: 'Tell us about your project', fr: 'Parlez-nous de votre projet', es: 'Cuéntanos sobre tu proyecto' },
  'Send project request': { fr: 'Envoyer la demande', es: 'Enviar solicitud' },
  'This opens your email app with the project details ready to send.': { fr: 'Votre application e-mail s’ouvrira avec les détails du projet prêts à être envoyés.', es: 'Esto abrirá tu aplicación de correo con los detalles del proyecto listos para enviar.' },
  'All rights reserved.': { fr: 'Tous droits réservés.', es: 'Todos los derechos reservados.' }
};

const supportedLanguages = ['en', 'fr', 'es'];
const metadata = {
  en: {
    title: 'Ederito — Digital Solutions by Zanara Labs LLC',
    description: 'Ederito builds premium websites, mobile applications, brands, data products and AI solutions from strategy to launch.'
  },
  fr: {
    title: 'Ederito — Solutions numériques par Zanara Labs LLC',
    description: 'Ederito crée des sites web, applications mobiles, marques, produits de données et solutions IA de la stratégie au lancement.'
  },
  es: {
    title: 'Ederito — Soluciones digitales por Zanara Labs LLC',
    description: 'Ederito crea sitios web, aplicaciones móviles, marcas, productos de datos y soluciones de IA desde la estrategia hasta el lanzamiento.'
  }
};

function prepareTranslatedElements() {
  document.querySelectorAll('[data-en]').forEach((element) => {
    const original = element.dataset.en || element.textContent.trim();
    const entry = translations[original];
    if (!entry) return;
    element.dataset.en = entry.en || original;
    element.dataset.fr = entry.fr || element.dataset.fr || original;
    element.dataset.es = entry.es || original;
  });
}

function injectBusinessPositioning() {
  const identityLabels = document.querySelectorAll('.identity span');
  identityLabels.forEach((label) => { label.textContent = 'EDERITO'; });

  const servicesSection = document.getElementById('services');
  if (servicesSection && !document.getElementById('maintenance')) {
    const maintenance = document.createElement('section');
    maintenance.id = 'maintenance';
    maintenance.className = 'section maintenance-wrap';
    maintenance.innerHTML = `
      <div class="wrap maintenance-grid">
        <div class="maintenance-copy reveal">
          <p class="eyebrow" data-en="Built for the long term" data-fr="Conçu pour durer" data-es="Creado para el largo plazo">Built for the long term</p>
          <h2 data-en="Six months of maintenance included after launch." data-fr="Six mois de maintenance inclus après le lancement." data-es="Seis meses de mantenimiento incluidos después del lanzamiento.">Six months of maintenance included after launch.</h2>
          <p data-en="Eligible website and application projects include six months of post-launch care. We handle agreed small updates, technical fixes, performance checks and guidance while your product settles into real-world use." data-fr="Les projets de sites web et d’applications admissibles comprennent six mois de suivi après le lancement. Nous prenons en charge les petites mises à jour convenues, les corrections techniques, les contrôles de performance et l’accompagnement pendant la mise en service réelle du produit." data-es="Los proyectos elegibles de sitios web y aplicaciones incluyen seis meses de soporte después del lanzamiento. Nos encargamos de pequeñas actualizaciones acordadas, correcciones técnicas, revisiones de rendimiento y orientación mientras tu producto entra en uso real.">Eligible website and application projects include six months of post-launch care. We handle agreed small updates, technical fixes, performance checks and guidance while your product settles into real-world use.</p>
          <p class="maintenance-note" data-en="After the included period, continue with a monthly care plan or request maintenance when needed." data-fr="Après la période incluse, poursuivez avec un forfait mensuel ou demandez une intervention ponctuelle selon vos besoins." data-es="Después del período incluido, continúa con un plan mensual o solicita mantenimiento cuando lo necesites.">After the included period, continue with a monthly care plan or request maintenance when needed.</p>
          <a class="btn btn-gold" href="#contact" data-en="Discuss your project" data-fr="Parler de votre projet" data-es="Hablar de tu proyecto">Discuss your project</a>
        </div>
        <div class="maintenance-card reveal delay">
          <span class="maintenance-badge" data-en="Included care" data-fr="Suivi inclus" data-es="Soporte incluido">Included care</span>
          <strong>6</strong>
          <h3 data-en="Months free" data-fr="Mois offerts" data-es="Meses gratis">Months free</h3>
          <ul>
            <li data-en="Agreed small content updates" data-fr="Petites mises à jour de contenu convenues" data-es="Pequeñas actualizaciones de contenido acordadas">Agreed small content updates</li>
            <li data-en="Technical fixes related to the delivered build" data-fr="Corrections techniques liées au produit livré" data-es="Correcciones técnicas relacionadas con el producto entregado">Technical fixes related to the delivered build</li>
            <li data-en="Performance and security checks" data-fr="Contrôles de performance et de sécurité" data-es="Revisiones de rendimiento y seguridad">Performance and security checks</li>
            <li data-en="Launch support and guidance" data-fr="Assistance et accompagnement au lancement" data-es="Soporte y orientación para el lanzamiento">Launch support and guidance</li>
          </ul>
        </div>
      </div>`;
    servicesSection.insertAdjacentElement('afterend', maintenance);
  }

  const footerText = document.querySelector('.footer p');
  if (footerText) {
    footerText.innerHTML = `© <span id="year"></span> Ederito. <span data-en="A digital solutions company within Zanara Labs LLC." data-fr="Une entreprise de solutions numériques au sein de Zanara Labs LLC." data-es="Una empresa de soluciones digitales dentro de Zanara Labs LLC.">A digital solutions company within Zanara Labs LLC.</span> <span data-en="All rights reserved." data-fr="Tous droits réservés." data-es="Todos los derechos reservados.">All rights reserved.</span>`;
  }

  if (!document.getElementById('ederito-v2-styles')) {
    const style = document.createElement('style');
    style.id = 'ederito-v2-styles';
    style.textContent = `
      .maintenance-wrap{background:linear-gradient(135deg,#111318 0%,#08090b 55%,#17130a 100%);border-block:1px solid var(--line)}
      .maintenance-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:70px;align-items:center}
      .maintenance-copy h2{font-size:clamp(42px,5.5vw,72px);line-height:1.03;letter-spacing:-.055em;margin-bottom:24px}
      .maintenance-copy>p{color:var(--muted);font-size:18px;max-width:760px}
      .maintenance-note{padding:16px 18px;border-left:3px solid var(--gold);background:rgba(242,190,50,.07);border-radius:0 12px 12px 0;margin:26px 0}
      .maintenance-card{padding:38px;border:1px solid rgba(242,190,50,.32);border-radius:26px;background:linear-gradient(180deg,rgba(242,190,50,.11),rgba(255,255,255,.025));box-shadow:0 30px 90px rgba(0,0,0,.35)}
      .maintenance-card strong{display:block;font:800 clamp(90px,12vw,150px)/.9 Manrope;color:var(--gold);letter-spacing:-.08em}
      .maintenance-card h3{font-size:34px;margin:10px 0 24px}
      .maintenance-card ul{list-style:none;margin:0;padding:0;display:grid;gap:14px}
      .maintenance-card li{position:relative;padding-left:28px;color:#d7d3ca}
      .maintenance-card li:before{content:'✓';position:absolute;left:0;color:var(--gold);font-weight:800}
      .maintenance-badge{display:inline-flex;padding:8px 12px;border:1px solid rgba(242,190,50,.35);border-radius:999px;color:var(--gold);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:26px}
      @media(max-width:900px){.maintenance-grid{grid-template-columns:1fr;gap:36px}}
      @media(max-width:640px){.language{gap:2px}.lang{padding:8px}.maintenance-card{padding:25px}.maintenance-copy h2{font-size:42px}}
    `;
    document.head.appendChild(style);
  }
}

injectBusinessPositioning();
prepareTranslatedElements();

const languageButtons = document.querySelectorAll('.lang');
function setLanguage(requestedLanguage) {
  const lang = supportedLanguages.includes(requestedLanguage) ? requestedLanguage : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;

  document.querySelectorAll('[data-en]').forEach((element) => {
    const translation = element.dataset[lang];
    if (typeof translation === 'string') element.textContent = translation;
  });

  languageButtons.forEach((button) => {
    const active = button.dataset.language === lang;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  document.title = metadata[lang].title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', metadata[lang].description);
  localStorage.setItem('ederito-language', lang);
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.language));
});

const savedLanguage = localStorage.getItem('ederito-language');
const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
setLanguage(savedLanguage || (supportedLanguages.includes(browserLanguage) ? browserLanguage : 'en'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lang = document.documentElement.dataset.lang || 'en';
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const service = String(data.get('service') || '').trim();
    const message = String(data.get('message') || '').trim();

    const templates = {
      en: { subject: `New Ederito project request — ${name}`, body: `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nProject:\n${message}` },
      fr: { subject: `Nouvelle demande de projet Ederito — ${name}`, body: `Nom : ${name}\nE-mail : ${email}\nService : ${service}\n\nProjet :\n${message}` },
      es: { subject: `Nueva solicitud de proyecto Ederito — ${name}`, body: `Nombre: ${name}\nCorreo: ${email}\nServicio: ${service}\n\nProyecto:\n${message}` }
    };

    const template = templates[lang] || templates.en;
    window.location.href = `mailto:Keffgorederthermozier@gmail.com?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
  });
}
