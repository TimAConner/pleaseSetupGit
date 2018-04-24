# pleaseSetupGit
## Motivation
While attending the [Nashville Software School](http://nashvillesoftwareschool.com/), there was an optional challenge to build a command line application that would automatically pull down a GitHub repository.  After finishing that, Emily Lemmon, the class' Junior Instructor, had the idea to turn it into an application that would help her and the TAs test student's repositories.  
## Purpose
One can quickly clone down a new or old repository using pleaseSetupGit.  This module will automatically setup README.md, setup .gitignore, add node_modules to git ignore, run npm init -y, run npm install, run grunt, and start the http server.  You'll be up and ready to work in the span of one command!  (Or two, because there's always  *one* person who just has to have more than grunt and http server running.)
## How to Install
1. npm install please-setup-git -g
1. You're ready to repo stalk!

## How to Contribute
1. Fork https://github.com/TimAConner/pleaseSetupGit to your profile
1. Clone the repo down
1. You're ready to contribute!

## How to Use
```
pleaseSetupGit <Repo URL> [--grunt --commit [--hs [--hs && --o]]]
```
### Options
* --grunt 
    * Will run grunt after npm install.
    * Will remove watch statement from the Gruntfile.js if it is present.
* --hs
    * Will start http server. 
    * If grunt is also being run, it will start it after grunt has run.
* --o
    * Will automatically open a browser at the http server if after grunt and http server has been started.
* --commit
    * Will commit if data has been changed after you npm init and install.
    * Commit message is "Initial Commit"

## Order of Operations
When pleaseSetupGit runs, this is the order that it checks and executes what to do:
1. Run git clone
1. Create .gitignore if not present
    1. Add node_modules to .gitignore 
1. Create README.md if not present
    1. Add # repo-name to readme file.
1. Run npm init -y if package or package-lock are not present
1. Run npm install if node_modules is not present
1. Run git commit if data has been added to the repo in the previous steps and if --commit option has been added as an option.
1. Run grunt if --grunt command has been added as an option.
    1. When grunt is complete, it will run --hs if that has been added as an option.
1. Run hs if --hs command has been added and grunt is complete.
