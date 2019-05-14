const asyncLocalStorage = require('async-local-storage');
const uuidV4 = require('uuid/v4');

module.exports = class AsyncLocalStorage {
  static getValue(proportyName) { return asyncLocalStorage.get(proportyName); }

  static setValue(proportyName, value) { return asyncLocalStorage.get(proportyName, value); }

  static getCorrelationId() { return asyncLocalStorage.get('correlationId'); }

  static setCorrelationId(correlationId) { return asyncLocalStorage.set('correlationId', correlationId || uuidV4()); }

  static setActive() { asyncLocalStorage.enable(); }

  static startScope() { asyncLocalStorage.scope(); }
};
