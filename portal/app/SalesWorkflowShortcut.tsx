'use client';

import { usePathname } from 'next/navigation';

export default function SalesWorkflowShortcut(){
 const path=usePathname();
 if(path.startsWith('/login')||path.startsWith('/start-project')||path.startsWith('/dashboard/sales')||path.startsWith('/admin/sales')) return null;
 const admin=path.startsWith('/admin');
 return <a href={admin?'/admin/sales':'/dashboard/sales'} className="sales-shortcut" aria-label={admin?'Open proposal and invoice workflow':'Open proposals and agreements'}><span>{admin?'Sales workflow':'Proposals'}</span><b>↗</b></a>;
}
