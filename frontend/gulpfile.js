const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');
const rename = require('gulp-rename');

const isProduction = process.env.NODE_ENV === 'production';

// Debug task to log files being processed
gulp.task('debug-sass', function() {
    return gulp.src('src/sass/**/*.{sass,scss}')
        .pipe(gulp.dest('debug'));
});

// Main Sass compilation task
gulp.task('sass', function() {
    return gulp.src('src/sass/style.sass')  // Main entry file
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src/sass'],
            indentedSyntax: true, // true for .sass
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(gulpif(isProduction, cleanCSS()))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('src/assets/css'))
        .pipe(browserSync.stream());
});

// Watch task with proper BrowserSync configuration
gulp.task('watch', function() {
    browserSync.init({
        proxy: "localhost:4001",
        port: 4002,
        ui: {
            port: 4003
        },
        open: false,
        notify: false,
        ghostMode: false,
        // Handle websocket connection properly
        ws: true,
        // Add middleware to handle webpack dev server
        middleware: function(req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            next();
        }
    });

    // Watch all sass files
    gulp.watch('src/sass/**/*.{sass,scss}', gulp.series('sass'));
    
    // Watch for changes in React files
    gulp.watch([
        'src/**/*.{js,jsx}',
        'public/**/*.html'
    ]).on('change', browserSync.reload);
});

// Default task
gulp.task('default', gulp.series('sass', 'watch'));

// Build task
gulp.task('build', gulp.series('sass'));