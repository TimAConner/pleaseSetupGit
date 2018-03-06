const { existsSync } = require('fs');
const { execSync } = require('child_process');
const {
    appendFileSync,
    readFileSync
} = require("fs")

const GITHUB_REGEX_MATCH = /https:\/\/github.com\/.*?\/(.*)?.git/;
const GITIGNORE_NODE_MODULES_REGEX_MATCH = /.*node_modules.*/;

const [,,gitRepoUrl] = process.argv;
const gitUrlMatch = GITHUB_REGEX_MATCH.exec(gitRepoUrl);

let hasDataBeenAdded = false;

if (gitUrlMatch !== null) {
    try {
        const [, repoName] = gitUrlMatch;
        const baseFilePath = `./${repoName}`;
        
        const execute = (code, consoleMessage) => {
            execSync(code);
            console.log(consoleMessage);
        };

        const appendToFile = (fileName, data, consoleMessage) => {
            try {
                appendFileSync(`${baseFilePath}/${fileName}`, `${data}`, 'utf8');
                console.log(consoleMessage);
            } catch ({message}) {
                console.log('Error:', message);
            }
        };
        
        const doesFileExists = fileName => existsSync(`${baseFilePath}/${fileName}`);

        execute(`git clone ${gitRepoUrl}`, "Cloned repo");
    
        if (!doesFileExists(`.gitignore`)) {
            hasDataBeenAdded = true;
            execute(`touch ${baseFilePath}/.gitignore`, 'Created: .gitignore');
        }

        // If git ignore does not have node_modules in it.
        const gitIgnoreContents = readFileSync(`${baseFilePath}/.gitignore`, 'utf8').toString();
        if (gitIgnoreContents.match(GITIGNORE_NODE_MODULES_REGEX_MATCH) === null) {           
            appendToFile(`.gitignore`, '\nnode_modules', `Append node_modules to .gitignore`);
        }

        // Check if readme exists, if it does not, create it and add the repo name to it.
        if (!doesFileExists(`README.md`)) {
            hasDataBeenAdded = true;
            execute(`touch ${baseFilePath}/README.md`, 'Created: README.md');
            appendToFile(`README.md`,  `#${repoName}`, `Append repo name to README.md`);
        }

        if (!doesFileExists(`${baseFilePath}/package.json`) || !doesFileExists(`${baseFilePath}/package-lock.json`) ) {
            hasDataBeenAdded = true;
            execute(`cd ${repoName}/ && npm init -y`, `Ran: npm init -y`);
        }

        if (!doesFileExists(`${baseFilePath}/node_modules`)) {
            execute(`cd ${repoName}/ && npm install`, `Ran: npm install`);
        }
        
        if (hasDataBeenAdded) {
            execute(`cd ${repoName}/ && git add . && git commit -m "Initital Commit"`, `Commited to ${repoName}`);
        }

    } catch ({message}) {
        console.log('Error:', message);
    }
} else {
    console.log('Usage: doGitForMe [gitUrl]');
}