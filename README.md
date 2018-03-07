# pleaseSetupGit
## Motivation
While attending the [Nashville Software School](http://nashvillesoftwareschool.com/), there was an optional challenge to build a command line application that would automatically pull down a github repo.  After finishing that, Emily Lemmon, the class' Junior Instructor, had the idea to turn it into an application that would help them test students repos.  
## Purpose
One can quickly clown down a new or old repo and be up and ready to work in the span of one command.
## How to Setup
1. npm install -g
1. You're ready to rock!

## How to use
```
pleaseSetupGit <Repo URL> [--grunt --commit [--hs [--hs && --o]]]
```
### Options
* --grunt 
    * Will run grunt after npm install.
    * Will remove watch statment from the Gruntfile.js if it is present.
* --hs
    * Will start http server. 
    * If grunt is also being run, it will start it after grunt has run.
* --o
    * Will automatically open a browser at the http server if after grunt and http server has been started.
* --commit
    * Will commit if data has been changed after you npm init and install.
    * Commit message is "Initial Commit"

## Order of Operationsn
When pleaseSetupGit runs, this is the order of things that happen.
1. git clone
1. Create .gitignore if not present
    1. Add node_modules to .gitignore 
1. Create README.md if not present
    1. Add # README NAME to readme file.
1. Run npm init -y if package or package-lock are not present
1. Run npm install if node_modules is not present
1. Run git commit if data has been added to the repo in the previous steps and if --commit option has been added.
1. Run grunt if --grunt command has been added.
    1. When grunt is complete, it will run --hs if that has been added as an option.
1. Run hs if --hs command has been added and grunt is complete.