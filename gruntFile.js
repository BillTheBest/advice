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
            "install-deps": {
                command: 'npm install'
            },
            "github-pages-delete": {
                command: 'hasPages=`git branch --list gh-pages`; if [ -n "$hasPages" ]; then git branch -D gh-pages; else echo boo; fi'
            },
            "github-pages-checkout": {
                command: 'git checkout -b gh-pages'
            },
            "github-pages-commit": {
                command: 'git commit -a -m "Docs for github"'
            },
            "github-pages-push": {
                command: [
                    'git push github gh-pages'
                ].join('&&')
            }
        },
        clean: {
            docs: ["*", "!doc", "!doc/*", "!index.html", "!node_modules","!node_modules/*"]
        },
        docco: {
            docs: {
                src: docFilePaths,
                options: {
                }
            },
            index: {
                src: 'readme.md',
                options: {
                    layout:"classic"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-docco3');

    // Creates the `server` task
    grunt.registerTask('default',[
        // Open before connect because connect uses keepalive at the moment
        // so anything after connect wouldn't run
        'karma:test',
        'open',
        'connect'
    ]);

    // Creates the `server` task
    grunt.registerTask('docs', ['shell:install-deps','shell:github-pages-delete','shell:github-pages-checkout', 'docco:docs', 'docco:main', 'clean:docs', 'shell:github-pages-push']);
};