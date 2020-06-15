const InspectorProxy = require('inspector-proxy');
const program = require('commander');

/* eslint-disable no-console */

program
  .version('1.0.0')
  .option('-d, --debug-port [debug-port]', 'The port of the process you want to debug')
  .option('-p, --port [port]', 'The port this process will expose')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}

const proxy = new InspectorProxy({ port: program.port });

proxy.start({ debugPort: program.debugPort })
  .then(() => console.log('devtools proxy is connected'))
  .catch(err => console.error(err));
