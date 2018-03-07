/*
Possible options:
    --commit: Will commit the project when everything has been ran and data has been added.
    --hs: Will start hs server once everythign is complete (will wait for grunt if grunt is also running)
    --o: Will automatically open up a broser with the http server started in it.
    --grunt: Will run grunt once.
    Example: pleaseSetupGit [url] --grunt --hs
    Example: pleaseSetupGit [url] --commit
*/

const { existsSync } = require('fs');
const { appendToFile } = require('./appendToFile');
const { execute } = require('./execute');
const removeWatch = require(`./transforms/removeWatch.js`);
const {
    appendFileSync,
    readFileSync,
    createReadStream,
    createWriteStream,
    writeFileSync
} = require("fs");

const { Writable } = require("stream");
const writeToGruntfile = Writable();

const GITHUB_REGEX_MATCH = /https:\/\/github.com\/.*?\/(.*)?.git/;
const GITIGNORE_NODE_MODULES_REGEX_MATCH = /.*node_modules.*/;

const {argv: [,,gitRepoUrl, ...options]} = process;

const isOptionOn = option => options.includes(option);

const gitUrlMatch = GITHUB_REGEX_MATCH.exec(gitRepoUrl);

let hasDataBeenAdded = false;

if (gitUrlMatch !== null) {
    try {
        const [, repoName] = gitUrlMatch;
        const baseFilePath = `./${repoName}`;      

        writeToGruntfile._write = (buffer, _, next) => {
            try {
                writeFileSync(`${baseFilePath}/Gruntfile.js`, buffer);
                next();
            } catch ({message}) {
                console.log('Error:', message);
            }
        };

        const doesFileExist = fileName => existsSync(`${baseFilePath}/${fileName}`);

        execute(`git clone ${gitRepoUrl}`, "Clone repo");
    
        if (!doesFileExist(`.gitignore`)) {
            hasDataBeenAdded = true;
            execute(`touch ${baseFilePath}/.gitignore`, 'Create .gitignore');
        }

        // If git ignore does not have node_modules in it.
        const gitIgnoreContents = readFileSync(`${baseFilePath}/.gitignore`, 'utf8').toString();
        if (gitIgnoreContents.match(GITIGNORE_NODE_MODULES_REGEX_MATCH) === null) {           
            appendToFile(`${baseFilePath}/.gitignore`, '\nnode_modules', `Append node_modules to .gitignore`);
        }

        // Check if readme exists, if it does not, create it and add the repo name to it.
        if (!doesFileExist(`README.md`)) {
            hasDataBeenAdded = true;
            execute(`touch ${baseFilePath}/README.md`, 'Creat README.md');
            appendToFile(`${baseFilePath}/README.md`,  `#${repoName}`, `Append repo name to README.md`);
        }

        // package.json and package-lock.json
        if (!doesFileExist(`package.json`) && !doesFileExist(`package-lock.json`) ) {
            hasDataBeenAdded = true;
            execute(`cd ${repoName}/ && npm init -y`, `npm init -y`);
        }

        // node_modules
        if (!doesFileExist(`node_modules`)) {
            execute(`cd ${baseFilePath}/ && npm install`, `npm install`);
        }
        
        // commit
        if (hasDataBeenAdded && isOptionOn("--commit")) {
            execute(`cd ${baseFilePath}/ && git add . && git commit -m "Initital Commit"`, `Commit to ${repoName}`);
        }

        // grunt
        if(isOptionOn("--grunt")){
            try {
                createReadStream(`${baseFilePath}/Gruntfile.js`)
                .pipe(removeWatch())
                .pipe(writeToGruntfile)
                .on('finish', () => {

                    execute(`cd ${repoName}/ && grunt --force`, 'grunt', true);
                    //pleaseSetupGit https://github.com/kenziebottoms/nss-front-03-planets.git --g --hs --o

                    // If hs is set to true, now run hs after running grunt.
                    if(isOptionOn("--hs")){
                        execute(`cd ${repoName}/ && hs ${isOptionOn("--o") ? '-o' : ''}`, 'http server', true);
                    }

                });

            } catch ({message}){
                console.log("Error:", message);
            }
        }

        // Run hs if grunt is not an option
        // hs
        if(isOptionOn("--hs") && !isOptionOn("--grunt")){
            execute(`cd ${repoName}/ && hs ${isOptionOn("--o") ? '-o' : ''}`, 'http server', true);
        }



    } catch ({message}) {
        console.log('Error:', message);
    }
} else {
    console.log('Usage: pleaseSetupGit [gitUrl] [options:  --commit, --grunt, --hs || (--hs && --o)]');
}