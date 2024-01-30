const fs = require('fs');
const path = require('path');

module.exports = ['getViews', (args) => {
    if (!args) return;

    return args.indexOf('%20') >= 0 ? args.slice(args.indexOf('%20') + 3) : args;
}, 'hasViews', (args) => {
    if (!args) return;

    const filters = ['sign-in', 'sign-up', '404'];

    return filters.indexOf(args) >= 0 ? false : true;
}];