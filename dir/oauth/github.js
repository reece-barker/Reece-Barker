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
const path = this.$.path = ['/oauth/github'][0];

router.get('/', async (req, res, next) => {
    if (req.session._uuid) {
        return res.redirect('/dashboard');
    }

    next();
}, async (req, res) => {
    const {
        code
    } = req.query;

    const {
        access_token,
        token_type,
        scope
    } = (await superagent
        .post('https://github.com/login/oauth/access_token')
        .send({
            client_id: req.env.github.client_id,
            client_secret: req.env.github.client_secret,
            code: code
        })
        .set('Accept', 'application/json')).body;

    const {
        login,
        id,
        node_id,
        avatar_url,
        gravatar_id,
        type,
        site_admin,
        name,
        company,
        blog,
        location,
        email,
        hireable,
        bio,
        twitter_username,
        public_repos,
        public_gists,
        followers,
        following,
        created_at,
        updated_at,
        private_gists,
        total_private_repos,
        owned_private_repos,
        disk_usage,
        collaborators,
        two_factor_authentication
    } = (await superagent
        .get('https://api.github.com/user')
        .set('User-Agent', 'PostmanRuntime/7.26.8')
        .set('Authorization', `token ${access_token}`)).body;

    const encryption = await crypto.createHash('sha256').update(`${id}`).digest('base64');

    if (!await req.db.db(req.env.realm.db).collection('users').findOne({
        username: login,
        '_apis.github': encryption
    })) {
        return res.redirect(`/register/github?access_token=${access_token}`);
    }

    res.redirect(`/login/github?access_token=${access_token}`);
});

module.exports = this;