const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}));

const languageButtons = document.querySelectorAll('.lang');
function setLanguage(lang){
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.querySelectorAll('[data-en][data-fr]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
  languageButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.language === lang));
  localStorage.setItem('portfolio-language', lang);
}
languageButtons.forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.language)));
setLanguage(localStorage.getItem('portfolio-language') || 'en');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
}, {threshold: .12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const lang = document.documentElement.dataset.lang;
  const subject = lang === 'fr' ? `Nouvelle demande de projet — ${data.get('name')}` : `New project request — ${data.get('name')}`;
  const body = lang === 'fr'
    ? `Nom : ${data.get('name')}\nE-mail : ${data.get('email')}\nService : ${data.get('service')}\n\nProjet :\n${data.get('message')}`
    : `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nService: ${data.get('service')}\n\nProject:\n${data.get('message')}`;
  window.location.href = `mailto:Keffgorederthermozier@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
