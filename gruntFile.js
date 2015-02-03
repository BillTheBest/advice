'use strict';

module.exports = function(grunt) {
    var port = '9000';
    var connect = require('./node_modules/grunt-contrib-connect/tasks/connect');

    grunt.initConfig({

        karma: {
            test: {
                configFile: 'karma.conf.js'
            }
        },

        connect: {
            all: {
                options:{
                    port: 9000,
                    hostname: "0.0.0.0",
                    // Prevents Grunt to close just after the task (starting the server) completes
                    // This will be removed later as `watch` will take care of that
                    keepalive: true
                }
            }
        },

        // grunt-open will open your browser at the project's URL
        open: {
            all: {
                // Gets the port from the connect configuration
                path: 'http://localhost:<%= connect.all.options.port%>/bin/'
            }
        },
        shell: {
            "github-pages-checkout": {
                command: 'git checkout gh-pages'
            },
            "github-pages-push": {
                command: 'git commit -A -m "Docs for github"  & git push github'
            }
        },
        clean: {
            docs: ["*", "!doc/*", "!index.html"]
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-shell-spawn');

    // Creates the `server` task
    grunt.registerTask('default',[
        // Open before connect because connect uses keepalive at the moment
        // so anything after connect wouldn't run
        'karma:test',
        'open',
        'connect'
    ]);

    // Creates the `server` task
    grunt.registerTask('docs', ['shell:github-pages-checkout','clean:docs','shell:github-pages-push']);
};