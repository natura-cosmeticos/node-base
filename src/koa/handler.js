/* eslint-disable max-lines */
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
 * It's a bridge between the domain layer and the Koa
 * @example
 * class MyHandler extends KoaHandler {};
 */
module.exports = class KoaHandler {
  /**
    * Initialize a KoaHandler instance with the an specific domain command
    * @param {Object} ctx - The Koa context https://koajs.com/#context
    * @param {Object} command - an Command instance
    */
  constructor(ctx, command, headersWhitelist = defaultHeadersWhitelist) {
    /**
     * @param {Object} ctx - The Koa context https://koajs.com/#context
     */
    this.ctx = ctx;
    /**
     * @param {Object} command - a Command instance
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
   * Parses the http status code
   * @param {string | number} httpStatusCode - The http status code
   */
  static parseHttpStatus(httpStatusCode) {
    // eslint-disable-next-line radix
    return parseInt(httpStatusCode);
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
      this.ctx.status = KoaHandler.parseHttpStatus(KoaHandler.httpStatus.internalServerError);
      this.ctx.body = error.toString();
    }
  }

  /**
   * @private
   */
  getHeadersInWhitelist(headers) {
    const whitelisted = _.pick(humps.camelizeKeys(headers), this.headersWhitelist);

    return Object.keys(whitelisted).length !== 0 ? whitelisted : undefined;
  }

  /**
   * @private
   */
  getQueryParams(params) {
    return Object.keys(params).reduce((acc, queryParam) => {
      try {
        acc[queryParam] = JSON.parse(params[queryParam]);
      } catch (error) {
        acc[queryParam] = params[queryParam];
      }

      return acc;
    }, {});
  }

  /**
   * @private
   */
  buildInput() {
    const queryParams = this.getQueryParams(this.ctx.query);
    const headers = this.getHeadersInWhitelist(this.ctx.headers);
    const paramsSources = [queryParams, this.ctx.params];

    if (HTTP_METHODS_WITH_BODY.includes(this.ctx.method)) {
      paramsSources.unshift(this.ctx.request.body);
    }

    if (headers) paramsSources.push({ headers });

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
    command.on(baseEvents.badRequest, this.onBadRequest.bind(this));
  }

  /**
   * Default behavior when an event not found occurs
   */

  onNotFound() {
    this.ctx.status = KoaHandler.parseHttpStatus(KoaHandler.httpStatus.notFound);
  }

  /**
   * Default behavior when an event success occurs
   * @param {Object} data - the data returned by the command instance
   */
  onSuccess(data) {
    this.ctx.response.body = data;
    this.ctx.response.status = KoaHandler.parseHttpStatus(KoaHandler.httpStatus.ok);
  }

  /**
   * Default behavior when an event validationFailed occurs
   * @param {Object} errors - the errors returned by the command instance
   */
  onValidationFailed(errors) {
    this.ctx.body = errors;
    this.ctx.status = KoaHandler.parseHttpStatus(KoaHandler.httpStatus.unprocessableEntity);
  }

  /**
   * Default behavior when an event noContent occurs
   */
  onNoContent() {
    this.ctx.body = null;
    this.ctx.status = KoaHandler.parseHttpStatus(KoaHandler.httpStatus.noContent);
  }

  /**
   * Default behavior when an event error occurs
   */
  onError(errors) {
    this.ctx.body = errors;
    this.ctx.status = KoaHandler.parseHttpStatus(KoaHandler.httpStatus.internalServerError);
  }

  /**
   * Default behavior when an event badRequest occurs
   */
  onBadRequest(errors) {
    this.ctx.body = errors;
    this.ctx.status = KoaHandler.parseHttpStatus(KoaHandler.httpStatus.badRequest);
  }
};
