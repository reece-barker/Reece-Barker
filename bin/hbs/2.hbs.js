module.exports = ['getLength', (args) => {
    if (!args) return;

    return args.length <= 0 ? '0' : args.length;
}, 'hasLength', (args) => {
    if (!args) return;

    return args.length <= 0 ? false : true;
}];

// /- hasLength (args: [STRING, LENGTH]) -/

// /- getLength (args: [STRING, ...]) -/