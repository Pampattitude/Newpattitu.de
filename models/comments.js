'use strict';

var mongoose = require('mongoose');

var schemaOptions = {
    autoIndex: true,
};

var schema = new mongoose.Schema({
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},

    author: {type: String},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    text: {type: String},

    status: {type: String, enum: ['visible', 'hidden'], default: 'visible'},

    created: {type: Date, default: Date.now},
});

exports.model = mongoose.model('Comment', schema, 'comments');
