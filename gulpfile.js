var gulp = require("gulp");
var watch = require("gulp-watch");
var plumber = require("gulp-plumber");
var sourcemaps = require("gulp-sourcemaps");
var sass = require("gulp-ruby-sass");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var uglify = require("gulp-uglify");
var livereload = require("gulp-livereload");
var browserify = require("browserify");
var rename = require("gulp-rename");
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var watchify = require('watchify');
var babelify = require('babelify');

var JSDEST = "./js";
var CSSDEST = "./stylesheets";


function styles() {
  return sass("./src/stylesheets/main.scss", {
      sourcemap: true,
      style: "expanded"
    })
    .on("error", sass.logError)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    /*  .pipe(sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: 'src/stylesheets/maps'
      }))*/
    .pipe(autoprefixer({
      browsers: ["ie >=9", "> 1%"],
      cascade: false
    }))
    .pipe(cssnano())
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(sourcemaps.write('.', {
      includeContent: true,
      sourceRoot: '/src/stylesheets'
    }))
    .pipe(gulp.dest(CSSDEST))
    .pipe(livereload());
}

function scripts(watch) {
  var b = browserify({
    entries: "./src/js/main.js",
    debug: true,
    cache: {},
    packageCache: {},
    plugin: [watchify]
  }).transform(babelify.configure({
    presets: ["es2015", "stage-0"]
  }))

  if (watch === true) {
    b.on('update', bundle);
  }
  bundle();

  function bundle() {

    b.bundle()
    .on('error', function(err) {
       console.log(err.message);
       this.emit('end');
     })
      .pipe(plumber())
      .pipe(source("main.js"))
      .pipe(buffer())
        .pipe(sourcemaps.init({
          loadMaps: true
        }))
        .pipe(uglify())
        .pipe(rename({
          extname: ".min.js"
        }))
        .pipe(sourcemaps.write('.', {
          includeContent: true,
          sourceRoot: '/'
        }))
      .pipe(gulp.dest(JSDEST))
  }
  // .bundle()
  //   .on('error', function(err) {
  //     console.log(err.message);
  //     this.emit('end');
  //   })
  //   .pipe(plumber())
  //   .pipe(source("main.js"))
  //   .pipe(buffer())
  //   .pipe(sourcemaps.init({
  //     loadMaps: true
  //   }))
  //   .pipe(uglify())
  //   .pipe(rename({
  //     extname: ".min.js"
  //   }))
  //   .pipe(sourcemaps.write('.', {
  //     includeContent: true,
  //     sourceRoot: '/'
  //   }))
  //   .pipe(gulp.dest(JSDEST))
  //   .pipe(livereload());
}
/*

function liveCSS() {
  return gulp.src("./dist/stylesheets/main.css")
  .pipe(autoprefixer({
    browsers: ['ie >= 9', "> 1%"],
    cascade:false
  }))
  .pipe(cssnano())
  .pipe(rename({
    extname:".min.css"
  }))
  .pipe(gulp.dest("./dist/stylesheets"))
}

*/




gulp.task("styles", styles);

gulp.task("scripts", scripts)

gulp.task("watch", function() {
  watch("src/**/*.scss", styles);
  scripts(true);
  livereload.listen();
})
