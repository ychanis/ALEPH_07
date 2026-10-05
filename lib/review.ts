export function reviewEvidence(tasks:any[],runs:any[],planId:string,from:string,to:string,today:string){
 const target=tasks.filter(t=>t.plan_id===planId&&!t.deleted&&t.due>=from&&t.due<=to);
 const records=runs.filter(r=>target.some(t=>t.id===r.task_id));
 const done=target.filter(t=>t.status==='done');
 const late=target.filter(t=>t.status!=='done'&&t.due<today);
 const blocked=target.filter(t=>records.some(r=>r.task_id===t.id&&r.reason.trim()));
 const estimate=target.reduce((a,t)=>a+t.estimate,0),actual=records.reduce((a,r)=>a+r.minutes,0);
 return {target,records,done,late,blocked,estimate,actual,difference:actual-estimate};
}
