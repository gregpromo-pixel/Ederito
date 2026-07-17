'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Package={id:string;slug:string;name:string;tagline:string|null;description:string|null;base_price_cents:number;requires_quote:boolean;includes_first_year_domain:boolean;included_maintenance_months:number;included_infrastructure_months:number;service_id:string};
type Service={id:string;slug:string;name:string};
type