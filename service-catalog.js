(() => {
  const portal = 'https://portal.ederito.com';

  const services = [
    {
      number: '01',
      title: ['Business websites', 'Sites web professionnels', 'Sitios web empresariales'],
      text: ['Landing pages, portfolios and complete business websites.', 'Pages d’atterrissage, portfolios et sites professionnels complets.', 'Páginas de destino, portafolios y sitios empresariales completos.'],
      journey: 'website'
    },
    {
      number: '02',
      title: ['Mobile applications', 'Applications mobiles', 'Aplicaciones móviles'],
      text: ['iOS and Android products designed, developed and prepared for launch.', 'Produits iOS et Android conçus, développés et préparés au lancement.', 'Productos iOS y Android diseñados, desarrollados y preparados para su lanzamiento.'],
      journey: 'app'
    },
    {
      number: '03',
      title: ['Web apps and client portals', 'Applications web et portails clients', 'Aplicaciones web y portales de clientes'],
      text: ['Secure dashboards, internal tools, account systems and custom software.', 'Tableaux de bord sécurisés, outils internes, comptes clients et logiciels sur mesure.', 'Paneles seguros, herramientas internas, sistemas de cuentas y software personalizado.'],
      journey: 'app'
    },
    {
      number: '04',
      title: ['E-commerce and booking', 'E-commerce et réservation', 'Comercio electrónico y reservas'],
      text: ['Online stores, payments, appointments, reservations and customer flows.', 'Boutiques en ligne, paiements, rendez-vous, réservations et parcours clients.', 'Tiendas en línea, pagos, citas, reservas y recorridos de clientes.'],
      journey: 'website'
    },
    {
      number: '05',
      title: ['Branding and UI/UX', 'Image de marque et UI/UX', 'Marca y UI/UX'],
      text: ['Brand identity, product interfaces, visual systems and launch-ready assets.', 'Identité de marque, interfaces produit, systèmes visuels et supports de lancement.', 'Identidad de marca, interfaces de producto, sistemas visuales y recursos de lanzamiento.'],
      journey: 'website'
    },
    {
      number: '06',
      title: ['SEO and performance', 'SEO et performance', 'SEO y rendimiento'],
      text: ['Search optimization, analytics, speed improvements and technical audits.', 'Référencement, analyses, optimisation de vitesse et audits techniques.', 'Posicionamiento, analítica, mejoras de velocidad y auditorías técnicas.'],
      journey: 'website'
    },
    {
      number: '07',
      title: ['AI solutions and chatbots', 'Solutions IA et chatbots', 'Soluciones de IA y chatbots'],
      text: ['Business assistants, automated workflows and AI-powered product features.', 'Assistants professionnels, automatisations et fonctionnalités alimentées par l’IA.', 'Asistentes empresariales, flujos automatizados y funciones impulsadas por IA.'],
      journey: 'app'
    },
    {
      number: '08',
      title: ['Hosting, email, DNS and SSL', 'Hébergement, e-mail, DNS et SSL', 'Alojamiento, correo, DNS y SSL'],
      text: ['Professional email, hosting setup, Cloudflare, migrations and security configuration.', 'E-mail professionnel, hébergement, Cloudflare, migrations et configuration de sécurité.', 'Correo profesional, alojamiento, Cloudflare, migraciones y configuración de seguridad.'],
      journey: 'website'
    },
    {
      number: '09',
      title: ['Maintenance and support', 'Maintenance et assistance', 'Mantenimiento y soporte'],
      text: ['Ongoing updates, monitoring, fixes and technical support for existing products.', 'Mises à jour, surveillance, corrections et support technique pour produits existants.', 'Actualizaciones, monitoreo, correcciones y soporte técnico para productos existentes.'],
      journey: 'website'
    },
    {
      number: '10',
      title: ['LLC formation assistance', 'Accompagnement à la création de LLC', 'Asistencia para crear una LLC'],
      text: ['Structured formation intake, state-fee estimates and administrative preparation.', 'Formulaire structuré, estimation des frais d’État et préparation administrative.', 'Formulario estructurado, estimación de tarifas estatales y preparación administrativa.'],
      journey: 'business'
    }
  ];

  function linkFor(journey, label) {
    const next = `/start-project?journey=${journey}&service=${encodeURIComponent(label)}`;
    return `${portal}/login?mode=register&next=${encodeURIComponent(next)}`;
  }

  function addStyles() {
    if (document.getElementById('ederito-catalog-styles')) return;
    const style = document.createElement('style');
    style.id = 'ederito-catalog-styles';
    style.textContent = `
      .catalog-intro{max-width:760px;color:#68655d;font-size:17px;margin-top:18px}
      .catalog-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:#c8c4bb;border:1px solid #c8c4bb;border-radius:24px;overflow:hidden}
      .catalog-card{min-height:270px;padding:32px;background:#efede7;color:#111;text-decoration:none;display:flex;flex-direction:column;transition:background .2s ease,transform .2s ease}
      .catalog-card:hover{background:#fff;transform:translateY(-2px)}
      .catalog-card-top{display:flex;justify-content:space-between;gap:18px;color:#77736b;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
      .catalog-card h3{font-size:30px;line-height:1.05;margin:42px 0 12px}
      .catalog-card p{color:#68655d;margin:0;max-width:520px}
      .catalog-card-action{margin-top:auto;padding-top:28px;font-weight:800;color:#111;display:flex;justify-content:space-between;align-items:center}
      .catalog-card-action b{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#f2be32;font-size:20px}
      .catalog-card.coming-soon{cursor:not-allowed;background:#dedbd4;opacity:.82}
      .catalog-card.coming-soon:hover{transform:none;background:#dedbd4}
      .catalog-card.coming-soon .catalog-card-action b{background:#aaa69e}
      .secure-project-entry{padding:34px;border:1px solid rgba(255,255,255,.14);border-radius:22px;background:#0c0c0d;display:grid;gap:18px;align-content:center}
      .secure-project-entry h3{font-size:34px;line-height:1.05;margin:0}
      .secure-project-entry p{color:#aaa8a1;margin:0}
      .secure-entry-actions{display:flex;gap:12px;flex-wrap:wrap}
      .nav-account{color:#f2be32!important;font-weight:800}
      @media(max-width:780px){.catalog-grid{grid-template-columns:1fr}.catalog-card{min-height:245px}.catalog-card h3{font-size:27px}.secure-entry-actions .btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function translated(values) {
    const lang = document.documentElement.dataset.lang || 'en';
    const index = lang === 'fr' ? 1 : lang === 'es' ? 2 : 0;
    return values[index];
  }

  function installHeaderLinks() {
    const nav = document.querySelector('.nav');
    if (!nav || nav.querySelector('[data-portal-login]')) return;

    const login = document.createElement('a');
    login.href = `${portal}/login`;
    login.dataset.portalLogin = 'true';
    login.dataset.en = 'Client login';
    login.dataset.fr = 'Connexion client';
    login.dataset.es = 'Acceso cliente';
    login.textContent = translated(['Client login', 'Connexion client', 'Acceso cliente']);

    const account = document.createElement('a');
    account.href = `${portal}/login?mode=register`;
    account.className = 'nav-account';
    account.dataset.en = 'Create account';
    account.dataset.fr = 'Créer un compte';
    account.dataset.es = 'Crear una cuenta';
    account.textContent = translated(['Create account', 'Créer un compte', 'Crear una cuenta']);

    nav.append(login, account);
  }

  function installCatalog() {
    const section = document.getElementById('services');
    const wrap = section?.querySelector('.wrap');
    if (!wrap || wrap.querySelector('.catalog-grid')) return;

    wrap.innerHTML = `
      <header class="section-head reveal visible">
        <div>
          <p class="eyebrow" data-en="Choose your project" data-fr="Choisissez votre projet" data-es="Elige tu proyecto">${translated(['Choose your project', 'Choisissez votre projet', 'Elige tu proyecto'])}</p>
          <h2 data-en="Everything Ederito can build for you." data-fr="Tout ce qu’Ederito peut créer pour vous." data-es="Todo lo que Ederito puede crear para ti.">${translated(['Everything Ederito can build for you.', 'Tout ce qu’Ederito peut créer pour vous.', 'Todo lo que Ederito puede crear para ti.'])}</h2>
          <p class="catalog-intro" data-en="Choose a service to create your secure client account. After signing in, the correct project form will open automatically." data-fr="Choisissez un service pour créer votre compte client sécurisé. Après connexion, le bon formulaire de projet s’ouvrira automatiquement." data-es="Elige un servicio para crear tu cuenta segura. Después de iniciar sesión, se abrirá automáticamente el formulario correcto.">${translated(['Choose a service to create your secure client account. After signing in, the correct project form will open automatically.', 'Choisissez un service pour créer votre compte client sécurisé. Après connexion, le bon formulaire de projet s’ouvrira automatiquement.', 'Elige un servicio para crear tu cuenta segura. Después de iniciar sesión, se abrirá automáticamente el formulario correcto.'])}</p>
        </div>
      </header>
      <div class="catalog-grid"></div>`;

    const grid = wrap.querySelector('.catalog-grid');
    services.forEach((service) => {
      const card = document.createElement('a');
      card.className = 'catalog-card';
      card.href = linkFor(service.journey, service.title[0]);
      card.innerHTML = `
        <div class="catalog-card-top"><span>${service.number}</span><span data-en="Secure portal" data-fr="Portail sécurisé" data-es="Portal seguro">${translated(['Secure portal', 'Portail sécurisé', 'Portal seguro'])}</span></div>
        <h3 data-en="${service.title[0]}" data-fr="${service.title[1]}" data-es="${service.title[2]}">${translated(service.title)}</h3>
        <p data-en="${service.text[0]}" data-fr="${service.text[1]}" data-es="${service.text[2]}">${translated(service.text)}</p>
        <div class="catalog-card-action"><span data-en="Create account to continue" data-fr="Créer un compte pour continuer" data-es="Crear una cuenta para continuar">${translated(['Create account to continue', 'Créer un compte pour continuer', 'Crear una cuenta para continuar'])}</span><b>+</b></div>`;
      grid.appendChild(card);
    });

    const domain = document.createElement('article');
    domain.className = 'catalog-card coming-soon';
    domain.setAttribute('aria-disabled', 'true');
    domain.innerHTML = `
      <div class="catalog-card-top"><span>11</span><span data-en="Coming soon" data-fr="Bientôt disponible" data-es="Próximamente">${translated(['Coming soon', 'Bientôt disponible', 'Próximamente'])}</span></div>
      <h3 data-en="Buy a domain" data-fr="Acheter un nom de domaine" data-es="Comprar un dominio">${translated(['Buy a domain', 'Acheter un nom de domaine', 'Comprar un dominio'])}</h3>
      <p data-en="Search, purchase and manage domains directly through Ederito. This service is being prepared." data-fr="Recherchez, achetez et gérez vos domaines directement avec Ederito. Ce service est en préparation." data-es="Busca, compra y administra dominios directamente con Ederito. Este servicio está en preparación.">${translated(['Search, purchase and manage domains directly through Ederito. This service is being prepared.', 'Recherchez, achetez et gérez vos domaines directement avec Ederito. Ce service est en préparation.', 'Busca, compra y administra dominios directamente con Ederito. Este servicio está en preparación.'])}</p>
      <div class="catalog-card-action"><span data-en="Domain marketplace coming soon" data-fr="Marché de domaines bientôt disponible" data-es="Mercado de dominios próximamente">${translated(['Domain marketplace coming soon', 'Marché de domaines bientôt disponible', 'Mercado de dominios próximamente'])}</span><b>⏳</b></div>`;
    grid.appendChild(domain);
  }

  function secureContactSection() {
    const form = document.getElementById('contactForm');
    if (!form || form.dataset.secureEntry === 'true') return;
    form.dataset.secureEntry = 'true';
    form.className = 'secure-project-entry reveal visible';
    form.removeAttribute('id');
    form.innerHTML = `
      <p class="eyebrow" data-en="Secure project intake" data-fr="Demande de projet sécurisée" data-es="Solicitud de proyecto segura">${translated(['Secure project intake', 'Demande de projet sécurisée', 'Solicitud de proyecto segura'])}</p>
      <h3 data-en="Create an account before starting a project." data-fr="Créez un compte avant de démarrer un projet." data-es="Crea una cuenta antes de iniciar un proyecto.">${translated(['Create an account before starting a project.', 'Créez un compte avant de démarrer un projet.', 'Crea una cuenta antes de iniciar un proyecto.'])}</h3>
      <p data-en="Your account keeps your request, messages, proposal, agreement, invoice and project updates together." data-fr="Votre compte rassemble votre demande, vos messages, votre proposition, votre contrat, votre facture et le suivi du projet." data-es="Tu cuenta reúne tu solicitud, mensajes, propuesta, contrato, factura y actualizaciones del proyecto.">${translated(['Your account keeps your request, messages, proposal, agreement, invoice and project updates together.', 'Votre compte rassemble votre demande, vos messages, votre proposition, votre contrat, votre facture et le suivi du projet.', 'Tu cuenta reúne tu solicitud, mensajes, propuesta, contrato, factura y actualizaciones del proyecto.'])}</p>
      <div class="secure-entry-actions">
        <a class="btn btn-gold" href="#services" data-en="Choose a project" data-fr="Choisir un projet" data-es="Elegir un proyecto">${translated(['Choose a project', 'Choisir un projet', 'Elegir un proyecto'])}</a>
        <a class="btn btn-dark" href="${portal}/login" data-en="Client login" data-fr="Connexion client" data-es="Acceso cliente">${translated(['Client login', 'Connexion client', 'Acceso cliente'])}</a>
      </div>`;
  }

  function updatePrimaryLinks() {
    document.querySelectorAll('a[href="#contact"]').forEach((link) => {
      link.setAttribute('href', '#services');
    });
  }

  function initialize() {
    addStyles();
    installHeaderLinks();
    installCatalog();
    secureContactSection();
    updatePrimaryLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
