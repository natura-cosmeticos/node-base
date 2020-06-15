const AWS = require('aws-sdk');

/**
 * Get the region for initialize the SSM from AWS SDK
 */
const region = process.env.REGION || 'us-east-1';
/**
 * Initializes the ssm based on the current region
 */
const ssm = new AWS.SSM({ region });

/**
 * @private
 */
function getKeysFromParameterStore(store, key) {
  return store.getParametersByPath({ Path: key }).promise();
}

/**
 * @private
 */
function ensureEnv(key) {
  if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
    throw new Error(`Expected environment variable ${key} to be defined`);
  }

  return process.env[key];
}

/**
 * @private
 */
function parseKeyName(key) {
  return key.substr(key.lastIndexOf('/') + 1);
}

/**
 * @private
 */
function setProcessEnvKeys(params) {
  params.forEach((param) => {
    process.env[parseKeyName(param.Name)] = param.Value;
  });
}

/**
 * AppSettings offers a way to initialize your app environment variables from AWS SSM
 */

class AppSettings {
  /**
   * Init app environment variables setting process.env based on Parameter Store variables
   * @param {Object} [store=ssm] - optional param of the Parameter Store, the default is AWS SSM
   * @return {undefined}
   */
  static async init(store = ssm) {
    const key = `/${AppSettings.application()}/${AppSettings.environment()}/`;

    const appKeys = await getKeysFromParameterStore(store, key);

    setProcessEnvKeys(appKeys.Parameters);
  }

  /**
   * Get the variable value from process.env
   * @param {string} key - The variable key
   * @return {string} - The variable value
   * @throws {Error} When the variable doesn't exist
   */
  static get(key) {
    return ensureEnv(key);
  }

  /**
   * Get the variable value from process.env or the default value passed,
   * then value is not found in process.env
   * @param {string} key - The variable key
   * @param {string} defaultValue - The variable default value
   * @return {string} - the variable value
   */
  static getOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
  }

  /**
  * Get the APP_NAME from process.env
  * @return {string} - The APP_NAME value
  * @throws {Error} When the variable doesn't exist
  */
  static application() {
    return ensureEnv('APP_NAME');
  }

  /**
   * Get the NODE_ENV from process.env
   * @return {string} - The NODE_ENV value
   * @throws {Error} When the variable doesn't exist
   */
  static environment() {
    return ensureEnv('NODE_ENV');
  }
}

module.exports = AppSettings;
