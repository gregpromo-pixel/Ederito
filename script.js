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

const supportedLanguages = ['en', 'fr', 'es'];
const languageButtons = document.querySelectorAll('.lang');
const metadata = {
  en: {
    title: 'Ederito — Digital Solutions by Zanara Labs LLC',
    description: 'Ederito builds premium websites, mobile apps, brands, data products and AI solutions from strategy to launch.',
    ogTitle: 'Ederito — Design. Build. Grow.',
    ogDescription: 'End-to-end digital solutions with six months of maintenance included on eligible builds.'
  },
  fr: {
    title: 'Ederito — Solutions numériques par Zanara Labs LLC',
    description: 'Ederito crée des sites web, applications mobiles, marques, produits de données et solutions IA de la stratégie au lancement.',
    ogTitle: 'Ederito — Concevoir. Créer. Développer.',
    ogDescription: 'Des solutions numériques de bout en bout avec six mois de maintenance inclus sur les projets admissibles.'
  },
  es: {
    title: 'Ederito — Soluciones digitales por Zanara Labs LLC',
    description: 'Ederito crea sitios web, aplicaciones móviles, marcas, productos de datos y soluciones de IA desde la estrategia hasta el lanzamiento.',
    ogTitle: 'Ederito — Diseñar. Crear. Crecer.',
    ogDescription: 'Soluciones digitales de principio a fin con seis meses de mantenimiento incluidos en proyectos elegibles.'
  }
};

function setMetaContent(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute('content', value);
}

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

  const pageMeta = metadata[lang];
  document.title = pageMeta.title;
  setMetaContent('meta[name="description"]', pageMeta.description);
  setMetaContent('meta[property="og:title"]', pageMeta.ogTitle);
  setMetaContent('meta[property="og:description"]', pageMeta.ogDescription);
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
      en: {
        subject: `New Ederito project request — ${name}`,
        body: `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nProject:\n${message}`
      },
      fr: {
        subject: `Nouvelle demande de projet Ederito — ${name}`,
        body: `Nom : ${name}\nE-mail : ${email}\nService : ${service}\n\nProjet :\n${message}`
      },
      es: {
        subject: `Nueva solicitud de proyecto Ederito — ${name}`,
        body: `Nombre: ${name}\nCorreo: ${email}\nServicio: ${service}\n\nProyecto:\n${message}`
      }
    };

    const template = templates[lang] || templates.en;
    window.location.href = `mailto:Keffgorederthermozier@gmail.com?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
  });
}
