const supportedLanguages = ['en', 'fr', 'es'];
const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');

if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }));
}

function installLegalLinks() {
  const footer = document.querySelector('.footer');
  const footerLinks = footer?.querySelector('div');
  if (footerLinks && !footerLinks.querySelector('[href="legal.html"]')) {
    const links = [
      ['legal.html#terms', 'Terms', 'Conditions', 'Términos'],
      ['legal.html#privacy', 'Privacy', 'Confidentialité', 'Privacidad'],
      ['legal.html#maintenance', 'Maintenance policy', 'Politique de maintenance', 'Política de mantenimiento'],
      ['legal.html#refunds', 'Refund policy', 'Politique de remboursement', 'Política de reembolso']
    ];
    links.forEach(([href, en, fr, es]) => {
      const link = document.createElement('a');
      link.href = href;
      link.dataset.en = en;
      link.dataset.fr = fr;
      link.dataset.es = es;
      link.textContent = en;
      footerLinks.appendChild(link);
    });
  }

  const form = document.getElementById('contactForm');
  const submit = form?.querySelector('button[type="submit"]');
  if (form && submit && !document.getElementById('legalAcceptance')) {
    const consent = document.createElement('label');
    consent.className = 'legal-consent';
    consent.innerHTML = `
      <input id="legalAcceptance" name="legal_acceptance" type="checkbox" required>
      <span data-en="I confirm that I am authorized to submit this request and agree to Ederito’s Terms, Privacy Policy, Maintenance Policy and Refund Policy. A project does not begin until a separate proposal or agreement is approved and any required deposit is paid."
            data-fr="Je confirme être autorisé à envoyer cette demande et j’accepte les Conditions, la Politique de confidentialité, la Politique de maintenance et la Politique de remboursement d’Ederito. Un projet ne commence qu’après approbation d’une proposition ou d’un contrat distinct et paiement de l’acompte requis."
            data-es="Confirmo que estoy autorizado para enviar esta solicitud y acepto los Términos, la Política de Privacidad, la Política de Mantenimiento y la Política de Reembolso de Ederito. Un proyecto no comienza hasta que se apruebe una propuesta o contrato separado y se pague el depósito requerido.">I confirm that I am authorized to submit this request and agree to Ederito’s Terms, Privacy Policy, Maintenance Policy and Refund Policy. A project does not begin until a separate proposal or agreement is approved and any required deposit is paid.</span>`;
    const policyLinks = document.createElement('p');
    policyLinks.className = 'legal-policy-links';
    policyLinks.innerHTML = `<a href="legal.html" target="_blank" rel="noopener" data-en="Review the Legal Center before submitting ↗" data-fr="Consulter le Centre juridique avant l’envoi ↗" data-es="Revisar el Centro Legal antes de enviar ↗">Review the Legal Center before submitting ↗</a>`;
    form.insertBefore(consent, submit);
    form.insertBefore(policyLinks, submit);
  }

  if (!document.getElementById('legal-ui-styles')) {
    const style = document.createElement('style');
    style.id = 'legal-ui-styles';
    style.textContent = `
      .legal-consent{display:grid!important;grid-template-columns:20px 1fr!important;gap:11px!important;align-items:start!important;padding:15px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.025);font-size:12px!important;line-height:1.55;color:#aaa8a1!important}
      .legal-consent input{width:18px!important;height:18px!important;margin:2px 0 0!important;accent-color:var(--gold)}
      .legal-policy-links{margin:-8px 0 0!important;font-size:12px!important}.legal-policy-links a{color:var(--gold);text-decoration:none}
      .footer>div{row-gap:10px;flex-wrap:wrap}.footer>div a{white-space:nowrap}
    `;
    document.head.appendChild(style);
  }
}

installLegalLinks();

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
  document.querySelector('meta[name="description"]')?.setAttribute('content', metadata[lang].description);
  localStorage.setItem('ederito-language', lang);
}

languageButtons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
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
if (year) year.textContent = String(new Date().getFullYear());

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const data = new FormData(contactForm);
    const lang = document.documentElement.dataset.lang || 'en';
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const service = String(data.get('service') || '').trim();
    const message = String(data.get('message') || '').trim();
    const acceptedAt = new Date().toISOString();

    const templates = {
      en: {
        subject: `New Ederito project request — ${name}`,
        body: `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nProject:\n${message}\n\nLegal policies accepted: Yes\nAccepted at: ${acceptedAt}\nNote: This request is not a final project agreement.`
      },
      fr: {
        subject: `Nouvelle demande de projet Ederito — ${name}`,
        body: `Nom : ${name}\nE-mail : ${email}\nService : ${service}\n\nProjet :\n${message}\n\nPolitiques juridiques acceptées : Oui\nAcceptées le : ${acceptedAt}\nRemarque : cette demande ne constitue pas un contrat de projet définitif.`
      },
      es: {
        subject: `Nueva solicitud de proyecto Ederito — ${name}`,
        body: `Nombre: ${name}\nCorreo: ${email}\nServicio: ${service}\n\nProyecto:\n${message}\n\nPolíticas legales aceptadas: Sí\nAceptadas el: ${acceptedAt}\nNota: esta solicitud no constituye un contrato final del proyecto.`
      }
    };

    const template = templates[lang] || templates.en;
    window.location.href = `mailto:Keffgorederthermozier@gmail.com?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
  });
}
