'use strict';

var mongoose = require('mongoose');

var schemaOptions = {
    autoIndex: true,
};

var schema = new mongoose.Schema({
    // author: {type: String, ref: 'User'}, // Temporarily removed

    title: {type: String, required: true},
    technicalName: {type: String, required: true, unique: true},

    caption: {type: String, required: true},
    text: {type: String, required: true},
    tags: {type: [String]},

    type: {type: String, enum: ['news', 'life', 'project', 'tutorial', 'other'], default: 'other'},

    featured: {type: Boolean, default: false},
    created: {type: Date, default: Date.now},
});

exports.model = mongoose.model('Article', schema, 'articles');
