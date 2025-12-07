const { execFile } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

/**
 * Parse a demo file using the parse_demo binary
 * @param {string} tempFilePath - Temporary file path where the demo is saved
 * @returns {Promise<Object>} Parsed demo data as JSON
 */
async function parseDemo(tempFilePath) {
    const binaryPath = path.join(__dirname, '..', 'bin', 'parse_demo');
    
    try {
        const { stdout, stderr } = await execFileAsync(binaryPath, [tempFilePath]);
        
        if (stderr) {
            console.error('Parse demo stderr:', stderr);
        }
        
        // Parse the JSON output
        const parsedData = JSON.parse(stdout);
        return parsedData;
        
    } catch (error) {
        console.error('Error parsing demo:', error);
        throw new Error(`Failed to parse demo file: ${error.message}`);
    }
}

module.exports = { parseDemo };
