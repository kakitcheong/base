var gulp = require('gulp');

var $ = require("gulp-load-plugins")({
	pattern: ['gulp-*', 'gulp.*'],
	replaceString: /\bgulp[\-.]/
});

var env,
	jsSources,
	sassSources,
	htmlSources,
	outputDir,
	sassStyle;

env = process.env.NODE_ENV || 'development';

if (env === 'development' ){
	outputDir = 'builds/development/';
	sassStyle = 'expanded';
} else{
	outputDir = 'builds/production/';
	sassStyle = 'compressed';
}

// source paths
jsSources = [
	'components/scripts/_init.js'
];

sassSources = ['components/sass/style.scss'];

var sassPaths = [
  'builds/development/bower_components/foundation-sites/scss',
  'builds/development/bower_components/motion-ui/src'
];

htmlSources = ['builds/development/*.html'];

var onError = function (err) {  
	$.util.beep();
	console.log(err);
};

// tasks
gulp.task('log', function(){
		
});

gulp.task('js', function(){
	gulp.src(jsSources)
		.pipe($.plumber({
			errorHandler: onError
		}))
		.pipe($.concat('script.js'))
		.pipe($.if(env === 'production', $.uglify()))
		.pipe(gulp.dest(outputDir + 'js'))
		.pipe($.connect.reload())
});

gulp.task('compass', function(){
	gulp.src(sassSources)
		.pipe($.plumber({
			errorHandler: onError
		}))
		.pipe($.compass({
			css: outputDir + 'stylesheets',
			sass: 'components/sass',
			image: 'builds/development/images',
			import_path: sassPaths,
			style: sassStyle,
			require: [
				'modular-scale',
				'scut'
			]
		})
		.on('error', $.util.log))
		.pipe(gulp.dest(outputDir + 'stylesheets'))
		.pipe($.connect.reload())
});

gulp.task('watch', function(){
	gulp.watch(jsSources, ['js']);
	gulp.watch('components/sass/**/*.scss', ['compass']);
	gulp.watch(htmlSources, ['html']);
});

gulp.task('connect', function(){
	$.connect.server({
		root: 'builds/development/',
		livereload: true
	})
});

gulp.task('html', function(){
	gulp.src(htmlSources)
		.pipe($.plumber({
			errorHandler: onError
		}))
		.pipe($.connect.reload())
		.pipe($.if(env === 'production', gulp.dest(outputDir)))
});

gulp.task('images', function(){
	gulp.src('builds/development/images/**/*.*')
		.pipe($.plumber({
			errorHandler: onError
		}))
		.pipe($.gulpif(env === 'production', $.imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false }]
		})))
		.pipe($.gulpif(env === 'production', gulp.dest(outputDir + 'images')))
		.pipe(connect.reload())
});

gulp.task('bowerJS', function(){
	var filterJS = $.filter('**/*.js', { restore: true });
	gulp.src('builds/development/bower.json')
		.pipe($.mainBowerFiles())
		.pipe(filterJS)
		.pipe($.concat('vendor.js'))
		.pipe($.if(env === 'production', $.uglify()))
		.pipe(gulp.dest(outputDir + 'js'))
});

gulp.task('bowerCSS', function(){
	var filterCSS = $.filter('**/*.css', { restore: true });
	gulp.src('builds/development/bower.json')
		.pipe($.mainBowerFiles())
		.pipe(filterCSS)
		.pipe($.concat('vendor.css'))
		.pipe($.if(env === 'production', $.uglify()))
		.pipe(gulp.dest(outputDir + 'stylesheets'))
});

gulp.task('default', ['js', 'compass', 'html', 'connect', 'watch'] );