const process = require('process');
const rdl = require('readline');
const clc = require('cli-color');
const std = process.stdout;

class Spinner {
    start(colour, text, textColour, xy) {
        //process.stdout.write(clc.reset);

        process.stdout.write('\u001B[?25l');

        const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

        let index = 0;
        //let placeholder = false;

        this.interval = setInterval(() => {
            /*if (!placeholder) {
                process.stdout.write(clc.reset);
                placeholder = true;
            }*/

            let line = spinners[index];

            if (line === undefined) {
                index = 0;

                line = spinners[index];
            }

            let out = false;

            rdl.cursorTo(std, 0, xy);

            if (colour) {
                out = `${clc[colour](line)} ${clc[textColour](text)}`;
            } else {
                out = line;
            }

            if (!out) {
                process.stdout.write('Error! There was an error while trying to parse your Spinner.');
                return;
            } else {
                std.write(out);
            }

            rdl.cursorTo(std, 0, xy);

            index = index > spinners.length ? 0 : index == spinners.length ? 0 : index + 1;
        }, 100);
    }
    stop(colour, text, textColour, xy) {
        clearInterval(this.interval);

        rdl.cursorTo(std, 0, xy);
        rdl.clearLine(std, 0);

        process.stdout.write(`${clc[colour]('✔')} ${clc[textColour](text)}`)

        rdl.cursorTo(std, 0, xy + 1)

        process.stdout.write('\u001B[?25h');
    }
}

module.exports = Spinner