import bcrypt from 'bcryptjs';
import {database} from '@/db/raw';
export const TTL=8*60*60*1000;
export const hashPassword=(p:string)=>bcrypt.hash(p,12);
export const verifyPassword=(p:string,h:string)=>bcrypt.compare(p,h);
export const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');
export const json=(value:any,status=200,headers:any={})=>Response.json(value,{status,headers:{'Cache-Control':'no-store',...headers}});
export const cookie=(token:string,age=TTL/1000)=>`pds_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`;
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin && req.headers.get('content-type')?.startsWith('application/json');}
export async function identity(req:Request){const token=req.headers.get('cookie')?.match(/(?:^|;\s*)pds_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(!token)return null;return database().prepare('SELECT u.id,u.username,s.token_hash,s.expires FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires>?').bind(await digest(token),Date.now()).first() as Promise<any>;}
export async function issue(userId:string){const token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join('');const expires=Date.now()+TTL;await database().prepare('INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)').bind(await digest(token),userId,expires).run();return {token,expires};}
