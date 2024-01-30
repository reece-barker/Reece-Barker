this.$ = new Object();

const express = require('express');
const router = this.$.router = express.Router();
const path = this.$.path = ['/activity'][0];

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
        return req.app.render(`libraries/activity`, {
            layout: false,
            _url: `/activity?hbs=true`,
            location: req.session.location || false,
            users: res.locals.session.users || false
        }, async (err, hbs) => {
            if (err) {
                return console.error(err);
            }

            res.send(hbs);
        });
    }

    res.render(`libraries/activity`, {
        layout: '1',
        _url: `/activity`,
        location: req.session.location || false,
        users: res.locals.session.users || false
    });
});

module.exports = this;