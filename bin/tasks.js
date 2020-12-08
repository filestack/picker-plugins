const { upload } = require('gulp-s3-publish');
const { S3 } = require('aws-sdk'); 

const tools = require('./tools');
const gulp = require('gulp');
const merge = require('merge-stream');
const webpack = require('webpack-stream');
const fs = require('fs');
const clean = require('gulp-clean');

const DIST_DIR = 'dist';

gulp.task('cleanup:dist', () => {
  const pkgList = tools.getPackages();

  const tasks = pkgList.map((pkg) => {
    return gulp.src(`${pkg.path}/${DIST_DIR}`, { read: false, allowEmpty: true })
        .pipe(clean({ allowEmpty: true }));
  });

  return merge(tasks);
});

gulp.task('bundle', gulp.series(['cleanup:dist', () => {
  const pkgList = tools.getPackages();

  const tasks = pkgList.map((pkg) => {
    const manifest = require(`${pkg.path}/package.json`);

    const entry = manifest.main;
    const webpackCfgPath = `${pkg.path}/webpack.config.js`;
    let webpackCfg;

    if (fs.existsSync(webpackCfgPath)) {
      webpackCfg = require(webpackCfgPath);
    }

    return gulp.src(`${pkg.path}/${entry}`)
      .pipe(webpack(webpackCfg))
      .pipe(gulp.dest(`${pkg.path}/${DIST_DIR}/${manifest.version}`));
  });

  return merge(tasks);
}]));

const uploadOpts = {
  bucket: 'static.filestackapi.com',
  uploadPath: 'picker-plugins',
  putObjectParams: {
    ACL: 'public-read'
  },
  // dryRun: true,
};

const client = new S3();

gulp.task('publish', gulp.series(['bundle', async () => {
  const pkgList = tools.getPackages();
  const tasks = pkgList.map((pkg) => {
    const opts = Object.assign({}, uploadOpts)
    opts.uploadPath = `${opts.uploadPath}/${pkg.name}`; 

    return gulp.src(`${pkg.path}/${DIST_DIR}/**/*`).pipe(upload(client, opts));
  });

  return merge(tasks);
}]));
