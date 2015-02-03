'use strict';

module.exports = function(grunt) {
    var port = '9000';
    var connect = require('./node_modules/grunt-contrib-connect/tasks/connect');
    var docFilePaths = ['advice.js'];
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
            "docker": {
                command: "docker advice.js"
            },
            "github-pages-checkout": {
                command: 'git branch -D gh-pages & git checkout gh-pages'
            },
            "github-pages-push": {
                command: 'git commit -A -m "Docs for github"  & git push github'
            }
        },
        clean: {
            docs: ["*", "!doc/*", "!index.html"]
        },
        docker: {
            options: {
                // These options are applied to all tasks
            },
            main: {
                // Specify `src` and `dest` directly on the task object
                src: docFilePaths,
                options: {
                    // ...
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-docker');

    // Creates the `server` task
    grunt.registerTask('default',[
        // Open before connect because connect uses keepalive at the moment
        // so anything after connect wouldn't run
        'karma:test',
        'open',
        'connect'
    ]);

    // Creates the `server` task
    grunt.registerTask('docs', ['shell:github-pages-checkout','clean:docs','docker:main', 'shell:github-pages-push']);
};