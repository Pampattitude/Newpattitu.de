'use strict';

var mongoose = require('mongoose');

var schemaOptions = {
    autoIndex: true,
};

var schema = new mongoose.Schema({
    // author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Temporarily removed

    title: {type: String, required: true},
    technicalName: {type: String, required: true, unique: true, index: true},

    text: {type: String},
    compressedText: {type: String},
    tags: {type: [String], index: true},

    type: {type: String, enum: ['news', 'life', 'project', 'tutorial', 'flash'], default: 'news'},

    views: {type: Number, default: 0},
    shares: {
        type: {
            facebook: {type: Number},
            twitter: {type: Number},
        },
        default: {facebook: 0, twitter: 0},
    },

    activated: {type: Boolean, default: false, index: true},
    created: {type: Date, default: Date.now},
    lastUpdated: {type: Date, default: Date.now},
});

exports.model = mongoose.model('Article', schema, 'articles');
