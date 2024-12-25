# Create your own Tutorial Organization #

Experience shows that you master new techniques better if you teach them to others. You have just struggled with fitting these new concepts into your previous understanding, so you know best how to explain them to people like yourself who are still learning.

After you have used a technique for years, it seems obvious to you, and you forget why it was not obvious when you were learning it. Experts suffer from [the curse of knowledge](https://en.wikipedia.org/wiki/Curse_of_knowledge#), and may write explanations that assume readers know things that they have not yet learned. You are not yet an expert, so you do not make such assumptions.

The best time to write a tutorial is immediately after you have learned a new technique. This forces you to check your understanding of each detail, and to use examples and metaphors that make sense to you. In a few months' time, you may need to use this technique again yourself, and your own words will be the best reminder you can have of how the process works.

## HTM-Elves

HTM-Elves is a GitHub organization that you can use as a template for your own tutorials organization on GitHub. It provides:

* A set of helpful scripts, snippets and processes that allow you to convert Markdown text to HTML in real time
* A set of JavaScript and CSS files that add interactive functionality to your output HTML
* The ability to customize your own layouts and colour schemes.

In short, the HTM-Elves workflow allows you to focus on the content of your tutorial (which you write in Markdown) and takes care of publishing it as professionally-packaged HTML on GitHub.

## Installing Pandoc and Watchman

The HTM-Elves workflow relies on Pandoc, a free open-source software document converter. ***Please [install Pandoc](https://pandoc.org/installing.html) on your development computer before continuing.*** Without Pandoc, there will be no magic.

To work most efficiently, it is good to see your Markdown files converted to HTML files and displayed in your browser in real time. For this, you can install [Meta's open source Watchman service](https://facebook.github.io/watchman/).

It's possible that Watchman has already been installed on your system by another development tool that you use. To check, run this command in a Terminal window:

```bash
watchman --version
```

If you see a response like `command not found: watchman`, you will need to [install Watchman](https://facebook.github.io/watchman/docs/install) yourself. If you see a version number, like `2024.11.04.00`, you're already set. 

## Getting started

The HTM-Elves workflow works in conjunction with GitHub. You need to set up your own GitHub Organization for your tutorials, 
and each tutorial you create will be contained in its own GitHub repository within your Organization.

### Creating a GitHub Organization and its Home Page

1. Create your own [GitHub organization](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations) as a container for your tutorial repositories.
2. Fork this repository into your new organization. **Use the exact name of your organization as the name of the repository, together with the suffix `.github.io`.** For example, if your GitHub Organization is called `MyTutorials`, your fork of this repository must be called `MyTutorials.github.io`.
4. On GitHub, visit the Settings tab, and the Pages section in the right-hand column
5.  In the Build And Deployment section, choose `main` as the branch and `docs/` as the source folder, then click Save.

It may take a few minutes for your forked repository to go live.

### Publishing a First Tutorial

1. On your development computer, create a new directory to contain all your future tutorials.
2. Clone your fork of this repository to your new directory.
3. In a Terminal window, `cd` into the repository directory and then run `npm run new`. This will ask you for the name of your first tutorial, and then generate a directory for it in the same parent directory. The new directory will contain a folder called `docs/` which itself will contain a folder called `md/` which contains a some placeholder Markdown files. These files will automatically have been converted to a file at `docs/index.html`, and this page should open in your browser, as a proof of concept. The new directory will already contain a Git repository.
4. In your organization on GitHub, create a new remote repository with the same name as your first Tutorial
5. Use `git remote add origin <link to your GitHub repo>` to connect your local repository to your new GitHub repository.
6. Run `git push -u origin main` to push your local repository to GitHub
7. Follow steps 3 and 4 from the section *Creating a GitHub Organization and its Home Page* above for your new GitHub repository.

## Generating your own material
1. Start writing your tutorial in Markdown files in the `docs/md/` folder. 
2. Use zero-padded numbering for your `.md` files (e.g.: "00-Intro.md", "01-First-steps.md", ...) to ensure that they are loaded in the correct order.
3. Run `npm run pandoc` to generate `docs/index.html` from your updated `.md` files.
4. Use the root of your new repository to contain the code and assets that demonstrate the finished version of your tutorial
5. Push your repository to GitHub when the tutorial is ready to share.

## Tips and tricks

For more insight into how to get the most of your HTM-Elves workflow, read the [articles on the HTM-Elves site](https://HTM-Elves.github.io). They were all written using this process.
