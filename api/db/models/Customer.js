const mongoose = require('mongoose');
const { DEFAULT_LANG } = require('../../config');
const bcrypt = require('bcrypt-nodejs');
const { PASS_LENGTH, HTTP_CODES } = require('../../config/Enum');
const is = require('is_js');
const CustomError = require('../../lib/Error');

const schema = mongoose.Schema({
    firm_name: {
        type: String, 
        required: true
    },
    custom_prompt: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});



module.exports = mongoose.model("customer", schema);