var fs = require("fs");

var words = fs.readFileSync("words").toString().split("\n");

var fewer = [];
for(var i = 0; i < words.length; i++) {
    if(Math.random() < .05)
        fewer.push(words[i]);
}

fs.writeFileSync("fewerwords", fewer.join("\n"));
