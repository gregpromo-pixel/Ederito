const supported = ['en', 'fr', 'es'];
const buttons = document.querySelectorAll('[data-language]');

function setLegalLanguage(requested) {
  const lang = supported.includes(requested) ? requested : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.querySelectorAll('[data-en]').forEach((element) => {
    const value = element.dataset[lang];
    if (typeof value === 'string') element.textContent = value;
  });
  buttons.forEach((button) => {
    const active = button.dataset.language === lang;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const titles = {
    en: 'Ederito Legal Center — Zanara Labs LLC',
    fr: 'Centre juridique Ederito — Zanara Labs LLC',
    es: 'Centro legal de Ederito — Zanara Labs LLC'
  };
  document.title = titles[lang];
  localStorage.setItem('ederito-language', lang);
}

buttons.forEach((button) => button.addEventListener('click', () => setLegalLanguage(button.dataset.language)));
const saved = localStorage.getItem('ederito-language');
const browser = navigator.language?.slice(0, 2).toLowerCase();
setLegalLanguage(saved || (supported.includes(browser) ? browser : 'en'));

document.querySelectorAll('.legal-nav a').forEach((link) => {
  link.addEventListener('click', () => document.querySelector('.legal-nav')?.classList.remove('open'));
});

const menu = document.querySelector('.legal-menu');
menu?.addEventListener('click', () => {
  const nav = document.querySelector('.legal-nav');
  const open = nav?.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(Boolean(open)));
});

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
