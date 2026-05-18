"use strict";

const murex = require("./languages/murex");

// Default export is the language function so users can call:
//   hljs.registerLanguage("murex", require("highlightjs-murex"))
// Named export is also available:
//   const { murex } = require("highlightjs-murex")
module.exports = murex;
module.exports.murex = murex;
