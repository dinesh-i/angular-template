var gulp = require('gulp');
var config = require('./gulp.config')();
var del = require('del');
var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')({lazy: true});

gulp.task('ts:gen-defs', function() {
    var tsFiles = gulp.src([config.files.appts], {read: false});
    return gulp
        .src(config.appTsDefinition)
        .pipe($.inject(tsFiles, {
            starttag: '//{',
            endtag: '//}',
            transform: function(filePath) {
                return '/// <reference path="../' + filePath + '" />';
            }
        }))
        .pipe(gulp.dest(config.folders.typings));
});

gulp.task('styles', ['clean-styles'], function() {
    log('Converting LESS files to CSS stylesheets');

    return gulp
        .src(config.files.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.folders.devBuild));
});

gulp.task('clean-styles', function(done) {
    var files = config.folders.devBuild + '**/*.css';
    clean(files, done);
});

gulp.task('scripts', ['clean-scripts'], function() {
    log('Transpiling Typescript code to Javascript');

    var tsResult = gulp
        .src(config.files.appts)
        .pipe($.sourcemaps.init())
        .pipe($.typescript({
            target: 'ES6',
            declarationFiles: false,
            noExternalResolve: false
        }));

    var merge = require('merge2');
    return merge([
        tsResult.dts.pipe(gulp.dest(config.folders.devBuild + 'js')),
        tsResult.js
            .pipe($.sourcemaps.write('.'))
            .pipe(gulp.dest(config.folders.devBuild + 'js'))
    ]);
});

gulp.task('clean-scripts', function(done) {
    var files = config.folders.devBuild + '**/*.js';
    clean(files, done);
});

gulp.task('wiredep', function() {
    log('Injecting script and CSS references');

    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(config.wiredepOptions))
        .pipe(gulp.dest(config.folders.app))
});

gulp.task('inject', ['wiredep', 'scripts', 'styles'], function() {
    log('Injecting script and CSS references');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.files.appcss)))
        .pipe($.inject(gulp.src(config.files.appjs)))
        .pipe(gulp.dest(config.folders.app))
});

gulp.task('clean-dev', function(done) {
    clean(config.folders.devBuild, done);
});

gulp.task('build-dev', ['clean-dev', 'inject'], function(done) {
    done();
});

gulp.task('serve-dev', ['build-dev'], function(done) {
    startBrowserSync();
    done();
});

////////////////

function startBrowserSync() {
    if (browserSync.active){
        return;
    }

    log('Starting browser-sync session');

    var options = {
        proxy: 'ng.training:' + 80,
        port: 3000,
        files: [
            config.folders.app + '**/*.*',
            config.folders.assets + '**/*.*'
        ],
        ghostMode: {
            clicks: false,
            location: false,
            forms: false,
            scroll: false
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    };
    browserSync(options);
}

function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

function log(message) {
    if (typeof(message) === 'object') {
        for (var item in message) {
            if (message.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(message[item]))
            }
        }
    } else {
        $.util.log($.util.colors.blue(message));
    }
}
