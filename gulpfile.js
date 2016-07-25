var gulp = require("gulp");
var runSequence = require("run-sequence");

// Requre the gulp tasks
require("require-dir")("gulp-tasks");

gulp.task("default", function(){

    runSequence([
       "clean",
       "tsc:dev",
       "copy:assets"
    ]);

});