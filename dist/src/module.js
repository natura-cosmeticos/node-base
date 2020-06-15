const { Module: NodeModule } = require('module');

/** Module helpers */
class Module {
  /**
   * Append path to NODE_PATH.
   *
   * Use only when you have no control over NODE_PATH, also run this as early as possible,
   * preferably before requiring any other module.
   * @param path - The path to add to NODE_PATH
   */
  static addToNodePath(path = 'src') {
    if (process.env.NODE_PATH) {
      process.env.NODE_PATH += `:${path}`;
    } else {
      process.env.NODE_PATH = path;
    }

    NodeModule._initPaths(); // eslint-disable-line
  }
}

module.exports = Module;
