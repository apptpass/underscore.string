var makeString = require('./make_string');

module.exports = function isBlank(str) {
  return (/^\s*$/).test(makeString(str));
};
