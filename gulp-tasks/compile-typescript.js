var gulp = require('gulp');
var tsc = require('gulp-typescript');

var tsProject = tsc.createProject("tsconfig.json");
const BUILD_DIR = "dist";

gulp.task('tsc:dev', function() {

    var tsResult = tsProject.src().pipe(tsc(tsProject));
    return tsResult.js.pipe(gulp.dest(BUILD_DIR));

});