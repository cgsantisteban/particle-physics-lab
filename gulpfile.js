'use strict'

const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const exec = require('child_process').exec;


//StackCounter plugin
let counterOptions = {
	cwd: __dirname + '/server/GAMOS/StackCounterPlugin'	
}

gulp.task('buildStackCounter', (cb)=> {
  exec('make clean;make',counterOptions, (err, stdout, stderr)=> {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

//Fit histogram
let fitOptions = {
		cwd: __dirname + '/server/ROOT/src'	
}

gulp.task('buildFitHistogram', (cb)=> {
  exec('make fitHistogram',fitOptions, (err, stdout, stderr)=> {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});


//Main
gulp.task('main',  ()=> {
	  gulp.src('public/js/ng/main.lab.js')
	  .pipe(concat('main.lab.min.js'))
	  .pipe(babel({
		  presets: ['es2015']
	  }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

//Controllers
gulp.task('includesCtrl',  ()=> {
	  gulp.src('public/js/ng/controllers/config/*.js')
	  .pipe(concat('includesCtrl.min.js'))
	  .pipe(babel({
          presets: ['es2015']
      }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

gulp.task('dataCtrl',  ()=> {
	  gulp.src('public/js/ng/controllers/data/**/*.js')
	  .pipe(concat('dataCtrl.min.js'))
	  .pipe(babel({
        presets: ['es2015']
	  }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

gulp.task('geometryCtrl',  ()=> {
	  gulp.src('public/js/ng/controllers/geometry/*.js')
	  .pipe(concat('geometryCtrl.min.js'))
	  .pipe(babel({
            presets: ['es2015']
        }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

gulp.task('sourceCtrl',  ()=> {
	  gulp.src('public/js/ng/controllers/sources/*.js')
	  .pipe(concat('sourceCtrl.min.js'))
	  .pipe(babel({
            presets: ['es2015']
        }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

gulp.task('histogramsCtrl',  ()=> {
	  gulp.src('public/js/ng/controllers/histograms/*.js')
	  .pipe(concat('histogramCtrl.min.js'))
	  .pipe(babel({
          presets: ['es2015']
      }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

gulp.task('mainCtrl',  ()=> {
	  gulp.src('public/js/ng/controllers/main/*.js')
	  .pipe(concat('mainCtrl.min.js'))
	  .pipe(babel({
          presets: ['es2015']
      }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

//directives
gulp.task('drawLab',  ()=> {
	  gulp.src('public/js/ng/directives/drawLaboratory.directive.js')
	  .pipe(concat('drawLaboratory.min.js'))
	  .pipe(babel({
          presets: ['es2015']
      }))
      .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

gulp.task('drawHistogram',  ()=> {
	  gulp.src('public/js/ng/directives/histograms/*.js')
	  .pipe(concat('drawHistogram.min.js'))
	  .pipe(babel({
        presets: ['es2015']
    }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

gulp.task('console',  ()=> {
	  gulp.src('public/js/ng/directives/console.directive.js')
	  .pipe(concat('console.directive.min.js'))
	  .pipe(babel({
      presets: ['es2015']
  }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

//factories
gulp.task('factories',  ()=> {
	  gulp.src('public/js/ng/factories/**/*.js')
	  .pipe(concat('factories.min.js'))
	  .pipe(babel({
      presets: ['es2015']
  }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});

//services
gulp.task('services',  ()=> {
	  gulp.src('public/js/ng/services/*.js')
	  .pipe(concat('services.min.js'))
	  .pipe(babel({
      presets: ['es2015']
  }))
	  .pipe(uglify({mangle: false}))
	  .pipe(gulp.dest('public/js/dist/'))
	});


gulp.task('default', ['buildStackCounter',
					'buildFitHistogram',
					'main',
					'services',
					'factories',
					'includesCtrl',
					'mainCtrl',
					'geometryCtrl',
					'sourceCtrl',
					'dataCtrl',
					'histogramsCtrl',
					'drawLab',
					'drawHistogram',
					'console'
]);
