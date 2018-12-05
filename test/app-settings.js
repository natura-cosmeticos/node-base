const { assert } = require('chai');
const AppSettings = require('../src/app-settings');

const parametersStore = require('./helpers/parameters-store-mock');

describe('AppSettings', () => {
  afterEach(() => {
    delete process.env.DATABASE_USERNAME;
    delete process.env.NODE_ENV;
    delete process.env.APP_NAME;
  });

  describe('.init', () => {
    it('should set the variables from parameters store in the process.env', async () => {
      // given
      process.env.APP_NAME = 'testingApp';
      process.env.NODE_ENV = 'test';
      // when
      await AppSettings.init(parametersStore);
      // then
      assert.equal(process.env[parametersStore.variableName], parametersStore.variableValue);
    });

    it('should throws an error when variable APP_NAME is not defined', async () => {
      // given
      process.env.NODE_ENV = 'test';
      // when
      try {
        await AppSettings.init(parametersStore);
      } catch (error) {
        // then
        assert.equal(error.message, 'Expected environment variable APP_NAME to be defined');
      }
    });

    it('should throws an error when variable NODE_ENV is not defined', async () => {
      // given
      process.env.APP_NAME = 'testingApp';
      // when
      try {
        await AppSettings.init(parametersStore);
      } catch (error) {
        // then
        assert.equal(error.message, 'Expected environment variable NODE_ENV to be defined');
      }
    });
  });

  describe('.get', () => {
    it('should returned the variable when its defined', () => {
      // given
      const variableName = 'DATABASE_USERNAME';

      process.env[variableName] = 'someDbUser';
      // when
      const result = AppSettings.get(variableName);

      // then
      assert.equal(result, process.env[variableName]);
    });

    it('should throw an error when call variable is not defined', () => {
      // given
      const variableName = 'DATABASE_USERNAME';
      const functionCall = () => {
        AppSettings.get(variableName);
      };

      // then
      assert.throws(functionCall, Error, /Expected environment variable DATABASE_USERNAME to be defined/);
    });
  });

  describe('.getOrDefault', () => {
    it('should returned the variable when its defined', () => {
      // given
      const variableName = 'DATABASE_USERNAME';

      process.env[variableName] = 'someNewDbUser';
      // when
      const result = AppSettings.getOrDefault(variableName);

      // then
      assert.equal(result, process.env[variableName]);
    });

    it('should the default value when variable is not defined', () => {
      // given
      const variableName = 'DATABASE_USERNAME';
      const defaultValue = 'the default value';

      // when
      const result = AppSettings.getOrDefault(variableName, defaultValue);

      // then
      assert.equal(result, defaultValue);
    });
  });
});
