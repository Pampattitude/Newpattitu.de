'use strict';

var mongoose = require('mongoose');

var schemaOptions = {
    autoIndex: true,
};

var schema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},

    author: {type: String},
    text: {type: String},
});

exports.model = mongoose.model('Comment', schema, 'comments');
