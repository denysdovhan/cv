import { readFileSync as read } from 'fs';
import gulp        from 'gulp';
import data        from 'gulp-data';
import jade        from 'gulp-jade';
import stylus      from 'gulp-stylus';
import deploy      from 'gulp-gh-pages';
import remark      from 'remark';
import html        from 'remark-html';
import textr       from 'remark-textr';
import typographic from 'typographic-base';
import express     from 'express';
import moment      from 'moment';

import pkg from './package';

const render = () =>
  remark()
    .use(textr, { plugins: [ typographic ], options: { locale: 'en-us' } })
    .use(html)
    .process(read('README.md').toString());

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

gulp.task('build', ['styles', 'render']);

gulp.task('watch', ['build', 'server'], () => {
  gulp.watch(['styles/**/*'], ['styles']);
  gulp.watch(['**/*.{jade,md}'], ['render']);
});

gulp.task('server', () => {
  express().use(express.static('dist')).listen(8000);
  console.log('Server is running on http://localhost:8000');
});

gulp.task('deploy', ['build'], () =>
  gulp.src('dist/**/*')
    .pipe(deploy({
      push: true,
      message: `Update ${moment(new Date()).format('lll')}`
    }))
);

gulp.task('default', ['watch']);
