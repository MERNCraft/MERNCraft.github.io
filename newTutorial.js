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
    console.log(`makeDirectories error: ${error.message}`)
    process.exit()
  } else if (stderr) {
    console.log(`stderr: ${stderr}`)
    process.exit()
  }
});



// console.log(`GENERATE PACKAGE.JSON`)
const package = join(fullPath, "package.json")
const watchFolder = join(fullPath, "docs", "md")
// "pandoc -o index.html --filter shared/filter.js --template=shared/template.html md/*.md"
const makePackageJson = `touch ${package} && cat > ${package} <<EOF
{
  "scripts": {
    "pandoc": "pandoc -o docs/index.html --template=shared/template.html docs/md/*.md",
    "watch": "node shared/watch.js ${watchFolder}"
  }
}
EOF`
exec(makePackageJson, (error, stdout, stderr) => {
  if (error) {
    // IGNORE ERRORS LIKE

    // error: Command failed: touch /Users/james/MERNCraft/Publisher/HTMElves/Tutorial-3/package.json && cat > /Users/james/MERNCraft/Publisher/HTMElves/Tutorial-3/package.json <<EOF
    // {
    //   "scripts": {
    //     "pandoc": "pandoc -o docs/index.html --template=shared/template.html docs/md/*.md",
    //     "watch": "node shared/watch.js /Users/james/MERNCraft/Publisher/HTMElves/Tutorial-3/docs/md"
    //   }
    // }
    // EOF
    // touch: /Users/james/MERNCraft/Publisher/HTMElves/Tutorial-3/package.json: No such file or directory

    // console.log(`package.json error: ${error.message}`)
    // process.exit()

  } else if (stderr) {
    console.log(`stderr: ${stderr}`)
    process.exit()
  }


  // console.log(`INSTALL shared SYMLINK`)
  let link = join(fullPath, "shared")
  exec(`ln -s ${shared} ${link}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`shared symlink error: ${error.message}`)
      process.exit()
    } else if (stderr) {
      console.log(`stderr: ${stderr}`)
      process.exit()
    }
  });



  // console.log(`INSTALL images SYMLINK IN docs/md`)
  link = join(fullPath, "docs", "md")
  exec(`ln -s "../images" ${link}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`images symlink error: ${error.message}`)
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
      console.log(`.gitignore error: ${error.message}`)
      process.exit()
    } else if (stderr) {
      console.log(`stderr: ${stderr}`)
      process.exit()
    }
  });


  exec(`cd ${fullPath} && git init`, (error, stdout, stderr) => {
    if (error) {
      console.log(`git init error: ${error.message}`)
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
      console.log(`99.md error: ${error.message}`)
      process.exit()
    } else if (stderr) {
      console.log(`stderr: ${stderr}`)
      process.exit()
    }


    // console.log(`npm run pandoc; CONVERT md TO doc/index.html`)
    exec(`cd ${fullPath} && npm run pandoc`, (error, stdout, stderr) => {
      if (error) {
        console.log(`run pandoc error: ${error.message}`)
        process.exit()

      } else if (stderr) {
        console.log(`stderr: ${stderr}`)
        process.exit()
      }


      // console.log("ADD README")
      const md = `${fullPath}/README.md`
      const readme = `touch ${md} && cat > ${md} <<'EOF'
# Tutorial Template #

The command ${'`'}npm run new${'`'} creates this new tutorial repository. Initially it contains the following folders, files and symlinks:
${'```'}
.
├── docs
│   ├── images
│   ├── index.html
│   └── md
│       ├── 99.md
│       └── images -> ../images
├── README.md
├── package.json
└── shared -> ../<Organization>/shared
${'```'}

If the installation is successful, the  file at ${'`'}docs/index.html${'`'} is generated automatically from the files in ${'`'}docs/md/${'`'}, and displayed in your favourite browser.

## Writing the content of your tutorial

You can now add new Markdown files to the ${'`'}docs/md/${'`'} and edit the existing ones.

To regenerate ${'`'}docs/index.html${'`'}, you can run ${'`'}npm run pandoc${'`'} in the Terminal. A better solution is to run ${'`'}npm run watch${'`'} in the Terminal. This will start the ${'`'}watchman${'`'} node module, and this will call ${'`'}npm run pandoc${'`'} for you automatically each time you save a changed Markdown file, delete one, or create a new one.

To see the updated ${'`'}docs/index.html${'`'} in your browser, you can run VS Code's Live Server extension.

## Publishing your tutorial

To publish your tutorial on GitHub, you need to:

1. Create a GitHub repository for this tutorial in the GitHub Organization that you created for this purpose.
2. Commit your changes locally and push them to the remote GitHub repository.
3. Open the Settings tab in your remote GitHub repository.
4. In the Code and automation section in the left column, choose Pages
5. In the Build and Deployment section of the Pages page, choose the ${'`'}main${'`'} branch and the ${'`'}docs/${'`'} folder and click Save to publish the site stored in the ${'`'}docs/${'`'} folder.

Assuming that your GitHub Organization is called ${'`'}MyOrganization${'`'}, and your tutorial repository is called ${'`'}MyTutorial${'`'}, your tutorial will be published at [https://MyOrganization.github.io/MyTutorial](). It may take a few minutes before your site goes live.

Because your tutorial repository is a child of your GitHub organization, the file at ${'`'}docs/index.html${'`'} is able to access files at [https://MyOrganization.github.io/shared](). As a result, all your tutorials will have the same look and feel.

In the future, to update your tutorial, simply commit your changes and push them to the GitHub repository.

## Writing efficiently

Publishing and updating your tutorial takes only a fraction of the time that it takes to write a good tutorial. Check out the articles on [the HTM-Eleves site](https://HTM-Elves.github.io), for ideas on how to use shortcuts, keybindings and other time-saving tricks so that you can focus on writing, not on typing.

## Providing material to accompany your tutorial

You can use this repository, just like any other, to share working code and assets associated with your tutorial. Developers who clone your repository will be able to read the tutorial at ${'`'}docs/index.html${'`'} locally, while reviewing and testing your code examples.

## Recycle the README

And don't forget to replace the contents of this README with a meaningful description of your own project and its tutorial, so that GitHub users will be able to find the work that you are sharing.

All the best!
EOF`
    exec(readme, (error, stdout, stderr) => {
      if (error) {
        console.log(`README error: ${error.message}`)
        process.exit()
      } else if (stderr) {
        console.log(`stderr: ${stderr}`)
        process.exit()
      }
    })


      // console.log(`MAKE FIRST COMMIT`)
      const commit = `cd ${fullPath} && git add . && git commit -m "Initial commit"`
      exec(commit, (error, stdout, stderr) => {
        if (error) {
          console.log(`First commit error: ${error.message}`)
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