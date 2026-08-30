import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
@Injectable()
export class WorkRepository {
  constructor(private readonly pool: Queryable) {}
  assign(key:string,actor:string,task:string) { return queryOne(this.pool,'SELECT assignment_id::text,task_id::text,assigned_at,expires_at,replayed FROM public.work_assign_task($1,$2,$3)',[key,actor,task]); }
  submit(key:string,actor:string,assignment:string,evidence?:string) { return queryOne(this.pool,'SELECT assignment_id::text,submitted_at,replayed FROM public.work_submit_completion($1,$2,$3,$4)',[key,actor,assignment,evidence ?? null]); }
  verify(key:string,actor:string,assignment:string) { return queryOne(this.pool,'SELECT assignment_id::text,reward_amount::text,experience_amount::text,transaction_id::text,replayed FROM public.work_verify_and_reward($1,$2,$3)',[key,actor,assignment]); }
  dashboard(actor:string) { return queryOne(this.pool,'SELECT daily_paid::text,daily_cap::text,weekly_paid::text,weekly_cap::text,active_assignments::text FROM public.work_my_dashboard($1)',[actor]); }
  assignments(actor:string) { return queryRows(this.pool,'SELECT assignment_id::text,task_id::text,code,name,job_type::text,status::text,assigned_at,expires_at,reward_amount::text,experience_amount::text FROM public.work_my_assignments($1)',[actor]); }
}
