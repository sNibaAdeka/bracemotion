"use client";
import {useEffect,useId,useRef,useState} from 'react';
import {ArrowLeft,ChartNoAxesCombined,LockKeyhole,RefreshCw} from 'lucide-react';
import AreaChart from '@/components/ui/area-chart';
import {isValidAccountChartResponse,UNCONFIGURED_ACCOUNT,type AccountChartLoader,type AccountChartResponse} from '@/lib/account-chart';
import './account-overview.css';
export interface AccountOverviewProps {
  /** Configure only after the server verifies real sessions and resource ownership. */
  loadMetrics?:AccountChartLoader;
  backHref?:string;signInHref?:string;
  /** Opaque UI invalidation key; never a substitute for server authorization. */
  accessScope?:string;
}
export default function AccountOverview({loadMetrics,backHref='/',signInHref='/sign-in',accessScope}:AccountOverviewProps) {
  const titleId=`bm-account-title-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
  const chartId=`${titleId}-chart`;
  const [revision,setRevision]=useState(0);
  const [view,setView]=useState<{loader:AccountChartLoader|undefined;scope:string|undefined;revision:number;response:AccountChartResponse;phase:'idle'|'loading'|'error'}>({loader:undefined,scope:undefined,revision:0,response:UNCONFIGURED_ACCOUNT,phase:'idle'});
  const current=view.loader===loadMetrics&&view.scope===accessScope&&view.revision===revision;
  const response=current?view.response:UNCONFIGURED_ACCOUNT;
  const phase=current?view.phase:loadMetrics?'loading':'idle';
  const controllerRef=useRef<AbortController|null>(null);
  useEffect(()=>{
    if(!loadMetrics){setView({loader:undefined,scope:accessScope,revision,response:UNCONFIGURED_ACCOUNT,phase:'idle'});return;}
    const controller=new AbortController();controllerRef.current=controller;setView({loader:loadMetrics,scope:accessScope,revision,response:UNCONFIGURED_ACCOUNT,phase:'loading'});
    Promise.resolve().then(()=>{if(controller.signal.aborted)return;return loadMetrics({signal:controller.signal});}).then(result=>{
      if(controller.signal.aborted||controllerRef.current!==controller)return;
      if(!isValidAccountChartResponse(result))throw new Error('Invalid account response');
      setView({loader:loadMetrics,scope:accessScope,revision,response:result,phase:'idle'});
    }).catch(()=>{if(!controller.signal.aborted&&controllerRef.current===controller){setView({loader:loadMetrics,scope:accessScope,revision,response:UNCONFIGURED_ACCOUNT,phase:'error'});}});
    return()=>{controller.abort();if(controllerRef.current===controller)controllerRef.current=null;};
  },[loadMetrics,accessScope,revision]);
  const ready=response.status==='ready';
  const sourceNote=phase==='loading'?'Loading data from the account source.':phase==='error'?'Account data couldn’t be loaded.':ready?response.snapshot.sourceLabel:response.status==='empty'?response.sourceLabel||'The connected source has no records yet.':response.status==='signed-out'?'Sign in to load account data.':response.status==='forbidden'?'This data isn’t available to the current account.':'The data source hasn’t been connected.';
  return <div className="bm-account"><header className="bm-account-header"><a href={backHref} className="bm-account-brand">Brace<span>Motion</span></a><a href={backHref} className="bm-account-back"><ArrowLeft size={17} aria-hidden="true"/>Back to the project</a></header>
    <main className="bm-account-main" aria-labelledby={titleId}><p className="bm-account-eyebrow">{loadMetrics?'Your account':'Public layout preview · No connected account'}</p><h1 id={titleId}>A clearer view.</h1><p className="bm-account-description">A place for your connected data, when account access and the data source are ready.</p>
      <section className="bm-account-panel" aria-labelledby={chartId}><div className="bm-account-panel-heading"><div><h2 id={chartId}><ChartNoAxesCombined size={22} aria-hidden="true"/>Data overview</h2><p>{sourceNote}</p></div>{loadMetrics&&<button type="button" className="bm-account-refresh" disabled={phase==='loading'} onClick={()=>setRevision(value=>value+1)} aria-label="Refresh account data"><RefreshCw size={18} aria-hidden="true"/>Refresh</button>}</div>
        {phase==='loading'?<p className="bm-account-message" role="status">Loading account data…</p>:phase==='error'?<p className="bm-account-message bm-account-error" role="alert">We couldn’t load this account view. No data is shown. Try again.</p>:response.status==='signed-out'||response.status==='forbidden'?<div className="bm-account-message"><LockKeyhole size={24} aria-hidden="true"/><p>{response.status==='signed-out'?'Sign in to access your account data.':'This account doesn’t have access to this data.'}</p><a href={signInHref}>Go to sign in</a></div>:<AreaChart title="Account data overview" availability={ready||response.status==='empty'?'available':'unavailable'} data={ready?response.snapshot.data:[]} categories={ready?response.snapshot.categories:[]} index={ready?response.snapshot.index:'Time'}/>}
        {ready&&<p className="bm-account-updated">Updated <time dateTime={response.snapshot.updatedAt}>{response.snapshot.updatedAt}</time></p>}
      </section>
      {!loadMetrics&&<p className="bm-account-disclosure"><LockKeyhole size={17} aria-hidden="true"/>Account access and data are not configured. This view does not request bracelet readings or private inquiries.</p>}
    </main>
  </div>;
}
