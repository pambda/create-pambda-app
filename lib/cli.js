const yargs = require('yargs');
const { run } = require('./index');
const { red } = require('chalk');

function main() {
  const parser = yargs
    .usage('Usage: $0 <project-directory>')
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

  argv.dir = argv._[0];

  run(argv, err => {
    if (err) {
      if (process.env.DEBUG) {
        throw err;
      } else {
        console.error(`[${red('ERROR')}] ${err.message}`);
        process.exit(1);
      }
    }
  });
}

main();
