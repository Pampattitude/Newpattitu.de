'use strict';

var mongoose = require('mongoose');

var schemaOptions = {
    autoIndex: true,
};

var schema = new mongoose.Schema({
    author: {type: String, unique: true},
    text: {type: String},

    status: {type: String, enum: ['new', 'fixed', 'wontFix']},

    created: {type: Date, default: Date.now},
});

exports.model = mongoose.model('Report', schema, 'reports');
