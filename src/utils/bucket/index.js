const FactoryBucket = require('./providers/factory');

const PROVIDERS = Object.freeze({
  S3: 'S3',
});

class BucketFactory {
  static create(options = {}) {
    if (PROVIDERS[options.provider]) {
      return FactoryBucket[PROVIDERS[options.provider]](options);
    }

    throw new Error('Provider not implemented');
  }
}

module.exports = {
  BucketFactory,
  PROVIDERS,
};
