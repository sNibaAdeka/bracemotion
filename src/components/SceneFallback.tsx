import {Component, type ReactNode} from 'react';
export function ProductPhoto({pose='closed'}:{pose?:'closed'|'open'}) {
 return <img className="scene-loading" src={pose === 'open' ? '/images/prototype-v4-open.webp' : '/images/prototype-v4-closed.webp'} alt={pose === 'open' ? 'Photograph of the fourth BraceMotion prototype with its case open: detached lid, board, wires and fabric strap' : 'Photograph of the fourth BraceMotion prototype: white case and fabric strap'}/>;
}
export class ProductBoundary extends Component<{children:ReactNode; onUnavailable?:()=>void},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onUnavailable?.();}
 render(){return this.state.failed ? <ProductPhoto/> : this.props.children;}
}
