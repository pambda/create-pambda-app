const yargs = require('yargs');
const { run } = require('./index');
const { error } = require('./log');
const { homedir } = require('os');
const { readFile } = require('fs');

function main(callback) {
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

  readJsonFile(`${homedir()}/.create-pambda-app.json`, (err, json) => {
    if (err) {
      return callback(err);
    }

    Object.entries(argv).forEach(([key, value]) => {
      if (value === undefined) {
        argv[key] = json[key];
      }
    });

    argv.dir = argv['project-directory'];
    argv.bucketName = argv['s3-bucket'];
    argv.prefix = argv['s3-prefix'];
    argv.functionName = argv['function-name'];
    argv.stackName = argv['stack-name'];
    argv.withoutCreatingBucket = argv['without-creating-bucket'];

    run(argv, callback);
  });
}

function readJsonFile(path, callback) {
  readFile(path, 'utf8', (err, data) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err);
      }

      return callback(null, {});
    }

    let json;
    try {
      json = JSON.parse(data);
    } catch (err) {
      return callback(err);
    }

    callback(null, json);
  });
}

main(err => {
  if (err) {
    if (process.env.DEBUG) {
      throw err;
    } else {
      error(err.message);
      process.exit(1);
    }
  }
});
