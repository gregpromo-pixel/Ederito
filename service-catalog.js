(() => {
  const portal = 'https://ederito.com/portal/';
  const services = [
    { number:'01', title:['Business websites','Sites web professionnels','Sitios web empresariales'], text:['Landing pages, portfolios and complete business websites.','Pages d’atterrissage, portfolios et sites professionnels complets.','Páginas de destino, portafolios y sitios empresariales completos.'], journey:'website' },
    { number:'02', title:['Mobile applications','Applications mobiles','Aplicaciones móviles'], text:['iOS and Android products designed, developed and prepared for launch.','Produits iOS et Android conçus, développés et préparés au lancement.','Productos iOS y Android diseñados, desarrollados y preparados para su lanzamiento.'], journey:'app' },
    { number:'03', title:['Web apps and client portals','Applications web et portails clients','Aplicaciones web y portales de clientes'], text:['Secure dashboards, internal tools, account systems and custom software.','Tableaux de bord sécurisés, outils internes, comptes clients et logiciels sur mesure.','Paneles seguros, herramientas internas, sistemas de cuentas y software personalizado.'], journey:'app' },
    { number:'04', title:['E-commerce and booking','E-commerce et réservation','Comercio electrónico y reservas'], text:['Online stores, payments, appointments, reservations and customer flows.','Boutiques en ligne, paiements, rendez-vous, réservations et parcours clients.','Tiendas en línea, pagos, citas, reservas y recorridos de clientes.'], journey:'website' },
    { number:'05', title:['Branding and UI/UX','Image de marque et UI/UX','Marca y UI/UX'], text:['Brand identity, product interfaces, visual systems and launch-ready assets.','Identité de marque, interfaces produit, systèmes visuels et supports de lancement.','Identidad de marca, interfaces de producto, sistemas visuales y recursos de lanzamiento.'], journey:'website' },
    { number:'06', title:['SEO and performance','SEO et performance','SEO y rendimiento'], text:['Search optimization, analytics, speed improvements and technical audits.','Référencement, analyses, optimisation de vitesse et audits techniques.','Posicionamiento, analítica, mejoras de velocidad y auditorías técnicas.'], journey:'website' },
    { number:'07', title:['AI solutions and chatbots','Solutions IA et chatbots','Soluciones de IA y chatbots'], text:['Business assistants, automated workflows and AI-powered product features.','Assistants professionnels, automatisations et fonctionnalités alimentées par l’IA.','Asistentes empresariales, flujos automatizados y funciones impulsadas por IA.'], journey:'app' },
    { number:'08', title:['Hosting, email, DNS and SSL','Hébergement, e-mail, DNS et SSL','Alojamiento, correo, DNS y SSL'], text:['Professional email, hosting setup, Cloudflare, migrations and security configuration.','E-mail professionnel, hébergement, Cloudflare, migrations et configuration de sécurité.','Correo profesional, alojamiento, Cloudflare, migraciones y configuración de seguridad.'], journey:'website' },
    { number:'09', title:['Maintenance and support','Maintenance et assistance','Mantenimiento y soporte'], text:['Ongoing updates, monitoring, fixes and technical support for existing products.','Mises à jour, surveillance, corrections et support technique pour produits existants.','Actualizaciones, monitoreo, correcciones y soporte técnico para productos existentes.'], journey:'website' },
    { number:'10', title:['LLC formation assistance','Accompagnement à la création de LLC','Asistencia para crear una LLC'], text:['Structured formation intake, state-fee estimates and administrative preparation.','Formulaire structuré, estimation des frais d’État et préparation administrative.','Formulario estructurado, estimación de tarifas estatales y preparación administrativa.'], journey:'business' }
  ];

  const translated = (values) => {
    const lang = document.documentElement.dataset.lang || 'en';
    return values[lang === 'fr' ? 1 : lang === 'es' ? 2 : 0];
  };

  const session = () => window.ederitoSession || { authenticated:false };
  const projectUrl = (service) => {
    const params = new URLSearchParams({ journey:service.journey, service:service.title[0] });
    if (!session().authenticated) params.set('mode','register');
    return `${portal}?${params.toString()}`;
  };

  function addStyles(){
    if(document.getElementById('ederito-catalog-styles'))return;
    const style=document.createElement('style');
    style.id='ederito-catalog-styles';
    style.textContent=`
      .catalog-intro{max-width:760px;color:#68655d;font-size:17px;margin-top:18px}
      .catalog-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:#c8c4bb;border:1px solid #c8c4bb;border-radius:24px;overflow:hidden}
      .catalog-card{min-height:270px;padding:32px;background:#efede7;color:#111;text-decoration:none;display:flex;flex-direction:column;transition:background .2s ease,transform .2s ease}
      .catalog-card:hover{background:#fff;transform:translateY(-2px)}
      .catalog-card-top{display:flex;justify-content:space-between;gap:18px;color:#77736b;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
      .catalog-card h3{font-size:30px;line-height:1.05;margin:42px 0 12px}.catalog-card p{color:#68655d;margin:0;max-width:520px}
      .catalog-card-action{margin-top:auto;padding-top:28px;font-weight:800;color:#111;display:flex;justify-content:space-between;align-items:center}
      .catalog-card-action b{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#f2be32;font-size:20px}
      .catalog-card.coming-soon{cursor:not-allowed;background:#dedbd4;opacity:.82}.catalog-card.coming-soon:hover{transform:none;background:#dedbd4}
      .secure-project-entry{padding:34px;border:1px solid var(--line);border-radius:22px;background:var(--surface);display:grid;gap:18px;align-content:center}
      .secure-project-entry h3{font-size:34px;line-height:1.05;margin:0}.secure-project-entry p{color:var(--muted);margin:0}.secure-entry-actions{display:flex;gap:12px;flex-wrap:wrap}
      @media(max-width:780px){.catalog-grid{grid-template-columns:1fr}.catalog-card{min-height:245px}.catalog-card h3{font-size:27px}.secure-entry-actions .btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function cardActionText(){
    return session().authenticated
      ? translated(['Open project intake','Ouvrir le formulaire','Abrir solicitud'])
      : translated(['Create account to continue','Créer un compte pour continuer','Crear una cuenta para continuar']);
  }

  function refreshCardLinks(){
    document.querySelectorAll('.catalog-card[data-service-index]').forEach((card)=>{
      const service=services[Number(card.dataset.serviceIndex)];
      card.href=projectUrl(service);
      const label=card.querySelector('.catalog-card-action span');
      if(label)label.textContent=cardActionText();
    });
    refreshSecureEntry();
  }

  function installCatalog(){
    const section=document.getElementById('services');
    const wrap=section?.querySelector('.wrap');
    if(!wrap||wrap.querySelector('.catalog-grid'))return;
    wrap.innerHTML=`<header class="section-head reveal visible"><div><p class="eyebrow">${translated(['Choose your project','Choisissez votre projet','Elige tu proyecto'])}</p><h2>${translated(['Everything Ederito can build for you.','Tout ce qu’Ederito peut créer pour vous.','Todo lo que Ederito puede crear para ti.'])}</h2><p class="catalog-intro">${translated(['Choose a service and continue through the secure client portal.','Choisissez un service et continuez dans le portail client sécurisé.','Elige un servicio y continúa en el portal seguro.'])}</p></div></header><div class="catalog-grid"></div>`;
    const grid=wrap.querySelector('.catalog-grid');
    services.forEach((service,index)=>{
      const card=document.createElement('a');
      card.className='catalog-card';
      card.dataset.serviceIndex=String(index);
      card.href=projectUrl(service);
      card.innerHTML=`<div class="catalog-card-top"><span>${service.number}</span><span>${translated(['Secure portal','Portail sécurisé','Portal seguro'])}</span></div><h3>${translated(service.title)}</h3><p>${translated(service.text)}</p><div class="catalog-card-action"><span>${cardActionText()}</span><b>+</b></div>`;
      grid.appendChild(card);
    });
    const domain=document.createElement('article');
    domain.className='catalog-card coming-soon';
    domain.innerHTML=`<div class="catalog-card-top"><span>11</span><span>${translated(['Coming soon','Bientôt disponible','Próximamente'])}</span></div><h3>${translated(['Buy a domain','Acheter un nom de domaine','Comprar un dominio'])}</h3><p>${translated(['Search, purchase and manage domains directly through Ederito.','Recherchez, achetez et gérez vos domaines directement avec Ederito.','Busca, compra y administra dominios directamente con Ederito.'])}</p><div class="catalog-card-action"><span>${translated(['Domain marketplace coming soon','Marché de domaines bientôt disponible','Mercado de dominios próximamente'])}</span><b>·</b></div>`;
    grid.appendChild(domain);
  }

  function refreshSecureEntry(){
    const box=document.querySelector('.secure-project-entry');
    if(!box)return;
    const loggedIn=session().authenticated;
    box.innerHTML=loggedIn
      ? `<p class="eyebrow">${translated(['Secure project intake','Demande de projet sécurisée','Solicitud de proyecto segura'])}</p><h3>${translated(['Welcome back. Start your next project.','Bon retour. Démarrez votre prochain projet.','Bienvenido de nuevo. Inicia tu próximo proyecto.'])}</h3><p>${translated(['Your dashboard keeps requests, messages, proposals, agreements, invoices and updates together.','Votre tableau de bord rassemble demandes, messages, propositions, contrats, factures et suivis.','Tu panel reúne solicitudes, mensajes, propuestas, contratos, facturas y actualizaciones.'])}</p><div class="secure-entry-actions"><a class="btn btn-gold" href="${portal}">${translated(['Open dashboard','Ouvrir le tableau de bord','Abrir panel'])}</a><a class="btn btn-dark" href="#services">${translated(['Choose a service','Choisir un service','Elegir un servicio'])}</a></div>`
      : `<p class="eyebrow">${translated(['Secure project intake','Demande de projet sécurisée','Solicitud de proyecto segura'])}</p><h3>${translated(['Create an account before starting a project.','Créez un compte avant de démarrer un projet.','Crea una cuenta antes de iniciar un proyecto.'])}</h3><p>${translated(['Your account keeps every project document and update together.','Votre compte centralise tous les documents et suivis du projet.','Tu cuenta reúne todos los documentos y actualizaciones del proyecto.'])}</p><div class="secure-entry-actions"><a class="btn btn-gold" href="#services">${translated(['Choose a project','Choisir un projet','Elegir un proyecto'])}</a><a class="btn btn-dark" href="${portal}?mode=login">${translated(['Client login','Connexion client','Acceso cliente'])}</a></div>`;
  }

  function secureContactSection(){
    const form=document.getElementById('contactForm');
    if(!form)return;
    form.className='secure-project-entry reveal visible';
    form.removeAttribute('id');
    refreshSecureEntry();
  }

  function updatePrimaryLinks(){document.querySelectorAll('a[href="#contact"]').forEach(link=>link.setAttribute('href','#services'))}
  function initialize(){addStyles();installCatalog();secureContactSection();updatePrimaryLinks();window.addEventListener('ederito:session',refreshCardLinks);setTimeout(refreshCardLinks,0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();