/** Presentation contracts only. Client state is not authorization. A real server
 * must verify its own session and per-resource ownership before returning data. */
export type AccountChartDataPoint = Record<string,string|number>;
export interface AccountChartSnapshot {
  index:string;
  categories:string[];
  data:AccountChartDataPoint[];
  sourceLabel:string;
  updatedAt:string;
  xAxisLabel?:string;
  yAxisLabel?:string;
}
export type AccountChartResponse =
  | {status:'unavailable'}
  | {status:'signed-out'}
  | {status:'forbidden'}
  | {status:'empty';sourceLabel?:string}
  | {status:'ready';snapshot:AccountChartSnapshot};
export type AccountChartLoader = (request:{signal:AbortSignal})=>Promise<AccountChartResponse>;
export const UNCONFIGURED_ACCOUNT:AccountChartResponse=Object.freeze({status:'unavailable'});
const unsafeKeys=new Set(['__proto__','constructor','prototype']);
export function isValidChartData(data:readonly AccountChartDataPoint[],categories:readonly string[],index:string):boolean {
  if(typeof index!=='string'||!index.trim()||unsafeKeys.has(index)||categories.length>8||data.length>5000)return false;
  if(!categories.length||new Set(categories).size!==categories.length)return false;
  if(Array.from(categories).some(key=>typeof key!=='string'||!key.trim()||key.length>120||key===index||unsafeKeys.has(key)))return false;
  for(let i=0;i<data.length;i++)if(!Object.hasOwn(data,i))return false;
  return data.every(row=>row!==null&&typeof row==='object'
    && Object.hasOwn(row,index)
    && (typeof row[index]==='string'||(typeof row[index]==='number'&&Number.isFinite(row[index])))
    && categories.every(key=>Object.hasOwn(row,key)&&typeof row[key]==='number'&&Number.isFinite(row[key])));
}
export function isValidAccountSnapshot(snapshot:unknown):snapshot is AccountChartSnapshot {
  if(!snapshot||typeof snapshot!=='object')return false;
  const value=snapshot as AccountChartSnapshot;
  return Array.isArray(value.data)&&Array.isArray(value.categories)&&typeof value.sourceLabel==='string'&&!!value.sourceLabel.trim()
    &&(value.xAxisLabel===undefined||typeof value.xAxisLabel==='string')
    &&(value.yAxisLabel===undefined||typeof value.yAxisLabel==='string')
    &&typeof value.updatedAt==='string'&&Number.isFinite(Date.parse(value.updatedAt))
    &&isValidChartData(value.data,value.categories,value.index);
}

export function isValidAccountChartResponse(response:unknown):response is AccountChartResponse {
  if(!response||typeof response!=='object'||Array.isArray(response))return false;
  const value=response as AccountChartResponse;
  switch(value.status){
    case 'ready':return isValidAccountSnapshot(value.snapshot);
    case 'empty':return value.sourceLabel===undefined||typeof value.sourceLabel==='string';
    case 'unavailable':case 'signed-out':case 'forbidden':return true;
    default:return false;
  }
}
