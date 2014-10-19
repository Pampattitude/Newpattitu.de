'use strict';

var mongoose = require('mongoose');

var generatePassword = function(password) {
    var crypto = require('crypto');
    var shasum = crypto.createHash('sha1');

    shasum.update(password);
    return shasum.digest('hex');
};

var schemaOptions = {
    autoIndex: true,
};

var schema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: String, required: true, set: generatePassword},

    rights: {type: String, enum: ['admin', 'moderator']},
});
schema.statics.generatePassword = generatePassword;

exports.model = mongoose.model('User', schema, 'users');
