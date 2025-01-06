const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const browserSync = require("browser-sync").create();
const sourcemaps = require("gulp-sourcemaps");

// paths
const paths = {
    sass: "./src/sass/**/*.{sass,scss}",
    css: "./src/assets/css",
};

// Compile SASS to CSS (Development)
function compileSassDev() {
  return gulp
    .src(paths.sass)
    .pipe(sourcemaps.init()) // Initialize sourcemaps
    .pipe(sass().on("error", sass.logError)) // Compile SASS/SCSS
    .pipe(sourcemaps.write(".")) // Write sourcemaps
    .pipe(gulp.dest(paths.css)) // Output to destination
    .pipe(browserSync.stream()); // Inject changes
}

// Live reload and watch
function watchFiles() {
    browserSync.init({
        server: {
        baseDir: "./",
        },
    });
          
    gulp.watch(paths.sass, compileSassDev); // Watch SASS/SCSS files
}

// Export tasks
exports.sassDev = compileSassDev;
exports.watch = watchFiles;
  
// Default task (Live development)
exports.default = gulp.series(compileSassDev, watchFiles);