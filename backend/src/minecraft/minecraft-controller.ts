/**
 * The former screen/workdir controller was never safe to use from the web
 * process: a container's filesystem and loopback are not the Minecraft host,
 * its restart path did not restart, and it exposed raw host log reads. Keep a
 * fail-closed export for stale imports while directing all control through the
 * DB-approved host-agent/executor architecture.
 */
export class MinecraftControllerDeprecatedError extends Error {
  constructor() {
    super('MinecraftController is disabled; use the approved host-local executor workflow');
    this.name = 'MinecraftControllerDeprecatedError';
  }
}

export class MinecraftController {
  constructor() {
    throw new MinecraftControllerDeprecatedError();
  }
}
