let gulp;

let nodemon;

const clc = require('cli-color');
const clt = require('cli-table');

const spinner = require('./bin/srv/spinner');

let js;
let scss;

const declareVariablesSpinner = new spinner();
const bundleCSSSpinner = new spinner();
const bundleJSSpinner = new spinner();
const cleanupFilesSpinner = new spinner();

const declareVariables = async () => {
    declareVariablesSpinner.start('blue', 'Importing all of the required modules from NodeJS...', 'white', 0);

    gulp = {
        'gulp': require('gulp'),
        'gulp-sass': require('gulp-sass'),
        'gulp-sass-glob': require('gulp-sass-glob'),
        'gulp-postcss': {
            'gulp-postcss': require('gulp-postcss'),
            'postcss-css-variables': require('postcss-css-variables'),
            'postcss-calc': require('postcss-calc')
        },
        'autoprefixer': require('autoprefixer'),
        'gulp-concat': require('gulp-concat'),
        'gulp-rename': require('gulp-rename'),
        'gulp-uglify': require('gulp-uglify'),
        'gulp-livereload': require('gulp-livereload'),
        'gulp-browserify': require('gulp-browserify')
    }

    gulp['gulp-sass'].compiler = require('node-sass');

    nodemone = require('nodemon');

    js = [
        'bin/js',
        {
            bin: 'bin/js/bin/*.js',
            modules: 'bin/js/modules/*.js',
            dir: 'bin/js/.dir'
        }
    ];

    scss = [
        'bin/scss',
        {
            bin: 'bin/scss/**/*.scss',
            modules: 'bin/scss/**/*.scss',
            dir: 'bin/scss/.dir'
        }
    ];
};

const bundleCSS = async () => {
    bundleCSSSpinner.start('blue', 'Bundling all of the SCSS files and coverting them into CSS...', 'white', 1);

    gulp.gulp.task('scss', () => {
        return gulp.gulp.src([scss[1].bin, scss[1].modules])
            .pipe(gulp['gulp-sass-glob']())
            .pipe(gulp['gulp-sass']({
                outputStyle: 'compressed'
            }).on('error', gulp['gulp-sass'].logError))
            .pipe(gulp['gulp-postcss']['gulp-postcss']([gulp.autoprefixer()]))
            .pipe(gulp['gulp-rename']('~css.css'))
            .pipe(gulp.gulp.dest(scss[1].dir))
            .pipe(gulp['gulp-livereload']())
            .pipe(gulp['gulp-rename']('~css.min.css'))
            .pipe(gulp['gulp-postcss']['gulp-postcss']([gulp['gulp-postcss']['postcss-css-variables'](), gulp['gulp-postcss']['postcss-calc']()]))
            .pipe(gulp.gulp.dest(scss[1].dir));
    });
}

const bundleJS = async () => {
    bundleJSSpinner.start('blue', 'Bundling all of the necessary JavaScript files...', 'white', 2);

    gulp.gulp.task('js', () => {
        return gulp.gulp.src([js[1].bin, js[1].modules])
            /*.pipe(browserify({
                transform: ['babelify'],
                insertGlobals: true,
            }))*/
            .pipe(gulp['gulp-concat']('~js.js'))
            .pipe(gulp.gulp.dest(js[1].dir))
            .pipe(gulp['gulp-livereload']())
            .pipe(gulp['gulp-rename']('~js.min.js'))
            .pipe(gulp['gulp-uglify']())
            .pipe(gulp.gulp.dest(js[1].dir))
            .pipe(gulp['gulp-livereload']());
    });
}

const watchBundle = async () => {
    cleanupFilesSpinner.start('blue', 'Cleaning up all the necessary file structures...', 'white', 3);

    gulp.gulp.task('watch', gulp.gulp.series(['scss', 'js'], () => {
        gulp['gulp-livereload'].listen();

        nodemon({
            script: '@.js',
            stdout: true
        }).on('readable', () => {
            this.stdout.on('data', (chunk) => {
                if (/^listening/.test(chunk)) {
                    gulp['gulp-livereload'].reload();
                }

                process.stdout.write(chunk);
            });
        });

        gulp.gulp.watch([scss[1].bin, scss[1].modules], gulp.gulp.series(['scss']));
        gulp.gulp.watch([js[1].bin, js[1].modules], gulp.gulp.series(['js']));
    }));
}

process.stdout.write(clc.reset);

declareVariables().then(async () => {
    setTimeout(async () => {
        declareVariablesSpinner.stop('green', 'All of the necessary modules have been imported.', 'white', 0);

        bundleCSS().then(async () => {
            setTimeout(() => {
                bundleCSSSpinner.stop('green', 'All of the SCSS files have been bundled and converted successfully to CSS.', 'white', 1);

                bundleJS().then(async () => {                        
                    setTimeout(() => {
                        bundleJSSpinner.stop('green', 'All the necessary JavaScript files have been bundled.', 'white', 2);

                        watchBundle().then(async () => {
                            setTimeout(() => {
                                cleanupFilesSpinner.stop('green', 'File structures have been cleaned up.', 'white', 3);

                                process.stdout.write(clc.yellow('\nBundle process is complete, please make sure your output files are correct.'));
                                process.stdout.write(clc.red.bold('\nThis bundler is currently only supported for Node version 16.17.0!\n'));
                            }, 5000);
                        });
                    }, 5000);
                });
            }, 5000);
        });
    }, 5000);
});