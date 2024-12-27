#!/usr/bin/env node

const pandoc = require("pandoc-filter")
const REGEX = /^\$([a-z_.-]+)\$$/

pandoc.stdio(action);

let item = 0

function action({t: type, c: content}, format, meta) {
  log(arguments)
  item++

  const match = REGEX.exec(content)
  if (match) { // content is like `$title$`
    const key = match[1] // key will be like `title`
    const swap = meta[key]
    if (swap) {
      return swap.c  // an array from `meta`
    } // else returns undefined
  }
}



// LOGGING //

const { createWriteStream } = require('fs')
const logger = new console.Console(createWriteStream("filter.log"));

function log(args) {
  const [{t: type, c: content}, format, meta] = args

  if (!item) {
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