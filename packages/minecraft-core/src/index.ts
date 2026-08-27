/**
 * The Minecraft control domain, shared by two processes that must not share a
 * framework.
 *
 * The API decides who may *request* an operation and shows the receipt. A
 * separate host-local worker — on the machine the Minecraft server actually
 * runs on — leases an already-approved operation and calls the loopback-only
 * agent. Both need these rules, and the worker must not carry NestJS to get
 * them, which is why they live in a package rather than in the API.
 */
export * from './approved-operation.repository';
export * from './approved-operation.service';
export * from './host-agent-client';
export type { Queryable, QueryResultLike } from './db';
