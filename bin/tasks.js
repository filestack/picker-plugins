const { upload } = require('gulp-s3-publish');
const { S3 } = require('aws-sdk'); 

const tools = require('./tools');
const gulp = require('gulp');
const merge = require('merge-stream');
const webpack = require('webpack-stream');
const fs = require('fs');
const clean = require('gulp-clean');
const git = require('git-rev-sync');

const DIST_DIR = 'dist';

// HELPERS
let currentTag;
const currentBranch = git.branch();

try {
  currentTag = git.tag();
} catch(e) {
  console.log('Current Git Tag not found. Beta will be released');
}

console.info('Current GIT Branch is ', currentBranch);
console.info(`Current GIT Tag is`, currentTag);

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
  dryRun: false,
};

const client = new S3();

const uploadVersion = (name, version) => {
  return upload(client, {
    ...Object.assign({}, uploadOpts), 
    uploadPath: `${uploadOpts.uploadPath}/${name}/${version}`,
  }).on('error', (e) => {
    console.log(e);
    process.exit(1);
  });
}

gulp.task('publish', gulp.series(['bundle', async () => {
  const pkgList = tools.getPackages();
  console.log('Packages to publish:');

  const toDo = [];

  pkgList.forEach((pkg) => {
    const inputDir = `${pkg.path}/${DIST_DIR}/${pkg.version}/*`;

    if (currentTag && currentBranch === 'master') {
      // upload ie: 1.x.x
      toDo.push(gulp.src(inputDir).pipe(uploadVersion(pkg.name, `${pkg.majorVersion}.x.x`)));

      // upload full version ie: 1.2.3
      toDo.push(gulp.src(inputDir).pipe(uploadVersion(pkg.name, pkg.version)));
    } else {
      // upload branch
      toDo.push(gulp.src(inputDir).pipe(uploadVersion(pkg.name, 'beta')));
    }

    
  });

  return merge(toDo);
}]))
