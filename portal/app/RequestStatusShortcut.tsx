'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';

type Lang='en'|'fr'|'es';
const labels={en:'Track requests',fr:'Suivre les demandes',es:'Seguir solicitudes'};

export default function RequestStatusShortcut(){
 const pathname=usePathname();
 const [lang,setLang]=useState<Lang>('en');
 useEffect(()=>{const saved=localStorage.getItem('ederito-portal-language') as Lang|null;if(saved&&['en','fr','es'].includes(saved))setLang(saved)},[]);
 if(pathname!=='/dashboard')return null;
 return <Link className="request-status-shortcut" href="/dashboard/requests">{labels[lang]} ↗</Link>;
}
