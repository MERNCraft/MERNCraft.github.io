/**
 * watch.js
 * 
 ***** First, ensure that the Watchman server is installed ******
 ***** https://facebook.github.io/watchman/docs/install    ******
 *
 * client.capabilityCheck() calls the 
 *   'watch-project' command, which calls the
 *   'subscribe'     command, which starts watching for changes
 * 
 * client.on('subscription', fileChangeCallback) will trigger
 * the fileChangeCallback() function each time a file changes.
 * 
 * fileChangeCallback() calls `npm run pandoc`, so your Markdown
 * files are converted and `docs/index.html` is updated.
 */


// npm script "watch" = "node public/watch.js Repo name"
// Obtain the absolute path to the `docs/md/` folder in the
// tutorial repository directory.
const { resolve, join } = require('path')
const tutorial = process.argv.slice(2).join(" ") // "Repo name"
const watchFolder = resolve(
  __dirname, // /path/to/HTM-Elves/public
  "../..",   // /path/to
  tutorial,  // /path/to/Repo name
  "docs",    // /path/to/Repo name/docs
  "md"       // /path/to/Repo name/docs/md
)

const { exec } = require("child_process");
const { Client } = require('fb-watchman')
const client = new Client()

const name = "watch markdown"
const optional = []
const required = ['relative_root']
const services = { optional, required }


client.capabilityCheck(services, checkCallback)


function checkCallback(error) {
  if (error) {
    console.error("Watchman checkCallback error\n", error)
    process.exit()
  }

  client.command(['watch-project', watchFolder], watchCallback)
}


function watchCallback(error, response) {
  if (error) {
    console.error("Watchman can't watch:\n", error)
    process.exit()
  }

  const { watch, relative_path, warning } = response

  // Show any 'warning' information to the user, as this may
  // suggest steps for remediation
  if (warning) {
    console.log(`Watchman warning: ${warning}`)
  }

  const expression = ["allof", ["match", "*.md"]]
  const fields = ["name", "exists"]
  const subscription = { expression, fields }
  const subscribe = ['subscribe', watch, name, subscription]

  if (relative_path) {
    subscription.relative_root = relative_path
  }

  client.command(subscribe, subscribeCallback)
  client.on('subscription', fileChangeCallback);

  function subscribeCallback(error, { subscribe }) {
    if (error) {
      console.log("SUBSCRIPTION error:", error)
      process.exit()
    }

    console.log(`Watchman is watching:\n'${watchFolder}/'\n`);
  }
}

/**
 * fileChangeCallback is called by Watchman any time a file in
 * the `docs/md/` folder is saved, created or deleted.
 * 
 * It calls the `npm run pandoc` script in the `package.json`
 * file. This updates the file at `docs/index.html`. If you use
 * Live Server to display `docs/index.html` in your browser,
 * you should see the page update each time you modify an .md
 * file. 
 */
function fileChangeCallback ({ files, subscription }) {
  if (subscription !== name) { return }

  if (files.length) {
    exec(`npm run pandoc`, (error, stdout, stderr) => {
        if (error) {
        console.log(`error: ${error.message}`)
        process.exit()

      } else if (stderr) {
        console.log(`stderr: ${stderr}`)
        process.exit()
      }

      // console.log("stdout:", stdout)
      // > pandoc
      // > pandoc -o docs/index.html --template=public/template.html docs/md/*.md

      console.log(`Treated: ${JSON.stringify(
        files.map(({ name, exists }) => (
          `${name}${exists ? "" : " (deleted)"}`
        )), null, 2)}`)
    });
  }
}
