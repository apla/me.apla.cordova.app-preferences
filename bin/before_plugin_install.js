'use strict';

module.exports = function (context) {
  var req = context.requireCordovaModule,

      path = req ('path'),
      pathParse = req ('path-parse');

  path.parse = pathParse;

  return true;
};
