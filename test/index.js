const { assert } = require('chai');
const NodeBase = require('../index');

describe('API', () => {
  it('verify App module contract', () => {
    const { App } = NodeBase;

    assert.typeOf(App.Command, 'function');
    assert.typeOf(App.Logger, 'function');
    assert.typeOf(App.Settings, 'function');
    assert.typeOf(App.baseEvents, 'object');
  });

  it('verify Koa module contract', () => {
    const { Koa } = NodeBase;

    assert.typeOf(Koa.adapter, 'function');
    assert.typeOf(Koa.appBuilder, 'function');
    assert.typeOf(Koa.AuthenticatedHandler, 'function');
    assert.typeOf(Koa.corsMiddleware, 'function');
    assert.typeOf(Koa.Handler, 'function');
    assert.typeOf(Koa.loggingMiddleware, 'function');
    assert.typeOf(Koa.UserAuthenticatedHandler, 'function');
  });

  it('verify External module contract', () => {
    const { External } = NodeBase;

    assert.typeOf(External.typeOrmLogger, 'object');
    assert.typeOf(External.TypeOrmConfigFactory, 'function');
  });

  it('verify MessageQueue module contract', () => {
    const { MessageQueue } = NodeBase;

    assert.typeOf(MessageQueue.LambdaHandler, 'function');
    assert.typeOf(MessageQueue.lambdaAdapter, 'function');
  });

  it('verify Tests module contract', () => {
    const { Tests } = NodeBase;

    assert.typeOf(Tests.helpers, 'object');
    assert.typeOf(Tests.mochaHelpers, 'object');
  });

  it('verify Util module contract', () => {
    const { Util } = NodeBase;

    assert.typeOf(Util.Module, 'function');
    assert.typeOf(Util.NodeInspector, 'function');
  });

  it('verify Security module contract', () => {
    const { App } = NodeBase;

    assert.typeOf(App.Security.JWT, 'function');
  });
});
