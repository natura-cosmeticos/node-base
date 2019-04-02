const aws = require('aws-sdk');
const AwsS3Bucket = require('./aws-s3-bucket');

const createAwsS3Bucket = options => new AwsS3Bucket(
  new aws.S3(),
  options,
);

module.exports = {
  S3: createAwsS3Bucket,
};
