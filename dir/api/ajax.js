this.$ = new Object();

const {
    BSON
} = require('mongodb-stitch-browser-sdk');

const express = require('express');
const crypto = require('crypto');
const router = this.$.router = express.Router();
const path = this.$.path = ['/api/ajax'][0];

router.get('/', async (req, res, next) => {
    if (!req.session._uuid) {
        return res.redirect('/login');
    }

    next();
}, async (req, res) => {
    res.json({
        _is: req.query._is ? req.query._is : false
    });
});

module.exports = this;