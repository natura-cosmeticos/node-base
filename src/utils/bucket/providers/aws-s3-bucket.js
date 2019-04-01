const BaseProviderBucket = require('./base');

class AwsS3Bucket extends BaseProviderBucket {
  getObject(bucketName, key) {
    return this.provider.getObject({
      Bucket: bucketName,
      Key: key,
    }).promise();
  }

  uploadObject(context, key) {
    return this.provider.putObject({
      ...context,
      Key: key,
    }).promise();
  }
}

module.exports = AwsS3Bucket;
