this.$ = new Object();

const {
    BSON
} = require('mongodb-stitch-browser-sdk');

const moment = require('moment');
const uuid = require('uuid');
const superagent = require('superagent');
const crypto = require('crypto');
const express = require('express');
const router = this.$.router = express.Router();
const path = this.$.path = ['/register'][0];

router.get('/', async (req, res, next) => {
    if (req.session._uuid) {
        return res.redirect('/dashboard');
    }

    next();
}, async (req, res) => {
    const next = async () => {
        res.render('register', {
            layout: '2',
            _url: '/register',
            cly: req.session.cly || false,
            users: false
        });
    }

    next();
});

router.get('/github', async (req, res, next) => {
    const {
        access_token
    } = req.query;

    if (!access_token) return res.redirect('/register');

    next();
}, async (req, res) => {
    const {
        access_token
    } = req.query;

    const {
        login,
        id,
        avatar_url,
        name,
        email,
        hireable,
        bio
    } = (await superagent
        .get('https://api.github.com/user')
        .set('User-Agent', 'PostmanRuntime/7.26.8')
        .set('Authorization', `token ${access_token}`)).body;

    const encryption = await crypto.createHash('sha256').update(`${id}`).digest('base64');

    if (await req.db.db(req.env.realm.db).collection('users').findOne({
        username: login
    })) {
        return res.redirect('/login');
    }

    if (await req.db.db(req.env.realm.db).collection('users').findOne({
        "_information.address": email
    })) {
        return res.redirect('/login');
    }

    const _uuid = uuid.v4();
    const _apis = {
        _: uuid.v4(),
        github: encryption,
        twitter: false
    };

    await req.db.db(req.env.realm.db).collection('users').insertOne({
        _id: new BSON.ObjectID(),
        _apis: _apis,
        _information: {
            img: avatar_url,
            fn: name,
            ln: false,
            address: email,
            bio: bio,
            employed: hireable,
            telephone: false,
            birthday: false
        },
        _options: {
            status: false,
            clearance: 1,
            _uuid: _uuid,
            notifications: [{
                _id: new BSON.ObjectID(),
                authors: {
                    profile: 'logo.svg',
                    username: 'Acolytes'
                },
                notification: `<i class="font-semibold">${login}</i> has just registered.`,
                _moment: moment().format()
            }]
        },
        username: login,
        password: false
    });

    await req.db.db(req.env.realm.db).collection('users').findOne({
        username: login,
        '_apis.github': encryption
    }).then(async (users) => {
        req.app.render('emails/registration', {
            layout: false,
            fullname: users.username,
            username: users.username,
            address: users._information.address
        }, async (err, html) => {
            if (err) {
                return console.error(err);
            }

            /*await req.utils.nodemailer.sendMail({
                from: req.env.nodemailer.username,
                to: users._information.address,
                subject: `Thank you for registering on our site, ${users.username}.`,
                html: html
            });*/
        });

        res.redirect('/login');
    });
});

router.post('/', async (req, res, next) => {
    if (req.session._uuid) {
        return res.redirect('/dashboard');
    }

    next();
}, async (req, res) => {
    const {
        avatar_url,
        fn,
        ln,
        address,
        bio,
        employed,
        telephone,
        birthday,
        username,
        password,
    } = req.body;

    if (await req.db.db(req.env.realm.db).collection('users').findOne({
        username: username
    })) {
        return res.json({
            err: {
                elements: ['#username'],
                xhr: {
                    username: 'You have provided an already in-use username.'
                },
                async: true
            }
        });
    }

    if (await req.db.db(req.env.realm.db).collection('users').findOne({
        "_information.address": address
    })) {
        return res.json({
            err: {
                elements: ['#address'],
                xhr: {
                    address: 'You have provided an already in-use address.'
                },
                async: true
            }
        });
    }

    const _uuid = uuid.v4();
    const _apis = {
        _: uuid.v4(),
        github: false,
        twitter: false
    };

    await req.db.db(req.env.realm.db).collection('users').insertOne({
        _id: new BSON.ObjectID(),
        _apis: _apis,
        _information: {
            img: avatar_url,
            fn: fn,
            ln: ln,
            address: address,
            bio: bio,
            employed: employed,
            telephone: telephone,
            birthday: birthday
        },
        _options: {
            status: false,
            clearance: 1,
            _uuid: _uuid,
            notifications: [{
                _id: new BSON.ObjectID(),
                authors: {
                    profile: 'logo.svg',
                    username: 'Acolytes'
                },
                notification: `<i class="font-semibold">${username}</i> has just registered.`,
                _moment: moment().format()
            }]
        },
        username: username,
        password: crypto.createHash('sha256').update(password).digest('base64')
    });

    await req.db.db(req.env.realm.db).collection('users').findOne({
        username: username
    }).then(async (users) => {
        req.app.render('emails/registration', {
            layout: false,
            fullname: users.username,
            username: users.username,
            address: users._information.address
        }, async (err, html) => {
            if (err) {
                return console.error(err);
            }

            /*await req.utils.nodemailer.sendMail({
                from: req.env.nodemailer.username,
                to: users._information.address,
                subject: `Thank you for registering on our site, ${users.username}.`,
                html: html
            });*/
        });

        res.json({
            err: false,
            _id: users._id,
            xhr: {
                uuid: users._options._uuid,
                url: '/login',
                async: true
            }
        });
    });
});

module.exports = this;