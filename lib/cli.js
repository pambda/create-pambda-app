const yargs = require('yargs');
const { run } = require('./index');
const { error } = require('./log');

function main() {
  const parser = yargs
    .command(
      '$0 <project-directory>',
      'Create Pambda app',
      yargs => yargs
        .positional('project-directory', {
          describe: 'A directory that a Pambda app is created',
        })
        .options({
          profile: {
            describe: 'Profile of AWS CLI',
            default: process.env.AWS_PROFILE || 'default',
            type: 'string',
          },
          's3-bucket': {
            describe: 'A name of the S3 bucket used for application packaging',
            type: 'string',
          },
          's3-prefix': {
            describe: 'A prefix name of S3',
            type: 'string',
          },
          'function-name': {
            describe: 'A name of a Lambda function',
            type: 'string',
          },
          'stack-name': {
            describe: 'A name of a CloudFormation stack',
            type: 'string',
          },
          'without-creating-bucket': {
            type: 'boolean',
          },
        })
    )
    .version()
    .help();

  const argv = parser.argv;

  argv.dir = argv['project-directory'];
  argv.bucketName = argv['s3-bucket'];
  argv.prefix = argv['s3-prefix'];
  argv.functionName = argv['function-name'];
  argv.stackName = argv['stack-name'];
  argv.withoutCreatingBucket = argv['without-creating-bucket'];

  run(argv, err => {
    if (err) {
      if (process.env.DEBUG) {
        throw err;
      } else {
        error(err.message);
        process.exit(1);
      }
    }
  });
}

main();
