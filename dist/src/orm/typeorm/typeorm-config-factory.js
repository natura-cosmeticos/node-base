const NamingStrategy = require('./naming-strategy');
const typeOrmLogger = require('./logger');

module.exports = class TypeOrmConfigFactory {
  constructor(config) {
    this.config = config;
  }

  create() {
    return Object.assign(this.config, {
      logger: typeOrmLogger,
      namingStrategy: new NamingStrategy(),
    });
  }
};
