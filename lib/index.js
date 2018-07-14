const ejs = require('ejs');
const { readdir, readFile, writeFile } = require('fs');
const { resolve } = require('path');
const series = require('run-series');
const mkdirp = require('mkdirp');
const npm = require('current-npm');
const AWS = require('aws-sdk');
const awsConfigLoader = require('aws-sdk-config-loader');
const { basename } = require('path');
const { info, value } = require('./log');

function run(options, callback) {
  /*
   * Generate an ID to avoid conflicting.
   */
  const shortId = Math.random().toString(36).substr(2);

  const {
    dir,
    profile,
  } = options;

  const {
    pkgName = basename(dir).replace(/^node-/, ''),
  } = options;

  const {
    bucketName = `pambda-tmp-${pkgName}-${shortId}`,
    prefix,
    functionName,
    stackName = `${pkgName}-${shortId}`,
    withoutCreatingBucket,
  } = options;

  const context = {
    pkgName,
    bucketName,
    prefix,
    functionName,
    stackName,
  };

  series([
    callback => mkdirp(dir, callback),

    callback => readdir(dir, (err, files) => {
      if (err) {
        return callback(err);
      }

      if (files.length > 0) {
        return callback(new Error(`The directory ${value(dir)} is not empty`));
      }

      callback(null);
    }),

    ...(
      [
        'lib',
        'public',
      ].map(name => callback => mkdirp(resolve(dir, name), callback))
    ),

    ...(
      [
        { src: '.gitignore.ejs', dest: '.gitignore' },
        { src: 'package.json.ejs', dest: 'package.json' },
        { src: 'index.js.ejs', dest: 'index.js' },
        { src: 'template.yaml.ejs', dest: 'template.yaml' },
        { src: 'lib/index.js.ejs', dest: 'lib/index.js' },
        { src: 'public/index.html.ejs', dest: 'public/index.html' },
      ].map(file => {
        file.context = context;
        file.dir = dir;
        return callback => generateFile(file, callback);
      })
    ),

    callback => {
      process.chdir(resolve(dir));

      npm.load((err, npm) => {
        if (err) {
          return callback(err);
        }

        npm.commands.install([
          'lambda-console',
          'pambda',
          'pambda-404',
          'pambda-aws',
          'pambda-binary-support',
          'pambda-errorhandler',
          'pambda-serve-static',
        ], err => {
          if (err) {
            return callback(err);
          }

          npm.config.set('save', false);
          npm.config.set('save-dev', true);

          npm.commands.install([
            'api-gateway-local',
            'aws-sdk',
            'cfn-package',
          ], err => callback(err));
        });
      });
    },

    callback => {
      if (withoutCreatingBucket) {
        return callback(null);
      }

      awsConfigLoader(AWS, { profile });

      const s3 = new AWS.S3();

      s3.createBucket({
        Bucket: bucketName,
      }, err => {
        if (err) {
          if (err.code === 'BucketAlreadyExists' || err.code === 'BucketAlreadyOwnedByYou') {
            /*
             * Assume successful if the bucket already exists.
             */
            info(`Bucket ${value(bucketName)} already exists.`);
          } else {
            return callback(err);
          }
        } else {
          info(`Bucket ${value(bucketName)} is created.`);
        }

        callback(null)
      });
    },
  ], callback);
}

function generateFile(options, callback) {
  const {
    context,
    dir,
  } = options;

  let {
    src,
    dest,
  } = options;

  src = resolve(__dirname, 'templates', src);
  dest = resolve(dir, dest);

  readFile(src, 'utf-8', (err, data) => {
    if (err) {
      return callback(err);
    }

    let value;
    try {
      value = ejs.render(data, context);
    } catch(e) {
      return callback(e);
    }

    writeFile(dest, value, err => {
      if (err) {
        return callback(err);
      }

      callback(null, {
        src,
        dest,
      });
    });
  });
}

/*
 * Exports.
 */
exports.run = run;
