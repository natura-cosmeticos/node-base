const { snakeCase } = require('typeorm/util/StringUtils');
const { DefaultNamingStrategy } = require('typeorm/naming-strategy/DefaultNamingStrategy');

module.exports = class NamingStrategy extends DefaultNamingStrategy {
  tableName(targetName, userSpecifiedName) {
    return userSpecifiedName || snakeCase(targetName);
  }

  columnName(propertyName, customName, embeddedPrefixes) {
    return snakeCase(embeddedPrefixes.concat(customName || propertyName).join('_'));
  }

  columnNameCustomized(customName) {
    return customName;
  }

  relationName(propertyName) {
    return snakeCase(propertyName);
  }
};
