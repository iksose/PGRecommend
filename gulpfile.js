var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var filesize = require('gulp-filesize');
var less = require('gulp-less');
var path = require('path');
var prefixer = require('gulp-autoprefixer');
var changed = require('gulp-changed');
var watch = require('gulp-watch');
var traceur = require('gulp-traceur');
var livereload = require('gulp-livereload');


/**
 * testing tasks (using karma to test in the browser). Requires a karma.conf.js for full config
 * single-run testing
 * continuous testing
 */

/** base deps, but you may need more specifically for your application */
var gulp = require('gulp');
var gutil = require('gulp-util');


//var PrettyError = require('pretty-error');

//var pe = new PrettyError();
var pe = require('pretty-error').start();

pe.appendStyle({
// this is a simple selector to the element that says 'Error'
   'pretty-error > header > title > kind': {

      // which we can hide:
      display: 'none'

   },

   // the 'colon' after 'Error':
   'pretty-error > header > colon': {

      // we hide that too:
      display: 'none'

   },

   // our error message
   'pretty-error > header > message': {

      // let's change its color:
      color: 'bright-white',

      // we can use black, red, green, yellow, blue, magenta, cyan, white,
      // grey, bright-red, bright-green, bright-yellow, bright-blue,
      // bright-magenta, bright-cyan, and bright-white

      // we can also change the background color:
      background: 'cyan',

      // it understands paddings too!
      padding: '0 1' // top/bottom left/right

   },

   // each trace item ...
   'pretty-error > trace > item': {

      // ... can have a margin ...
      marginLeft: 2,

      // ... and a bullet character!
      bullet: '"<grey>o</grey>"'

      // Notes on bullets:
      //
      // The string inside the quotation mark will be used for bullets.
      //
      // You can set its color/background color using tags.
      //
      // This example sets the background color to white, and the text color
      // to cyan, the character will be a hyphen with a space character
      // on each side:
      // example: '"<bg-white><cyan> - </cyan></bg-white>"'
      //
      // Note that we should use a margin of 3, since the bullet will be
      // 3 characters long.

   },

   'pretty-error > trace > item > header > pointer > file': {

      color: 'bright-cyan'

   },

   'pretty-error > trace > item > header > pointer > colon': {

      color: 'cyan'

   },

   'pretty-error > trace > item > header > pointer > line': {

      color: 'bright-cyan'

   },

   'pretty-error > trace > item > header > what': {

      color: 'bright-white'

   },

   'pretty-error > trace > item > footer > addr': {

      display: 'none'
    }
});

// var renderedError = pe.render(new Error('Some error message'));
// console.log(renderedError);

function HandleError(err){
  var renderedError2 = pe.render(new Error(err.message));
  console.log(renderedError2);
  // var renderedError2 = pe.render(err.message);
  // console.log(renderedError2);

  // console.log("LOL" + err.message)
  // gutil.log(err.message);

  // console.log(err);
  //console.log("Also", err.message);
}



gulp.task('vendor', function() {
  gulp.src('client/lib/*.js')
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('client/concat'))
    .pipe(filesize())
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(gulp.dest('client/concat'))
    .pipe(filesize())
    //.on('error', gutil.log)
    .on('error', HandleError)
});

gulp.task('scripts', function() {
  gulp.src('client/js/*.js')
    .pipe(concat('scripts.js'))
    .on('error', HandleError)
    .pipe(traceur({sourceMap: false, experimental: true}))
    .on('error', HandleError)
    .pipe(gulp.dest('client/concat'))
    .pipe(filesize())
    .pipe(uglify())
    .pipe(rename('scripts.min.js'))
    .pipe(gulp.dest('client/concat'))
    .pipe(filesize())
    //.on('error', gutil.log)
    .on('error', HandleError)
    .on('end', function(){
      var renderedError = pe.render('Successfully uglified');
      console.log(renderedError);
    })
});


// Compiles LESS > CSS
gulp.task('css', function(){
    return gulp.src('client/less/myapp.less')
        .pipe(less())
        .pipe(gulp.dest('client/concat/css'))
        .pipe(filesize())
        // .on('error', gutil.log);
        .on('error', HandleError)
});


// Watch Files For Changes
gulp.task('watch', function() {
    var server = livereload();
    gulp.watch('client/js/*.js', ['scripts']);
    gulp.watch('client/lib/*.js', ['vendor'])
    gulp.watch('client/less/*.less', ['css']);
    gulp.watch('client/concat/**').on('change', function(file) {
      console.log("Server changed")
      // var renderedError = pe.render('Server changed');
      // console.log(renderedError);
      server.changed(file.path);

  })
});

// Default Task
gulp.task('default', ['watch']);
