const AWS = require('aws-sdk');
const faker = require('faker');
const { assert } = require('chai');
const sinon = require('sinon');
const AwsS3Bucket = require('../../../../src/utils/bucket/providers/aws-s3-bucket');

describe('Provider - AwsS3Bucket', () => {
  let S3;

  beforeEach(() => {
    S3 = new AWS.S3();
  });

  describe('getObject', () => {
    it('returns the AWS S3 object model with the file in the Buffer', async () => {
      const expectResult = {
        AcceptRanges: 'bytes',
        Body: Buffer.from('Test file\n'),
        ContentLength: 23,
        ContentType: 'text/plain',
        ETag: faker.random.uuid(),
        LastModified: faker.date.future(),
        Metadata: {},
      };

      sinon.stub(S3, 'getObject').returns({
        promise: () => (expectResult),
      });

      const bucket = new AwsS3Bucket(S3, {});
      const BUCKET_NAME = 'aws.s3.bucket';

      const result = await bucket.getObject(
        BUCKET_NAME,
        `${faker.random.uuid()}\\${faker.random.uuid()}`,
      );

      assert.equal(result, expectResult);
    });
  });

  describe('uploadObject', () => {
    it('upload passing file on buffer, returns the VersionId and ETag uuid', async () => {
      const expectResult = {
        ETag: faker.random.uuid(),
        VersionId: faker.random.uuid(),
      };

      const context = {
        Body: Buffer.from('Test file\n'),
        Bucket: 'aws.s3.bucket',
        ContentType: 'text/plain',
      };

      sinon.stub(S3, 'putObject').returns({
        promise: () => (expectResult),
      });

      const bucket = new AwsS3Bucket(S3, {});

      const result = await bucket.uploadObject(
        context,
        `${faker.random.uuid()}\\${faker.random.uuid()}`,
      );

      assert.equal(result, expectResult);
    });
  });
});
