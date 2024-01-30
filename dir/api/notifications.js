this.$ = new Object();

const {
    BSON
} = require('mongodb-stitch-browser-sdk');

const express = require('express');
const crypto = require('crypto');
const router = this.$.router = express.Router();
const path = this.$.path = ['/api/notifications'][0];

router.get('/', async (req, res, next) => {
    if (!req.session._uuid) {
        return res.redirect('/login');
    }

    res.setHeader('Content-Type', 'application/json');

    next();
}, async (req, res) => {
    const {
        _id
    } = req.body;

    await req.db.db(req.env.realm.db).collection('users').findOne({
        _id: req.session.users._id
    }).then(async (users) => {
        await req.db.db(req.env.realm.db).collection('users').updateOne({
            username: users.username
        }, {
            $set: {
                '_options.notifications': []
            }
        }, {
            upsert: false,
            multi: true
        });

        res.json({
            err: null,
            body: {
                text: "Completed!"
            }
        });
    }).catch(async (err) => {
        res.json({
            err: err,
            body: null
        });
    });
});

module.exports = this;