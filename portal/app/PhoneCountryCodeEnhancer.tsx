'use client';

import { useEffect } from 'react';

type CountryCallingCode = readonly [iso: string, dial: string];

const COUNTRY_CALLING_CODES: readonly CountryCallingCode[] = [
  ['AD', '+376'], ['AE', '+971'], ['AF', '+93'], ['AG', '+1 268'], ['AI', '+1 264'],
  ['AL', '+355'], ['AM', '+374'], ['AO', '+244'], ['AQ', '+672'], ['AR', '+54'],
  ['AS', '+1 684'], ['AT', '+43'], ['AU', '+61'], ['AW', '+297'], ['AX', '+358 18'],
  ['AZ', '+994'], ['BA', '+387'], ['BB', '+1 246'], ['BD', '+880'], ['BE', '+32'],
  ['BF', '+226'], ['BG', '+359'], ['BH', '+973'], ['BI', '+257'], ['BJ', '+229'],
  ['BL', '+590'], ['BM', '+1 441'], ['BN', '+673'], ['BO', '+591'], ['BQ', '+599'],
  ['BR', '+55'], ['BS', '+1 242'], ['BT', '+975'], ['BV', '+47'], ['BW', '+267'],
  ['BY', '+375'], ['BZ', '+501'], ['CA', '+1'], ['CC', '+61 89164'], ['CD', '+243'],
  ['CF', '+236'], ['CG', '+242'], ['CH', '+41'], ['CI', '+225'], ['CK', '+682'],
  ['CL', '+56'], ['CM', '+237'], ['CN', '+86'], ['CO', '+57'], ['CR', '+506'],
  ['CU', '+53'], ['CV', '+238'], ['CW', '+599 9'], ['CX', '+61 89164'], ['CY', '+357'],
  ['CZ', '+420'], ['DE', '+49'], ['DJ', '+253'], ['DK', '+45'], ['DM', '+1 767'],
  ['DO', '+1 809'], ['DO', '+1 829'], ['DO', '+1 849'], ['DZ', '+213'], ['EC', '+593'],
  ['EE', '+372'], ['EG', '+20'], ['EH', '+212'], ['ER', '+291'], ['ES', '+34'],
  ['ET', '+251'], ['FI', '+358'], ['FJ', '+679'], ['FK', '+500'], ['FM', '+691'],
  ['FO', '+298'], ['FR', '+33'], ['GA', '+241'], ['GB', '+44'], ['GD', '+1 473'],
  ['GE', '+995'], ['GF', '+594'], ['GG', '+44 1481'], ['GH', '+233'], ['GI', '+350'],
  ['GL', '+299'], ['GM', '+220'], ['GN', '+224'], ['GP', '+590'], ['GQ', '+240'],
  ['GR', '+30'], ['GS', '+500'], ['GT', '+502'], ['GU', '+1 671'], ['GW', '+245'],
  ['GY', '+592'], ['HK', '+852'], ['HM', '+672'], ['HN', '+504'], ['HR', '+385'],
  ['HT', '+509'], ['HU', '+36'], ['ID', '+62'], ['IE', '+353'], ['IL', '+972'],
  ['IM', '+44 1624'], ['IN', '+91'], ['IO', '+246'], ['IQ', '+964'], ['IR', '+98'],
  ['IS', '+354'], ['IT', '+39'], ['JE', '+44 1534'], ['JM', '+1 876'], ['JO', '+962'],
  ['JP', '+81'], ['KE', '+254'], ['KG', '+996'], ['KH', '+855'], ['KI', '+686'],
  ['KM', '+269'], ['KN', '+1 869'], ['KP', '+850'], ['KR', '+82'], ['KW', '+965'],
  ['KY', '+1 345'], ['KZ', '+7'], ['LA', '+856'], ['LB', '+961'], ['LC', '+1 758'],
  ['LI', '+423'], ['LK', '+94'], ['LR', '+231'], ['LS', '+266'], ['LT', '+370'],
  ['LU', '+352'], ['LV', '+371'], ['LY', '+218'], ['MA', '+212'], ['MC', '+377'],
  ['MD', '+373'], ['ME', '+382'], ['MF', '+590'], ['MG', '+261'], ['MH', '+692'],
  ['MK', '+389'], ['ML', '+223'], ['MM', '+95'], ['MN', '+976'], ['MO', '+853'],
  ['MP', '+1 670'], ['MQ', '+596'], ['MR', '+222'], ['MS', '+1 664'], ['MT', '+356'],
  ['MU', '+230'], ['MV', '+960'], ['MW', '+265'], ['MX', '+52'], ['MY', '+60'],
  ['MZ', '+258'], ['NA', '+264'], ['NC', '+687'], ['NE', '+227'], ['NF', '+672 3'],
  ['NG', '+234'], ['NI', '+505'], ['NL', '+31'], ['NO', '+47'], ['NP', '+977'],
  ['NR', '+674'], ['NU', '+683'], ['NZ', '+64'], ['OM', '+968'], ['PA', '+507'],
  ['PE', '+51'], ['PF', '+689'], ['PG', '+675'], ['PH', '+63'], ['PK', '+92'],
  ['PL', '+48'], ['PM', '+508'], ['PN', '+64'], ['PR', '+1 787'], ['PR', '+1 939'],
  ['PS', '+970'], ['PT', '+351'], ['PW', '+680'], ['PY', '+595'], ['QA', '+974'],
  ['RE', '+262'], ['RO', '+40'], ['RS', '+381'], ['RU', '+7'], ['RW', '+250'],
  ['SA', '+966'], ['SB', '+677'], ['SC', '+248'], ['SD', '+249'], ['SE', '+46'],
  ['SG', '+65'], ['SH', '+290'], ['SI', '+386'], ['SJ', '+47'], ['SK', '+421'],
  ['SL', '+232'], ['SM', '+378'], ['SN', '+221'], ['SO', '+252'], ['SR', '+597'],
  ['SS', '+211'], ['ST', '+239'], ['SV', '+503'], ['SX', '+1 721'], ['SY', '+963'],
  ['SZ', '+268'], ['TC', '+1 649'], ['TD', '+235'], ['TF', '+262'], ['TG', '+228'],
  ['TH', '+66'], ['TJ', '+992'], ['TK', '+690'], ['TL', '+670'], ['TM', '+993'],
  ['TN', '+216'], ['TO', '+676'], ['TR', '+90'], ['TT', '+1 868'], ['TV', '+688'],
  ['TW', '+886'], ['TZ', '+255'], ['UA', '+380'], ['UG', '+256'], ['UM', '+1'],
  ['US', '+1'], ['UY', '+598'], ['UZ', '+998'], ['VA', '+39 06698'], ['VC', '+1 784'],
  ['VE', '+58'], ['VG', '+1 284'], ['VI', '+1 340'], ['VN', '+84'], ['VU', '+678'],
  ['WF', '+681'], ['WS', '+685'], ['XK', '+383'], ['YE', '+967'], ['YT', '+262'],
  ['ZA', '+27'], ['ZM', '+260'], ['ZW', '+263']
] as const;

const SPECIAL_REGION_NAMES: Record<string, Record<string, string>> = {
  XK: { en: 'Kosovo', fr: 'Kosovo', es: 'Kosovo' }
};

const COPY = {
  en: {
    select: 'Country / calling code',
    number: 'Area code and phone number',
    help: 'Choose the country calling code, then enter the area code and phone number.'
  },
  fr: {
    select: 'Pays / indicatif',
    number: 'Indicatif régional et numéro',
    help: "Choisissez l’indicatif du pays, puis saisissez l’indicatif régional et le numéro."
  },
  es: {
    select: 'País / código',
    number: 'Código de área y número',
    help: 'Elige el código del país y luego escribe el código de área y el número.'
  }
} as const;

type SupportedLanguage = keyof typeof COPY;

function activeLanguage(): SupportedLanguage {
  const raw = document.documentElement.dataset.lang || document.documentElement.lang || navigator.language || 'en';
  if (raw.toLowerCase().startsWith('fr')) return 'fr';
  if (raw.toLowerCase().startsWith('es')) return 'es';
  return 'en';
}

function localeRegion() {
  const candidates = [navigator.language, ...(navigator.languages || [])];
  for (const locale of candidates) {
    const match = locale.match(/[-_]([A-Za-z]{2})$/);
    if (match) return match[1].toUpperCase();
  }
  return 'US';
}

function flag(iso: string) {
  if (!/^[A-Z]{2}$/.test(iso)) return '🌐';
  return String.fromCodePoint(...iso.split('').map((letter) => 127397 + letter.charCodeAt(0)));
}

function regionName(iso: string, language: SupportedLanguage) {
  const special = SPECIAL_REGION_NAMES[iso]?.[language];
  if (special) return special;
  try {
    return new Intl.DisplayNames([language], { type: 'region' }).of(iso) || iso;
  } catch {
    return iso;
  }
}

function normalizedDialCode(value: string) {
  const [, dial = '+1'] = value.split('|');
  return `+${dial.replace(/\D/g, '')}`;
}

function enhancePhoneInput(input: HTMLInputElement) {
  if (input.dataset.countryCodeEnhanced === 'true' || !input.name) return;

  const parent = input.parentElement;
  if (!parent) return;

  const language = activeLanguage();
  const copy = COPY[language];
  const originalName = input.name;
  const defaultRegion = localeRegion();

  input.dataset.countryCodeEnhanced = 'true';
  input.dataset.originalPhoneName = originalName;
  input.name = `${originalName}_national_number`;
  input.autocomplete = 'tel-national';
  input.inputMode = 'tel';
  input.placeholder = copy.number;
  input.maxLength = 24;
  parent.classList.add('phone-country-enhanced');

  const select = document.createElement('select');
  select.className = 'phone-country-code';
  select.name = `${originalName}_country`;
  select.setAttribute('aria-label', copy.select);
  select.title = copy.select;

  const displayRows = COUNTRY_CALLING_CODES.map(([iso, dial]) => ({
    iso,
    dial,
    name: regionName(iso, language)
  })).sort((a, b) => a.name.localeCompare(b.name, language));

  for (const row of displayRows) {
    const option = document.createElement('option');
    option.value = `${row.iso}|${row.dial}`;
    option.textContent = `${flag(row.iso)} ${row.name} (${row.dial})`;
    select.appendChild(option);
  }

  const preferredOption = Array.from(select.options).find((option) => option.value.startsWith(`${defaultRegion}|`));
  select.value = preferredOption?.value || 'US|+1';

  const combined = document.createElement('input');
  combined.type = 'hidden';
  combined.name = originalName;

  const callingCode = document.createElement('input');
  callingCode.type = 'hidden';
  callingCode.name = `${originalName}_country_code`;

  const helper = document.createElement('small');
  helper.className = 'phone-country-helper';
  helper.textContent = copy.help;

  function updateValues() {
    const dial = normalizedDialCode(select.value);
    const rawNumber = input.value.trim();
    const numberDigits = rawNumber.replace(/\D/g, '');
    callingCode.value = dial;
    combined.value = rawNumber.startsWith('+') ? `+${numberDigits}` : `${dial}${numberDigits}`;
  }

  select.addEventListener('change', updateValues);
  input.addEventListener('input', updateValues);
  input.addEventListener('change', updateValues);

  parent.insertBefore(select, input);
  parent.appendChild(combined);
  parent.appendChild(callingCode);
  parent.appendChild(helper);
  updateValues();

  input.form?.addEventListener('reset', () => window.setTimeout(updateValues, 0));
}

function scanPhoneInputs(root: ParentNode = document) {
  root.querySelectorAll<HTMLInputElement>('input[type="tel"]').forEach(enhancePhoneInput);
}

export default function PhoneCountryCodeEnhancer() {
  useEffect(() => {
    scanPhoneInputs();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('input[type="tel"]')) enhancePhoneInput(node as HTMLInputElement);
          scanPhoneInputs(node);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
