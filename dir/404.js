this.$ = new Object();

const express = require('express');
const router = this.$.router = express.Router();
const path = this.$.path = ['/404'][0];

router.get('/', async (req, res) => {
    res.status(404).render('404', {
        layout: '2',
        _url: '/404',
        users: res.locals.session.users || false
    });
});

module.exports = this;