const { Transform } = require("stream");
const GRUNTFILE_WATCH_REGEX_MATCH = /(grunt\.registerTask\(.*\[.*?)(\,\s((?:'|")watch(?:'|")))(.*?\]\))/;

// Sifts through the buffer and removes the 'watch' statment from grunt.registerTask
module.exports = () => Transform({
    transform (buffer, _, callback) {
        try {
            const bufferWithoutWatch = buffer.toString().replace(GRUNTFILE_WATCH_REGEX_MATCH, "$1$4");
            callback(null, bufferWithoutWatch);
        } catch ({message}) {
            console.log('Error:', message);
        }
    }
});