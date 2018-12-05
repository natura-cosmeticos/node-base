const { assert } = require('chai');
const ArrayUtils = require('../../src/utils/array');
const fixture = require('../fixtures/array-utils-data');

describe('ArrayUtils', () => {
  let arrayUtils;
  let data = [];

  beforeEach(() => {
    arrayUtils = new ArrayUtils();
    data = fixture();
  });
  describe('deepMap()', () => {
    it('arrays are equal because down() and up() did not mutate any item', async () => {
      const down = (item, context) => ({
        context, item: { ...item },
      });
      const up = item => item;
      const deepMapped = await arrayUtils.deepMap({
        context: null, dataset: data, down, iteree: 'children', up,
      });


      assert.deepEqual(deepMapped, data);
    });
    describe('deepMap use case with fake apply promotion function', () => {
      it('returns first product price as 10 because promotion of 50% was applied using down and up functions', async () => {
        const products = [
          {
            price: 20,
            productCode: 0,
            productItens: [
              {
                price: 20,
                productCode: 1,
                productItens: [{
                  price: 20,
                  productCode: 2,
                  productItens: [],
                }],
              },
            ],
          },
        ];

        const promotions = [
          {
            productCode: 0,
            promotions: [50],
          },
        ];

        function down(dataset, context) {
          const newContext = context !== null ? context
            : (promotions.find(promo => promo.productCode === dataset.productCode) || null);

          return {
            context: newContext,
            item: {
              price: newContext !== null && dataset.productItens.length === 0
                ? newContext.promotions.reduce((acc, promotion) => acc * ((100 - promotion) / 100),
                  dataset.price)
                : dataset.price,
              productCode: dataset.productCode,
              productItens: dataset.productItens,
            },
          };
        }

        function up(item) {
          return {
            ...item,
            price: item.productItens.length > 0
              ? item.productItens.reduce((acc, currentItem) => acc + currentItem.price, 0)
              : item.price,
          };
        }

        const deepMapped = await arrayUtils.deepMap({
          context: null, dataset: products, down, iteree: 'productItens', up,
        });

        assert.equal(deepMapped[0].price, 10);
        assert.notDeepEqual(deepMapped, products);
      });
    });
  });
});
