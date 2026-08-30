import { Body, ConflictException, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard'; import { ConsentGuard } from '../auth/guards/consent.guard'; import { CsrfGuard } from '../auth/guards/csrf.guard'; import { SessionGuard } from '../auth/guards/session.guard'; import { requireUserId, type RequestWithSession } from '../auth/session.context'; import { isExpectedCommandFailure } from '../core/pg-error'; import { WorkAssignmentDto, WorkCompletionDto } from './work.dto'; import { WorkRepository } from './work.repository';
@ApiTags('work') @Controller('work') @UseGuards(SessionGuard,AuthenticatedGuard,ConsentGuard,CsrfGuard)
export class WorkController {
  constructor(private readonly work: WorkRepository) {}
  private async command<T>(work:()=>Promise<T>):Promise<T> { try{return await work();}catch(error){if(isExpectedCommandFailure(error))throw new ConflictException('work action was rejected');throw error;} }
  @Get() dashboard(@Req() request:RequestWithSession){return this.work.dashboard(requireUserId(request));}
  @Get('assignments') assignments(@Req() request:RequestWithSession){return this.work.assignments(requireUserId(request));}
  @Post('assignments') assign(@Req() request:RequestWithSession,@Body() body:WorkAssignmentDto){return this.command(()=>this.work.assign(body.idempotencyKey,requireUserId(request),body.taskId));}
  @Post('assignments/:id/completions') submit(@Req() request:RequestWithSession,@Param('id',ParseUUIDPipe) id:string,@Body() body:WorkCompletionDto){return this.command(()=>this.work.submit(body.idempotencyKey,requireUserId(request),id,body.evidence));}
  @Post('assignments/:id/verify') verify(@Req() request:RequestWithSession,@Param('id',ParseUUIDPipe) id:string,@Body() body:WorkCompletionDto){return this.command(()=>this.work.verify(body.idempotencyKey,requireUserId(request),id));}
}
