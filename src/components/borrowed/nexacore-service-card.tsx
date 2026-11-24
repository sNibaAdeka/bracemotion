// Adapted from NexaCore service-card.tsx, MIT © 2026 Mohammad Shehadeh.
// Full upstream LICENSE and ATTRIBUTION are retained in public/licenses/nexacore/.
import {useId} from 'react';
import './nexacore-service-card.css';

function ServiceIcon({level}:{level:number}) {
  return <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="nexacore-service-icon">
    <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.3"/>
    {level>=2&&<circle cx="11.5" cy="4.5" r="2" fill="currentColor"/>}
    {level>=3&&<circle cx="4" cy="11" r="3" fill="currentColor"/>}
  </svg>;
}

export function NexacoreServiceCard({label,level,title,description}:{label:string;level:number;title:string;description:string}) {
  const headingId=useId();
  return <article className="nexacore-service-card" data-slot="service-card" aria-labelledby={headingId}>
    <span className="nexacore-service-glow" aria-hidden="true"/>
    <div className="nexacore-service-copy">
      <span className="nexacore-service-badge"><ServiceIcon level={level}/>{label}</span>
      <h3 id={headingId}>{title}</h3>
      <p>{description}</p>
      <a href="#signal-title" aria-label={`Explore ${title.toLowerCase()}`} className="nexacore-service-link">Explore how it works <span aria-hidden="true">↗</span></a>
    </div>
  </article>;
}
