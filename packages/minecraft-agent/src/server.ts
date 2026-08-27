import { loadConfig } from './config';
import { createMinecraftAgent } from './http';
import { MinecraftOperations } from './operations';

const config = loadConfig();
const operations = new MinecraftOperations(config);
const server = createMinecraftAgent({ config, operations });
let shuttingDown = false;

function shutdown(signal: NodeJS.Signals): void {
  if (shuttingDown) return;
  shuttingDown = true;
  process.stdout.write(`${JSON.stringify({ event: 'minecraft_agent_shutdown', signal, at: new Date().toISOString() })}\n`);

  const force = setTimeout(() => {
    process.stderr.write('Timed out while waiting for active HTTP requests to finish\n');
    process.exit(1);
  }, 30000);
  force.unref();

  server.close((error) => {
    clearTimeout(force);
    if (error) {
      process.stderr.write(`HTTP shutdown failed: ${error.message}\n`);
      process.exitCode = 1;
    }
  });
}

server.once('error', (error) => {
  process.stderr.write(`Minecraft agent failed to listen: ${error.message}\n`);
  process.exitCode = 1;
});

server.listen(config.port, config.host, () => {
  process.stdout.write(`${JSON.stringify({
    event: 'minecraft_agent_started',
    at: new Date().toISOString(),
    host: config.host,
    port: config.port,
    service: config.service
  })}\n`);
});

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
