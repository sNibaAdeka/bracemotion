import type { Config } from '@netlify/functions';
export default async () => Response.json({service:'BraceMotion inquiries',status:'available',version:1}, {headers:{'Cache-Control':'no-store'}});
export const config: Config = {path:'/api/health', method:'GET'};
