'use strict';

var bind = function(f) {
    if (f === null)
        return function() {};

    var args = Array.prototype.slice.call(arguments);
    args.shift();

    return function () {
        var argsCopy = args.slice(0);
        var start = expandArgs(argsCopy, arguments);
        return f.apply(null, argsCopy.concat(Array.prototype.slice.call(arguments, start)));
    };
};

var  bindMember = function(f, o) {
    if (f === null)
        return function() {};
    else if (o === null)
        return f;

    var args = Array.prototype.slice.call(arguments);
    args.shift();
    args.shift();

    return function () {
        var start = 0;

        if (o.constructor == BindArg) {
            var arg = o.index;
            o = arguments[arg - 1];
            if (arg > start)
                start = arg;
        }

        var argsCopy = args.slice(0);
        start = expandArgs(argsCopy, arguments, start);
        return f.apply(o, argsCopy.concat(Array.prototype.slice.call(arguments, start)));
    };
};

var BindArg = function(i) {
    this.index = i;
};

var expandArgs = function(args, argumentList, start) {
    if (start === null)
        start = 0;

    for (var i=0; i < args.length; ++i) {
        if (args[i] && args[i].constructor == BindArg) {
            var arg = args[i].index;
            if (arg > 0 && arg <= argumentList.length) {
                args[i] = argumentList[arg - 1];
                if (arg > start)
                    start = arg;
            }
            else
                args[i] = null;
        }
    }

    return start;
};

for (var i = 1 ; i < 10 ; ++i) {
    var arg = new BindArg(i);
    global['_' + i] = arg;
}

exports.bind = bind;
exports.bindMember = bindMember;

exports.arg = {
    _1: _1,
    _2: _2,
    _3: _3,
    _4: _4,
    _5: _5,
    _6: _6,
    _7: _7,
    _8: _8,
    _9: _9,
};
