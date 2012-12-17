module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'tasks/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<%= jshint.files %>',
      tasks: 'default'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        trailing: true
      },
      globals: {
        exports: true
      }
    },
    csslint: {
      valid: 'test/valid.css',
      empty: 'test/empty.css',
      all: 'test/*.css'
    },
    cssmin: {
      options: { 
        banner: '/*my awesome css banner */'
      },
      plain: {
        src: 'test/valid.css',
        dest: 'valid.min.css'
      },
      banner: {
        src: ['<%= cssmin.options.banner %>', 'test/valid.css' ],
        dest: 'valid.min.banner.css'
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task. csslint:all will fail, that's okay until there's unit tests
  grunt.registerTask('default', 'jshint csslint'.split(' ') );

};
