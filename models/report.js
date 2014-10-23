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
});

exports.model = mongoose.model('Report', schema, 'reports');
