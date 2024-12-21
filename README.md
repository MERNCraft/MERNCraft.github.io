# Create your own Tutorial Organization #

Experience shows that you master new techniques better if you teach them to others. You have just struggled with fitting these new concepts into your previous understanding, so you know best how to explain them to people like yourself who are still learning.

After you have used a technique for years, it seems obvious to you, and you forget why it was not obvious when you were learning it. Experts suffer from [the curse of knowledge](https://en.wikipedia.org/wiki/Curse_of_knowledge#), and may write explanations that assume readers know things that they have not yet learned. You are not yet an expert, so you do not make such assumptions.

The best time to write a tutorial is immediately after you have learned a new technique. This forces you to check your understanding of each detail, and to use examples and metaphors that make sense to you. In a few months' time, you may need to use this technique again yourself, and your own words will be the best reminder you can have of how the process works.

## HTM-Elves

HTM-Elves is a GitHub organization that you can use as a template for your own tutorials organization on GitHub. It provides:

* A set of helpful scripts, snippets and processes that allow you to convert Markdown text to HTML in real time
* A set of JavaScript and CSS files that add interactive functionality to your output HTML
* The ability to customize your own layouts and colour schemes.

In short, the HTM-Elves workflow allows you to focus on the content of your tutorial (which you write in Markdown) and takes care of publishing it as professionally-packaged HTML.

## Getting started

1. Create your own [GitHub organization](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations) as a container for your tutorial repositories.
2. Fork this repository into your new organization. **Use the exact name of your organization as the name of the repository.**
3. On your development computer, create a new directory to contain all your future tutorials.
4. Clone your fork of this repository to your new directory.
5. In a Terminal window open into the repository directory, run `npm run new`. This will ask you for the name of your first tutorial, and then generate a directory for it in the same parent directory. The new directory will contain a folder called `docs/` which itself will contain a folder called `md/` which contains a placeholder file: `99.md`. This `99.md` file will automatically have been converted to a file at `docs/index.html`, and this page should open in your browser, as a proof of concept. The new directory will already contain a Git repository.
6. In your organization on GitHub, create a new remote repository with the same name as your first Tutorial
7. Use `git remote add origin <link to your GitHub repo> to connect your local repository to your new GitHub repository.
8. Run `git push origin -u main` to push your local repository to GitHub
9. On GitHub, visit the Settings tab, and the Pages section in the right-hand column

## Generating your own material
1. Start writing your tutorial in Markdown files in the `docs/md/` folder. 
2. Use zero-padded numbering for your `.md` files (e.g.: "00-Intro.md", "01-First-steps.md", ...) to ensure that they are loaded in the correct order.
3. Run `npm run pandoc` to generate `docs/index.html` from your updated `.md` files.
4. Use the root of your new repository to contain the code and assets that demonstrate the finished version of your tutorial
5. Push your repository to GitHub when the tutorial is ready to share.

