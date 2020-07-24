var syntax = 'scss'; // Syntax: sass or scss;

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	browsersync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleancss = require('gulp-clean-css'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache = require('gulp-cache'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	ftp = require('vinyl-ftp'),
	notify = require('gulp-notify'),
	rsync = require('gulp-rsync');

function browserSync() {
	return browsersync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
	})
};

function styles() {
	return gulp.src('app/' + syntax + '/**/*.' + syntax + '')
		.pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
		.pipe(rename({ suffix: '.min', prefix: '' }))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
		.pipe(gulp.dest('app/css'))
		.pipe(browsersync.reload({ stream: true }))
};

function scripts() {
	return gulp.src([
		'app/libs/jquery/jquery.min.js',
		'app/js/common.js', // Always at the end
	])
		.pipe(concat('scripts.min.js'))
		// .pipe(uglify()) // Minify js (opt.)
		.pipe(gulp.dest('app/js'))
		.pipe(browsersync.reload({ stream: true }))
};

gulp.task('rsync', function () {
	return gulp.src('app/**')
		.pipe(rsync({
			root: 'app/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// include: ['*.htaccess'], // Includes files to deploy
			exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
});

gulp.task('prebuild', async function () {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/css/main.min.css'
	])
		.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
		.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
		.pipe(gulp.dest('dist/js'))

	var buildFiles = gulp.src([
		'app/*.html',
	]).pipe(gulp.dest('dist'));

});

gulp.task('clean', async function () {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function () {
	return gulp.src('app/img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({ // С кешированием
			// .pipe(imagemin({ // Сжимаем изображения без кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngquant()]
		}))/**/)
		.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

var watchers = function () {
	gulp.watch('app/' + syntax + '/**/*.' + syntax + '', styles);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], scripts);
	gulp.watch('app/*.html').on('change', browsersync.reload)
}

gulp.task('watch', watchers);

gulp.task('default', gulp.parallel('watch', styles, scripts, browserSync));
gulp.task('build', gulp.parallel('prebuild', 'clean', 'img', styles, scripts));
