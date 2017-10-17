require('dotenv').config();
var gulp = require('gulp');
var replace = require('gulp-replace');
var fileinclude = require('gulp-file-include');
var livereload = require('gulp-livereload');
var htmlhint = require('gulp-htmlhint');
var minimist = require('minimist');
var imagemin = require('gulp-imagemin');
var nodemailer = require('nodemailer');
var http = require('http');
var st = require('st');
var fs = require('fs');
var path = require('path');

<% if (useLitmus) { %>
var litmus = require('gulp-litmus');
<% } %>


var knownOptions = {
    string: 'eml',
    default: { eml: process.env.NODE_ENV || process.env.GMAIL_EMAIL }
};

var options = minimist(process.argv.slice(2), knownOptions);

var imgLocation = '<%= imageLocation %>';
var fontStack   = 'Helvetica, arial, sans-serif';
var bgColour    = '#eeeeee';
var bodyColour  = '#ffffff';
var textColour  = '#666666';
var brandColour = '#ff6500';

<% if (useLitmus) { %>
var litmusOptions = {
    username: process.env.LITMUS_USERNAME,
    password: process.env.LITMUS_PASSWORD,
    url: 'https://'+ process.env.LITMUS_COMPANY +'.litmus.com',
    applications: [
        'ol2011',
        'ol2013',
        'outlookcom',
        'ffoutlookcom',
        'chromeoutlookcom',
        'yahoo',
        'ffyahoo',
        'chromeyahoo',
        'gmailnew',
        'ffgmailnew',
        'chromegmailnew',
        'androidgmailapp',
        'iphone5s',
        'iphone6',
        'iphone6plus',
        'iphone7',
        'ipad'
    ]
};
<% } %>

gulp.task('send', function () {
    var htmlEmail = fs.readFileSync('./dist/built/index.html', { encoding: 'utf8' });
    var mailOptions = {
        from: 'Piece Mail <' + process.env.GMAIL_EMAIL + '>',
        to: options.eml,
        subject: '<%= appname %>',
        html: htmlEmail
    };
    transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD
        }
    });
    transporter.sendMail(mailOptions, function(error, info) {
        "use strict";

        if ( error ) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
});

gulp.task('server', function(done) {
  http.createServer(
    st({ path: __dirname + '/dist', index: 'index.html', cache: false })
  ).listen(8008, done);
});

gulp.task('html', function() {
    gulp.src(['./src/*.html'])
    .pipe(fileinclude({
        prefix: '_',
        basepath: '@file'
    }))
    .pipe(replace('{{img-url}}', './images/'))
    .pipe(replace('{{font-stack}}', fontStack))
    .pipe(replace('{{bg-colour}}', bgColour))
    .pipe(replace('{{body-colour}}', bodyColour))
    .pipe(replace('{{text-colour}}', textColour))
    .pipe(replace('{{brand-colour}}', brandColour))
    .pipe(htmlhint())
    .pipe(htmlhint.reporter())
    .pipe(gulp.dest('./dist'))
});

gulp.task('build', function() {
    gulp.src(['./src/*.html'])
    .pipe(fileinclude({
        prefix: '_',
        basepath: '@file'
    }))
    .pipe(replace('{{img-url}}', imgLocation))
    .pipe(replace('{{font-stack}}', fontStack))
    .pipe(replace('{{bg-colour}}', bgColour))
    .pipe(replace('{{body-colour}}', bodyColour))
    .pipe(replace('{{text-colour}}', textColour))
    .pipe(replace('{{brand-colour}}', brandColour))
    .pipe(htmlhint())
    .pipe(htmlhint.reporter())
    .pipe(gulp.dest('./dist/built'))
});

gulp.task('images', function () {
    return gulp.src('./src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'));
});

gulp.task('watch', function () {
    gulp.watch(['./src/index.html', './src/pieces/*.html', './src/style.css'], ['html'])
    gulp.watch(['./src/images/*'], ['images'])
    livereload.listen();
    gulp.watch(['./dist/**']).on('change', livereload.changed);
});

<% if (useLitmus) { %>
gulp.task('test', function () {
    gulp.src('dist/built/index.html')
    .pipe(litmus(litmusOptions))
});
<% } %>

gulp.task('default', ['html', 'images', 'server', 'watch']);
