const ApolloExpress = require('apollo-server-express');
const ApolloLambda = require('apollo-server-lambda');


/**
 * GraphQL GraphQLAppBuilder Factory
 * @class
 * @constructor
 * @param {Object} executableSchema schema built with makeExecutableSchema()
 * @param {Object} rawSchema GraphQL rawSchema
 * @param {String} rawSchema.typeDefs GraphQL Schema typeDefs
 * @param {[Function]} rawSchema.resolvers GraphQL Schema resolvers
 * @param {Boolean} authentication If GraphQL Server needs authentication
 */
class GraphQLAppBuilder {
  constructor({
    executableSchema = null, rawSchema = null,
    authentication = { attributtes: null, headers: null, Provider: null },
  }) {
    this.rawSchema = rawSchema;
    this.executableSchema = executableSchema;
    this.authentication = authentication;
  }

  /**
   * @private
   */
  getAuthenticated(headers) {
    const { Provider } = this.authentication;
    const dynamicProvider = new Provider({ headers });

    dynamicProvider.setHeadersToBeDecrypted(this.authentication.attributtes);

    return dynamicProvider.getAuthorization();
  }

  /**
  * @private
  */
  getAuthenticatedLambdaSchema(schema) {
    return Object.assign(schema, {
      context: ({ event, context }) => ({
        context,
        event,
        functionName: context.functionName,
        headers: event.headers,
        ...this.getAuthenticated(event.headers),
      }),
    });
  }

  /**
  * @private
  *
  */
  getAuthenticatedExpressSchema(schema) {
    return Object.assign(schema, {
      context: ({ req }) => ({
        headers: req.headers,
        ...this.getAuthenticated(req.headers),
      }),
    });
  }

  /**
  * @private
  */
  async buildSchema() {
    return this.executableSchema !== null
      ? { playground: false, schema: await this.executableSchema }
      : this.rawSchema;
  }

  /**
   * Returns ApolloServer Lambda Server running with async schema defined in class constructor
   * @function Promise
   * @returns {ApolloLambda.ApolloServer}
   */
  async createLambdaHandler() {
    const builtSchema = await this.buildSchema();
    const schema = this.authentication.Provider !== null
      ? this.getAuthenticatedLambdaSchema(builtSchema)
      : builtSchema;

    return new ApolloLambda.ApolloServer(schema).createHandler();
  }

  /**
   * Returns Express Server running with async schema defined in class constructor as middleware
   * @function Promise
   */
  async createExpressHandler(app) {
    const builtSchema = await this.buildSchema();
    const schema = this.authentication.Provider !== null
      ? this.getAuthenticatedExpressSchema(builtSchema)
      : builtSchema;

    new ApolloExpress.ApolloServer(schema).applyMiddleware({ app });

    return app;
  }
}

module.exports = GraphQLAppBuilder;
