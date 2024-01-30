const moment = require('moment');

module.exports = ['getTimes', (args) => {
    if (!args) return;

    if (moment(args).isValid()) {
        if (moment(args).isSameOrAfter(moment().add(1, 'day').format())) {
            return moment(args).format('MMMM Do YYYY');
        }
        return moment(args).fromNow();
    }

    return;
}, 'hasTimes', (args) => {
    if (!args) return;

    if (moment(args).isValid()) {
        return moment().isSameOrBefore(moment(args).add(1, 'd')) ? true : false;
    }
}];