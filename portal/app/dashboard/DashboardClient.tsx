'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Lang = 'en' | 'fr' | 'es';
type Tab = 'projects' | 'contracts' | 'invoices' | 'support';
type Project = { id:string; name:string; status:string; target_launch_date:string|null; free_maintenance_ends_at:string|null };
type Contract = { id:string; title:string; status:string; contract_number:string };
type Invoice = { id:string; invoice_number:string