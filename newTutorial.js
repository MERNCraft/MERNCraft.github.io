/**
 * newTutorial.js
 */


const { readdirSync, lstatSync } = require('fs')
const { resolve, join } = require('path')
const { exec } = require("child_process");

const readlineSync = require('readline-sync');
const parent = resolve( __dirname, ".." )
const shared = `../${__dirname.split("/").slice(-1)[0]}/shared`


// Get a name for the new tutorial
const name = (() => {
  const NAME_REGEX = /^tutorial[_ -](\d+)/i
  const GIT_REGEX = /([^a-z0-9]+)|([a-z0-9]+)/gi

  // Read required tutorial name from args
  const args = process.argv.slice(2)
  let warn = ""
  let name

  if (args.length) {
    // Use non-hyphenated words, so compatibility warning is shown
    name = args.join(" ")
  }


  // Create an array of existing entries in parent directory...
  const existing = readdirSync(parent)
    .filter( name => { // ... which are themselves directories
      const path = join(parent, name)
      return lstatSync(path).isDirectory()
    }).map( name => name.toLowerCase())


  // Find a title which is sure to be unused
  const used = existing
    .map( name => { // ... but just keep XXs from `Tutorial-XX`
      const match = NAME_REGEX.exec(name)
      return match ? Number(match[1]) : ""
    })
    .reduce(( max, next ) => isNaN(max) ? 0 : Math.max(max, next))

  const placeholder = `Tutorial-${used + 1}`


  return (function () {
    // Detect whether any characters in `name` are unusable
    ;({ name, warn } = sanitize(name))
    
    while (warn) {
      const prompt = `${warn}
  (Press Enter to use "${name}"). Tutorial name: `
      let response = readlineSync.question(prompt)
      if (!response) {
        response = name
      }

      ;({ name, warn } = sanitize(response))

      if (isUniqueName(name)) {
        if (!warn) {
          return name

        } else {
          // The name had to be tweaked. A new warning will appear.
        }
        
      } else {
        // The name is not unique
        warn = `${warn ? warn + "\n" : ""}The name ${name} already exists. Please choose a unique name for your new tutorial.`
        name = placeholder
      }
    }
  })()


  // HELPERS / HELPERS / HELPERS // HELPERS / HELPERS / HELPERS //


  /**
   * Replaces any sequences of non-alphanumeric characters with "-"
   * Provides an explanation of what characters have been replaced.
   * 
   * @param {String} name 
   * @returns { name: String [, warn: String] }
   */
  function sanitize(name) {
    if (!name) {
      return {
        name: placeholder,
        warn: "Please provide a unique name for your new tutorial."
      }
    }

    let match
    const toReplace = []
    const toKeep = []

    while (match = GIT_REGEX.exec(name)) {    
      if (match[1]) {
        toReplace.push(match[1])
      }
      if (match[2]) {
        toKeep.push(match[2])
      }
    }

    if (!toKeep.length) {
      // No part of the name is usable
      return {
        name: placeholder,
        warn: "For compatibility with GitHub repository names only alpha-numeric ASCII characters are allowed."
      }

    } else {
      const output = {
        name: toKeep.join("-")
      }
      
    
      // Ignore "-" which will be replaced with itself
      while (true) {
        const dashIndex = toReplace.indexOf("-")

        if (dashIndex < 0) {
          break
        }
        
        toReplace.splice(dashIndex, 1)
      }
      
      const replacements = toReplace.length
      if (replacements) {
        // Create an ordered list of characters to remove (not "-")
        const replaced = toReplace
          .join("").replaceAll("-", "")
          .split("")
          .filter(( char, index, array ) => (
            array.indexOf(char) === index
          ))
          .sort()
          .join("") // may be empty

          const s = replaced.length === 1 ? "" : "s"
          const dashes = replacements === 1
            ? "a dash"
            : "dashes"

          if (toKeep.length === 1) {
            // Unusable characters are at the start or finish
            output.warn = `For compatibility with GitHub repository names the character${s} "${replaced}" will be removed.`

          } else if (replaced) {
            output.warn = `For compatibility with GitHub repository names the character${s} "${replaced}" will be replaced with ${dashes}.`
        }
      }

      return output
    }
  }



  function isUniqueName(name) {
    return (existing.indexOf(name.toLowerCase()) < 0)
  }
})()



// console.log(`MAKE DIRECTORY STRUCTURE`)
const fullPath = join(parent, name)
const makeDirectories = `mkdir -p ${fullPath}/docs/{md,images}`
exec(makeDirectories, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`)
    process.exit()
  } else if (stderr) {
    console.log(`stderr: ${stderr}`)
    process.exit()
  }
});



// console.log(`GENERATE PACKAGE.JSON`)
const package = `${fullPath}/package.json`
// "pandoc -o index.html --filter shared/filter.js --template=shared/template.html md/*.md"
const makePackageJson = `touch ${package} && cat > ${package} <<EOF
{
  "scripts": {
    "pandoc": "pandoc -o docs/index.html --template=shared/template.html docs/md/*.md"
  },
  "devDependencies": {
    "pandoc": "^0.2.0"
  }
}
EOF`
exec(makePackageJson, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`)
    process.exit()
  } else if (stderr) {
    console.log(`stderr: ${stderr}`)
    process.exit()
  }



  // console.log(`RUN npm i TO INSTALL pandoc devDependency`)
  exec("npm i", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
      process.exit()
    } else if (stderr) {
      // IGNORE WARNINGS LIKE:
      // ExperimentalWarning: CommonJS module /opt/homebrew/lib/node_modules/npm/node_modules/debug/src/node.js is loading ES Module /opt/homebrew/lib/node_modules/npm/node_modules/supports-color/index.js using require().
      // Support for loading ES Module in require() is an experimental feature and might change at any time
      // (Use `node --trace-warnings ...` to show where the warning was created)

      // console.log(`stderr: ${stderr}`)
      // process.exit()
    }



    // console.log(`INSTALL shared SYMLINK`)
    const link = join(fullPath, "shared")
    exec(`ln -s ${shared} ${link}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        process.exit()
      } else if (stderr) {
        console.log(`stderr: ${stderr}`)
        process.exit()
      }
    });



    // console.log(`INITIALIZE GIT`)
    const gitignore = `${fullPath}/.gitignore`
    const makeIgnore = `touch ${gitignore} && cat > ${gitignore} <<EOF
    node_modules/
    .env
    .DS_Store
    .vscode/*
    !.vscode/extensions.json
    Icon?
    ![iI]con[_a-zA-Z0-9-]
    shared
    Notes/
    EOF
    `
    exec(makeIgnore, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        process.exit()
      } else if (stderr) {
        console.log(`stderr: ${stderr}`)
        process.exit()
      }
    });


    exec(`cd ${fullPath} && git init`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        process.exit()
      } else if (stderr) {
        console.log(`stderr: ${stderr}`)
        process.exit()
      }
      // console.log("stdout:", stdout)
      // // Initialized empty Git repository ...

      createAndConvertMDFile()
    })
  })
})



function createAndConvertMDFile() {
  // console.log(`CREATE PLACEHOLDER AT doc/md/99.md`)
  const month = (() => {
    const now = new Date()
    const month = now.toLocaleString("en-GB", { month: "long" })
    const year = now.getFullYear()
    return `${month} ${year}`
  })()
  const md = `${fullPath}/docs/md/99.md`
  const makeMD = `touch ${md} && cat > ${md} <<EOF
---
title: ${name.replaceAll("-", " ")}
subtitle: (no subtitle yet)
month: ${month}
repo: ${name}
---
# Success! #
Your Markdown to HTML conversion process is working.
EOF`

  exec(makeMD, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
      process.exit()
    } else if (stderr) {
      console.log(`stderr: ${stderr}`)
      process.exit()
    }


    // console.log(`RUN npm run pandoc TO CONVERT IT TO doc/index.html`)
    exec(`cd ${fullPath} && npm run pandoc`, (error, stdout, stderr) => {
      if (error) {
        // IGNORE ERROR LIKE:

        // Command failed: touch /Users/james/MERNCraft/Publisher/HTMElves/Tutorial-7/package.json && cat > /Users/james/MERNCraft/Publisher/HTMElves/Tutorial-7/package.json <<EOF
        // {
        //   "scripts": {
        //     "pandoc": "pandoc -o docs/index.html --template=shared/template.html docs/md/*.md"
        //   },
        //   "devDependencies": {
        //     "pandoc-filter": "^2.2.0"
        //   }
        // }
        // EOF
        // touch: /Users/james/MERNCraft/Publisher/HTMElves/Tutorial-7/package.json: No such file or directory

        // console.log(`error: ${error.message}`)
        // process.exit()

      } else if (stderr) {
        console.log(`stderr: ${stderr}`)
        process.exit()
      }



      // console.log(`MAKE FIRST COMMIT`)
      const commit = `cd ${fullPath} && git add . && git commit -m "Initial commit"`
      exec(commit, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`)
          process.exit()
        } else if (stderr) {
          console.log(`stderr: ${stderr}`)
          process.exit()
        }
        // console.log("stdout:", stdout)
        // Initial commit: 5 files changed, 145 insertions(+)...
      })



      // console.log("OPEN THE CONVERTED index.html IN BROWSER")
      const url = `${fullPath}/docs/index.html`
      const start = (process.platform == 'darwin' 
        ? 'open'
        : ( process.platform == 'win32'
            ? 'start'
            : 'xdg-open'
        )
      );
      exec(start + ' ' + url);
    })
  })
}