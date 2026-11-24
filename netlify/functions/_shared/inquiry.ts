import { createHash } from 'node:crypto';
export type Inquiry = { id: string; email: string; name: string; interest: 'research'|'engineering'|'other'; consent: true; createdAt: string; version: 1 };
export interface PrivateStore {
  get(key: string, options: {type: 'json'}): Promise<unknown>;
  setJSON(key: string, value: unknown, options?: {onlyIfNew?: boolean}): Promise<{modified: boolean}>;
}
const respond = (body: unknown, status = 200) => Response.json(body, {status, headers: {'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}});
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
export async function handleInquiry(request: Request, store: PrivateStore, siteId: string, ip = 'unknown', now = new Date()): Promise<Response> {
  if (request.method !== 'POST') return respond({error:'method_not_allowed'}, 405);
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return respond({error:'origin_not_allowed'}, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return respond({error:'unsupported_media_type'}, 415);
  if (Number(request.headers.get('content-length') || 0) > 4096) return respond({error:'payload_too_large'}, 413);
  let data: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return respond({error:'payload_too_large'}, 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return respond({error:'invalid_request'}, 400);
    data = parsed as Record<string, unknown>;
  } catch {return respond({error:'invalid_request'}, 400);}
  // Reject rather than pretend to persist honeypot submissions.
  if (text(data.website)) return respond({error:'invalid_request'}, 400);
  const email = text(data.email).toLowerCase(), name = text(data.name), id = text(data.id), interest = text(data.interest);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || email.length > 254) return respond({error:'invalid_email', field:'email'}, 422);
  if (name.length > 80 || (/[<>]/.test(name) || [...name].some(char => char.charCodeAt(0) < 32))) return respond({error:'invalid_name', field:'name'}, 422);
  if (!['research','engineering','other'].includes(interest)) return respond({error:'invalid_interest', field:'interest'}, 422);
  if (data.consent !== true) return respond({error:'consent_required', field:'consent'}, 422);
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)) return respond({error:'invalid_id'}, 422);
  try {
    const existing = await store.get(`inquiries/${id}`, {type:'json'}) as Inquiry|null;
    if (existing) return existing.email === email && existing.interest === interest && existing.name === name ? respond({ok:true, id, stored:true, duplicate:true}) : respond({error:'id_conflict'}, 409);
    // Five atomic slots per IP per hour. Only a salted hash is retained, never raw IP.
    const bucket = now.toISOString().slice(0, 13);
    const rateKey = `limits/${bucket}/${digest(`${siteId}:${bucket}:${ip}`)}`;
    let allowed = false;
    for (let slot = 0; slot < 5; slot++) {
      const slotKey = `${rateKey}/${slot}`;
      const reserved = await store.setJSON(slotKey, {id, at: now.toISOString()}, {onlyIfNew:true});
      const owner = reserved.modified ? {id} : await store.get(slotKey, {type:'json'}) as {id?:string}|null;
      if (owner?.id === id) {allowed = true; break;}
    }
    if (!allowed) return respond({error:'rate_limited'}, 429);
    const record: Inquiry = {id, email, name, interest:interest as Inquiry['interest'], consent:true, createdAt:now.toISOString(), version:1};
    const written = await store.setJSON(`inquiries/${id}`, record, {onlyIfNew:true});
    const saved = await store.get(`inquiries/${id}`, {type:'json'}) as Inquiry|null;
    if (!saved || saved.email !== email || saved.interest !== interest || saved.name !== name) return respond({error:'storage_unavailable'}, 503);
    return respond({ok:true, id, stored:true, duplicate:!written.modified}, written.modified ? 201 : 200);
  } catch { return respond({error:'storage_unavailable'}, 503); }
}
