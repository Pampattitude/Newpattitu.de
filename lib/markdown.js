'use strict';

var escape = require('escape-html');
var hljs = require('highlight.js');
hljs.configure({
    classPrefix: 'lang-',
    useBR: false,
});
var marked = require('marked');

var printer = require('./printer');

var file = './test.md';

var renderer = {
    code: function(code, lang, escaped) {
        if (lang) {
            try {
                var out = hljs.highlight(lang, code, true).value;
                if (out != null && out !== code) {
                    escaped = true;
                    code = out;
                }
            }
            catch (err) {
                throw err;
            }
        }

        if (!lang) {
            return '<pre class="md-code-pre"><code class="md-code">'
                + (escaped ? code : escape(code))
                + '\n</code></pre>';
        }

        return '<pre class="md-code-pre"><code class="md-code '
            + 'md-code-lang-'
            + escape(lang)
            + '" data-lang="' + escape(lang) + '">'
            + (escaped ? code : escape(code))
            + '\n</code></pre>\n';
    },

    blockquote: function(quote) {
        return '<blockquote class="md-blockquote">\n' + quote + '</blockquote>\n';
    },

    html: function(html) {
        return html;
    },

    heading: function(text, level, raw) {
        console.log('HEADING');
        return '<h'
            + level
            + ' id="'
            + 'head-'
            + raw.toLowerCase().replace(/[^\w]+/g, '-')
            + '" class="md-heading md-heading-' + level + '">'
            + text
            + '</h'
            + level
            + '>\n';
    },

    hr: function() {
        return '<hr class="md-hr" />\n';
    },

    list: function(body, ordered) {
        var type = ordered ? 'ol' : 'ul';
        return '<' + type + ' class="md-list">\n' + body + '</' + type + '>\n';
    },

    listitem: function(text) {
        return '<li class="md-listitem">' + text + '</li>\n';
    },

    paragraph: function(text) {
        return '<p class="md-paragraph">' + text + '</p>\n';
    },

    table: function(header, body) {
        return '<table class="md-table">\n'
            + '<thead>\n'
            + header
            + '</thead>\n'
            + '<tbody>\n'
            + body
            + '</tbody>\n'
            + '</table>\n';
    },

    tablerow: function(content) {
        return '<tr class="md-tablerow">\n' + content + '</tr>\n';
    },

    tablecell: function(content, flags) {
        var type = flags.header ? 'th' : 'td';
        var tag = flags.align
            ? '<' + type + ' class="md-tablecell md-tablecell-' + flags.align + '">'
            : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
    },

    // span level renderer
    strong: function(text) {
        return '<strong class="md-strong">' + text + '</strong>';
    },

    em: function(text) {
        return '<em class="md-em">' + text + '</em>';
    },

    codespan: function(text) {
        return '<code class="md-codespan">' + text + '</code>';
    },

    br: function() {
        return '<br class="md-br" />';
    },

    del: function(text) {
        return '<del class="md-del">' + text + '</del>';
    },

    link: function(href, title, text) {
        try {
            var prot = decodeURIComponent(unescape(href))
                .replace(/[^\w:]/g, '')
                .toLowerCase();
        } catch (e) {
            return '';
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
            return '';
        }

        var out = '<a class="md-link" href="' + href + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
    },

    image: function(href, title, text) {
        var out = '<img class="md-image" src="' + href + '" alt="' + text + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += ' />'
        return out;
    },
};

module.exports = function(text) {
    return marked(text, {
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        smartLists: true,
    });
};

module.exports.sanitize = function(text) {
    return marked(text, {
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        sanitize: true,
        smartLists: true,
    });
};
