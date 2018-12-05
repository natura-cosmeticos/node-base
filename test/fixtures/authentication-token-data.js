const faker = require('faker');

module.exports = {
  jobTitle: faker.name.jobTitle(),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
};
