module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'requirejs'],

        // list of files to include
        files: [
            //---------- LIB ----------//
            {pattern: 'bower_components/chai/chai.js', included: false},
            {pattern: 'bower_components/mocha/mocha.js', included: false},
            {pattern: 'bower_components/sinon-chai/lib/sinon-chai.js', included: false},
            {pattern: 'bower_components/sinonjs/sinon.js', included: false},
            {pattern: 'bower_components/underscore-mutation/mutation.js', included: false},
            {pattern: 'bower_components/lodash/dist/lodash.js', included: false},
            {pattern: 'bower_components/backbone/backbone.js', included: false},

            //-------- PROJECT --------//
//            {pattern: 'test/**/*.js', included:false },

            //--------- TEST ----------//
            //{pattern: 'test/assets/**/*.js', included: false},
            {pattern: 'advice.js', included:false },
            {pattern: 'test/core-test.js', included: false },
            {pattern: 'test/test-main.js', included: true }
            //{pattern: 'test/modules/**/*.js', included: false},

//            'require.config.js',
        ],

        // list of files to exclude
        exclude: [],

        reporters: ['progress', 'coverage'],

        preprocessors: {
            'advice.js': ['coverage']
        },

        coverageReporter: {
            dir: 'coverage',
            subdir: function(browser) {
                // normalization process to keep a consistent browser name across different OS
                return browser.toLowerCase().split(/[ /-]/)[0];
            }
        },

        // web server port
        port: 9876,

        // enable or disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - Firefox
        // - Safari (only Mac)
        // - PhantomJS
        browsers: ['Chrome'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
