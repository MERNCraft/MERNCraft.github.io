#!/usr/bin/env node

const pandoc = require("pandoc-filter")
const SWAP_REGEX = /^\$([a-z_.-]+)\$$/
const CODE_REGEX = /([a-z0-9-]+)-(#(\d*))?(w?)(s?)$/
// All languages supported by Prism:
// https://prismjs.com/#supported-languages
const languages = ["abap", "abnf", "actionscript", "ada", "adoc", "agda", "al", "antlr4", "apacheconf", "apex", "apl", "applescript", "aql", "arduino", "arff", "arm-asm", "armasm", "art", "arturo", "asciidoc", "asm6502", "asmatmel", "aspnet", "atom", "autohotkey", "autoit", "avdl", "avisynth", "avro-idl", "avs", "awk", "bash", "basic", "batch", "bbcode", "bbj", "bicep", "birb", "bison", "bnf", "bqn", "brainfuck", "brightscript", "bro", "bsl", "c", "cfc", "cfscript", "chaiscript", "cil", "cilk", "cilk-c", "cilk-cpp", "cilkc", "cilkcpp", "clike", "clojure", "cmake", "cobol", "coffee", "coffeescript", "conc", "concurnas", "context", "cooklang", "coq", "cpp", "crystal", "cs", "csharp", "cshtml", "csp", "css", "css-extras", "csv", "cue", "cypher", "d", "dart", "dataweave", "dax", "dhall", "diff", "django", "dns-zone", "dns-zone-file", "docker", "dockerfile", "dot", "dotnet", "ebnf", "editorconfig", "eiffel", "ejs", "elisp", "elixir", "elm", "emacs", "emacs-lisp", "erb", "erlang", "eta", "etlua", "excel-formula", "factor", "false", "firestore-security-rules", "flow", "fortran", "fsharp", "ftl", "g4", "gamemakerlanguage", "gap", "gawk", "gcode", "gdscript", "gedcom", "gettext", "gherkin", "git", "gitignore", "glsl", "gml", "gn", "gni", "go", "go-mod", "go-module", "gradle", "graphql", "groovy", "gv", "haml", "handlebars", "haskell", "haxe", "hbs", "hcl", "hgignore", "hlsl", "hoon", "hpkp", "hs", "hsts", "html", "http", "ichigojam", "icon", "icu-message-format", "idr", "idris", "iecst", "ignore", "inform7", "ini", "ino", "io", "j", "java", "javadoc", "javadoclike", "javascript", "javastacktrace", "jexl", "jinja2", "jolie", "jq", "js", "js-extras", "js-templates", "jsdoc", "json", "json5", "jsonp", "jsstacktrace", "jsx", "julia", "keepalived", "keyman", "kotlin", "kt", "kts", "kum", "kumir", "kusto", "latex", "latte", "ld", "less", "lilypond", "linker-script", "liquid", "lisp", "livescript", "llvm", "log", "lolcode", "lua", "ly", "magma", "makefile", "markdown", "markup", "markup-templating", "mata", "mathematica", "mathml", "matlab", "maxscript", "md", "mel", "mermaid", "metafont", "mizar", "mongodb", "monkey", "moon", "moonscript", "mscript", "mustache", "n1ql", "n4js", "n4jsd", "nand2tetris-hdl", "nani", "naniscript", "nasm", "nb", "neon", "nevod", "nginx", "nim", "nix", "npmignore", "nsis", "objc", "objectivec", "objectpascal", "ocaml", "odin", "opencl", "openqasm", "oscript", "oz", "parigp", "parser", "pascal", "pascaligo", "pbfasm", "pcaxis", "pcode", "peoplecode", "perl", "php", "php-extras", "phpdoc", "plant-uml", "plantuml", "plsql", "po", "powerquery", "powershell", "pq", "processing", "prolog", "promql", "properties", "protobuf", "psl", "pug", "puppet", "pure", "purebasic", "purescript", "purs", "px", "py", "python", "q", "qasm", "qml", "qore", "qs", "qsharp", "r", "racket", "razor", "rb", "rbnf", "reason", "regex", "rego", "renpy", "res", "rescript", "rest", "rip", "rkt", "roboconf", "robot", "robotframework", "rpy", "rq", "rss", "ruby", "rust", "sas", "sass", "scala", "scheme", "sclang", "scss", "sh", "sh-session", "shell", "shell-session", "shellsession", "shortcode", "sln", "smali", "smalltalk", "smarty", "sml", "smlnj", "sol", "solidity", "solution-file", "soy", "sparql", "splunk-spl", "sqf", "sql", "squirrel", "ssml", "stan", "stata", "stylus", "supercollider", "svg", "swift", "systemd", "t4", "t4-cs", "t4-templating", "t4-vb", "tap", "tcl", "tex", "textile", "toml", "tremor", "trickle", "trig", "troy", "ts", "tsconfig", "tsx", "tt2", "turtle", "twig", "typescript", "typoscript", "uc", "unrealscript", "uorazor", "uri", "url", "uscript", "v", "vala", "vb", "vba", "vbnet", "velocity", "verilog", "vhdl", "vim", "visual-basic", "warpscript", "wasm", "web-idl", "webidl", "webmanifest", "wgsl", "wiki", "wl", "wolfram", "wren", "xeora", "xeoracube", "xls", "xlsx", "xml", "xml-doc", "xojo", "xquery", "yaml", "yang", "yml", "zig"]

pandoc.stdio(action);

let item = 0

function action({t: type, c: content}, format, meta) {
  // log(arguments)

  switch (type) {
    case "CodeBlock":
      return treatAnnotatedCodeBlock(content)
    case "Div":
      return checkForAside(content)
    case "Link":
      return checkForVariableLink(content, meta)
  }
}


function treatClasses(classList, attributes) {
  let noNumbers = false
  let wrap = false
  let skip = false
  let start

  classList.forEach((item, index, array) => {
    let match

    if (match = CODE_REGEX.exec(item)) {
      // [
      //   'bash-#3w',
      //   'bash',
      //   '#3',
      //   '3',        // start from
      //   'w',        // wrap
      //   's',        // skipped lines
      //   index: 0,
      //   input: 'bash-#3w'
      // ]

      wrap = wrap || !!match[4] // may be 'w'
      skip = skip || !!match[5] // may be 's'

      if (start = match[3]) {
        attributes.push(["data-start", start])
      } else if (match[2] || wrap || skip) {
        noNumbers = true
      }
      if (skip) {
        array[0] = "skip"
      } else {
        array[index] = match[1]   // the root class
      }
    }
  })

  // Replace language `name` with `language-name`
  const indices = languages.map(lang => classList.indexOf(lang))
  indices.forEach(index => {
    if(index + 1) {
      classList[index] = `language-${classList[index]}`
    }
  })
  if (!noNumbers) {
    classList.push("line-numbers")
  } else if (wrap) {
    classList.push("wrap")
  }
}



function treatAnnotatedCodeBlock([attributes, content]) {
  // id: ""
  // classes: ["md-#4"]
  // attributes: [[ "data-start", 4 ]]
  // content: "<o>old</o>\n<n>new</n>"

  let [id, classList, custom] = attributes
  treatClasses(classList, custom)

  id = id ? ` id="${id}"` : ""

  const classNames = classList.length
    ? ` class="${classList.join(" ")}"`
    : ""

  custom = custom.length
    ? `${custom.reduce((attributes, [key, value]) => {
      return `${attributes} ${key}="${value}"`
    }, "")}`
    : ""

  // Replace any < or > that are not part of a tag
  // such as `<b>`, `</i>`, `<u>` or `</s>`
  content = content
  .replace(/<(?!\/?[bius]>)/g, "&lt;")
  .replace(/(?<!<\/?[bius])>/g, "&gt;")

  const result = pandoc.RawBlock(
    "html",
    `<pre${id}${classNames}${custom}><code${classNames}>${content}</code></pre>`
  )

  return result
}



let labelSeed = 0



/**
 * A fenced block with attributes will create Block of type
 * "Div". For example:
 *
 *   ::: { #id .className attribute=value }
 *   contents
 *   :::
 *
 * The attributes of a Div may be:
 * - #id
 * - .className
 * - attribute=value
 *
 * These will be collected into `content[0]` as:
 * [ "id", ["className"], [["attribute", "value"]]]
 *
 * WARNING: if any of the attributes do not match the expected
 * patterns, pandoc will not recognize the fenced block, and
 * will treat it as a simple string that just happens to begin
 * with :::
 *
 * `content[1]` of the Div will be an array of child objects.
 *
 * @param {array} content [[ attribute ], [ child ]]
 * @returns {object || undefined}
 */
function checkForAside(content) {
  const [ attributes, children ] = content
  let [ id, classes, custom ] = attributes

  // Check if one of the classes is "ASIDE" (in capitals)
  const indexAside = classes.indexOf("ASIDE")
  if (indexAside < 0) return // leave the Div unchanged

  // If we get here, replace the Div with an <aside> element
  // which wraps the children.

  classes.splice(indexAside, 1) // remove ASIDE class

  id = id ? ` id="${id}"` : ""

  // Create a ` class="..."` string from the other class names
  // or an empty string if there are none.
  classes = classes.length
    ? ` class="${classes.join(" ")}"` // begins with a space
    : ""

  // Create an ` attribute="..."` string, or an empty string
  custom = custom.length
    ? custom.reduce((cumul, [key, value]) => (
        cumul + ` ${key}="${value}"`
      ), "")
    : ""

  const label = ` aria-label="label-${++labelSeed}"`

  // Generate the opening aside tag with its attributes
  const tag = `<aside${id}${classes}${custom}${label}>`


  const elements = children.map(({ t: type, c: content }) => (
    // For example...
    //
    //    type: "Para"
    // content: [ {"t":"Str","c":"contents"}, ... ]
    //
    // ... will be add to `elements` as pandoc.Para(content)

    pandoc[type](content)
  ))

  // Wrap the contents of the "div.ASIDE" in the appropriate
  // <aside> tags, created using pandoc.RawBlock.
  return [
    pandoc.RawBlock(
      "html",
      tag
    ),
    ...elements,
    pandoc.RawBlock(
      "html",
      "</aside>"
    )
  ]
}



/**
 * Called when a Link Block is encountered
 *
 * Checks if the href or the title for the link are variables
 * that need to be replaced from meta
 *
 * @param {array} content
 *                [ attributes, anchor, [ href, title-text ] ]
 * @param {*} meta
 */
function checkForVariableLink(content, meta) {
  const [ attributes, anchor, link ] = content

  link.forEach(( item, index, array ) => {
    const match = SWAP_REGEX.exec(item)

    if (match) {
      // Either the href itself or the title-text is a variable
      const key = match[1]
      const swap = meta[key]?.c
      if (swap) {
        // There is a value for this variable in meta. The value
        // will be an array of { t, c? } objects. But pandoc.Link
        // expects a simple string both for the href and for the
        // title text. The value array may contain { t: "Space" }
        // objects, which have no `c`.
        const string = swap.reduce((cumul, {t, c}) => (
          `${cumul}${t === "Space" ? " " : c}`
        ), "")
        array[index] = string
      }
    }
  })
  // The `content` array may have been modified in situ. There's
  // no need to return the modified array. Indeed, returning an
  // object will break pandoc's expectations.
}


// LOGGING //

const { createWriteStream } = require('fs')
// const logger = new console.Console(createWriteStream("filter.log"));

function log(args) {
  const [{t: type, c: content}, format, meta] = args

  if (!item++) {
    logger.log(`format: ${format}

--- <<< meta ---
${JSON.stringify(meta, null, 2)}
--- meta >>> ---
`
    )
  }

  logger.log(`--- ${item} ---
type:   "${type}"`)
  if (content) {
    logger.log(`content: ${JSON.stringify(content, null, 2)}`)
  }
  logger.log("")
}