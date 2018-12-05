const inspector = require('inspector');
const os = require('os');
const { get } = require('lodash');
const { spawn } = require('child_process');

const LISTEN_INTERFACE = '0.0.0.0';

/* eslint-disable no-console */

/** Class representing a point. */

/** Node.js inspector wrapper that provides a proxy without authentication
 * allowing the same debug URL to be used across process restarts */
class NodeInspector {
  /**
   * @param {number} inspectorPort - The port the Inspector will listen
   * @param {number} proxyPort - The port the proxy will listen
   */
  constructor(inspectorPort = 9292, proxyPort = 9000) {
    this.inspectorPort = inspectorPort;
    this.proxyPort = proxyPort;
  }

  /**
   * Starts the inspector and the proxy
   */
  start() {
    this.startInspector();
    this.startProxy();
  }

  /**
   * Starts the inspector and the proxy, also waits for a debugger to be
   * attached before continuing the execution
   */
  startAndWait() {
    this.startProxy();
    this.startInspector(true);
  }

  startInspector(wait = false) {
    const ipAddress = this.primaryIpAddress();
    const devToolsUrl = 'chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws='
      + `${ipAddress}:${this.proxyPort}/__ws_proxy__`;

    console.log(`\ndevtools url: ${devToolsUrl}\n`);

    inspector.open(this.inspectorPort, LISTEN_INTERFACE, wait);
  }

  /**
   * Start only the proxy. Use this if you want to start or manage your own
   * inspector.
   */
  startProxy() {
    const debuggerProcess = spawn(
      'node',
      `${__dirname}/inspector-proxy.js -d ${this.inspectorPort} -p ${this.proxyPort}`.split(' '),
    );

    process.on('exit', () => debuggerProcess.kill());
  }

  primaryIpAddress() {
    return get(os.networkInterfaces(), 'eth0[0].address');
  }
}

module.exports = NodeInspector;
