const yargs = require('yargs');
const { run } = require('./index');

function main() {
  const parser = yargs
    .usage('Usage: $0 <app-name>')
    .options({
      profile: {
        describe: 'Profile of AWS CLI',
        default: process.env.AWS_PROFILE || 'default',
      },
    })
    .version()
    .help();

  const argv = parser.argv;

  if (argv._.length < 1) {
    parser.showHelp();
    return;
  }

  argv.pkgName = argv._[0];

  run(argv, err => {
    if (err) {
      throw err;
    }
  });
}

main();
