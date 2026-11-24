"use client";
import React,{forwardRef,lazy,Suspense,useId} from 'react';
import type * as SubframeCore from '@subframe/core';
import {cn} from '@/lib/utils';
import {isValidChartData,type AccountChartDataPoint} from '@/lib/account-chart';
import './area-chart.css';
// Large source library is loaded only when real chart data is supplied, never for
// the unconfigured account screen or the public marketing/inquiry page.
const AreaChartRenderer=lazy(()=>import('./area-chart-renderer'));
export class AreaChartBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<p className="bm-area-chart-loading" role="alert">The chart couldn’t load. The complete data table below is still available.</p>:this.props.children;}
}
export type DataPoint=AccountChartDataPoint;
export interface AreaChartRootProps extends Omit<React.ComponentProps<typeof SubframeCore.AreaChart>,'data'|'categories'|'index'|'children'> {
  data?:DataPoint[];categories?:string[];index?:string;stacked?:boolean;className?:string;
  title?:string;availability?:'available'|'unavailable';emptyMessage?:string;
}
const EMPTY_DATA:DataPoint[]=[];
const EMPTY_CATEGORIES:string[]=[];
export const AreaChart=forwardRef<HTMLDivElement,AreaChartRootProps>(function AreaChartRoot({data=EMPTY_DATA,categories=EMPTY_CATEGORIES,index='Time',stacked=false,className,title='Your data',availability='available',emptyMessage='No data is available for this view yet.',colors=['#c69bff','#9d7ddd','#e2b7ff','#765aad'],dark=true,...otherProps},ref) {
  const id=useId().replace(/[^a-zA-Z0-9_-]/g,'');
  const valid=data.length>0&&isValidChartData(data,categories,index);
  const message=availability==='unavailable'?'Account data isn’t connected yet.':data.length>0&&!valid?'This data can’t be displayed. Please request a valid response from the data source.':emptyMessage;
  return <div ref={ref} className={cn('bm-area-chart',className)} data-chart-state={availability==='unavailable'?'unavailable':valid?'ready':'empty'}>
    {availability==='unavailable'||!valid?<div className="bm-area-chart-empty" role="status"><span aria-hidden="true" className="bm-area-chart-empty-mark">∿</span><p>{message}</p></div>:<>
      <AreaChartBoundary key={`${index}:${categories.join('|')}`}><Suspense fallback={<p className="bm-area-chart-loading" role="status">Loading chart…</p>}><div className="bm-area-chart-visual" role="img" aria-label={`${title}. ${categories.join(', ')} by ${index}. A complete data table follows.`}>
        <AreaChartRenderer className="bm-area-chart-renderer h-80 w-full" data={data} categories={categories} index={index} stacked={stacked} colors={colors} dark={dark} {...otherProps}/>
      </div></Suspense></AreaChartBoundary>
      <details className="bm-area-chart-data"><summary>Show data table</summary><div className="bm-area-chart-table-scroll" tabIndex={0} role="region" aria-labelledby={`bm-chart-table-${id}`}>
        <table><caption id={`bm-chart-table-${id}`}>{title}</caption><thead><tr><th scope="col">{index}</th>{categories.map(category=><th scope="col" key={category}>{category}</th>)}</tr></thead><tbody>{data.map((row,rowIndex)=><tr key={rowIndex}><th scope="row">{row[index]}</th>{categories.map(category=><td key={category}>{row[category]}</td>)}</tr>)}</tbody></table>
      </div></details>
    </>}
  </div>;
});
export default AreaChart;
