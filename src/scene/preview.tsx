import React from 'react';
import { createRoot } from 'react-dom/client';
import { useMotionValue } from 'motion/react';
import ProductScene from './ProductScene';
function Preview() {
 const p = useMotionValue(Number(new URLSearchParams(location.search).get('p') ?? 0));
 return <div style={{width:'100vw',height:'100vh'}}><ProductScene progress={p} /></div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Preview /></React.StrictMode>);
