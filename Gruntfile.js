module.exports = function(grunt){
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		concat:{
			spaseed:{
				src:['spaseed/~.js'],
				dest:'dest/spaseed.js'
			},
			app:{
				src:['app/~.js'],
				dest:'dest/app.js'
			}
		},
		watch:{
			files:[
				'spaseed/~.js','spaseed/~.tpl','spaseed/~.ejs',
                'app/~.js','app/~.tpl','app/~.ejs'
            ],
			tasks:['concat']
		},
		yuidoc: {
		    compile: {
		      name: '<%= pkg.name %>',
		      description: '<%= pkg.description %>',
		      version: '<%= pkg.version %>',
		      options: {
		        paths: ['spaseed'],
		        themedir: 'docs/themes/default',
		        outdir: 'docs/app/'
		      }
		    }
		},
		mocha: {
			all: {
			  src: ['test/index.html'],
			  options: {
			    run: true
			  }
			}
		}
	});
	grunt.loadNpmTasks('grunt-qc-concat');
	grunt.loadNpmTasks('grunt-qc-watch');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-mocha');

    grunt.registerTask('default',['concat','yuidoc','watch']);
    grunt.registerTask('test',['mocha:all']);
}