# highlightjs-murex

Third-party highlight.js language module for the Murex shell/programming language.

## Install

Install from npm (when published):

```bash
npm install highlight.js highlightjs-murex
```

For local development in this repository:

```bash
npm ci
```

## Usage (Node.js)

```js
const hljs = require("highlight.js/lib/core");
const { murex } = require("highlightjs-murex");

hljs.registerLanguage("murex", murex);

const source = `#!/usr/bin/env murex\nout "Hello" -> regexp s/Hello/World/`;
const html = hljs.highlight(source, { language: "murex" }).value;
console.log(html);
```

## Usage (Browser)

```html
<script src="/path/to/highlight.min.js"></script>
<script src="/path/to/highlightjs-murex.min.js"></script>
<script>
	hljs.registerLanguage("murex", window.highlightjsMurex.murex);
	hljs.highlightAll();
</script>
```

If your browser bundle exports a different global name, register that exported `murex` factory with `hljs.registerLanguage("murex", ...)`.

## Language Registration

- Primary language name: `murex`
- Grammar aliases: `murex`

Register with:

```js
hljs.registerLanguage("murex", murex);
```

## Step 1 Decisions

- Package target: standalone third-party package (not upstream highlight.js core).
- highlight.js compatibility contract: pinned to the 11.9 minor line.
- CI/dev test version: highlight.js 11.9.0.

## Compatibility Policy

| Component | Policy |
|---|---|
| highlight.js | `>=11.9.0 <11.10.0` |
| Node.js | `>=18` |
| Murex syntax support | Current documented syntax from Murex docs/examples, with best-effort support for older scripts unless it conflicts with current documented grammar |

## Known Limitations

- Builder forms (`%(`, `%[`, `%{`) are currently highlighted under a shared `string` class rather than separate semantic classes.
- Grammar is intentionally conservative to reduce false positives; some niche Murex one-liners may receive partial rather than maximal highlighting.
- Auto-detection is tuned to avoid misclassifying Bash/JSON, so explicit language tags are recommended in Markdown fences.

## Murex Sample

```murex
#!/usr/bin/env murex

%[1..3] -> foreach i {
	out "idx=$i"
}

value = null ?? "fallback"
out ${value}
```

## Development

```bash
npm ci
npm test
```

## Project Layout

- src/languages/murex.js: highlight.js grammar definition for Murex
- src/index.js: package entrypoint
- src/data/keywords.js: generated keyword/builtin dataset
- test/corpus/basic.mx: baseline syntax fixture
- test/corpus/operators.mx: operator-heavy positive fixture
- test/corpus/delimiters.mx: nested delimiter positive fixture
- test/corpus/edge/unclosed.mx: malformed input edge fixture
- test/corpus/edge/escaped-operators.mx: escaped operator edge fixture
- test/corpus/edge/mixed-statement-expression.mx: mixed statement/expression edge fixture
- test/corpus/negative/bash.sh: Bash false-positive guard fixture
- test/corpus/negative/sample.json: JSON false-positive guard fixture
- test/smoke.test.js: grammar smoke test
- scripts/check-hljs-pin.js: highlight.js pin enforcement
- scripts/lint.js: minimal syntax/lint gate

## Keyword Dataset Regeneration

The builtins and control-flow keyword dataset is generated from Murex command docs.

- default source: /Users/laurencemorgan/dev/go/src/github.com/lmorg/murex/docs/commands
- override source with MUREX_REPO or MUREX_COMMAND_DOCS_DIR

Run:

```bash
npm run generate:keywords
```

Manual overrides live in scripts/keyword-overrides.json.

See docs/keyword-overrides-example.md for override structure examples.

## Contribution Notes

When Murex grammar/docs evolve, update this package in the following order:

1. Regenerate command keyword dataset:

```bash
npm run generate:keywords
```

2. Add or update corpus fixtures in test/corpus for new syntax cases.
3. Update grammar rules in src/languages/murex.js as needed.
4. Run full checks:

```bash
npm test
```

5. Optionally regenerate theme previews for visual review:

```bash
npm run render:previews
```

## Local Theme Preview Harness

Generate local HTML snapshots for multiple highlight.js themes:

```bash
npm run render:previews
```

Output is written to previews/index.html plus one file per theme.
