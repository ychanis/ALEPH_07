import {identity,json} from '@/lib/server/auth';
import {database} from '@/db/raw';
import {readData} from '@/app/api/data/route';
export async function GET(req:Request){const u=await identity(req);if(!u)return json({error:'로그인이 필요해요.'},401);const db=database();const exp:any=await db.prepare('SELECT payload FROM experiments WHERE user_id=?').bind(u.id).first();return json({...await readData(db,u.id),experiment:exp?JSON.parse(exp.payload):null,exported_at:new Date().toISOString(),timezone:'Asia/Seoul',unit:'minutes'},200,{'Content-Disposition':'attachment; filename="pds-private-diary.json"'});}
