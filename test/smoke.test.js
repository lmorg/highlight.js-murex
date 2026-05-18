"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const hljs = require("highlight.js/lib/core");
const bash = require("highlight.js/lib/languages/bash");
const json = require("highlight.js/lib/languages/json");

const murex = require("../src/languages/murex");

hljs.registerLanguage("murex", murex);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);

function highlightFixture(name) {
	const fixturePath = path.join(__dirname, "corpus", ...name.split("/"));
	const code = fs.readFileSync(fixturePath, "utf8");
	return hljs.highlight(code, { language: "murex" }).value;
}

function readFixture(name) {
	const fixturePath = path.join(__dirname, "corpus", ...name.split("/"));
	return fs.readFileSync(fixturePath, "utf8");
}

const basic = highlightFixture("basic.mx");
assert.ok(basic.includes("hljs-comment"), "expected comment highlighting");
assert.ok(basic.includes("hljs-string"), "expected string highlighting");
assert.ok(basic.includes("hljs-number"), "expected number highlighting");
assert.ok(basic.includes("hljs-variable"), "expected variable highlighting");
assert.ok(basic.includes("hljs-operator"), "expected operator highlighting");

const operators = highlightFixture("operators.mx");
assert.match(
	operators,
	/hljs-operator">(?:\?\?|\?:|&lt;~|~&gt;|\|&gt;|&gt;&gt;|=~|!~|&&|\|\|)/,
	"expected advanced operators to be highlighted"
);

const delimiters = highlightFixture("delimiters.mx");
assert.ok(
	delimiters.includes("hljs-punctuation"),
	"expected delimiter punctuation highlighting"
);
assert.ok(delimiters.includes("hljs-subst"), "expected subshell highlighting");

// Edge fixture: malformed input should still highlight without crashing.
const unclosed = highlightFixture("edge/unclosed.mx");
assert.ok(unclosed.length > 0, "expected output for malformed input");
assert.ok(
	unclosed.includes("hljs-string") || unclosed.includes("hljs-comment"),
	"expected partial highlighting on malformed input"
);

const escapedOps = highlightFixture("edge/escaped-operators.mx");
assert.ok(
	escapedOps.includes("hljs-string"),
	"expected escaped-operator fixture to preserve string highlighting"
);

const mixed = highlightFixture("edge/mixed-statement-expression.mx");
assert.ok(
	mixed.includes("hljs-keyword"),
	"expected mixed fixture to include keyword highlighting"
);
assert.ok(
	mixed.includes("hljs-operator"),
	"expected mixed fixture to include operator highlighting"
);
assert.ok(
	mixed.includes("hljs-built_in"),
	"expected mixed fixture to include built-in command highlighting"
);

// Negative fixtures: avoid classifying non-Murex code as murex in auto-detection.
const bashAuto = hljs.highlightAuto(readFixture("negative/bash.sh"), [
	"murex",
	"bash",
	"json"
]);
assert.notEqual(
	bashAuto.language,
	"murex",
	"expected bash fixture to avoid murex auto-detection"
);

const jsonAuto = hljs.highlightAuto(readFixture("negative/sample.json"), [
	"murex",
	"bash",
	"json"
]);
assert.equal(
	jsonAuto.language,
	"json",
	"expected json fixture to auto-detect as json"
);

console.log("smoke test passed");
