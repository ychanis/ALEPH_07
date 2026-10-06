import {getChatGPTUser} from '@/app/chatgpt-auth';
import {identity,json,sameOrigin} from '@/lib/server/auth';
import {database} from '@/db/raw';
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'허용되지 않은 요청'},403);const u=await identity(req);if(!u)return json({error:'로그인이 필요해요.'},401);const trusted=await getChatGPTUser();if(trusted?.email?.toLowerCase()!=='ksyji123@gmail.com')return json({error:'과제 6 소유자의 ChatGPT 계정 확인이 필요해요.'},403);const result=await database().prepare('UPDATE plans SET owner_id=? WHERE owner_id IS NULL').bind(u.id).run();return json({ok:true,movedPlans:result.meta.changes});}
