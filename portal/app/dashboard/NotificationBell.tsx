'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Notification = {
  id:string;
  recipient_user_id:string|null;
  template_key:string;
  payload:Record<string,unknown>|null;
  status:string;
  created_at:string;
};

type Props={userId:string;initialNotifications:Notification[]};

function titleFor(item:Notification