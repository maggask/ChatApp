module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			foo: {
				src: [
					"src/js/*.js",
					"src/js/services/*.js",
					"src/js/directives/*.js",
					"src/js/controllers/*.js",
					],
				},
			},
			concat: {
				options: {
					separator: ';',
				},
				dist: {
					src: ['src/js/app.js', 'src/js/services/socket.js', 'src/js/controllers/login.js', 'src/js/controllers/room.js', 'src/js/controllers/rooms.js'],
					dest: 'build/built.js',
				},
			},
			// From https://github.com/gruntjs/grunt-contrib-uglify
			uglify: {
				my_target: {
					files: {
						'build/chatapp.min.js': ['build/built.js']
					}
				}
			},
			// From https://github.com/gruntjs/grunt-contrib-connect
			connect: {
				server: {
					options: {
						port: 8081,
						keepalive: true,
						livereload: false,
						open:true,
					}
				}
			}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'connect']);
};