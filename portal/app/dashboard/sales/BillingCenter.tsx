type Invoice={id:string;invoice_number:string;status:string;total_cents:number;description:string|null};
const money=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value/100);
export default function BillingCenter({invoices}:{invoices:Invoice[]}){
 if(!invoices.length)return null;
 return <section className="billing-center"><h2>Secure payments</h2>{invoices.map(item=><article key={item.id}><div><small>{item.invoice_number}</small><strong>{item.description||'Ederito invoice'}</strong></div><div><b>{money(item.total_cents)}</b>{item.status==='paid'?<span>Paid</span>:<a href={`/api/payments/start/${item.id}`}>Pay securely</a>}</div></article>)}</section>;
}
