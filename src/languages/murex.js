"use strict";

module.exports = function murex(hljs) {
  // ---------------------------------------------------------------------------
  // Variables
  // Forms from parse_vars.go:
  //   $name   @name   $.meta   $1   $(path/to/var)   @{subshell}   ${subshell}
  // ---------------------------------------------------------------------------

  // $(path) and $!$(path) parenthesis variable references
  const VAR_PAREN = {
    className: "variable",
    begin: /\$\([^)]*\)/,
    relevance: 0
  };

  // Plain sigil variables: $name, @name, $.meta, $1
  const VARIABLE = {
    className: "variable",
    begin: /(?:@\.|\$\.|\$|@)[A-Za-z_0-9][A-Za-z0-9_.]*/,
    relevance: 0
  };

  // ---------------------------------------------------------------------------
  // Sub-shells: ${...} and @{...}
  // From parse_subshell.go — block inside braces is re-entrant Murex code
  // ---------------------------------------------------------------------------
  const SUBSHELL = {
    className: "subst",
    begin: /(?:\$\{|@\{)/,
    end: /\}/,
    contains: [VAR_PAREN, VARIABLE],
    relevance: 0
  };

  // ---------------------------------------------------------------------------
  // Strings
  // Single quote: opaque, no expansion (parse_quotes.go parseString with qStart='\'')
  // Double quote: infix, supports \n \t \r \s and variable expansion
  // ---------------------------------------------------------------------------
  const SINGLE_QUOTE = {
    className: "string",
    begin: /'/,
    end: /'/,
    relevance: 0
  };

  const DOUBLE_QUOTE = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR_PAREN,
      SUBSHELL,
      VARIABLE
    ],
    relevance: 0
  };

  // ---------------------------------------------------------------------------
  // Builder forms (%, from parse_object.go / parse_array.go)
  //   %(string)  %[array]  %{object}
  // Listed in relevance > 0 so they score above generic Bash
  // ---------------------------------------------------------------------------
  const STRING_BUILDER = {
    className: "string",
    begin: /%\(/,
    end: /\)/,
    contains: [hljs.BACKSLASH_ESCAPE, VAR_PAREN, SUBSHELL, VARIABLE],
    relevance: 1
  };

  const ARRAY_BUILDER = {
    className: "string",
    begin: /%\[/,
    end: /\]/,
    contains: [SINGLE_QUOTE, DOUBLE_QUOTE, hljs.C_NUMBER_MODE, VAR_PAREN, SUBSHELL, VARIABLE, STRING_BUILDER],
    relevance: 1
  };

  const OBJECT_BUILDER = {
    className: "string",
    begin: /%\{/,
    end: /\}/,
    contains: [SINGLE_QUOTE, DOUBLE_QUOTE, hljs.C_NUMBER_MODE, VAR_PAREN, SUBSHELL, VARIABLE, STRING_BUILDER, ARRAY_BUILDER],
    relevance: 1
  };

  // Allow nested array/object builders
  ARRAY_BUILDER.contains.push(OBJECT_BUILDER);
  OBJECT_BUILDER.contains.push(ARRAY_BUILDER);

  // ---------------------------------------------------------------------------
  // Named pipes: <stdin>  <stdout>  <null>  <named>
  // Stderr redirect tags: <!out>  <!null>  <!named>
  // From parse_statement.go / namedpipe docs
  // ---------------------------------------------------------------------------
  const STDERR_REDIRECT = {
    className: "operator",
    begin: /<![A-Za-z0-9_.:!-]+>/,
    relevance: 0
  };

  const NAMED_PIPE = {
    className: "symbol",
    begin: /<[A-Za-z_][A-Za-z0-9_.:-]*>/,
    relevance: 0
  };

  // ---------------------------------------------------------------------------
  // Operators — longest match first to avoid partial collisions
  // Source: symbols/exp.go + operators-and-tokens.md
  // Single-char arithmetic (+, -, *, /) deliberately omitted: they are not
  // reliably distinguishable from path separators and flag prefixes in
  // statement (shell) context.
  // ---------------------------------------------------------------------------
  const OPERATOR = {
    className: "operator",
    begin: [
      // file/pipe redirection
      /\|>/,   // truncate pipe
      />>/, // append file
      /->/, // arrow pipe (primary Murex pipe)
      /=>/,  // generic pipe
      // merge / coalesce
      /<~/,
      /~>/,
      /\?\?/,
      /\?:/,
      // boolean
      /&&/,
      /\|\|/,
      // comparison
      /==/, /!=/, />=/, /<=/, /=~/, /!~/,
      // compound assignment
      /\+\+/, /--/, /\+=/, /-=/, /\*=/, /\/=/,
      // pipe
      /\|(?!>)/,
      // plain assignment (after all compound forms matched)
      /=/
    ].map(r => r.source).join("|"),
    relevance: 0
  };

  // ---------------------------------------------------------------------------
  // Comments
  // Block comment: /# ... #/  (from parseCommentMultiLine)
  // Line comment:  # ...      (from parseComment)
  //
  // MUST list BLOCK_COMMENT before LINE_COMMENT so that when the scanner sees
  // `/#` it matches BLOCK_COMMENT (starting at `/`) before LINE_COMMENT
  // (starting at `#`).  The OPERATOR pattern no longer contains bare `/` so it
  // cannot consume the leading `/` of a block comment.
  // ---------------------------------------------------------------------------
  const BLOCK_COMMENT = {
    className: "comment",
    begin: /\/#/,
    end: /#\//,
    relevance: 0
  };

  const LINE_COMMENT = {
    className: "comment",
    begin: /#/,
    end: /$/,
    relevance: 0
  };

  // ---------------------------------------------------------------------------
  // Language definition
  // No keyword list: in Murex the command name is positional (first token of a
  // statement / each pipeline segment). highlight.js keyword matching is
  // position-agnostic so it fires on arguments, flags, and values, producing
  // incorrect and inconsistent highlights.
  // ---------------------------------------------------------------------------
  return {
    name: "Murex",
    aliases: ["murex"],
    contains: [
      hljs.SHEBANG({ binary: "murex", relevance: 10 }),
      // Comments before everything else so they are opaque
      BLOCK_COMMENT,
      LINE_COMMENT,
      // Strings
      SINGLE_QUOTE,
      DOUBLE_QUOTE,
      STRING_BUILDER,
      ARRAY_BUILDER,
      OBJECT_BUILDER,
      // Numbers
      hljs.C_NUMBER_MODE,
      // Expansion
      SUBSHELL,
      VAR_PAREN,
      VARIABLE,
      // Pipes / named pipes / redirects
      STDERR_REDIRECT,
      NAMED_PIPE,
      // Operators
      OPERATOR
    ]
  };
};
