import { getStore } from '@netlify/blobs';
import type { Config, Context } from '@netlify/functions';
import { handleInquiry } from './_shared/inquiry';
export default async (request: Request, context: Context) => {
  try {
    const store = getStore({name:'bracemotion-inquiries', consistency:'strong'});
    return await handleInquiry(request, store, context.site.id ?? "bracemotion", context.ip);
  } catch {
    return Response.json({error:'storage_unavailable'}, {status:503, headers:{'Cache-Control':'no-store'}});
  }
};
export const config: Config = {path:'/api/inquiry', rateLimit:{windowLimit:20, windowSize:60, aggregateBy:['ip','domain']}};
