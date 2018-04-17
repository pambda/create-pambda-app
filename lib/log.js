const {
  cyan,
  green,
  red,
} = require('chalk');

function error(format, ...args) {
  console.error(`[${red('ERROR')}] ${format}`, ...args);
}

function info(format, ...args) {
  console.info(`[${cyan('INFO')}] ${format}`, ...args);
}

function value(v) {
  return green(v);
}

/*
 * Exports.
 */
exports.error = error;
exports.info = info;
exports.value = value;
