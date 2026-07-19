'use client';

import { useEffect } from 'react';

type Lang = 'en' | 'fr' | 'es';
type Dictionary = Record<string, string>;
type Pair = readonly [string, string];

const makeDictionary = (pairs: readonly Pair[]): Dictionary => Object.fromEntries(pairs);

const fr = makeDictionary([
  ['Back to dashboard','Retour au tableau de bord'],['Dashboard','Tableau de bord'],['Client','Client'],['Status','Statut'],['Priority','Priorité'],['Normal','Normale'],['High