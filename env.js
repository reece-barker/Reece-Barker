const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const env = require(path.join(process.cwd(), '/env.json'));
require('dotenv').config();

module.exports = {
    hbs: () => {
        let hbs = {};

        fs.readdir(path.join(process.cwd(), '/bin/hbs'), (err, files) => {
            files.forEach((file) => {
                require(path.join(process.cwd(), `/bin/hbs/${file}`)).forEach((_hbs, i, __hbs) => {
                    if (typeof _hbs == 'function') {
                        hbs[__hbs[i - 1]] = _hbs;
                    }
                });
            });
        });

        return hbs;
    },
    ev: [],
    db: async () => {
        const realm = Realm.App.getApp(env.realm._id);

        let credentials = await Realm.Credentials.emailPassword(process.env._USERNAME, process.env.PASSWORD);

        const user = await realm.logIn(credentials);
        
        return user.mongoClient(env.realm._atlas);
    }/*,
    nodemailer: nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.TLS_USERNAME,
            pass: process.env.TLS_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    })*/
}