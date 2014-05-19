module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
    './client/concat/vendor.js',
    './client/concat/scripts.js',
    './test/*.js'
    ],

    autoWatch : true,
    singleRun: false,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-phantomjs-launcher'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
