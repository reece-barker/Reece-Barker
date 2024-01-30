this.$ = new Object();

const {
    BSON
} = require('mongodb-stitch-browser-sdk');

const moment = require('moment');

const express = require('express');
const router = this.$.router = express.Router();
const path = this.$.path = ['/collaboration/articles'][0];

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
        return req.app.render(`libraries/${path}`, {
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

router.get('/:_id', async (req, res, next) => {
    if (!req.session._uuid) {
        return res.redirect('/login');
    }

    next();
}, async (req, res) => {
    const {
        hbs
    } = req.query;

    const {
        _id
    } = req.params;

    if (hbs) {
        return req.app.render(`libraries/${path}`, {
            layout: false,
            _url: `${path}?hbs=true`,
            location: req.session.location || false,
            users: res.locals.session.users || false,
            articles: await req.db.db(req.env.realm.db).collection('articles').findOne({ _id: new BSON.ObjectID(_id) })
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
        users: res.locals.session.users || false,
        articles: await req.db.db(req.env.realm.db).collection('articles').findOne({ _id: new BSON.ObjectID(_id) })
    });
});

router.post('/', async (req, res, next) => {
    if (!req.session._uuid) {
        return res.status(403).json({
            err: true
        });
    }

    next();
}, async (req, res) => {
    const {
        tag,
        description,
        genre
    } = req.body;

    await req.db.db(req.env.realm.db).collection('articles').insertOne({
        _id: new BSON.ObjectID(),
        _information: {
            author: await req.db.db(req.env.realm.db).collection('users').findOne({ _id: req.session.users._id }),
            tag: tag,
            description: description,
            genre: genre,
            _moment: moment().format()
        },
        _options: {
            rating: false,
            replies: [],
            status: true,
        }
    }).then(async (articles) => {
        return res.json({
            err: false
        });
    });
});

module.exports = this;