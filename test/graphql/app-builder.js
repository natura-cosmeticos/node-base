const Logger = require('@naturacosmeticos/clio-nodejs-logger');
const { assert } = require('chai');
const express = require('express');
const { GraphQLSchema, GraphQLString, GraphQLObjectType } = require('graphql');
const gql = require('graphql-tag');
const { makeExecutableSchema } = require('graphql-tools');
const request = require('supertest');

const GraphqlAppBuilder = require('../../src/graphql/app-builder');
const { asyncDone } = require('../../src/tests/mocha-helpers');

const HANDLER_PORT = 3000;
const HTTP_STATUS_OK = 200;
let rawSchema;

class MockProvider {
  setHeadersToBeDecrypted() {}

  getAuthorization() {}
}

describe('graphqlAppBuilder', () => {
  before(() => {
    Logger.supressOutput = true;
  });
  beforeEach(() => {
    rawSchema = {
      playground: false,
      schema: new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: () => ({
            helloWorld: {
              resolve: () => 'hello world',
              type: GraphQLString,
            },
          }),
          name: 'HelloWorld',
        }),
      }),
    };
  });
  describe('builds a working graphqlApp expressHandler', () => {
    let listener;

    afterEach(() => {
      listener.close();
    });
    it('with a rawSchema', async () => {
      // given
      const expectedReturn = { helloWorld: 'hello world' };
      const graphqlApp = new GraphqlAppBuilder({ rawSchema });
      const app = express();

      // when
      const graphqlExpressHandler = await graphqlApp.createExpressHandler(app);

      listener = graphqlExpressHandler.listen(HANDLER_PORT);

      // then
      const response = await request(graphqlExpressHandler).get('/graphql?query={helloWorld}').expect(HTTP_STATUS_OK);

      assert.deepEqual(response.body.data, expectedReturn);
    });
    it('with an executableSchema', async () => {
      // given
      const typeDefs = gql`
      type Query {
        helloWorld: String!
      }
      `;

      const resolvers = {
        Query: {
          helloWorld: () => 'hello world',
        },
      };

      const expectedReturn = { helloWorld: 'hello world' };

      const executableSchema = makeExecutableSchema({ resolvers, typeDefs });

      const graphqlApp = new GraphqlAppBuilder({ executableSchema });
      const app = express();

      // when
      const graphqlExpressHandler = await graphqlApp.createExpressHandler(app);

      listener = graphqlExpressHandler.listen(HANDLER_PORT);

      // then
      const response = await request(graphqlExpressHandler).get('/graphql?query={helloWorld}').expect(HTTP_STATUS_OK);

      assert.deepEqual(response.body.data, expectedReturn);
    });
    it('with an authentication provider', async () => {
      // given
      const authentication = {
        Provider: MockProvider,
      };
      const expectedReturn = { helloWorld: 'hello world' };
      const graphqlApp = new GraphqlAppBuilder({ authentication, rawSchema });
      const app = express();

      // when
      const graphqlExpressHandler = await graphqlApp.createExpressHandler(app);

      listener = graphqlExpressHandler.listen(HANDLER_PORT);

      // then
      const response = await request(graphqlExpressHandler).get('/graphql?query={helloWorld}').expect(HTTP_STATUS_OK);

      assert.deepEqual(response.body.data, expectedReturn);
    });
  });
  describe('builds a working graphqlApp lambdaHandler', () => {
    it('with a rawSchema', asyncDone(async (done) => {
      // given
      const expectedReturn = { helloWorld: 'hello world' };
      const graphqlApp = new GraphqlAppBuilder({ rawSchema });
      const event = {
        httpMethod: 'GET',
        path: '/graphql',
        queryStringParameters: {
          query: '{helloWorld}',
        },
      };
      const context = {
        functionName: 'graphql',
      };
      const callback = (error, response) => {
        // then
        const body = JSON.parse(response.body);

        assert.deepEqual(body.data, expectedReturn);
        done();
      };

      // when
      const graphqlLambdaHandler = await graphqlApp.createLambdaHandler();

      graphqlLambdaHandler(event, context, callback);
    }));
    it('with an executableSchema', asyncDone(async (done) => {
      // given

      const typeDefs = gql`
      type Query {
        helloWorld: String!
      }
      `;
      const resolvers = {
        Query: {
          helloWorld: () => 'hello world',
        },
      };
      const expectedReturn = { helloWorld: 'hello world' };
      const executableSchema = makeExecutableSchema({ resolvers, typeDefs });
      const graphqlApp = new GraphqlAppBuilder({ executableSchema });
      const event = {
        httpMethod: 'GET',
        path: '/graphql',
        queryStringParameters: {
          query: '{helloWorld}',
        },
      };
      const context = {
        functionName: 'graphql',
      };

      const callback = (error, response) => {
        // then
        const body = JSON.parse(response.body);

        assert.deepEqual(body.data, expectedReturn);
        done();
      };

      // when
      const graphqlLambdaHandler = await graphqlApp.createLambdaHandler();

      graphqlLambdaHandler(event, context, callback);
    }));
    it('with an authentication provider', asyncDone(async (done) => {
      // given
      const authentication = {
        Provider: MockProvider,
      };
      const expectedReturn = { helloWorld: 'hello world' };
      const graphqlApp = new GraphqlAppBuilder({ authentication, rawSchema });
      const event = {
        httpMethod: 'GET',
        path: '/graphql',
        queryStringParameters: {
          query: '{helloWorld}',
        },
      };
      const context = {
        functionName: 'graphql',
      };
      const callback = (error, response) => {
        // then
        const body = JSON.parse(response.body);

        assert.deepEqual(body.data, expectedReturn);
        done();
      };

      // when
      const graphqlLambdaHandler = await graphqlApp.createLambdaHandler();

      graphqlLambdaHandler(event, context, callback);
    }));
  });
});
