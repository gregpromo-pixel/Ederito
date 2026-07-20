'use client';

import { useEffect } from 'react';

type Lang='en'|'fr'|'es';

const copy={
  en:{eyebrow:'Smart client workspace',title:'Your next move, clearly mapped.',subtitle:'Projects, approvals, payments, messages, and launch progress in one place.',next:'Recommended next action',start:'Start your first project',review:'Review active project',messages:'Check project messages',support:'Open support',timeline:'Project journey',activity:'Activity center',empty:'No urgent activity. Your workspace is clear.',steps:['Request','Proposal','Agreement','Payment','Build','Review','Launch'],notifications:['Project activity','Messages','Billing','Support']},
  fr:{eyebrow:'Espace client intelligent',title:'Votre prochaine étape, clairement définie.',subtitle:'Projets, validations, paiements, messages et progression réunis au même endroit.',next:'Prochaine action recommandée',start:'Démarrer votre premier projet',review:'Voir le projet actif',messages:'Consulter les messages',support:'Ouvrir l’assistance',timeline:'Parcours du projet',activity:'Centre d’activité',empty:'Aucune activité urgente. Votre espace est à jour.',steps:['Demande','Proposition','Contrat','Paiement','Création','Révision','Lancement'],notifications:['Activité projet','Messages','Facturation','Assistance']},
  es:{eyebrow:'Espacio inteligente del cliente',title:'Tu próximo paso, claramente definido.',subtitle:'Proyectos, aprobaciones, pagos, mensajes y progreso en un solo lugar.',next:'Próxima acción recomendada',start:'Iniciar tu primer proyecto',review:'Ver proyecto activo',messages:'Revisar mensajes',support:'Abrir soporte',timeline:'Ruta del proyecto',activity:'Centro de actividad',empty:'No hay actividad urgente. Tu espacio está al día.',steps:['Solicitud','Propuesta','Acuerdo','Pago','Creación','Revisión','Lanzamiento'],notifications:['Actividad del proyecto','Mensajes','Facturación','Soporte']}
} as const;

function currentLanguage():Lang{
  const value=localStorage.getItem('ederito-portal-language');
  return value==='fr'||value==='es'?value:'en';
}

function count(selector:string){return document.querySelectorAll(selector).length}

export default function SmartClientWorkspace(){
  useEffect(()=>{
    const dashboard=document.querySelector<HTMLElement>('.dashboard-shell');
    const hero=document.querySelector<HTMLElement>('.dashboard-hero');
    if(!dashboard||!hero||document.querySelector('.smart-workspace'))return;

    const lang=currentLanguage();
    const t=copy[lang];
    const projects=count('.workspace-panel .premium-record');
    const projectTotal=Number(document.querySelector('.dashboard-stats article:first-child strong')?.textContent||0);
    const contractTotal=Number(document.querySelector('.dashboard-stats article:nth-child(2) strong')?.textContent||0);
    const invoiceTotal=Number(document.querySelector('.dashboard-stats article:nth-child(3) strong')?.textContent||0);
    const messageTotal=Number(document.querySelector('.dashboard-stats article:nth-child(4) strong')?.textContent||0);
    const hasProject=Math.max(projects,projectTotal)>0;
    const progress=hasProject?Math.min(92,18+(contractTotal?18:0)+(invoiceTotal?16:0)+28):8;
    const activeStep=hasProject?Math.min(5,1+(contractTotal?1:0)+(invoiceTotal?1:0)):0;
    const nextHref=hasProject?'#workspace':'/start-project';
    const nextLabel=hasProject?t.review:t.start;

    const section=document.createElement('section');
    section.className='smart-workspace';
    section.innerHTML=`
      <div class="smart-workspace-head">
        <div><p class="eyebrow">${t.eyebrow}</p><h2>${t.title}</h2><p>${t.subtitle}</p></div>
        <div class="smart-progress" style="--smart-progress:${progress}"><strong>${progress}%</strong><span>${t.timeline}</span></div>
      </div>
      <div class="smart-workspace-grid">
        <article class="smart-next-action">
          <small>01 / ${t.next}</small>
          <h3>${nextLabel}</h3>
          <p>${hasProject?t.subtitle:t.empty}</p>
          <div><a class="button" href="${nextHref}">${nextLabel}<span>↗</span></a><a href="/ai-planner">AI Studio</a></div>
        </article>
        <article class="smart-activity">
          <header><small>02 / ${t.activity}</small><strong>${messageTotal+invoiceTotal}</strong></header>
          <div>${t.notifications.map((label,index)=>`<button type="button" data-smart-tab="${index===0?'projects':index===1?'messages':index===2?'invoices':'support'}"><span>${label}</span><b>${[projectTotal,messageTotal,invoiceTotal,0][index]}</b></button>`).join('')}</div>
        </article>
      </div>
      <article class="smart-timeline">
        <header><small>03 / ${t.timeline}</small><span>${progress}%</span></header>
        <div>${t.steps.map((step,index)=>`<button type="button" class="${index<activeStep?'complete':index===activeStep?'active':''}" data-smart-tab="${index===0?'projects':index===1||index===2?'contracts':index===3?'invoices':'projects'}"><i>${index<activeStep?'✓':String(index+1).padStart(2,'0')}</i><span>${step}</span></button>`).join('')}</div>
      </article>`;
    hero.insertAdjacentElement('afterend',section);

    const workspace=document.querySelector<HTMLElement>('.workspace-section');
    if(workspace)workspace.id='workspace';
    section.querySelectorAll<HTMLElement>('[data-smart-tab]').forEach(button=>button.addEventListener('click',()=>{
      const target=button.dataset.smartTab;
      const tab=[...document.querySelectorAll<HTMLButtonElement>('.workspace-tabs button')].find(item=>item.textContent?.toLowerCase().includes(target==='projects'?(lang==='fr'?'projet':lang==='es'?'proyecto':'project'):target==='contracts'?(lang==='fr'?'contrat':lang==='es'?'contrato':'contract'):target==='invoices'?(lang==='fr'?'facture':lang==='es'?'factura':'invoice'):target==='messages'?'message':lang==='fr'?'assistance':lang==='es'?'soporte':'support'));
      tab?.click();
      workspace?.scrollIntoView({behavior:'smooth',block:'start'});
    }));
  },[]);
  return null;
}
