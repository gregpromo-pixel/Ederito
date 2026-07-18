'use client';

import { useEffect } from 'react';

type Lang = 'en' | 'fr' | 'es';

type AddressResult = {
  matched: boolean;
  matchedAddress?: string;
  components?: { line1: string; city: string; region: string; postalCode: string; country: string };
};

const translations: Record<Exclude<Lang, 'en'>, Record<string, string>> = {
  es: {
    'Back to dashboard': 'Volver al panel',
    'Project concierge': 'Concierge de proyectos',
    'Start with the right plan.': 'Empieza con el plan correcto.',
    'The form changes with your selections, so you answer only what Ederito needs to review, quote, file, or build your project.': 'El formulario cambia según tus selecciones, para que respondas solamente lo que Ederito necesita para revisar, cotizar, registrar o desarrollar tu proyecto.',
    'Questions matched to your service': 'Preguntas adaptadas a tu servicio',
    'Transparent third-party costs': 'Costos externos transparentes',
    'Human review before work begins': 'Revisión humana antes de comenzar',
    'Web presence': 'Presencia web', 'Build a website': 'Crear un sitio web',
    'Digital product': 'Producto digital', 'Build an app': 'Crear una aplicación',
    'Business formation': 'Formación empresarial', 'Start an LLC': 'Crear una LLC',
    'View plans': 'Ver planes', 'Selected': 'Seleccionado', 'Choose one plan': 'Elige un plan',
    'Most popular': 'Más popular', 'Defined package': 'Paquete definido', 'Custom scope': 'Alcance personalizado',
    'Plan selected': 'Plan seleccionado', 'Choose plan': 'Elegir plan', 'Custom proposal': 'Propuesta personalizada',
    'Ederito fee + state fee': 'Tarifa de Ederito + tarifa estatal',
    'Required information': 'Información requerida', 'Prepare the filing.': 'Prepara el registro.',
    'Conditional form': 'Formulario condicional', 'Formation details': 'Datos de formación',
    'Core information used to prepare the state formation document.': 'Información principal utilizada para preparar el documento estatal de formación.',
    'Formation state': 'Estado de formación', 'Select state': 'Selecciona un estado',
    'Number of owners': 'Número de propietarios', 'Select one': 'Selecciona una opción',
    'One owner': '1 propietario', 'Two or more owners': '2 o más propietarios',
    'Preferred legal LLC name': 'Nombre legal preferido de la LLC', 'Second name choice': 'Segunda opción de nombre', 'Third name choice': 'Tercera opción de nombre', 'Optional': 'Opcional',
    'Principal office street address': 'Dirección de la oficina principal',
    'The mailing address is different from the principal office.': 'La dirección postal es diferente de la oficina principal.',
    'Mailing address': 'Dirección postal', 'Specific business purpose or activity': 'Propósito o actividad específica del negocio',
    'Registered agent': 'Agente registrado', 'Who will serve as registered agent?': '¿Quién será el agente registrado?',
    'I will serve as registered agent': 'Yo seré el agente registrado', 'I already have a registered agent': 'Ya tengo un agente registrado', 'I need help finding a registered-agent provider': 'Necesito ayuda para encontrar un proveedor de agente registrado',
    'Registered-agent legal name': 'Nombre legal del agente registrado', 'Agent type': 'Tipo de agente', 'Individual': 'Persona', 'Registered business': 'Empresa registrada',
    'Owners and management': 'Propietarios y administración', 'Only the ownership and management information needed for this structure is displayed.': 'Solo se muestra la información de propiedad y administración necesaria para esta estructura.',
    'Management structure': 'Estructura de administración', 'Member-managed': 'Administrada por los miembros', 'Manager-managed': 'Administrada por gerentes',
    'Organizer': 'Organizador', 'Authorize Ederito or its filing representative': 'Autorizar a Ederito o a su representante de registro', 'Another organizer': 'Otro organizador',
    'Effective date': 'Fecha de vigencia', 'When should the LLC become effective?': '¿Cuándo debe entrar en vigencia la LLC?', 'When accepted by the state': 'Cuando sea aceptada por el estado', 'A future date, if permitted': 'Una fecha futura, si está permitida',
    'EIN information': 'Información del EIN', 'Responsible party’s full legal name': 'Nombre legal completo de la persona responsable', "Responsible party's full legal name": 'Nombre legal completo de la persona responsable',
    "Responsible party's tax-ID status": 'Situación de identificación fiscal de la persona responsable', 'Has an SSN': 'Tiene un Número de Seguro Social (SSN)', 'Has an ITIN': 'Tiene un Número de Identificación Personal del Contribuyente (ITIN)', 'Does not have an SSN or ITIN': 'No tiene SSN ni ITIN', 'Needs guidance': 'Necesita orientación',
    'The number itself will be collected later through a secure process when required.': 'El número completo se solicitará más adelante mediante un proceso seguro, únicamente cuando sea necesario.',
    'Reason for applying for an EIN': 'Motivo de la solicitud del EIN', 'Started a new business': 'Inició un nuevo negocio', 'Banking purpose': 'Propósito bancario', 'Hired employees': 'Contrató empleados', 'Changed organization type': 'Cambió el tipo de organización', 'Purchased an active business': 'Compró un negocio activo', 'Other': 'Otro',
    'Business start or acquisition date': 'Fecha de inicio o adquisición del negocio', 'Accounting-year closing month': 'Mes de cierre del año contable', 'December': 'Diciembre', 'Another month': 'Otro mes',
    'Will the business have employees in the next 12 months?': '¿El negocio tendrá empleados durante los próximos 12 meses?', 'No': 'No', 'Yes': 'Sí',
    'Principal activity category': 'Categoría de actividad principal', 'Specific product, service, or work performed': 'Producto, servicio o trabajo específico',
    'Authorize Ederito as third-party designee for EIN questions?': '¿Autoriza a Ederito como tercero designado para consultas relacionadas con el EIN?',
    'Contact and authorization': 'Contacto y autorización', 'Review and submit.': 'Revisa y envía.', 'Full legal name': 'Nombre legal completo', 'Best phone number': 'Mejor número de teléfono', 'Email': 'Correo electrónico', 'Preferred contact': 'Método de contacto preferido',
    'Submit formation request': 'Enviar solicitud de formación', 'Sending request...': 'Enviando solicitud...', 'Your selection': 'Tu selección', 'Ederito service fee': 'Tarifa de servicio de Ederito', 'State filing fee': 'Tarifa estatal de registro', 'Estimated total': 'Total estimado', 'Formation limitations': 'Limitaciones de la formación'
  },
  fr: {
    'Back to dashboard': 'Retour au tableau de bord', 'Project concierge': 'Conciergerie de projet', 'Start with the right plan.': 'Commencez avec le bon plan.',
    'Questions matched to your service': 'Questions adaptées à votre service', 'Transparent third-party costs': 'Coûts tiers transparents', 'Human review before work begins': 'Révision humaine avant le début',
    'Web presence': 'Présence web', 'Build a website': 'Créer un site web', 'Digital product': 'Produit numérique', 'Build an app': 'Créer une application', 'Business formation': 'Création d’entreprise', 'Start an LLC': 'Créer une LLC',
    'View plans': 'Voir les offres', 'Selected': 'Sélectionné', 'Choose one plan': 'Choisissez une offre', 'Required information': 'Informations requises', 'Prepare the filing.': 'Préparez le dépôt.', 'Conditional form': 'Formulaire conditionnel',
    'Formation details': 'Détails de création', 'Formation state': 'État de création', 'Select state': 'Choisir un État', 'Number of owners': 'Nombre de propriétaires', 'Select one': 'Choisir', 'One owner': '1 propriétaire', 'Two or more owners': '2 propriétaires ou plus',
    'Preferred legal LLC name': 'Nom légal préféré de la LLC', 'Second name choice': 'Deuxième choix de nom', 'Third name choice': 'Troisième choix de nom', 'Optional': 'Facultatif', 'Principal office street address': 'Adresse du siège principal', 'Mailing address': 'Adresse postale',
    'Registered agent': 'Agent enregistré', 'Who will serve as registered agent?': 'Qui sera l’agent enregistré ?', 'Owners and management': 'Propriétaires et gestion', 'Management structure': 'Structure de gestion', 'Organizer': 'Organisateur', 'Effective date': 'Date d’effet',
    'EIN information': 'Informations EIN', "Responsible party's full legal name": 'Nom légal complet de la personne responsable', "Responsible party's tax-ID status": 'Statut fiscal de la personne responsable', 'Has an SSN': 'Possède un numéro de sécurité sociale (SSN)', 'Has an ITIN': 'Possède un numéro fiscal individuel (ITIN)', 'Does not have an SSN or ITIN': 'Ne possède ni SSN ni ITIN', 'Needs guidance': 'Besoin d’aide',
    'Contact and authorization': 'Contact et autorisation', 'Review and submit.': 'Vérifiez et envoyez.', 'Full legal name': 'Nom légal complet', 'Best phone number': 'Meilleur numéro de téléphone', 'Email': 'E-mail', 'Submit formation request': 'Envoyer la demande de création', 'Your selection': 'Votre sélection', 'State filing fee': 'Frais de dépôt de l’État', 'Estimated total': 'Total estimé'
  }
};

function translatePage(lang: Lang) {
  if (lang === 'en') return;
  const dictionary = translations[lang];
  const root = document.querySelector('.intake-page');
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const original = node.nodeValue?.trim();
    if (!original || !dictionary[original]) return;
    node.nodeValue = (node.nodeValue || '').replace(original, dictionary[original]);
  });
}

function addLanguageControl(lang: Lang) {
  const header = document.querySelector('.intake-topbar');
  if (!header || header.querySelector('.intake-language')) return;
  const control = document.createElement('div');
  control.className = 'language-mini intake-language';
  (['en', 'fr', 'es'] as Lang[]).forEach((code) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = code.toUpperCase();
    if (code === lang) button.className = 'active';
    button.addEventListener('click', () => {
      localStorage.setItem('ederito-portal-language', code);
      window.location.reload();
    });
    control.appendChild(button);
  });
  header.insertBefore(control, header.lastElementChild);
}

function enhanceAddress(textarea: HTMLTextAreaElement, lang: Lang) {
  if (textarea.dataset.enhanced === 'true') return;
  textarea.dataset.enhanced = 'true';
  textarea.required = false;
  textarea.classList.add('address-original');
  const base = textarea.name;
  const labels = lang === 'es'
    ? { line1: 'Dirección', line2: 'Apartamento, suite o unidad', city: 'Ciudad', region: 'Estado', postal: 'Código postal', country: 'País', check: 'Comprobar dirección', suggestion: 'Encontramos esta dirección estandarizada:', use: 'Usar dirección sugerida', keep: 'Conservar lo que escribí', noMatch: 'No encontramos una coincidencia exacta. Revisa los campos o conserva la dirección ingresada.' }
    : lang === 'fr'
      ? { line1: 'Adresse', line2: 'Appartement, suite ou unité', city: 'Ville', region: 'État', postal: 'Code postal', country: 'Pays', check: 'Vérifier l’adresse', suggestion: 'Nous avons trouvé cette adresse normalisée :', use: 'Utiliser l’adresse suggérée', keep: 'Conserver mon adresse', noMatch: 'Aucune correspondance exacte. Vérifiez les champs ou conservez l’adresse saisie.' }
      : { line1: 'Street address', line2: 'Apartment, suite, or unit', city: 'City', region: 'State', postal: 'ZIP code', country: 'Country', check: 'Check address', suggestion: 'We found this standardized address:', use: 'Use suggested address', keep: 'Keep what I entered', noMatch: 'No exact match was found. Review the fields or keep the address you entered.' };

  const wrapper = document.createElement('div');
  wrapper.className = 'structured-address full';
  wrapper.innerHTML = `
    <div class="address-grid">
      <label class="field address-line1"><span>${labels.line1}</span><input name="${base}_line1" autocomplete="address-line1" required></label>
      <label class="field"><span>${labels.line2}</span><input name="${base}_line2" autocomplete="address-line2"></label>
      <label class="field"><span>${labels.city}</span><input name="${base}_city" autocomplete="address-level2" required></label>
      <label class="field"><span>${labels.region}</span><input name="${base}_region" autocomplete="address-level1" maxlength="2" required></label>
      <label class="field"><span>${labels.postal}</span><input name="${base}_postal_code" autocomplete="postal-code" required></label>
      <label class="field"><span>${labels.country}</span><select name="${base}_country" autocomplete="country"><option value="US">United States</option><option value="OTHER">Other</option></select></label>
    </div>
    <div class="address-actions"><button type="button" class="address-check">${labels.check}</button><span class="address-status"></span></div>
    <div class="address-suggestion" hidden></div>`;
  textarea.parentElement?.insertAdjacentElement('afterend', wrapper);

  const input = (suffix: string) => wrapper.querySelector(`[name="${base}_${suffix}"]`) as HTMLInputElement | HTMLSelectElement;
  const sync = () => {
    const parts = [input('line1').value, input('line2').value, input('city').value, input('region').value, input('postal_code').value, input('country').value].filter(Boolean);
    textarea.value = parts.join(', ');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  };
  wrapper.querySelectorAll('input,select').forEach((element) => element.addEventListener('input', sync));

  const check = wrapper.querySelector('.address-check') as HTMLButtonElement;
  const status = wrapper.querySelector('.address-status') as HTMLElement;
  const suggestion = wrapper.querySelector('.address-suggestion') as HTMLElement;
  check.addEventListener('click', async () => {
    sync();
    check.disabled = true;
    status.textContent = '…';
    suggestion.hidden = true;
    try {
      const response = await fetch('/api/address/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ line1: input('line1').value, city: input('city').value, region: input('region').value, postalCode: input('postal_code').value, country: input('country').value }) });
      const result = await response.json() as AddressResult;
      status.textContent = '';
      if (!result.matched || !result.components) {
        suggestion.innerHTML = `<p>${labels.noMatch}</p><button type="button" class="address-keep">${labels.keep}</button>`;
        suggestion.hidden = false;
        return;
      }
      suggestion.innerHTML = `<strong>${labels.suggestion}</strong><p>${result.matchedAddress || ''}</p><div><button type="button" class="address-use">${labels.use}</button><button type="button" class="address-keep">${labels.keep}</button></div>`;
      suggestion.hidden = false;
      suggestion.querySelector('.address-use')?.addEventListener('click', () => {
        input('line1').value = result.components!.line1;
        input('city').value = result.components!.city;
        input('region').value = result.components!.region;
        input('postal_code').value = result.components!.postalCode;
        input('country').value = result.components!.country;
        sync();
        suggestion.hidden = true;
      });
    } catch {
      status.textContent = labels.noMatch;
    } finally {
      check.disabled = false;
    }
  });
}

function buildOwnerCards(select: HTMLSelectElement, lang: Lang) {
  const raw = select.value;
  const count = raw === 'single' ? 1 : Number(raw);
  if (!count || count < 1) return;
  const ownerSection = select.closest('.question-group')?.nextElementSibling?.nextElementSibling || document.querySelector('.question-group:nth-of-type(3)');
  const members = document.querySelector('textarea[name="members"]') as HTMLTextAreaElement | null;
  if (!members) return;
  members.required = false;
  members.parentElement?.classList.add('legacy-members-field');
  const existing = members.closest('.form-grid')?.querySelector('.owner-cards') as HTMLElement | null;
  if (existing?.dataset.count === String(count)) return;
  existing?.remove();

  const text = lang === 'es'
    ? { title: 'Información de cada propietario', equal: 'Dividir los porcentajes por igual', name: 'Nombre legal completo', type: 'Tipo de propietario', person: 'Persona', company: 'Empresa', email: 'Correo electrónico', phone: 'Teléfono', role: 'Función', member: 'Miembro', manager: 'Gerente', ownership: 'Porcentaje de propiedad', profit: 'Porcentaje de ganancias', loss: 'Porcentaje de pérdidas', responsible: 'Persona responsable para el EIN', total: 'Cada grupo de porcentajes debe sumar exactamente 100%.' }
    : lang === 'fr'
      ? { title: 'Informations de chaque propriétaire', equal: 'Répartir les pourcentages également', name: 'Nom légal complet', type: 'Type de propriétaire', person: 'Personne', company: 'Entreprise', email: 'E-mail', phone: 'Téléphone', role: 'Rôle', member: 'Membre', manager: 'Gestionnaire', ownership: 'Pourcentage de propriété', profit: 'Part des bénéfices', loss: 'Part des pertes', responsible: 'Personne responsable pour l’EIN', total: 'Chaque groupe de pourcentages doit totaliser exactement 100 %.' }
      : { title: 'Information for each owner', equal: 'Divide percentages equally', name: 'Full legal name', type: 'Owner type', person: 'Individual', company: 'Business entity', email: 'Email', phone: 'Phone', role: 'Role', member: 'Member', manager: 'Manager', ownership: 'Ownership percentage', profit: 'Profit share percentage', loss: 'Loss share percentage', responsible: 'EIN responsible party', total: 'Each percentage group must total exactly 100%.' };

  const wrap = document.createElement('div');
  wrap.className = 'owner-cards full';
  wrap.dataset.count = String(count);
  const equalValues = Array.from({ length: count }, (_, index) => index === count - 1 ? (100 - Math.floor((100 / count) * 100) / 100 * (count - 1)).toFixed(2) : (Math.floor((100 / count) * 100) / 100).toFixed(2));
  wrap.innerHTML = `<div class="owner-cards-head"><div><h4>${text.title}</h4><p>${text.total}</p></div><label class="switch-field"><input type="checkbox" class="equal-owner-shares" checked><span>${text.equal}</span></label></div>` +
    Array.from({ length: count }, (_, index) => `<article class="owner-card"><div class="owner-card-index">${String(index + 1).padStart(2, '0')}</div><h4>${lang === 'es' ? 'Propietario' : lang === 'fr' ? 'Propriétaire' : 'Owner'} ${index + 1}</h4><div class="form-grid">
      <label class="field full"><span>${text.name}</span><input name="owner_${index + 1}_name" required></label>
      <label class="field"><span>${text.type}</span><select name="owner_${index + 1}_type"><option value="individual">${text.person}</option><option value="business">${text.company}</option></select></label>
      <label class="field"><span>${text.role}</span><select name="owner_${index + 1}_role"><option value="member">${text.member}</option><option value="manager">${text.manager}</option></select></label>
      <label class="field"><span>${text.email}</span><input name="owner_${index + 1}_email" type="email" required></label>
      <label class="field"><span>${text.phone}</span><input name="owner_${index + 1}_phone" type="tel" required></label>
      <label class="field"><span>${text.ownership}</span><input class="owner-percentage" name="owner_${index + 1}_ownership_percent" type="number" min="0" max="100" step="0.01" value="${equalValues[index]}" readonly required></label>
      <label class="field"><span>${text.profit}</span><input class="profit-percentage" name="owner_${index + 1}_profit_percent" type="number" min="0" max="100" step="0.01" value="${equalValues[index]}" readonly required></label>
      <label class="field"><span>${text.loss}</span><input class="loss-percentage" name="owner_${index + 1}_loss_percent" type="number" min="0" max="100" step="0.01" value="${equalValues[index]}" readonly required></label>
      <label class="check-row full"><input type="radio" name="ein_responsible_owner" value="${index + 1}" ${index === 0 ? 'checked' : ''}><span>${text.responsible}</span></label>
    </div></article>`).join('');
  members.closest('.form-grid')?.insertBefore(wrap, members.parentElement);

  wrap.querySelector('.equal-owner-shares')?.addEventListener('change', (event) => {
    const checked = (event.target as HTMLInputElement).checked;
    wrap.querySelectorAll<HTMLInputElement>('.owner-percentage,.profit-percentage,.loss-percentage').forEach((field) => {
      field.readOnly = checked;
      if (checked) field.value = equalValues[Number(field.name.match(/owner_(\d+)/)?.[1] || 1) - 1];
    });
  });

  wrap.querySelectorAll('.owner-card').forEach((card, index) => {
    const phone = card.querySelector(`input[name="owner_${index + 1}_phone"]`) as HTMLInputElement;
    const addressAnchor = document.createElement('textarea');
    addressAnchor.name = `owner_${index + 1}_address`;
    addressAnchor.required = true;
    const label = document.createElement('label');
    label.className = 'field full owner-address-anchor';
    label.innerHTML = `<span>${lang === 'es' ? 'Dirección del propietario' : lang === 'fr' ? 'Adresse du propriétaire' : 'Owner address'}</span>`;
    label.appendChild(addressAnchor);
    phone.closest('.form-grid')?.appendChild(label);
    enhanceAddress(addressAnchor, lang);
  });
}

function enhanceOwnerSelector(lang: Lang) {
  const select = document.querySelector('select[name="ownership_type"]') as HTMLSelectElement | null;
  if (!select) return;
  if (select.dataset.enhanced !== 'true') {
    select.dataset.enhanced = 'true';
    const current = select.value;
    select.innerHTML = `<option value="">${lang === 'es' ? 'Selecciona una opción' : lang === 'fr' ? 'Choisir' : 'Select one'}</option>` + Array.from({ length: 10 }, (_, index) => `<option value="${index + 1}">${index + 1}</option>`).join('');
    if (current === 'single') select.value = '1';
    select.addEventListener('change', () => setTimeout(() => buildOwnerCards(select, lang), 20));
  }
  buildOwnerCards(select, lang);
}

function enhanceEin(lang: Lang) {
  const select = document.querySelector('select[name="third_party_designee"]') as HTMLSelectElement | null;
  if (select && select.dataset.enhanced !== 'true') {
    select.dataset.enhanced = 'true';
    const prompt = document.createElement('option');
    prompt.value = '';
    prompt.textContent = lang === 'es' ? 'Selecciona una opción' : lang === 'fr' ? 'Choisir' : 'Select one';
    select.insertBefore(prompt, select.firstChild);
    select.value = '';
  }
  const taxStatus = document.querySelector('select[name="responsible_party_tax_id_status"]');
  const group = taxStatus?.closest('.question-group');
  if (group && !group.querySelector('.sensitive-data-notice')) {
    const notice = document.createElement('div');
    notice.className = 'inline-note full sensitive-data-notice';
    notice.textContent = lang === 'es'
      ? 'No escribas aquí tu SSN o ITIN completo. Después de que la LLC sea aceptada por el estado, Ederito solicitará el número mediante un proceso seguro. El EIN lo emite el IRS; Ederito cobra únicamente por la preparación y asistencia administrativa.'
      : lang === 'fr'
        ? 'Ne saisissez pas votre SSN ou ITIN complet ici. Après l’acceptation de la LLC par l’État, Ederito demandera le numéro par un processus sécurisé. L’EIN est délivré par l’IRS; les frais Ederito couvrent uniquement la préparation et l’assistance administrative.'
        : 'Do not enter a complete SSN or ITIN here. After the LLC is accepted by the state, Ederito will request the number through a secure process. The EIN is issued by the IRS; Ederito charges only for preparation and administrative assistance.';
    group.querySelector('.form-grid')?.prepend(notice);
  }
}

function validateOwnerPercentages(event: Event, lang: Lang) {
  const form = event.target as HTMLFormElement;
  if (!form.matches('.project-form')) return;
  const cards = form.querySelector('.owner-cards');
  if (!cards) return;
  for (const className of ['owner-percentage', 'profit-percentage', 'loss-percentage']) {
    const total = Array.from(cards.querySelectorAll<HTMLInputElement>(`.${className}`)).reduce((sum, input) => sum + Number(input.value || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      event.preventDefault();
      alert(lang === 'es' ? 'Los porcentajes de propiedad, ganancias y pérdidas deben sumar exactamente 100%.' : lang === 'fr' ? 'Les pourcentages de propriété, bénéfices et pertes doivent totaliser exactement 100 %.' : 'Ownership, profit, and loss percentages must each total exactly 100%.');
      return;
    }
  }
}

export default function IntakeEnhancer() {
  useEffect(() => {
    if (!window.location.pathname.startsWith('/start-project')) return;
    const lang = ((localStorage.getItem('ederito-portal-language') || 'en') as Lang);
    const run = () => {
      addLanguageControl(lang);
      translatePage(lang);
      document.querySelectorAll<HTMLTextAreaElement>('textarea[name="principal_address"],textarea[name="mailing_address"],textarea[name="registered_agent_address"],textarea[name="single_owner_address"]').forEach((textarea) => enhanceAddress(textarea, lang));
      enhanceOwnerSelector(lang);
      enhanceEin(lang);
    };
    run();
    const observer = new MutationObserver(() => run());
    observer.observe(document.body, { childList: true, subtree: true });
    const submitHandler = (event: Event) => validateOwnerPercentages(event, lang);
    document.addEventListener('submit', submitHandler, true);
    return () => {
      observer.disconnect();
      document.removeEventListener('submit', submitHandler, true);
    };
  }, []);
  return null;
}
