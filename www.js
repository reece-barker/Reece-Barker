const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const cors = require('cors');

const crypto = require('crypto');
const moment = require('moment');
const uuid = require('uuid');

const clc = require('cli-color');
const clt = require('cli-table');

this.session = require('connect-mongodb-session')(session);
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { networkInterfaces } = require('os');

const Realm = require('realm');
const {
    BSON
} = require('mongodb-stitch-browser-sdk');

const client = express();
const https = require('https').createServer({
    cert: fs.readFileSync(`./ssl/reece-barker_co.crt`, {
        encoding: 'utf8'
    }),
    ca: fs.readFileSync(`./ssl/reece-barker_co.ca-bundle`, {
        encoding: 'utf8'
    }),
    key: fs.readFileSync(`./ssl/reece-barker_co.key`, {
        encoding: 'utf8'
    })
},
    client);
const io = require('socket.io')(https);

const utils = require(`./env.js`);
const env = require(path.join(process.cwd(), '/env.json'))

fs.writeFile(path.join(process.cwd(), '/bin/hbs/4.hbs.js'), `
    module.exports = ['URL', (url) => {
        return 'https://${process.env.DOMAIN}/' + url;
    }];
`, (err) => {
    if (err) return console.error(err);
});

client.set('session', session({
    genid: () => {
        return uuid.v4();
    },
    secret: uuid.v4(),
    store: new this.session({
        uri: process.env.URI + `retryWrites=${process.env.RETRYWRITES}&w=${process.env.W}`,
        collection: env.mongodb.collection
    }),
    resave: true,
    saveUninitialized: false
}));

client.set('hbs', exphbs.create({
    extname: '.hbs',
    defaultLayout: '1',
    partialsDir: `./views/partials`,
    layoutsDir: `./views/layouts`,
    helpers: utils.hbs()
}));

client.engine('hbs', client.get('hbs').engine);
client.set('trust proxy', 1);
client.set('view engine', 'hbs');

client.use(client.get('session'));
client.use(express.json());

client.use(cors({
    origin: `*.${process.env.DOMAIN}`.replace('www.', '')
}));

client.use('/utils', express.static(`./bin`));

client.use(require('cookie-parser')());
client.use(require('body-parser').urlencoded({
    extended: true
}));

client.use(async (req, res, next) => {
    req.io = io;
    req.env = env;
    req.db = await utils.db();
    req.tls = utils.tls;
    req.utils = utils;
    req.ev = utils.ev;

    next();
});

client.use(async (req, res, next) => {
    if (!req.cookies['_uuid'] && req.session._uuid) {
        await req.session.regenerate(async (err) => {
            if (err) {
                console.error(err);
            }
        });
    } else if (req.cookies['_uuid'] !== req.session._uuid) {
        await req.session.regenerate(async (err) => {
            if (err) {
                console.error(err);
            }
        });
    }

    next();
});

client.use(async (req, res, next) => {
    res.locals.session = req.session._uuid ? {
        _id: req.session.users._id,
        _uuid: req.session._uuid,
        status: true,
        users: await req.db.db(req.env.realm.db).collection('users').findOne({
            _id: req.session.users._id
        })
    } : false;

    next();
});

process.stdout.write(clc.reset);

https.listen(process.env.PORT, async () => {
    process.stdout.write(clc.yellow(`\nhttps://${process.env.DOMAIN}/`));
});

this.__init__ = async (dir, files) => {
    let _dir = await fs.readdirSync(dir);

    for (let i in _dir) {
        let v = `${dir}/${_dir[i]}`;

        if (fs.statSync(v).isDirectory()) {
            await this.__init__(v, files);
        } else {
            files.push(v);
        }
    }

    return files;
}

this.__init__(`./dir`, utils.ev).then(async (_v_) => {
    const routes = [];
    let _v = [];

    _v_.forEach(async (file) => {
        if (!file.includes('.DS_Store')) {
            _v.push(file);
        }
    });

    (async () => {
        _v.forEach(async (__v) => {
            const v = require(__v);

            routes.push(v.$.path);
            client.use(v.$.path, v.$.router);
        });
    })().then(async () => {
        client.get('*', async (req, res, next) => {
            if (routes.indexOf(req.path) >= 0) return;

            next();
        }, async (req, res) => {
            res.status(404).render('404', {
                layout: '2',
                _url: '/404',
                users: res.locals.session.users
            });
        });
    });
});

client.get('/', async (req, res) => {    
    let projects = [];

    await req.db.db(req.env.realm.db).collection('projects').find({}).then(async (prjs) => {
        let prj = [];
        let prj_before = prjs;
    
        for (var i = 0; i < prj_before.length; i++) {        
            prj.push(prj_before[i]);
        }
    
        projects = prj.reverse();
    });

    res.render('@', {
        layout: '2',
        _url: '/',
        users: res.locals.session.users,
        projects: projects
    });
});