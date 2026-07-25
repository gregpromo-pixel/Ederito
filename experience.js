(() => {
  const portal = 'https://ederito.com/portal/';
  const SUPABASE_URL = 'https://yyeabxdzwaidgvlnlzai.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_wqAMVxq4ZKUBiprV9rV25g_e4covZxI';
  const languages = ['en', 'fr', 'es'];
  const text = {
    en: { login: 'Client login', create: 'Create account', dashboard: 'Dashboard', signout: 'Sign out', language: 'Language' },
    fr: { login: 'Connexion client', create: 'Créer un compte', dashboard: 'Tableau de bord', signout: 'Déconnexion', language: 'Langue' },
    es: { login: 'Acceso cliente', create: 'Crear cuenta', dashboard: 'Panel', signout: 'Cerrar sesión', language: 'Idioma' }
  };

  const cookieLanguage = () => document.cookie.match(/(?:^|; )ederito-language=(en|fr|es)/)?.[1] || '';
  const language = () => {
    const shared = cookieLanguage();
    const saved = localStorage.getItem('ederito-language') || localStorage.getItem('ederito-portal-language');
    const browser = navigator.language?.slice(0, 2).toLowerCase();
    return languages.includes(shared) ? shared : languages.includes(saved) ? saved : languages.includes(browser) ? browser : 'en';
  };
  const persist = (lang) => {
    if (!languages.includes(lang)) return;
    localStorage.setItem('ederito-language', lang);
    localStorage.setItem('ederito-portal-language', lang);
    document.cookie = `ederito-language=${lang}; Max-Age=31536000; Path=/; Domain=.ederito.com; SameSite=Lax; Secure`;
  };

  function installSharedStyles() {
    if (document.getElementById('ederito-shared-account-styles')) return;
    const style = document.createElement('style');
    style.id = 'ederito-shared-account-styles';
    style.textContent = `
      .experience-account-area{display:flex;align-items:center;gap:8px}
      .experience-login,.experience-create,.experience-signout,.experience-dashboard{min-height:42px;display:inline-flex;align-items:center;justify-content:center;border-radius:11px;padding:0 13px;text-decoration:none;font:800 11px Manrope,sans-serif;white-space:nowrap;cursor:pointer}
      .experience-login,.experience-signout{border:0;background:transparent;color:var(--muted)}
      .experience-create{border:1px solid var(--text);background:var(--text);color:var(--bg)}
      .experience-dashboard{gap:9px;border:1px solid var(--line);background:var(--surface);color:var(--text);padding-left:6px}
      .experience-avatar{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:var(--gold);color:#111;font-size:11px;font-weight:900}
      .experience-dashboard-name{max-width:92px;overflow:hidden;text-overflow:ellipsis}
      .public-footer-language{display:flex!important;align-items:center;gap:10px;justify-self:end}
      .public-footer-language label{color:var(--muted);font-size:12px}
      .public-footer-language select{min-width:128px;padding:9px 34px 9px 12px;border:1px solid var(--line);border-radius:9px;background:var(--surface2);color:var(--text);font:inherit;font-weight:700}
      .footer{min-height:auto!important;padding:46px 0 34px!important;grid-template-columns:1fr auto!important;align-items:end!important}
      .footer>.identity{align-self:start}.footer>p{grid-column:1/-1;margin:0;padding-top:20px;border-top:1px solid var(--line)}
      .footer>div:not(.public-footer-language):not(.footer-legal-links){display:flex;gap:16px}
      @media(max-width:1080px){.experience-login,.experience-signout{display:none}.experience-dashboard-name{display:none}.experience-dashboard{padding-right:6px}.experience-create{padding:0 11px}}
      @media(max-width:700px){.experience-create{display:none}.experience-account-area{margin-left:auto}.footer{grid-template-columns:1fr!important}.public-footer-language{justify-self:stretch;justify-content:space-between}.public-footer-language select{min-width:150px}}
    `;
    document.head.appendChild(style);
  }

  function removeDock() {
    document.querySelector('.experience-dock')?.remove();
    if (!document.getElementById('ederito-no-bottom-dock')) {
      const style = document.createElement('style');
      style.id = 'ederito-no-bottom-dock';
      style.textContent = '.experience-dock{display:none!important}body{padding-bottom:max(0px,env(safe-area-inset-bottom))!important}';
      document.head.appendChild(style);
    }
  }

  function applySharedLanguage() {
    const lang = language();
    persist(lang);
    const control = document.querySelector(`.lang[data-language="${lang}"]`);
    if (control && !control.classList.contains('active')) control.click();
  }

  function installFooterLanguage() {
    document.querySelector('.header .language')?.remove();
    const footer = document.querySelector('.footer');
    if (!footer || footer.querySelector('.public-footer-language')) return;
    const wrap = document.createElement('div');
    wrap.className = 'public-footer-language';
    const lang = language();
    wrap.innerHTML = `<label for="ederito-footer-language">${text[lang].language}</label><select id="ederito-footer-language" aria-label="${text[lang].language}"><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option></select>`;
    const select = wrap.querySelector('select');
    select.value = lang;
    select.addEventListener('change', () => {
      persist(select.value);
      const button = document.querySelector(`.lang[data-language="${select.value}"]`);
      button?.click();
      document.documentElement.lang = select.value;
      window.location.reload();
    });
    footer.appendChild(wrap);
  }

  function loadSupabase() {
    if (window.ederitoSupabaseClient) return Promise.resolve(window.ederitoSupabaseClient);
    return new Promise((resolve, reject) => {
      const create = () => {
        if (!window.supabase?.createClient) return reject(new Error('Supabase client unavailable'));
        window.ederitoSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        resolve(window.ederitoSupabaseClient);
      };
      if (window.supabase?.createClient) return create();
      let script = document.querySelector('script[data-ederito-supabase]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.dataset.ederitoSupabase = 'true';
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', create, { once: true });
      script.addEventListener('error', reject, { once: true });
    });
  }

  async function readSession() {
    try {
      const client = await loadSupabase();
      const { data } = await client.auth.getSession();
      const session = data.session;
      if (!session?.user) return { authenticated: false };
      const { data: profile } = await client.from('profiles').select('full_name,avatar_url').eq('id', session.user.id).maybeSingle();
      const fullName = profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client';
      return { authenticated: true, user: session.user, fullName, firstName: fullName.trim().split(/\s+/)[0], avatarUrl: profile?.avatar_url || '' };
    } catch (error) {
      console.warn('Ederito session check failed', error);
      return { authenticated: false };
    }
  }

  function publishSession(data) {
    window.ederitoSession = data;
    window.dispatchEvent(new CustomEvent('ederito:session', { detail: data }));
  }

  function renderHeader(data) {
    const actions = document.querySelector('.header-actions');
    if (!actions) return;
    actions.querySelector('.experience-account-area')?.remove();
    document.querySelector('.nav')?.querySelectorAll('[data-portal-login],.nav-account,[data-session-link]').forEach((node) => node.remove());

    const lang = language();
    const t = text[lang];
    const area = document.createElement('div');
    area.className = 'experience-account-area';

    if (data.authenticated) {
      const dashboard = document.createElement('a');
      dashboard.href = portal;
      dashboard.className = 'experience-dashboard';
      dashboard.dataset.sessionLink = 'dashboard';
      dashboard.innerHTML = `<span class="experience-avatar">${(data.firstName || 'C').slice(0, 1).toUpperCase()}</span><span class="experience-dashboard-name">${data.firstName || t.dashboard}</span><span>· ${t.dashboard}</span>`;

      const signout = document.createElement('button');
      signout.type = 'button';
      signout.className = 'experience-signout';
      signout.dataset.sessionLink = 'signout';
      signout.textContent = t.signout;
      signout.addEventListener('click', async () => {
        const client = await loadSupabase();
        await client.auth.signOut();
        const next = { authenticated: false };
        renderHeader(next);
        publishSession(next);
      });
      area.append(dashboard, signout);
    } else {
      const login = document.createElement('a');
      login.href = `${portal}?mode=login`;
      login.className = 'experience-login';
      login.dataset.sessionLink = 'login';
      login.textContent = t.login;

      const create = document.createElement('a');
      create.href = `${portal}?mode=register`;
      create.className = 'experience-create';
      create.dataset.sessionLink = 'create';
      create.textContent = t.create;
      area.append(login, create);
    }

    const menu = actions.querySelector('.menu');
    actions.insertBefore(area, menu || null);
  }

  function harden() {
    const root = document.documentElement;
    const body = document.body;
    const sync = () => root.style.setProperty('--app-height', `${window.visualViewport?.height || window.innerHeight}px`);
    const focusIn = (event) => {
      if (event.target?.matches?.('input,textarea,select,[contenteditable="true"]')) body.classList.add('keyboard-open');
    };
    const focusOut = () => setTimeout(() => {
      if (!document.activeElement?.matches?.('input,textarea,select,[contenteditable="true"]')) body.classList.remove('keyboard-open');
    }, 80);
    document.addEventListener('focusin', focusIn);
    document.addEventListener('focusout', focusOut);
    document.addEventListener('pointerdown', () => body.classList.add('had-pointer'), { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') body.classList.remove('had-pointer');
      if (event.key === 'Escape') document.activeElement?.blur?.();
    });
    window.addEventListener('resize', sync, { passive: true });
    window.visualViewport?.addEventListener('resize', sync, { passive: true });
    sync();
  }

  async function refreshAccount() {
    const data = await readSession();
    renderHeader(data);
    publishSession(data);
  }

  async function init() {
    installSharedStyles();
    document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => {
      persist(button.dataset.language);
      setTimeout(() => {
        applySharedLanguage();
        installFooterLanguage();
        refreshAccount();
      }, 0);
    }));
    harden();
    removeDock();
    applySharedLanguage();
    installFooterLanguage();
    await refreshAccount();
    try {
      const client = await loadSupabase();
      client.auth.onAuthStateChange(() => setTimeout(refreshAccount, 0));
    } catch {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();