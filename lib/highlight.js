var hljs = require('highlight.js');
hljs.configure({
    classPrefix: 'lang-',
    useBR: false,
});

module.exports = exports = function(text, language) {
    try {
        console.log(language, text);
        return hljs.highlight(language, text, true).value;
    }
    catch (err) {
        throw new Error(err);
    }
};
