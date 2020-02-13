const Logger = require('@naturacosmeticos/clio-nodejs-logger');
const request = require('supertest');
const koaAppBuilder = require('../../src/koa/app-builder');

describe('koaAppBuilder', () => {
  it('builds a working koaApp', async () => {
    Logger.supressOutput = true;
    const app = koaAppBuilder();

    app.router.get('/test', (ctx) => {
      ctx.response.status = 302;
    });

    app.koaApp.use(app.router.routes());

    await request(app.koaApp.callback()).get('/test').expect(302);
  });
});
