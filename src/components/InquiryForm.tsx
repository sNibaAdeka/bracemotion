import {useRef,useState,type FormEvent} from 'react';
import {ArrowUpRight} from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import {CheckCircle} from '@phosphor-icons/react/dist/csr/CheckCircle';
import {ArrowClockwise} from '@phosphor-icons/react/dist/csr/ArrowClockwise';

type State = {kind:'idle'|'sending'|'success'|'error'; message?:string; receipt?:string};
export default function InquiryForm() {
  const [state,setState] = useState<State>({kind:'idle'});
  const requestId = useRef(crypto.randomUUID());
  const busy = useRef(false);
  const result = useRef<HTMLDivElement>(null);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy.current) return;
    busy.current = true; setState({kind:'sending'});
    const form=event.currentTarget, data=new FormData(form);
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 20000);
    try {
      const response = await fetch('/api/inquiry',{signal:controller.signal,method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:requestId.current,name:data.get('name'),email:data.get('email'),interest:data.get('interest'),consent:data.get('consent')==='on',website:data.get('website')})});
      if(response.status===429) throw Error('Too many requests. Please try again in an hour.');
      const parsed: unknown = await response.json().catch(()=>null);
      const payload = parsed && typeof parsed==='object' && !Array.isArray(parsed) ? parsed as Record<string,unknown> : {};
      if(!response.ok || payload.ok!==true || payload.stored!==true || typeof payload.id!=='string') {
        if(response.status===409) { requestId.current=crypto.randomUUID(); throw Error('Your inquiry details have changed. Select “Send inquiry” again.'); }
        if(response.status===422) {
          const field = typeof payload.field==='string' ? payload.field : '';
          const messages:Record<string,string>={email:'Check your email: use an address in the format name@example.com.',name:'Check your name: up to 80 characters, without < or >.',interest:'Choose an inquiry topic from the list.',consent:'Please consent to the use of your contact details for a response.'};
          const control = form.elements.namedItem(field);
          if(control instanceof HTMLElement) control.focus();
          throw Error(messages[field] ?? 'Check the form details and try again.');
        }
        throw Error('Your inquiry could not be saved. Your details remain in the form. Please try again.');
      }
      setState({kind:'success',receipt:payload.id.slice(0,8).toUpperCase()});
      requestAnimationFrame(()=>result.current?.focus());
    } catch(error) {
      setState({kind:'error',message:controller.signal.aborted ? 'The server is taking too long to respond. Your details remain in the form; please try again.' : error instanceof TypeError ? 'Unable to connect to the server. Check your connection and try again.' : error instanceof Error ? error.message : 'Your inquiry could not be sent. Please try again.'});
    } finally {clearTimeout(timeout);busy.current=false;}
  }
  if(state.kind==='success') return <div ref={result} className="form-success" tabIndex={-1} role="status"><CheckCircle size={42} weight="light" aria-hidden="true"/><h3>Inquiry saved.</h3><p>Your contact details and topic are available to the project team. Inquiry reference: <strong>{state.receipt}</strong>.</p><button className="text-link" onClick={()=>{requestId.current=crypto.randomUUID();setState({kind:'idle'});}}><ArrowClockwise size={18} aria-hidden="true"/> New inquiry</button></div>;
  return <form onSubmit={submit} className="inquiry-form" aria-label="Collaboration inquiry" aria-busy={state.kind==='sending'}>
    <div className="field-row"><label>Your name <span>(optional)</span><input type="text" name="name" autoComplete="name" maxLength={80}/></label><label>Email<input type="email" name="email" autoComplete="email" inputMode="email" required maxLength={254}/></label></div>
    <label>What would you like to discuss?<select name="interest" defaultValue="research"><option value="research">Research collaboration</option><option value="engineering">Engineering and technology</option><option value="other">General project information</option></select></label>
    <div className="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" autoComplete="off" tabIndex={-1}/></label></div>
    <label className="consent"><input type="checkbox" name="consent" required/><span>I consent to the use of my email and name to respond to this inquiry. <a href="#privacy">Data privacy</a></span></label>
    <p className="form-note">Do not submit medical information. This form is for project inquiries.</p>
    {state.kind==='error' && <p className="form-error" role="alert">{state.message}</p>}
    <button type="submit" className="button button-primary" disabled={state.kind==='sending'}>{state.kind==='sending'?'Saving inquiry…':'Send inquiry'}<ArrowUpRight size={20} aria-hidden="true"/></button>
  </form>;
}
