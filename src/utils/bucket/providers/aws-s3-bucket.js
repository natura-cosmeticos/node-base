const BaseProviderBucket = require('./base');

class BucketAwsS3 extends BaseProviderBucket {
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

module.export = BucketAwsS3;
