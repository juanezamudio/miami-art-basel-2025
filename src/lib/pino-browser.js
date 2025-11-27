// Browser-compatible pino stub for WalletConnect
const noop = () => {};
const logger = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  fatal: noop,
  silent: noop,
  child: () => logger,
  level: 'silent',
};

function pino() {
  return logger;
}

pino.destination = () => ({});
pino.transport = () => ({});
pino.levels = { values: {}, labels: {} };
pino.stdSerializers = {};
pino.stdTimeFunctions = {};

module.exports = pino;
module.exports.default = pino;
module.exports.pino = pino;
