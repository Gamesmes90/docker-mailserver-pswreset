// Require Filesystem module
const fs = require("fs");

// Require the Obfuscator Module
const JavaScriptObfuscator = require('javascript-obfuscator');

// Read the file of your original JavaScript Code as text
fs.readFile('./utils.js', "UTF-8", function(err, data) {
    if (err) {
        throw err;
    }

    // Obfuscate content of the JS file
    var obfuscationResult = JavaScriptObfuscator.obfuscate(data);

    // Write the obfuscated code into a new file
    fs.writeFile('./public/utils.js', obfuscationResult.getObfuscatedCode() , function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("utils.js has been obfuscated!");
    });
});