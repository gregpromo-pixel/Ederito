'use client';

import { useEffect } from 'react';

type Lang='en'|'fr'|'es';
type Dictionary=Record<string,string>;

const fr:Dictionary={
'Back to dashboard':'Retour au tableau de bord','Project concierge':'Conciergerie de projet','Start with the right plan.':'Commencez avec le bon plan.','The form changes with your selections, so you answer only what Ederito needs to review, quote, file, or build your project.':'Le formulaire s’adapte à vos choix afin que vous répondiez uniquement aux questions nécessaires