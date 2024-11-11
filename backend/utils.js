const fs = require('fs');

const readMarkdownFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
        });
    });
};

module.exports = { readMarkdownFile };