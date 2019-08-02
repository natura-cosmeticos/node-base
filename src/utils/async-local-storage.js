const asyncLocalStorage = require('async-local-storage');
const uuidV4 = require('uuid/v4');

module.exports = class AsyncLocalStorage {
  static getValue(propertyName) { return asyncLocalStorage.get(propertyName); }

  static setValue(propertyName, value) { return asyncLocalStorage.set(propertyName, value); }

  static getCorrelationId() { return asyncLocalStorage.get('correlationId'); }

  static setCorrelationId(correlationId) { return asyncLocalStorage.set('correlationId', correlationId || uuidV4()); }

  static setActive() { asyncLocalStorage.enable(); }

  static startScope() { asyncLocalStorage.scope(); }

  static setInactive() { asyncLocalStorage.disable(); }
};
