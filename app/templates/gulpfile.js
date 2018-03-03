require('dotenv').config();
var brandConfig = require('./brand-config.js');
var connect = require('gulp-connect');
var fileinclude = require('gulp-file-include');
var fs = require('fs');
var gulp = require('gulp');
var htmlhint = require('gulp-htmlhint');
var imagemin = require('gulp-imagemin');
var minimist = require('minimist');
var nodemailer = require('nodemailer');
var path = require('path');
var replace = require('gulp-token-replace');
var st = require('st');
var swap = require('gulp-replace');

<% if (useLitmus) { %>
var litmus = require('gulp-litmus');
<% } %>

var knownOptions = {
  string: 'eml',
  default: { eml: process.env.NODE_ENV || process.env.GMAIL_EMAIL }
};

var options = minimist(process.argv.slice(2), knownOptions);

gulp.task('connect', function () {
  connect.server({
    root: 'dist',
    port: 8008,
    livereload: true
  });
});

<% if (useLitmus) { %>
var litmusOptions = {
    username: process.env.LITMUS_USERNAME,
    password: process.env.LITMUS_PASSWORD,
    url: 'https://' + process.env.LITMUS_COMPANY + '.litmus.com',
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
    from: '"Piece Mail" <' + process.env.GMAIL_EMAIL + '>',
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
  transporter.sendMail(mailOptions, function (error, info) {
    "use strict";
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });
});

gulp.task('server', function (done) {
  http.createServer(
    st({ path: __dirname + '/dist', index: 'index.html', cache: false })
  ).listen(8008, done);
});

gulp.task('html', function () {
  gulp.src(['./src/*.html'])
    .pipe(fileinclude({
      prefix: '_',
      basepath: '@file'
    }))
    .on("error", errorHandler)
    .pipe(swap('{{img-url}}', '{{img-url.local}}'))
    .pipe(replace({ global: brandConfig }))
    .pipe(htmlhint())
    .pipe(htmlhint.reporter())
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('build', function () {
  gulp.src(['./src/*.html'])
    .pipe(fileinclude({
      prefix: '_',
      basepath: '@file'
    }))
    .on("error", errorHandler)
    .pipe(swap('{{img-url}}', '{{img-url.prod}}'))
    .pipe(replace({ global: brandConfig }))
    .pipe(htmlhint())
    .pipe(htmlhint.reporter())
    .pipe(gulp.dest('./dist/built'));
});

gulp.task('images', function () {
  return gulp.src('./src/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/images'));
});

gulp.task('watch', function () {
  gulp.watch(['./src/*.html', './src/pieces/**/*.html', './src/style.css'], ['html']);
  gulp.watch(['./src/images/**/*'], ['images']);
});
<% if (useLitmus) { %>
  gulp.task('test', function () {
    gulp.src('dist/built/index.html')
      .pipe(litmus(litmusOptions))
  });
<% } %>
  gulp.task('default', ['html', 'images', 'connect', 'watch']);
gulp.task('send', ['build', 'sendEmail']);

// Simple error handler.
function errorHandler(error) {
  console.log(error.toString());
  this.emit('end');
}
