var gulp = require("gulp");

const BUILD_DIR = "dist";

gulp.task("copy:assets", function() {

  return gulp.src(["src/config/**"], {base: "./src"}).pipe(gulp.dest(BUILD_DIR));

});