const { readFileSync: read } = require('fs');
const gulp        = require('gulp');
const data        = require('gulp-data');
const jade        = require('gulp-jade');
const stylus      = require('gulp-stylus');
const deploy      = require('gulp-gh-pages');
const remark      = require('remark');
const html        = require('remark-html');
const textr       = require('remark-textr');
const typographic = require('typographic-base');
const express     = require('express');
const moment      = require('moment');

const pkg = require('./package');

const render = () =>
  remark()
    .use(textr, { plugins: [ typographic ], options: { locale: 'en-us' } })
    .use(html)
    .processSync(read('README.md').toString());

gulp.task('styles', () =>
  gulp.src('styles/main.styl')
    .pipe(stylus())
    .pipe(gulp.dest('dist'))
);

gulp.task('render', () =>
  gulp.src('layout/index.jade')
    .pipe(data(() => ({
      pkg,
      content: render()
    })))
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest('dist'))
);

gulp.task('build', gulp.series('styles', 'render'));

gulp.task('server', () => {
  express().use(express.static('dist')).listen(8000);
  console.log('Server is running on http://localhost:8000');
});

gulp.task('watch', gulp.series('build', 'server', () => {
  gulp.watch(['styles/**/*'], ['styles']);
  gulp.watch(['**/*.{jade,md}'], ['render']);
}));

gulp.task('deploy', gulp.series('build', () =>
  gulp.src('dist/**/*')
    .pipe(deploy({
      push: true,
      message: `Update ${moment(new Date()).format('lll')}`
    }))
));

gulp.task('default', gulp.series('watch'));
