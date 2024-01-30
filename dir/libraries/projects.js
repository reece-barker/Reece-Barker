this.$ = new Object();

const express = require('express');
const router = this.$.router = express.Router();
const path = this.$.path = ['/projects'][0];

router.get('/:project', async (req, res) => {
    await req.db.db(req.env.realm.db).collection('projects').find({
        number: req.params.project
    }).then(async (project) => {
        return res.redirect(project.url);
    });
});

module.exports = this;