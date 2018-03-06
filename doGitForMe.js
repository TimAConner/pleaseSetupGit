/*
Possible options:
    --commit: Will commit the project when everything has been ran and data has been added.
    --hs: Will start hs server once everythign is complete (will wait for grunt if grunt is also running)
    --grunt: Will run grunt once.
    Example: pleaseSetupGit [url] --grunt --hs
    Example: pleaseSetupGit [url] --commit
*/

const { existsSync } = require('fs');
const { execSync } = require('child_process');
const {
    appendFileSync,
    readFileSync,
    createReadStream,
    createWriteStream,
    writeFile
} = require("fs")

const { Transform, Writable } = require("stream");
const removeWatch = Transform();
const writeToGruntfile = Writable();

const GITHUB_REGEX_MATCH = /https:\/\/github.com\/.*?\/(.*)?.git/;
const GITIGNORE_NODE_MODULES_REGEX_MATCH = /.*node_modules.*/;
const GRUNTFILE_WATCH_REGEX_MATCH = /(grunt\.registerTask\(.*\[.*?)(\,\s'watch')(.*?\]\))/;

const {argv: [,,gitRepoUrl, ...options]} = process;

const isOptionOn = option => options.includes(option);

const gitUrlMatch = GITHUB_REGEX_MATCH.exec(gitRepoUrl);

let hasDataBeenAdded = false;

if (gitUrlMatch !== null) {
    try {
        const [, repoName] = gitUrlMatch;
        const baseFilePath = `./${repoName}`;
        
        // Sifts through the buffer and removes the 'watch' statment from grunt.registerTask
        removeWatch._transform = (buffer, _, callback) => {
            try {
                const bufferWithoutWatch = buffer.toString().replace(GRUNTFILE_WATCH_REGEX_MATCH, "$1$3");
                callback(null, bufferWithoutWatch);
            } catch ({message}) {
                console.log('Error:', message);
            }
        }

        writeToGruntfile._write = (buffer, _, next) => {
            try {
                writeFile(`${baseFilePath}/Gruntfile.js`, buffer, (err) => {
                    if(err) throw err;
                });
                next();
            } catch ({message}) {
                console.log('Error:', message);
            }
        };

        const execute = (code, consoleMessage) => {
            try {
                console.log("Running: ", consoleMessage);
                execSync(code);
                console.log("Finished: ", consoleMessage);
            } catch ({message}) {
                console.log('Error:', message);
            }
        };  

        const appendToFile = (fileName, data, consoleMessage) => {
            try {
                console.log("Running: ", consoleMessage);
                appendFileSync(`${baseFilePath}/${fileName}`, `${data}`, 'utf8');
                console.log("Finished: ", consoleMessage);
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
            appendToFile(`.gitignore`, '\nnode_modules', `Append node_modules to .gitignore`);
        }

        // Check if readme exists, if it does not, create it and add the repo name to it.
        if (!doesFileExist(`README.md`)) {
            hasDataBeenAdded = true;
            execute(`touch ${baseFilePath}/README.md`, 'Creat README.md');
            appendToFile(`README.md`,  `#${repoName}`, `Append repo name to README.md`);
        }

        if (!doesFileExist(`${baseFilePath}/package.json`) && !doesFileExist(`${baseFilePath}/package-lock.json`) ) {
            hasDataBeenAdded = true;
            execute(`cd ${repoName}/ && npm init -y`, `npm init -y`);
        }

        if (!doesFileExist(`${baseFilePath}/node_modules`)) {
            execute(`cd ${repoName}/ && npm install`, `npm install`);
        }
        
        if (hasDataBeenAdded && isOptionOn("--commit")) {
            execute(`cd ${repoName}/ && git add . && git commit -m "Initital Commit"`, `Commit to ${repoName}`);
        }

        //TODO:
        // Run through gruntfile, remove watch from
        //    grunt.registerTask("default", ['jshint', 'sass', 'browserify', 'watch']);//Will do by default when you excecute grunt.
        // write that back

        if(isOptionOn("--grunt")){
            try {
                createReadStream(`${baseFilePath}/Gruntfile.js`)
                .pipe(removeWatch)
                .pipe(writeToGruntfile)
                .on('finish', () => {

                    execute(`cd ${repoName}/ && grunt --force`, 'grunt', true);

                    if(isOptionOn("--hs")){
                        execute(`cd ${repoName}/ && hs`, 'http server', true);
                    }

                });

            } catch ({message}){
                console.log("Error:", message);
            }
        }

        // Wait for grunt fo finish running then do its thing
        if(isOptionOn("--hs") && !isOptionOn("--grunt")){
            execute(`cd ${repoName}/ && hs`, 'Started http server', true);
        }



    } catch ({message}) {
        console.log('Error:', message);
    }
} else {
    console.log('Usage: doGitForMe [gitUrl] [options:  --commit, --grunt, --hs]');
}