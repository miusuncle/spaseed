module.exports = function(grunt){
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		concat:{
			lib:{
				src:['lib/~.js'],
				dest:'dest/lib.js'
			},
			main:{
				src:['main/~.js','config/~.js','modules/~.js','widget/~.js'],
				dest:'dest/main.js'
			}
		},
		watch:{
			files:[
                'modules/~.js','modules/~.tpl','modules/~.ejs',
                'widget/~.js','widget/~.tpl','widget/~.ejs',
                'main/~.js','main/~.tpl',
                'lib/~.js',
                'config/~.js'
            ],
			tasks:['concat']
		},
		yuidoc: {
		    compile: {
		      name: '<%= pkg.name %>',
		      description: '<%= pkg.description %>',
		      version: '<%= pkg.version %>',
		      options: {
		        paths: ['lib','main','config','widget'],
		        themedir: 'docs/themes/default',
		        outdir: 'docs/app/'
		      }
		    }
		 }
	});
	grunt.loadNpmTasks('grunt-qc-concat');
	grunt.loadNpmTasks('grunt-qc-watch');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');

    grunt.registerTask('default',['concat','yuidoc','watch']);
}