const Promise = require('bluebird');

class ArrayUtils {
  constructor(limit = 10) {
    this.limit = limit;
  }

  /* istanbul ignore next */
  prepareArguments(dataset, context, {
    down, up, limit = null, concurrent,
  }, iteree) {
    return {
      concurrent,
      context,
      dataset,
      down,
      iteree,
      limit,
      up,
    };
  }

  verifyLimitAndProp(iteree, item, limit) {
    return (item[[iteree]] !== undefined && (limit !== null && limit > 0));
  }

  /**
    * Recursively iterates over array on a specific iteree and executes a
    * function when the object is being mapped (down) and other when the map is over (up).
    * @param {Object} args - DeepMap function arguments.
    * @param {Array} args.dataset - Dataset to be iterated over.
    * @param {string} args.iteree - Attribute which the recursion occurs.
    * @param {function|Promise} args.down - Function that will be executed when the object is mapped
    * @param {function|Promise} args.up - Function that will be executed when
    * the mapping (down function) is executed
    * @param {object} args.context - Context from previous iteration.
  */

  /* eslint-disable max-lines-per-function */
  /* istanbul ignore next */
  async deepMap({
    dataset, iteree, down = (item, context) => ({ context, item }), up = item => item,
    context, limit = this.limit, concurrent = true,
  }) {
    const promisifiedDataset = await Promise.map(dataset, async (iterated) => {
      const { item, context: newContext } = await down(iterated, context, limit);

      if (this.verifyLimitAndProp(iteree, item, limit)) {
        item[[iteree]] = await this.deepMap(
          this.prepareArguments(item[iteree], newContext, {
            concurrent,
            down,
            limit: limit !== null && limit > 0 ? limit - 1 : null,
            up,
          }, iteree),
        );
      }

      return up(item, limit);
    }, { concurrency: concurrent ? Infinity : 1 });

    return promisifiedDataset;
  }
}
module.exports = ArrayUtils;
