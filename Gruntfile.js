module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      norm: {
        src: ['src/valence.js', 'src/filter.js', 'src/moment.js', 'src/picker.js', 'src/sort.js', 'src/topic.js', 'src/ui.js', 'src/topics.js'],
        dest: 'build/duedateadjustment.js'
      },
      server: {
        src: 'build/newduedateadjustment.js',
        dest: '/Volumes/chase/duedateadjustment.js'
      },
      newBuild: {
        src: ['new/lib/byui.js', 'new/ui.js', 'new/items.js', 'new/item.js', 'new/table.js', 'new/valence.js', 'new/init.js', 'new/lib/moment.js', 'new/lib/filter.js', 'new/lib/picker.js', 'new/lib/tablesort.js'],
        dest: 'build/newduedateadjustment.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat:newBuild', 'concat:server']);
};  