this.$ = new Object();

const {
    BSON
} = require('mongodb-stitch-browser-sdk');

const uuid = require('uuid');
const superagent = require('superagent');
const crypto = require('crypto');
const express = require('express');
const moment = require('moment');
const router = this.$.router = express.Router();
const path = this.$.path = ['/oauth/twitter'][0];

module.exports = this;