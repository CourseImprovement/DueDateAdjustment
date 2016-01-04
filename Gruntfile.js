module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      norm: {
        src: ['src/valence.js', 'src/filter.js', 'src/moment.js', 'src/picker.js', 'src/sort.js', 'src/topic.js', 'src/ui.js', 'src/topics.js'],
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