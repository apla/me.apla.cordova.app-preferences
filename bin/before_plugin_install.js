'use strict';

module.exports = function (context) {
  var req = context.requireCordovaModule,

      path = req ('path'),
      pathParse = require ('./lib/path-parse');

  path.parse = path.parse || pathParse;

  return true;
};
