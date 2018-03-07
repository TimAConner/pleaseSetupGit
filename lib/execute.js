const { execSync } = require('child_process');
module.exports.execute = (code, consoleMessage) => {
    try {
        console.log("Running:", consoleMessage);
        execSync(code);
        console.log("Finished:", consoleMessage);
    } catch ({message}) {
        console.log('Error:', message);
    }
};  