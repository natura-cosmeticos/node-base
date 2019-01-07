const humps = require('humps');
const _ = require('lodash');
const httpStatusEnum = require('./http-status-enum');
const defaultHeadersWhitelist = require('./headers-whitelist-enum');
const baseEvents = require('../base-events');
/**
 * HTTP methods that can have body attribute
 */
const HTTP_METHODS_WITH_BODY = ['PATCH', 'POST', 'PUT'];

/**
 * It's a bridge between the domain layer and the Express
 * @example
 * class MyHandler extends ExpressHandler {};
 */
module.exports = class ExpressHandler {
  /**
    * Initialize a ExpressHandler instance with the an specific domain command
    * @param {Object} request - The Express request https://expressjs.com/en/4x/api.html#req
    * @param {Object} response - The Express response https://expressjs.com/en/4x/api.html#res
    * @param {Object} command - an Command instance
    */
  constructor(request, response, command, headersWhitelist = defaultHeadersWhitelist) {
    /**
     * @param {Object} request - The Express request https://expressjs.com/en/4x/api.html#req
     */
    this.request = request;
    /**
     * @param {Object} response - The Express response https://expressjs.com/en/4x/api.html#res
     */
    this.response = response;
    /**
     * @param {Object} command - an Command instance
     */
    this.command = command;

    /**
     * @private {Array} headersWhitelist - Headers Whitelist
     */
    this.headersWhitelist = headersWhitelist;
  }

  /**
   * A HTTP statuses getter
   * @return {object} a dictionary with the common HTTP statuses
   */
  static get httpStatus() {
    return httpStatusEnum;
  }

  /**
   * Invoke the command execute method, setting up the default listeners and
   * handling an exception if occurred
   */
  async handle() {
    try {
      this.setupListeners(this.command);
      await this.command.execute(this.buildInput());
    } catch (error) {
      this.response.status(ExpressHandler.httpStatus.internalServerError);
      this.response.json(error.toString());
    }
  }

  /**
   * @private
   */
  getHeadersInWhitelist(headers) {
    const camelCaseHeaders = humps.camelizeKeys(headers);

    const whitelisted = _.pick(camelCaseHeaders, this.headersWhitelist);

    return Object.keys(whitelisted).length !== 0 ? whitelisted : undefined;
  }

  /**
   * @private
   */
  getQueryParams(params) {
    const queryParams = {};

    Object.keys(params).forEach((queryParam) => {
      try {
        queryParams[queryParam] = JSON.parse(params[queryParam]);
      } catch (error) {
        queryParams[queryParam] = params[queryParam];
      }
    });

    return queryParams;
  }

  /**
   * @private
   */
  buildInput() {
    const queryParams = this.getQueryParams(this.request.query);
    const headers = this.getHeadersInWhitelist(this.request.headers);
    const paramsSources = [queryParams, this.request.params];


    if (HTTP_METHODS_WITH_BODY.includes(this.request.method)) {
      paramsSources.unshift(this.request.body);
    }

    if (headers) {
      paramsSources.push({ headers });
    }

    return Object.assign({}, ...paramsSources);
  }

  /**
   * Handles the default events and can be overrided to handle additional events
   * @param {Object} command - an Command instance
   */
  setupListeners(command) {
    command.on(baseEvents.success, this.onSuccess.bind(this));
    command.on(baseEvents.validationFailed, this.onValidationFailed.bind(this));
    command.on(baseEvents.notFound, this.onNotFound.bind(this));
    command.on(baseEvents.noContent, this.onNoContent.bind(this));
    command.on(baseEvents.error, this.onError.bind(this));
  }

  /**
   * Default behavior when an event not found occurs
   */

  onNotFound() {
    this.response.status(ExpressHandler.httpStatus.notFound);
    this.response.json(null);
  }


  /**
   * Default behavior when an event success occurs
   * @param {Object} data - the data returned by the command instance
   */
  onSuccess(data) {
    this.response.status(ExpressHandler.httpStatus.ok);
    this.response.json(data);
  }

  /**
   * Default behavior when an event validationFailed occurs
   * @param {Object} errors - the errors returned by the command instance
   */
  onValidationFailed(errors) {
    this.response.status(ExpressHandler.httpStatus.unprocessableEntity);
    this.response.json(errors);
  }

  /**
   * Default behavior when an event noContent occurs
   */
  onNoContent() {
    this.response.status(ExpressHandler.httpStatus.noContent);
    this.response.json(null);
  }

  /**
   * Default behavior when an event error occurs
   */
  onError(errors) {
    this.response.status(ExpressHandler.httpStatus.internalServerError);
    this.response.json(errors);
  }
};
