const { src, dest, watch, parallel, series } = require('gulp');
const sass   		= require('gulp-sass') (require('sass'));
const concat 		= require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify 		= require('gulp-uglify-es').default;
const autoPrefixer= require('gulp-autoprefixer');
const imagemin 	= require('gulp-imagemin');
const del			 = require('del');
let pug = require('gulp-pug');



function pugIN () {
	return src('app/pages_pug/**/*.pug')
	.pipe(pug({
		pretty: true
	}))
	.pipe(dest('app'))
}



function cleanDist() {
	return del('dist')
}


function styles () {
	return src('app/scss/main.scss')
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(concat('style.min.css'))
		.pipe(autoPrefixer({
			overrideBrowserslist: ['last 10 version'],
			grid: true
		}))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function watching() {
	watch(['app/scss/**/*.scss'], styles);
	watch([ 'app/js/**/*.js','!app/js/main.min.js'], scripts);
	watch('app/*html').on('change', browserSync.reload);
	watch(['app/pages_pug/**/*.pug'], pugIN )
}

function browsersync() {
	browserSync.init({
		server: {
			baseDir: './app'
		}
	});
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'app/js/main.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream());
	
}

function build() {
	return src([
		'app/css/style.min.css',
		'app/fonts/**/*',
		'app/js/main.min.js',
		'app/*.html',
	], {base: 'app'})
	
	.pipe(dest('dist'))
}

function images() {
	return src('app/images/**/*')
		.pipe(imagemin(
			[
				imagemin.gifsicle({interlaced: true}),
				imagemin.mozjpeg({quality: 75, progressive: true}),
				imagemin.optipng({optimizationLevel: 5}),
				imagemin.svgo({
					 plugins: [
						  {removeViewBox: true},
						  {cleanupIDs: false}
					 ]
				})
		  ]))
	.pipe(dest('dist/images'))
}



exports.styles = styles;
exports.watching = watching;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
exports.pugIN = pugIN;

exports.build = series(cleanDist, build,  images);
exports.default = parallel(  styles, scripts, pugIN, browsersync, watching );


