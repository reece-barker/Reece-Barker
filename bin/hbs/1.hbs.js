module.exports = ['toUpperCase', (args) => {
    if (!args) return;

    if (!Array.isArray(args)) {
        return args.charAt(0).toUpperCase() + args.slice(1).toLowerCase();
    }

    args[0] = args[0].split(' ');

    if (args[1]) {
        args[0].forEach((_args, i, _) => {
            if (args[1].indexOf(_args) >= 0) return;

            _[i] = _args.charAt(0).toUpperCase() + _args.slice(1).toLowerCase();
        });
    }

    return args[0].join(' ');
}, 'toLowerCase', (args) => {
    if (!args) return;

    if (!Array.isArray(args)) {
        return args.charAt(0).toLowerCase() + args.slice(1).toLowerCase();
    }

    args[0] = args[0].split(' ');

    if (args[1]) {
        args[0].forEach((_args, i, _) => {
            if (args[1].indexOf(_args) >= 0) return;

            _[i] = _args.charAt(0).toLowerCase() + _args.slice(1).toLowerCase();
        });
    }

    return args[0].join(' ');
}];