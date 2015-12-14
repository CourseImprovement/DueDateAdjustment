module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      norm: {
        src: ['src/valence.js', 'src/*.js'],
        dest: 'build/duedateadjustment.js'
      },
      server: {
        src: 'build/duedateadjustment.js',
        dest: '/Volumes/chase/duedateadjustment.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat:norm', 'concat:server']);
};  