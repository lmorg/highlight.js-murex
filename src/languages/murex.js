"use strict";

const {
  CONTROL_FLOW_KEYWORDS_STR,
  GENERAL_BUILTINS_STR,
  LITERALS_STR
} = require("../data/keywords");

module.exports = function murex(hljs) {
  const VARIABLE = {
    className: "variable",
    begin: /(?:\$\.|\$|@)[A-Za-z_][A-Za-z0-9_.]*/,
    relevance: 0
  };

  const SUBSHELL = {
    className: "subst",
    begin: /(?:\$\{|@\{)/,
    end: /}/,
    contains: [VARIABLE],
    relevance: 0
  };

  const NAMED_PIPE = {
    className: "symbol",
    begin: /<[A-Za-z0-9_.:-]+>/,
    relevance: 0
  };

  const REDIRECTION = {
    className: "operator",
    begin: /<![A-Za-z0-9_.:-]+>/,
    relevance: 0
  };

  const OPERATOR = {
    className: "operator",
    begin:
      /(?:\|>|>>|->|=>|<~|~>|\?\?|\?:|&&|\|\||==|!=|>=|<=|=~|!~|\+\+|--|\+=|-=|\*=|\/=|[=+\-*/<>|;])/,
    relevance: 0
  };

  const PUNCTUATION = {
    className: "punctuation",
    begin: /[{}()\[\];]/,
    relevance: 0
  };

  let STRING_BUILDER;
  let ARRAY_BUILDER;
  let OBJECT_BUILDER;

  STRING_BUILDER = {
    className: "string",
    begin: /%\(/,
    end: /\)/,
    relevance: 0
  };

  ARRAY_BUILDER = {
    className: "string",
    begin: /%\[/,
    end: /\]/,
    relevance: 0
  };

  OBJECT_BUILDER = {
    className: "string",
    begin: /%\{/,
    end: /\}/,
    relevance: 0
  };

  STRING_BUILDER.contains = [hljs.BACKSLASH_ESCAPE, SUBSHELL, VARIABLE];
  ARRAY_BUILDER.contains = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    hljs.C_NUMBER_MODE,
    SUBSHELL,
    VARIABLE,
    STRING_BUILDER,
    ARRAY_BUILDER,
    OBJECT_BUILDER,
    PUNCTUATION,
    OPERATOR
  ];
  OBJECT_BUILDER.contains = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    hljs.C_NUMBER_MODE,
    SUBSHELL,
    VARIABLE,
    STRING_BUILDER,
    ARRAY_BUILDER,
    OBJECT_BUILDER,
    PUNCTUATION,
    OPERATOR
  ];

  const BLOCK_COMMENT = {
    className: "comment",
    begin: /\/#/,
    end: /#\//,
    relevance: 0
  };

  return {
    name: "Murex",
    aliases: ["murex"],
    keywords: {
      keyword: CONTROL_FLOW_KEYWORDS_STR,
      built_in: GENERAL_BUILTINS_STR,
      literal: LITERALS_STR
    },
    contains: [
      hljs.SHEBANG({ binary: "murex", relevance: 10 }),
      BLOCK_COMMENT,
      hljs.HASH_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
      SUBSHELL,
      STRING_BUILDER,
      ARRAY_BUILDER,
      OBJECT_BUILDER,
      VARIABLE,
      NAMED_PIPE,
      REDIRECTION,
      OPERATOR,
      PUNCTUATION
    ]
  };
};
