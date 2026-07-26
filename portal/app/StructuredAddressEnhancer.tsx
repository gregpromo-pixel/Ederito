'use client';

import { useEffect } from 'react';

type Lang = 'en' | 'fr' | 'es';
type AddressValue = {
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};
type PartyValue = {
  name: string;
  ownership?: string;
  address: AddressValue;
};

const addressTargets = [
  'principal_address',
  'mailing_address',
  'registered_agent_address',
  'single_owner_address'
] as const;

const partyTargets: Record<string, { multiple: boolean; ownership: boolean }> = {
  outside_manager_details: { multiple: false, ownership: false },
  members: { multiple: true, ownership: true },
  manager_details: { multiple: true, ownership: false },
  arkansas_franchise_officer: { multiple: false, ownership: false },
  texas_governing_people: { multiple: true, ownership: false }
};

const copy = {
  en: {
    addressHelp: 'Enter each part separately so it can be reviewed exactly as it should appear on official records.',
    line1: 'Street address', line2: 'Apartment, suite, unit, or floor', city: 'City', region: 'State, province, or region', postal: 'ZIP or postal code', country: 'Country',
    line1Placeholder: 'Street number and street name', line2Placeholder: 'Optional', cityPlaceholder: 'City', regionPlaceholder: 'State or province', postalPlaceholder: 'ZIP or postal code', countryPlaceholder: 'Country',
    confirmAddress: 'I confirm that this address matches the official or current address I intend Ederito to use and that the spelling, unit number, city, state, postal code, and country are correct.',
    lockedState: 'The registered-agent address must use the selected formation state.',
    legalName: 'Full legal name', ownership: 'Ownership percentage', addPerson: 'Add another person', removePerson: 'Remove', person: 'Person',
    partyHelp: 'Enter the legal name and complete address for each required person. Do not combine multiple people in one text box.',
    finalConfirm: 'I have reviewed every name, address, date, number, and spelling before submission. I understand that Ederito relies on the information I provide and, to the extent permitted by law, is not responsible for delays, rejected filings, correction fees, or other consequences caused by inaccurate, incomplete, or mistyped client-provided information.',
    finalNote: 'Ederito may flag obvious issues, but the customer remains responsible for confirming that submitted information matches official records.',
    validationTitle: 'Address accuracy required', validationMessage: 'Complete every required address field and confirm its accuracy before continuing.'
  },
  fr: {
    addressHelp: 'Saisissez chaque élément séparément afin qu’il puisse être vérifié exactement comme il doit apparaître dans les documents officiels.',
    line1: 'Adresse municipale', line2: 'Appartement, bureau, unité ou étage', city: 'Ville', region: 'État, province ou région', postal: 'Code postal', country: 'Pays',
    line1Placeholder: 'Numéro et nom de rue', line2Placeholder: 'Facultatif', cityPlaceholder: 'Ville', regionPlaceholder: 'État ou province', postalPlaceholder: 'Code postal', countryPlaceholder: 'Pays',
    confirmAddress: 'Je confirme que cette adresse correspond à l’adresse officielle ou actuelle qu’Ederito doit utiliser et que l’orthographe, le numéro d’unité, la ville, l’État, le code postal et le pays sont exacts.',
    lockedState: 'L’adresse de l’agent enregistré doit utiliser l’État de constitution sélectionné.',
    legalName: 'Nom légal complet', ownership: 'Pourcentage de propriété', addPerson: 'Ajouter une autre personne', removePerson: 'Supprimer', person: 'Personne',
    partyHelp: 'Saisissez le nom légal et l’adresse complète de chaque personne requise. Ne regroupez pas plusieurs personnes dans une seule zone de texte.',
    finalConfirm: 'J’ai vérifié chaque nom, adresse, date, numéro et orthographe avant l’envoi. Je comprends qu’Ederito se fie aux informations que je fournis et que, dans la mesure permise par la loi, Ederito n’est pas responsable des retards, rejets, frais de correction ou autres conséquences causés par des informations fournies par le client qui sont inexactes, incomplètes ou mal saisies.',
    finalNote: 'Ederito peut signaler des problèmes évidents, mais le client demeure responsable de confirmer que les renseignements correspondent aux documents officiels.',
    validationTitle: 'Exactitude de l’adresse requise', validationMessage: 'Remplissez chaque champ d’adresse obligatoire et confirmez son exactitude avant de continuer.'
  },
  es: {
    addressHelp: 'Ingresa cada parte por separado para revisarla exactamente como debe aparecer en los registros oficiales.',
    line1: 'Dirección', line2: 'Apartamento, suite, unidad o piso', city: 'Ciudad', region: 'Estado, provincia o región', postal: 'Código postal', country: 'País',
    line1Placeholder: 'Número y nombre de la calle', line2Placeholder: 'Opcional', cityPlaceholder: 'Ciudad', regionPlaceholder: 'Estado o provincia', postalPlaceholder: 'Código postal', countryPlaceholder: 'País',
    confirmAddress: 'Confirmo que esta dirección coincide con la dirección oficial o actual que deseo que Ederito utilice y que la ortografía, el número de unidad, la ciudad, el estado, el código postal y el país son correctos.',
    lockedState: 'La dirección del agente registrado debe usar el estado de formación seleccionado.',
    legalName: 'Nombre legal completo', ownership: 'Porcentaje de propiedad', addPerson: 'Agregar otra persona', removePerson: 'Eliminar', person: 'Persona',
    partyHelp: 'Ingresa el nombre legal y la dirección completa de cada persona requerida. No combines varias personas en un solo cuadro de texto.',
    finalConfirm: 'He revisado cada nombre, dirección, fecha, número y ortografía antes de enviar. Entiendo que Ederito depende de la información que proporciono y que, en la medida permitida por la ley, no es responsable por retrasos, rechazos, cargos de corrección u otras consecuencias causadas por información del cliente incorrecta, incompleta o mal escrita.',
    finalNote: 'Ederito puede señalar problemas evidentes, pero el cliente sigue siendo responsable de confirmar que la información coincida con los registros oficiales.',
    validationTitle: 'Se requiere exactitud de la dirección', validationMessage: 'Completa todos los campos de dirección obligatorios y confirma su exactitud antes de continuar.'
  }
} as const;

function language(): Lang {
  const value = localStorage.getItem('ederito-portal-language') || localStorage.getItem('ederito-language');
  return value === 'fr' || value === 'es' ? value : 'en';
}

function make<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

function createInput(label: string, placeholder: string, autocomplete: string, required: boolean) {
  const wrapper = make('label', 'structured-address-field');
  const caption = make('span');
  caption.textContent = label;
  const input = make('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.autocomplete = autocomplete;
  input.required = required;
  wrapper.append(caption, input);
  return { wrapper, input };
}

function currentAddress(fields: ReturnType<typeof createAddressFields>): AddressValue {
  return {
    line1: fields.line1.value.trim(),
    line2: fields.line2.value.trim(),
    city: fields.city.value.trim(),
    region: fields.region.value.trim(),
    postalCode: fields.postal.value.trim(),
    country: fields.country.value.trim()
  };
}

function formattedAddress(value: AddressValue) {
  return [
    value.line1,
    value.line2,
    [value.city, value.region, value.postalCode].filter(Boolean).join(', '),
    value.country
  ].filter(Boolean).join('\n');
}

function createAddressFields(lang: Lang, required: boolean, lockFormationState = false) {
  const t = copy[lang];
  const line1 = createInput(t.line1, t.line1Placeholder, 'address-line1', required);
  const line2 = createInput(t.line2, t.line2Placeholder, 'address-line2', false);
  const city = createInput(t.city, t.cityPlaceholder, 'address-level2', required);
  const region = createInput(t.region, t.regionPlaceholder, 'address-level1', required);
  const postal = createInput(t.postal, t.postalPlaceholder, 'postal-code', required);
  const country = createInput(t.country, t.countryPlaceholder, 'country-name', required);

  if (lockFormationState) {
    const formation = document.querySelector<HTMLSelectElement>('select[name="formation_state"]');
    const sync = () => {
      region.input.value = formation?.value || '';
      region.input.readOnly = Boolean(formation?.value);
      region.input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    formation?.addEventListener('change', sync);
    sync();
    const note = make('small', 'structured-address-state-note');
    note.textContent = t.lockedState;
    region.wrapper.append(note);
  }

  return {
    wrappers: [line1.wrapper, line2.wrapper, city.wrapper, region.wrapper, postal.wrapper, country.wrapper],
    line1: line1.input,
    line2: line2.input,
    city: city.input,
    region: region.input,
    postal: postal.input,
    country: country.input
  };
}

function transformAddress(original: HTMLInputElement | HTMLTextAreaElement, lang: Lang) {
  if (original.dataset.structuredAddress === 'true') return;
  original.dataset.structuredAddress = 'true';
  const label = original.closest('label');
  if (!label) return;

  const required = original.required;
  original.required = false;
  original.classList.add('structured-address-original');
  original.setAttribute('aria-hidden', 'true');

  const block = make('fieldset', 'structured-address-block');
  block.dataset.addressFor = original.name;
  const legend = make('legend');
  legend.textContent = label.querySelector(':scope > span')?.textContent?.trim() || copy[lang].line1;
  const help = make('p', 'structured-address-help');
  help.textContent = copy[lang].addressHelp;
  const grid = make('div', 'structured-address-grid');
  const fields = createAddressFields(lang, required, original.name === 'registered_agent_address');
  fields.wrappers.forEach((wrapper) => grid.append(wrapper));

  const confirmation = make('label', 'structured-address-confirmation');
  const checkbox = make('input');
  checkbox.type = 'checkbox';
  checkbox.required = required;
  checkbox.name = `${original.name}_accuracy_confirmed`;
  checkbox.value = 'yes';
  const confirmationText = make('span');
  confirmationText.textContent = copy[lang].confirmAddress;
  confirmation.append(checkbox, confirmationText);

  const sync = () => {
    const value = currentAddress(fields);
    original.value = formattedAddress(value);
    original.dispatchEvent(new Event('input', { bubbles: true }));
    original.dispatchEvent(new Event('change', { bubbles: true }));
  };
  [fields.line1, fields.line2, fields.city, fields.region, fields.postal, fields.country].forEach((input) => input.addEventListener('input', sync));

  block.append(legend, help, grid, confirmation);
  label.insertAdjacentElement('afterend', block);
  label.classList.add('structured-address-source-label');
}

function partyRow(lang: Lang, baseName: string, index: number, ownership: boolean, onChange: () => void, onRemove?: () => void) {
  const t = copy[lang];
  const row = make('article', 'structured-party-row');
  const header = make('header');
  const title = make('strong');
  title.textContent = `${t.person} ${index + 1}`;
  header.append(title);
  if (onRemove) {
    const remove = make('button');
    remove.type = 'button';
    remove.textContent = t.removePerson;
    remove.addEventListener('click', onRemove);
    header.append(remove);
  }

  const identity = make('div', 'structured-party-identity');
  const nameField = createInput(t.legalName, t.legalName, 'name', true);
  identity.append(nameField.wrapper);
  let ownershipInput: HTMLInputElement | null = null;
  if (ownership) {
    const ownershipField = createInput(t.ownership, '100', 'off', true);
    ownershipField.input.type = 'number';
    ownershipField.input.min = '0';
    ownershipField.input.max = '100';
    ownershipField.input.step = '0.01';
    ownershipInput = ownershipField.input;
    identity.append(ownershipField.wrapper);
  }

  const grid = make('div', 'structured-address-grid');
  const address = createAddressFields(lang, true, false);
  address.wrappers.forEach((wrapper) => grid.append(wrapper));
  const confirm = make('label', 'structured-address-confirmation');
  const checkbox = make('input');
  checkbox.type = 'checkbox';
  checkbox.required = true;
  checkbox.name = `${baseName}_${index}_accuracy_confirmed`;
  checkbox.value = 'yes';
  const text = make('span');
  text.textContent = t.confirmAddress;
  confirm.append(checkbox, text);

  const inputs = [nameField.input, ownershipInput, address.line1, address.line2, address.city, address.region, address.postal, address.country].filter(Boolean) as HTMLInputElement[];
  inputs.forEach((input) => input.addEventListener('input', onChange));
  row.append(header, identity, grid, confirm);

  return {
    row,
    value: (): PartyValue => ({
      name: nameField.input.value.trim(),
      ...(ownershipInput ? { ownership: ownershipInput.value.trim() } : {}),
      address: currentAddress(address)
    })
  };
}

function transformParty(original: HTMLTextAreaElement, lang: Lang, config: { multiple: boolean; ownership: boolean }) {
  if (original.dataset.structuredParty === 'true') return;
  original.dataset.structuredParty = 'true';
  const label = original.closest('label');
  if (!label) return;

  original.required = false;
  original.classList.add('structured-address-original');
  original.setAttribute('aria-hidden', 'true');

  const block = make('fieldset', 'structured-party-block');
  const legend = make('legend');
  legend.textContent = label.querySelector(':scope > span')?.textContent?.trim() || copy[lang].legalName;
  const help = make('p', 'structured-address-help');
  help.textContent = copy[lang].partyHelp;
  const list = make('div', 'structured-party-list');
  const add = make('button', 'structured-party-add');
  add.type = 'button';
  add.textContent = `+ ${copy[lang].addPerson}`;
  const rows: ReturnType<typeof partyRow>[] = [];

  const sync = () => {
    original.value = JSON.stringify(rows.map((item) => item.value()));
    original.dispatchEvent(new Event('input', { bubbles: true }));
    original.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const render = () => {
    list.replaceChildren();
    rows.forEach((item, index) => {
      const rebuilt = partyRow(lang, original.name, index, config.ownership, sync, rows.length > 1 ? () => {
        rows.splice(index, 1);
        render();
        sync();
      } : undefined);
      const oldValue = item.value();
      rows[index] = rebuilt;
      list.append(rebuilt.row);
      const inputs = rebuilt.row.querySelectorAll<HTMLInputElement>('input[type="text"],input[type="number"]');
      const values = [oldValue.name, oldValue.ownership || '', oldValue.address.line1, oldValue.address.line2, oldValue.address.city, oldValue.address.region, oldValue.address.postalCode, oldValue.address.country];
      inputs.forEach((input, inputIndex) => { if (values[inputIndex] !== undefined) input.value = values[inputIndex]; });
    });
  };

  const addRow = () => {
    const item = partyRow(lang, original.name, rows.length, config.ownership, sync);
    rows.push(item);
    render();
  };
  add.addEventListener('click', addRow);
  addRow();
  block.append(legend, help, list);
  if (config.multiple) block.append(add);
  label.insertAdjacentElement('afterend', block);
  label.classList.add('structured-address-source-label');
}

function ensureFinalConfirmation(lang: Lang) {
  const form = document.querySelector<HTMLFormElement>('.project-form');
  const grid = form?.querySelector<HTMLElement>('.contact-section .form-grid');
  if (!form || !grid || form.querySelector('[data-final-accuracy-confirmation]')) return;
  const wrapper = make('div', 'final-accuracy-confirmation full');
  wrapper.dataset.finalAccuracyConfirmation = 'true';
  const label = make('label');
  const checkbox = make('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'all_information_accuracy_acknowledgment';
  checkbox.value = 'yes';
  checkbox.required = true;
  const text = make('span');
  text.textContent = copy[lang].finalConfirm;
  label.append(checkbox, text);
  const note = make('p');
  note.textContent = copy[lang].finalNote;
  wrapper.append(label, note);
  grid.append(wrapper);
}

function enhance() {
  if (!window.location.pathname.startsWith('/start-project')) return;
  const lang = language();
  addressTargets.forEach((name) => {
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`input[name="${name}"],textarea[name="${name}"]`).forEach((element) => transformAddress(element, lang));
  });
  Object.entries(partyTargets).forEach(([name, config]) => {
    document.querySelectorAll<HTMLTextAreaElement>(`textarea[name="${name}"]`).forEach((element) => transformParty(element, lang, config));
  });
  ensureFinalConfirmation(lang);
}

export default function StructuredAddressEnhancer() {
  useEffect(() => {
    if (!window.location.pathname.startsWith('/start-project')) return;
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        enhance();
      });
    };
    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    const onLanguage = () => window.setTimeout(() => window.location.reload(), 30);
    window.addEventListener('ederito:language', onLanguage);
    return () => {
      observer.disconnect();
      window.removeEventListener('ederito:language', onLanguage);
    };
  }, []);
  return null;
}
