const { assert } = require('chai');
const { BucketFactory, PROVIDERS } = require('../../../src/utils/bucket');
const AwsS3Bucket = require('../../../src/utils/bucket/providers/aws-s3-bucket');

describe('BucketFactory', () => {
  describe('AWS-S3 provider', () => {
    it('create instance AWS-S3 provider', () => {
      const instance = BucketFactory.create({ provider: PROVIDERS.S3 });

      assert.instanceOf(instance, AwsS3Bucket);
    });
  });

  describe('Provider not implemented', () => {
    it('create instance without passing provider, return exception', () => {
      const functionCall = () => BucketFactory.create();

      assert.throws(functionCall, Error);
    });
  });
});
