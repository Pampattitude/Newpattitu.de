'use strict';

var synonyms = [
    /* Beta */          ['alpha', 'beta', 'prototype'],
    /* Dev */           ['dev', 'development', 'programming'],
    /* Javascript */    ['js', 'javascript'],
    /* Node.js */       ['nodejs', 'node', 'node.js'],
    /* Unity3D */       ['unity', 'unity3d', 'unity5'],
];
var synonymsObject = {};

// make `synonyms` array an object for faster search result
(function() {
    synonyms.forEach(function(group) {
        group.forEach(function(elem) {
            synonymsObject[elem] = group.filter(function(word) { return elem !== word; });
        });
    });
})();

exports.buildSearchRegExp = function(termsArray) {
    var newTermsArray = [];

    termsArray.forEach(function(term) {
        newTermsArray = newTermsArray.concat(synonymsObject[term] || []).concat(term);
    });

    newTermsArray = newTermsArray.filter(function(value, index, self) { return self.indexOf(value) === index; })

    return '(' + newTermsArray.join('|') + ')+?';
};
