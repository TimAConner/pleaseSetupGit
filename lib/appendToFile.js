const { appendFileSync } = require("fs");
module.exports.appendToFile = (filePath, data, consoleMessage) => {
    try {
        console.log("Running:", consoleMessage);
        appendFileSync(filePath, `${data}`, 'utf8');
        console.log("Finished:", consoleMessage);
    } catch ({message}) {
        console.log('Error:', message);
    }
};