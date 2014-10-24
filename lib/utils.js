'use strict';

var cheerio = require('cheerio');

var printer = require(__dirname + '/printer');

var objectToArray = function(self) {
    // Preferencially choses self as current object
    var obj = self || this;

    var ret = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            ret.push(obj[prop]);
    }
    return ret;
};
exports.objectToArray = objectToArray;

var objectToObjectArray = function(self) {
    // Preferencially choses this as current object
    var obj = this || self;

    var ret = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            ret.push({
                key: prop,
                val: obj[prop],
            });
        }
    }
    return ret;
};
exports.objectToObjectArray = objectToObjectArray;

var newEmptyObject = function(data) {
    var obj = {};

    for (var prop in obj) {
        delete obj[prop];
    }

    for (var prop in data) {
        obj[prop] = data[prop];
    }

    return obj;
};
exports.newEmptyObject = newEmptyObject;

var traceCaller = function(n) {
    if (isNaN(n) || n < 0)
        n = 1;
    n += 1;
    var s = (new Error()).stack, a=s.indexOf('\n', 5);

    while (n--) {
        a = s.indexOf('\n', a + 1);
        if (a < 0) {
            a = s.lastIndexOf('\n', s.length);
            break;
        }
    }
    var b = s.indexOf('\n', a + 1);
    if (b < 0)
        b = s.length;
    a = Math.max(s.lastIndexOf(' ', b), s.lastIndexOf('/', b));
    b = s.lastIndexOf(':', b);
    s = s.substring(a + 1, b);
    return s;
};
exports.traceCaller = traceCaller;

// deepmerge by Zachary Murray (dremelofdeath) CC-BY-SA 3.0
var mergeObjects = function(foo, bar) {
    var merged = {};
    for (var each in bar) {
        if (foo.hasOwnProperty(each) && bar.hasOwnProperty(each)) {
            if (typeof(foo[each]) == 'object' && typeof(bar[each]) == 'object') {
                merged[each] = mergeObjects(foo[each], bar[each]);
            }
            else {
                merged[each] = [foo[each], bar[each]];
            }
        }
        else if(bar.hasOwnProperty(each)) {
            merged[each] = bar[each];
        }
    }
    for (var each in foo) {
        if (!(each in bar) && foo.hasOwnProperty(each)) {
            merged[each] = foo[each];
        }
    }
    return merged;
};
exports.mergeObjects = mergeObjects;

var escapeRegExp = function(str){
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
};
exports.escapeRegExp = escapeRegExp;

var getAllPropertyNames = function(obj) {
    var props = [];

    do {
        Object.getOwnPropertyNames(obj).forEach(function(prop) {
            if (props.indexOf(prop) === -1) {
                props.push(prop);
            }
        });
    } while (obj = Object.getPrototypeOf(obj));

    return props;
};
exports.getAllPropertyNames = getAllPropertyNames;

var cleanHtmlInput = function(html, validTags, validAttributes) {
    var validTagNames = validTags || ['a', 'b', 'font', 'i', 'img', 'p', 'strike', 'span', 'sub', 'sup', 'u'];
    var validAttributeNames = validAttributes || ['align', 'class', 'href', 'size', 'src'];

    var $ = cheerio.load(html);
    var getAttributes = function() { var attrs = {}; if (this.attribs) { for (var attr in this.attribs) { attrs[attr] = this.attribs[attr]; } } return attrs; };

    $('*').each(function() {
        // Clean tags
        (function() {
            var found = false;
            for (var i = 0 ; validTagNames.length > i ; ++i) {
                if ((this[0].name || this[0].tagName).toUpperCase() == validTagNames[i].toUpperCase()) {
                    found = true;
                    break ;
                }
            }

            if (!found) {
                printer.debug('Removing tag ' + (this[0].name || this[0].tagName));
                $(this).remove();
            }
        }).call(this);

        // Clean attributes
        (function() {
            var attrs = getAttributes.call(this[0]);
            for (var attr in attrs) {
                var found = false;
                for (var j = 0 ; validAttributeNames.length > j ; ++j) {
                    if (validAttributeNames[j] == attr) {
                        found = true;
                        break ;
                    }
                }

                if (!found) {
                    printer.debug('Removing attribute ' + attr + ' of tag ' + (this[0].name || this[0].tagName));
                    $(this).removeAttr(attr);
                }
            }
        }).call(this);
    });

    return $.html();
};
exports.cleanHtmlInput = cleanHtmlInput;

var trim = function(str) {
    return str.replace(/(\t|\n|\r)+/g, '')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/^ /, '')
    .replace(/ $/, '');
};
exports.trim = trim;

exports.stripHtml = function(str) {
    return str.replace(/<(?:.|\n)*?>/gm, '');
};

var prepadNumber = function(nbr, size) {
    if (undefined == size)
        size = 2;

    var nb = '' + nbr;
    while (size > nb.length)
        nb = '0' + nb;

    return nb;
};
exports.prepadNumber = prepadNumber;

exports.bbCodeToHtml = function(str) {
    var start = new Date();
    var ret = require('escape-html')(new String(str));

    ret = ret
        .replace(/\[(\/)?title\]/g, '<$1h1>') // Title
        .replace(/\[(\/)?subtitle\]/g, '<$1h2>') // Subtitle
        .replace(/\[(\/)?p\]/g, '<$1p>') // Paragraph

        .replace(/\[(\/)?b\]/g, '<$1b>') // Bold
        .replace(/\[(\/)?i\]/g, '<$1i>') // Italic
        .replace(/\[(\/)?s\]/g, '<$1s>') // Strikethrough
        .replace(/\[(\/)?u\]/g, '<$1u>') // Underline

        .replace(/\[img\]((?:(?!\[\/?img\]).)+)\[\/img\]/g, '<img src="$1" alt="" />') // Picture
        .replace(/\[url(=([^\]]*))?\]((?:(?!\[\/?img\]).)+)\[\/url\]/g, '<a href="$2">$3</a>') // Link

        .replace(/\[(\/)?quote\]/g, '<$1blockquote>') // quote
        .replace(/\[(\/)?code\]/g, '<$1pre class="code">') // code
        .replace(/\[comment\]/g, '<span class="comment">').replace(/\[\/comment\]/g, '</span>') // comment, should escape HTML
        .replace(/\[tldr\]/g, '<p class="tldr">').replace(/\[\/tldr\]/g, '</p>') // tl;dr
    ;

    printer.debug(new Date() - start, 'ms');

    return ret;
};
