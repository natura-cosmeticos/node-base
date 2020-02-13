const _ = require('lodash');
const Koa = require('koa');
const Router = require('koa-router');
const faker = require('faker/locale/en');
const request = require('supertest');

const corsMiddleware = require('../../src/koa/cors-middleware');

describe('corsMiddleware', () => {
  function buildMiddleware(allowedOrigins) {
    const app = new Koa();
    const router = new Router();

    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.response.status = 400;
      }
    });

    app.use(corsMiddleware(allowedOrigins));

    router.get('/test', (ctx) => {
      ctx.body = 'It works';
    });

    app.use(router.routes());

    return app;
  }

  function buildOrigins() {
    return _.times(
      faker.random.number({ max: 5, min: 1 }),
      faker.internet.domainName,
    );
  }

  describe('without origin specification', () => {
    it('should allow a GET request with the Origin header', async () => {
      await request(buildMiddleware().callback())
        .get('/test')
        .set('Origin', faker.internet.domainName())
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200);
    });

    it('should allow an OPTIONS request with the Origin header', async () => {
      await request(buildMiddleware().callback())
        .options('/test')
        .set('Origin', faker.internet.domainName())
        .expect('Access-Control-Allow-Origin', '*')
        .expect(204);
    });

    it('should allow a GET request without the Origin header', async () => {
      await request(buildMiddleware().callback())
        .get('/test')
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200);
    });

    it('should allow an OPTIONS request without the Origin header', async () => {
      await request(buildMiddleware().callback())
        .options('/test')
        .expect('Access-Control-Allow-Origin', '*')
        .expect(204);
    });
  });

  describe('with origin specifications', () => {
    it('should allow a GET request with an allowed Origin header', async () => {
      const allowedOrigins = buildOrigins();
      const origin = _.sample(allowedOrigins);

      await request(buildMiddleware(allowedOrigins).callback())
        .get('/test')
        .set('Origin', origin)
        .expect('Access-Control-Allow-Origin', origin)
        .expect(200);
    });

    it('should allow an OPTIONS request with an allowed Origin header', async () => {
      const allowedOrigins = buildOrigins();
      const origin = _.sample(allowedOrigins);

      await request(buildMiddleware(allowedOrigins).callback())
        .options('/test')
        .set('Origin', origin)
        .expect('Access-Control-Allow-Origin', origin)
        .expect(204);
    });

    it('should not allow a GET request with an unauthorized Origin header', async () => {
      const allowedOrigins = buildOrigins();

      await request(buildMiddleware(allowedOrigins).callback())
        .get('/test')
        .set('Origin', faker.internet.domainName())
        .expect(400);
    });

    it('should not allow an OPTIONS request with an unauthorized Origin header', (done) => {
      const allowedOrigins = buildOrigins();

      request(buildMiddleware(allowedOrigins).callback())
        .options('/test')
        .set('Origin', faker.internet.domainName())
        .expect(400)
        .end(done);
    });
  });
});
