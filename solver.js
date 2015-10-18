// Write a program that finds the longest chains of words with 6-letter overlap between words (given the English dictionary). So a chain is:
//
// grounders -> undershirts -> shirtsleeve
//
// If there are 7 words in the longest word chain, then print all the 7-word chains.


// Read words from file
//--------------------------------------------------------------------------------
var words = require("fs").readFileSync("words").toString().split("\n");
console.log("read file done");


// Filter words
//--------------------------------------------------------------------------------
//
// Remove words less than 6 letters
// Create a mapping of unique prefixes to words
// Create a mapping of unique suffixes to words
//
//--------------------------------------------------------------------------------
var prunedWords = [];
var prefixes = {};
var suffixes = {};
for(var i = 0; i < words.length; i++) {
    if(words[i].length >= 6) {
        prunedWords.push(words[i]);
        var prefix = words[i].substr(0, 6);
        var suffix = words[i].substr(words[i].length - 6);
        prefixes[prefix] = prefixes[prefix] || {};
        prefixes[prefix][words[i]] = true;
        suffixes[suffix] = suffixes[suffix] || {};
        suffixes[suffix][words[i]] = true;
    }
}
words = prunedWords;
prunedWords = [];
console.log("wow very " + words.length);
console.log("filtering done");


// Prune words
//--------------------------------------------------------------------------------
//
// Remove words which aren't connected with any other words
// We take advantage of sparse edges to keep the graph as small as possible
//
//--------------------------------------------------------------------------------
for(var i = 0; i < words.length; i++) {
    var w = words[i];
    var prefix = w.substr(0, 6);
    var suffix = w.substr(w.length - 6);
    var prev = suffixes[prefix] || {};
    var prevCount = Object.keys(prev).length;
    var next = prefixes[suffix] || {};
    var nextCount = Object.keys(next).length;

    // Word is connected if there are other words besides itself which chains to it
    var prevConnected = prevCount>0 && !(prevCount === 1 && w in prev);
    var nextConnected = nextCount>0 && !(nextCount === 1 && w in next);

    if(prevConnected || nextConnected)
        prunedWords.push(w);
}
words = prunedWords;
console.log("wow very " + words.length);
console.log("pruning done");


// Construct word graph
//--------------------------------------------------------------------------------
//
// Maps words to array of chainable words
//
//--------------------------------------------------------------------------------
var wordGraph = {};
for(var i = 0; i < words.length; i++) {
    var w = words[i];
    var suffix = w.substr(w.length - 6);
    wordGraph[w] = [];
    var next = Object.keys(prefixes[suffix] || {});
    for(var j = 0; j < next.length; j++)
        if(w !== next[j])
            wordGraph[w].push(next[j]);
}
console.log("graph construction done");
// console.log(wordGraph);


// Topological sort with Tarjan's
//--------------------------------------------------------------------------------
// 
// ordering contains nodes in reverse topological order
//
//--------------------------------------------------------------------------------
var ordering = [];
var seen = {};
var tempSeen = {};

var visit = function(word) {
    if(word in tempSeen) {
        throw new Error("wow there's a cycle game over");
    }
    if(!(word in seen)) {
        tempSeen[word] = true;
        var next = wordGraph[word];
        for(var i = 0; i < next.length; i++) {
            visit(next[i]);
        }
        delete tempSeen[word];
        seen[word] = true;
        ordering.push(word);
    }
}

for(var i = 0; i < words.length; i++)
    visit(words[i]);
console.log("topological sort done");


// Longest path algorithm
// (or shortest negative path)
//--------------------------------------------------------------------------------
var state = {};
var best = 0;
var bestPaths = [];

while(ordering.length > 0) {
    var w = ordering.pop();
    var node = state[w] || {best: 1, paths: [[w]]};
    var nextWords = wordGraph[w];

    if(node.best > best) {
        best = node.best;
        bestPaths = [];
    }
    if(node.best >= best) {
        bestPaths = bestPaths.concat(node.paths);
    }

    for(var i = 0; i < nextWords.length; i++) {
        var next = nextWords[i];
        var nextNode = state[next] = state[next] || {best: 0};
        if(node.best + 1 > nextNode.best) {
            nextNode.paths = [];
            nextNode.best = node.best + 1;
        }
        if(node.best + 1 >= nextNode.best) {
            for(var j = 0; j < node.paths.length; j++) {
                var path = node.paths[j].slice();
                path.push(next);
                nextNode.paths.push(path);
            }
        }
    }
}
console.log("solve complete");
console.log("longest chain: " + best);
console.log(bestPaths);
