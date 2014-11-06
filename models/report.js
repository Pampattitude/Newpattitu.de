'use strict';

var mongoose = require('mongoose');

var schemaOptions = {
    autoIndex: true,
};

var schema = new mongoose.Schema({
    author: {type: String},
    text: {type: String},

    status: {type: String, enum: ['open', 'treated', 'closed'], default: 'open'},

    created: {type: Date, default: Date.now},
    'new': {type: Boolean, default: true},
});

exports.model = mongoose.model('Report', schema, 'reports');
