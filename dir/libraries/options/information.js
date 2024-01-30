this.$ = new Object();

const express = require('express');
const router = this.$.router = express.Router();
const path = this.$.path = ['/options/information'][0];

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

router.post('/', async (req, res, next) => {
    if (!req.session._uuid) {
        return res.redirect('/login');
    }

    next();
}, async (req, res) => {
    const {
        subject,
        description,
        rating
    } = req.body;

    await req.utils.nodemailer.sendMail({
        from: req.env.nodemailer.username,
        to: 'contact-us@mooonys.co',
        subject: `New Feedback: ${subject}`,
        html: description + `
        
        Rating:
        ${rating}
        `
    });

    res.json({
        err: false,
        _id: req.session.users._id,
        xhr: false
    });
});

module.exports = this;