'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const copy = {
  en:{eyebrow:'Secure client access',title:'Everything about your project, in one place.',lead:'Review projects, contracts, invoices, maintenance coverage and support requests through your private Ederito workspace.',signIn:'Sign in',register:'Create account',name:'Full name',email:'Email',password:'Password',submitIn:'Continue securely',submitUp:'Create secure account',switchUp:'New to Ederito?',switchIn:'Already have an account