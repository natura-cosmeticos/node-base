const { assert } = require('chai');
const FactoryProvider = require('../../../../src/utils/bucket/providers/factory');
const { PROVIDERS } = require('../../../../src/utils/bucket');
const AwsS3Bucket = require('../../../../src/utils/bucket/providers/aws-s3-bucket');

describe('FactoryProvider', () => {
  describe('Provider AWS-S3', () => {
    it('create instance AWS-S3 provider', () => {
      const options = {
        Bucket: 'aws.s3.bucket.test',
      };

      const instance = FactoryProvider[PROVIDERS.S3](options);

      assert.equal(instance.options, options);
      assert.instanceOf(instance, AwsS3Bucket);
    });
  });
});
