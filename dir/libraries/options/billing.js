this.$ = new Object();

const crypto = require('crypto');
const express = require('express');
const router = this.$.router = express.Router();
const path = this.$.path = ['/options/billing'][0];

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
        return req.app.render(`libraries${path}`, {
            layout: false,
            _url: `${path}?hbs=true`,
            location: req.session.location || false,
            users: res.locals.session.users || false
        }, async (err, hbs) => {
            if (err) {
                return console.error(err);
            }

            res.send(hbs);
        });
    }

    res.render(`libraries${path}`, {
        layout: '1',
        _url: `${path}`,
        location: req.session.location || false,
        users: res.locals.session.users || false
    });
});

router.post('/', async (req, res, next) => {
    if (!req.session._uuid) {
        return res.redirect('/login');
    }

    next();
}, async (req, res) => {
    const {
        card_number,
        name_on_card,
        expiration_date,
        security_code,
        password
    } = req.body;

    const encryption = crypto.createHash('sha256').update(password).digest('base64');

    if (!await req.db.db(req.env.realm.db).collection('users').findOne({
        password: encryption
    })) {
        return res.json({
            err: {
                elements: ['#password'],
                xhr: {
                    'password': 'You have provided an invalid password.'
                },
                async: true
            }
        });
    }

    await req.db.db(req.env.realm.db).collection('users').findOne({
        username: req.session.users._clients._credentials.username,
        password: encryption
    }).then(async (users) => {
        await req.db.db(req.env.realm.db).collection('users').updateOne({
            username: users.username
        }, {
            $set: {
                "_options.billing": {
                    card_number: card_number,
                    name_on_card: name_on_card,
                    expiration_date: expiration_date,
                    security_code: security_code,
                }
            }
        }, {
            upsert: false
        });

        return res.json({
            err: false,
            _id: users._id,
            xhr: {
                uuid: users._options._uuid,
                url: '/options/billing',
                async: true
            }
        });
    });
});

module.exports = this;