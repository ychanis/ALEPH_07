import {DatabaseSync} from 'node:sqlite';
import {createServer} from 'node:http';
import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import * as auth from '../app/api/auth/route';
import * as data from '../app/api/data/route';
import * as experiment from '../app/api/experiment/route';
import * as exp from '../app/api/export/route';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync('drizzle/'+f,'utf8').replaceAll('--> statement-breakpoint',''));
class Statement{sql:string;args:any[]=[];constructor(s:string){this.sql=s;}bind(...v:any[]){this.args=v;return this;}async first(){return sql.prepare(this.sql).get(...this.args)||null;}async all(){return {results:sql.prepare(this.sql).all(...this.args)};}async run(){const r=sql.prepare(this.sql).run(...this.args);return {meta:{changes:Number(r.changes)}};}}
(globalThis as any).__testDB={prepare:(s:string)=>new Statement(s),batch:async(queries:any[])=>{sql.exec('BEGIN');try{const values=[];for(const q of queries)values.push(/^\s*SELECT/i.test(q.sql)?await q.all():await q.run());sql.exec('COMMIT');return values;}catch(e){sql.exec('ROLLBACK');throw e;}}};
const routes:any={'/api/auth':auth,'/api/data':data,'/api/experiment':experiment,'/api/export':exp};let origin='';
const server=createServer(async(req,res)=>{try{let bytes='';for await(const c of req)bytes+=c;const request=new Request(origin+req.url,{method:req.method,headers:req.headers as any,...(req.method!=='GET'?{body:bytes}: {})});const route=routes[new URL(request.url).pathname];const response=route?.[req.method!]?.(request);const r=response?await response:new Response('not found',{status:404});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());}catch{res.writeHead(500);res.end('internal test failure');}});
await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+(server.address() as any).port;
const evidence:any[]=[];let passed=0;
async function call(label:string,path:string,method='GET',body:any=null,session='',status=200,extra:any={}){const headers:any={...extra};if(session)headers.cookie=session;if(method!=='GET'){headers.origin=origin;headers['content-type']='application/json';}const r=await fetch(origin+path,{method,headers,...(method!=='GET'?{body:JSON.stringify(body)}:{})});const value:any=await r.json();assert.equal(r.status,status,label+': '+JSON.stringify(value));evidence.push({label,request:{method,path,headers:{...(session?{Cookie:'pds_session=[REDACTED]'}:{}),...extra},body:body?Object.fromEntries(Object.entries(body).map(([k,v])=>/password/i.test(k)?[k,'[REDACTED]']:[k,v])):null},response:{status:r.status,body:value}});passed++;return {value,cookie:r.headers.get('set-cookie')?.split(';')[0]||''};}
try{
const pw=crypto.randomUUID()+'aA1!';for(const name of ['test-a','test-b'])await call('가입 '+name,'/api/auth','POST',{action:'signup',username:name,password:pw},'',201);
await call('중복 가입','/api/auth','POST',{action:'signup',username:'test-a',password:pw},'',409);
const incorrect=await call('잘못된 비밀번호','/api/auth','POST',{action:'login',username:'test-a',password:pw+'wrong'},'',401);const unknown=await call('없는 아이디','/api/auth','POST',{action:'login',username:'test-unknown',password:pw},'',401);assert.deepEqual(incorrect.value,unknown.value);
const hashes=sql.prepare('SELECT username,password_hash FROM users ORDER BY username').all() as any[];assert.notEqual(hashes[0].password_hash,hashes[1].password_hash);assert(hashes.every(h=>h.password_hash.startsWith('$2b$12$')&&!h.password_hash.includes(pw)));evidence.push({label:'같은 비밀번호·서로 다른 bcrypt salt',database:hashes});passed++;
const a=(await call('로그인 A','/api/auth','POST',{action:'login',username:'test-a',password:pw})).cookie;const b=(await call('로그인 B','/api/auth','POST',{action:'login',username:'test-b',password:pw})).cookie;
const plan=(title:string)=>({title,start:'2026-10-06',end:'2026-12-31',priority:'보통',criterion:'집중 학습',estimate:30,improvement:''});const pa=(await call('A 계획 생성','/api/data','POST',{action:'plan',value:plan('A 자료')},a)).value.id;const pb=(await call('B 계획 생성','/api/data','POST',{action:'plan',value:plan('B 자료')},b)).value.id;
const ta=(await call('A 할 일 생성','/api/data','POST',{action:'task',value:{plan_id:pa,title:'A 학습',due:'2026-12-31',priority:'보통',tags:'',estimate:30}},a)).value.id;
const tb=(await call('B 할 일 생성','/api/data','POST',{action:'task',value:{plan_id:pb,title:'B 학습',due:'2026-12-31',priority:'보통',tags:'',estimate:30}},b)).value.id;
await call('A 내 할 일 읽기 성공','/api/data?kind=tasks&id='+ta,'GET',null,a);await call('B 내 할 일 읽기 성공','/api/data?kind=tasks&id='+tb,'GET',null,b);
const beforeA=(await call('A 정상 목록','/api/data','GET',null,a)).value;const beforeB=(await call('B 정상 목록','/api/data','GET',null,b)).value;
for(const [name,session,otherTask,otherPlan] of [['A→B',a,tb,pb],['B→A',b,ta,pa]]){
await call(name+' 읽기 거절','/api/data?kind=tasks&id='+otherTask,'GET',null,session,404);
await call(name+' 수정 거절','/api/data','POST',{action:'task',value:{id:otherTask,plan_id:otherPlan,title:'변조',due:'2026-12-31',priority:'보통',tags:'',estimate:0}},session,404);
await call(name+' 삭제 거절','/api/data','POST',{action:'delete',id:otherTask},session,404);
await call(name+' 남의 계획에 새 자료 거절','/api/data','POST',{action:'task',value:{plan_id:otherPlan,title:'침입',due:'2026-12-31',priority:'보통',tags:'',estimate:0}},session,404);
}
const uidB=(sql.prepare('SELECT id FROM users WHERE username=?').get('test-b') as any).id;
const spoof=await call('URL·헤더에 B ID 위조','/api/data?user_id='+uidB,'GET',null,a,200,{'X-User-Id':uidB});assert.deepEqual(spoof.value,beforeA);
await call('본문 B ID 위조해도 내 새 계획 소유','/api/data','POST',{action:'plan',user_id:uidB,value:{...plan('위조 소유자 테스트'),owner_id:uidB}},a);
assert.deepEqual((await call('거절 후 B 전체자료 불변','/api/data','GET',null,b)).value,beforeB);
const afterA=(await call('거절 후 A 원래자료 불변','/api/data','GET',null,a)).value;assert.deepEqual(afterA.tasks,beforeA.tasks);assert.equal(afterA.plans.filter((p:any)=>p.title==='위조 소유자 테스트').length,1);assert(!afterA.plans.some((p:any)=>p.id===pb));
await call('비로그인 직접 요청','/api/data','GET',null,'',401);await call('비로그인 직접 내보내기','/api/export','GET',null,'',401);
await call('로그아웃 전 성공','/api/data','GET',null,a);await call('A 로그아웃','/api/auth','POST',{action:'logout'},a);await call('동일 주소·방식·기존 쿠키 재전송 거절','/api/data','GET',null,a,401);
await call('비밀번호 변경 전 B 성공','/api/data','GET',null,b);await call('B 비밀번호 변경','/api/auth','POST',{action:'password',password:pw,newPassword:crypto.randomUUID()+'nN1!'},b);await call('비밀번호 변경 후 기존 쿠키 거절','/api/data','GET',null,b,401);
const a2=(await call('A 재로그인','/api/auth','POST',{action:'login',username:'test-a',password:pw})).cookie;
await call('1일차 설정 고정','/api/experiment','POST',{action:'start',question:'계획 규칙을 바꾸면 집중 시간이 늘어날까?',rule:'하루 30분'},a2);
await call('실제 오늘 기록','/api/experiment','POST',{action:'day',minutes:30,note:'테스트용, 실제 사용자 기록이 아님'},a2);
await call('같은 날짜 중복 거절','/api/experiment','POST',{action:'day',minutes:40,note:'중복'},a2,400);
await call('1일차에 규칙 변경 거절','/api/experiment','POST',{action:'change',rule:'하루 40분',reason:'테스트'},a2,400);
// Simulated calendar validates the workflow only; never counted as real user days.
const NativeDate=globalThis.Date;const epoch=NativeDate.now();let clock=epoch;
class SimulatedDate extends NativeDate {constructor(...args:any[]){if(args.length)super(args[0]);else super(clock);}static now(){return clock;}}
(globalThis as any).Date=SimulatedDate;
let workflowSession=a2;
try{for(let d=2;d<=5;d++){clock=epoch+(d-1)*86400000;workflowSession=(await call('가상 달력 검증용 재로그인','/api/auth','POST',{action:'login',username:'test-a',password:pw})).cookie;if(d===3){await call('가상 3일차 규칙 변경 전 기록 거절','/api/experiment','POST',{action:'day',minutes:35,note:'시뮬레이션'},workflowSession,400);await call('가상 2일차 뒤 규칙 변경','/api/experiment','POST',{action:'change',rule:'하루 40분',reason:'검증용 가상 달력, 실제 사용자 판단 아님'},workflowSession);await call('두 번째 규칙 변경 거절','/api/experiment','POST',{action:'change',rule:'하루 50분',reason:'중복 변경'},workflowSession,400);}await call('가상 날짜 '+d+'일차 기록','/api/experiment','POST',{action:'day',minutes:d*10,note:'가상 달력 자동검증. 실제 5일 사용 증거 아님'},workflowSession);}await call('가상 6번째 날짜 기록 거절','/api/experiment','POST',{action:'day',minutes:10,note:'초과 기록'},workflowSession,400);}finally{globalThis.Date=NativeDate;}
evidence.push({label:'달력 시뮬레이션 구분',note:'위 가상 2~5일차는 흐름 자동검증이며 실제 사용자 기록·실제 5일 완주 증거가 아니다.'});
const exported=(await call('내 자료 전체 내보내기','/api/export','GET',null,a2)).value;assert(exported.experiment.days.length===5&&!exported.plans.some((p:any)=>p.id===pb));
const expiry=(await call('만료 확인용 로그인','/api/auth','POST',{action:'login',username:'test-a',password:pw})).cookie; const oldHash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(expiry.split('=')[1]));const key=Array.from(new Uint8Array(oldHash)).map(b=>b.toString(16).padStart(2,'0')).join('');sql.prepare('UPDATE sessions SET expires=? WHERE token_hash=?').run(Date.now()-1,key);await call('만료된 세션 거절','/api/data','GET',null,expiry,401);
await call('계정 삭제','/api/auth','POST',{action:'delete-account',password:pw},a2);await call('삭제 후 쿠키 거절','/api/data','GET',null,a2,401);assert.equal((sql.prepare('SELECT COUNT(*) n FROM plans WHERE owner_id=(SELECT id FROM users WHERE username=?)').get('test-a') as any).n,0);assert.equal((sql.prepare('SELECT COUNT(*) n FROM tasks WHERE id=?').get(ta) as any).n,0);assert.equal((sql.prepare('SELECT COUNT(*) n FROM experiments').get() as any).n,0);
mkdirSync('t07',{recursive:true});writeFileSync('t07/evidence-local.json',JSON.stringify({environment:'실제 API 코드 + Node HTTP + 메모리 SQLite D1 adapter. Cloudflare 배포 환경 검증과 구분함.',executed_at:new Date().toISOString(),passed,evidence},null,2));console.log(JSON.stringify({passed,result:'PASS',evidence:'t07/evidence-local.json'}));
}finally{server.close();}
