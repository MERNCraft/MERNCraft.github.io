#!/usr/bin/env node

const pandoc = require("pandoc-filter")
const REGEX = /^\$([a-z_.-]+)\$$/

pandoc.stdio(action);

function action({t: type, c: content}, format, meta) {
  log(arguments)
  
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
  logger.log(`type:   "${type}"`)
  if (content) {
    logger.log(`content: ${JSON.stringify(content, null, 2)}`)
  }
  logger.log(`format: ${format}`)
  // logger.log(`meta:   ${JSON.stringify(meta, null, 2)}`)
  logger.log("")
}