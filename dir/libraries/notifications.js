this.$ = new Object();

const express = require('express');
const router = this.$.router = express.Router();
const path = this.$.path = ['/notifications'][0];

router.get('/', async (req, res, next) => {
    if (!req.session._uuid) {
        return res.redirect('/login');
    }

    next();
}, async (req, res) => {
    const {
        hbs
    } = req.query;

    if (hbs) {
        return req.app.render(`libraries/notifications`, {
            layout: false,
            _url: `/notifications?hbs=true`,
            location: req.session.location || false,
            users: res.locals.session.users || false
        }, async (err, hbs) => {
            if (err) {
                return console.error(err);
            }

            res.send(hbs);
        });
    }

    res.render(`libraries/notifications`, {
        layout: '1',
        _url: `/notifications`,
        location: req.session.location || false,
        users: res.locals.session.users || false
    });
});

module.exports = this;