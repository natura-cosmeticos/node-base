const { NodeInspector } = require('architecture-node-base').Util;

new NodeInspector(
  process.env.DEBUGGER_INSPECTOR_PORT || 9230,
  process.env.DEBUGGER_PROXY_PORT || 10000,
).startAndWait();

// eslint-disable-next-line no-debugger
debugger;
