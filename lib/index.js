const ejs = require('ejs');
const { readdir, readFile, writeFile } = require('fs');
const { resolve } = require('path');
const shortid = require('shortid');
const series = require('run-series');
const mkdirp = require('mkdirp');
const npm = require('current-npm');
const AWS = require('aws-sdk');
const awsConfigLoader = require('aws-sdk-config-loader');

function run(options, callback) {
  /*
   * Generate an ID to avoid conflicting.
   *
   * Invalid characters in the ID are replaced, because
   * the ID is also used as a part of a S3 bucket name.
   */
  const shortId = shortid.generate()
    .replace(/-/g, 'a')
    .replace(/_/g, 'b')
    .toLowerCase();

  const {
    pkgName,
    profile,
  } = options;

  const bucketName = `${pkgName}-${shortId}`;
  const lambdaName = `${pkgName}-${shortId}`;
  const stackName = `${pkgName}-${shortId}`;

  const dir = pkgName;

  const context = {
    pkgName,
    bucketName,
    lambdaName,
    stackName,
  };

  series([
    callback => mkdirp(dir, callback),

    callback => readdir(dir, (err, files) => {
      if (err) {
        return callback(err);
      }

      if (files.length > 0) {
        return callback(new Error(`The directory '${dir}' is not empty`));
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
          'pambda-binary-support',
          'pambda-serve-static',
        ], err => callback(err));
      });
    },

    callback => {
      awsConfigLoader(AWS, { profile });

      const s3 = new AWS.S3();

      s3.createBucket({
        Bucket: bucketName,
      }, err => callback(err));
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
