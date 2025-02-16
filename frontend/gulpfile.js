const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');

const isProduction = process.env.NODE_ENV === 'production';

// Debug task to log files being processed
gulp.task('debug-sass', function() {
    return gulp.src('src/sass/**/*.{sass,scss}')
        .pipe(gulp.dest('debug')); // This will copy files to a debug folder
});

// Sass/SCSS Compilation
gulp.task('sass', function() {
    return gulp.src('src/sass/style.scss')  // Main entry point
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src/sass'],
            indentedSyntax: false, // false for .scss, true for .sass
            outputStyle: 'expanded', // This will make the output readable
            debug: true
        }).on('error', function(err) {
            console.error('Sass error:', err.message);
            // Display error in the browser
            browserSync.notify(err.message, 3000);
            this.emit('end');
        }))
        // .pipe(cleanCSS())  // fir
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('src/assets/css'))
        .pipe(browserSync.stream());
});

// Watch files
gulp.task('watch', function() {
    browserSync.init({
        proxy: "localhost:4001",  // Point to React dev server
        port: 4002  // BrowserSync will run on port 4002
    });

    // Watch all sass/scss files but compile only through style.scss
    gulp.watch('src/sass/**/*.{sass,scss}', gulp.series('sass'));
    gulp.watch('src/**/*.{js,jsx}').on('change', browserSync.reload);
});

// Default task (development)
gulp.task('default', gulp.series('sass', 'watch'));

// Build task (production)
gulp.task('build', gulp.series('sass'));