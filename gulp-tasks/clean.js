var gulp = require("gulp");
var del = require('del');

const BUILD_DIR = "dist";

gulp.task('clean', function() {
    return del.sync([BUILD_DIR]);
});