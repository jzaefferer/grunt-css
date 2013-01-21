/*
 * grunt-css
 * https://github.com/jzaefferer/grunt-css
 *
 * Copyright (c) 2012 Jörn Zaefferer
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  "use strict";

  function min_max(min, max) {
    var gzip = require('gzip-js');
    var gzipSize = String(gzip.zip(min, {}).length);
    grunt.log.writeln('Uncompressed size: ' + String(max.length).green + ' bytes.');
    grunt.log.writeln('Compressed size: ' + gzipSize.green + ' bytes gzipped (' + String(min.length).green + ' bytes minified).');
  }

  function expandFiles( files ) {
    return grunt.util._.pluck( grunt.file.expandMapping( files ), "src" );
  }

  /**
   * Returns a string with encoded HTML characters
   *
   * @param {string} text The text to encode
   * @return {string}
   */
  function encodeHTML(text) {
    if (!text) {
      return '';
    }

    return text
        .replace(/"/g, '&quot;')// "
        .replace(/&/g, '&amp;')// &
        .replace(/</g, '&lt;')// <
        .replace(/>/g, '&gt;')// >
        .replace(/'/g, '&apos;');// '
  }

  grunt.registerMultiTask( "csslint", "Lint CSS files with csslint", function() {
    var csslint = require( "csslint" ).CSSLint;
    var files = expandFiles( this.filesSrc );
    var ruleset = {};
    var verbose = grunt.verbose;
    var template;
    var report = {
      files: []
    };
    // get underscore
    var underscore = (grunt.util && grunt.util._) ? grunt.util._ : grunt.utils._;
    // load templates
    var templates = {
      junit: grunt.file.read(__dirname + '/templates/junit.tmpl'),
      checkstyle: grunt.file.read(__dirname + '/templates/checkstyle.tmpl')
    };
    csslint.getRules().forEach(function( rule ) {
      ruleset[ rule.id ] = 1;
    });
    for ( var rule in this.data.rules ) {
      if ( !this.data.rules[ rule ] ) {
        delete ruleset[rule];
      } else {
        ruleset[ rule ] = this.data.rules[ rule ];
      }
    }
    var hadErrors = 0;
    files.forEach(function( filepath, index ) {
      var file = grunt.file.read( filepath ),
        message = "Linting " + filepath + "...",
        result;

      // skip empty files
      if (file.length) {
        result = csslint.verify( file, ruleset );
        // add result to report
        report.files[index] = {
          filepath: filepath,
          passed: !result.messages.length,
          errors: result.messages
        };
        verbose.write( message );
        if (result.messages.length) {
          verbose.or.write( message );
          grunt.log.error();
        } else {
          verbose.ok();
        }

        result.messages.forEach(function( message ) {
          grunt.log.writeln( "[".red + (typeof message.line !== "undefined" ? ( "L" + message.line ).yellow + ":".red + ( "C" + message.col ).yellow : "GENERAL".yellow) + "]".red );
          grunt.log[ message.type === "error" ? "error" : "writeln" ]( message.message + " " + message.rule.desc + " (" + message.rule.id + ")" );
        });
        if ( result.messages.length ) {
          hadErrors += 1;
        }
      } else {
        grunt.log.writeln( "Skipping empty file " + filepath);
      }

    });

      report.encode = encodeHTML;
      report.workspace = grunt.option('workspace') || '';

      // generate junit xml
      if (this.data.junit) {
          template = underscore.template(templates.junit, {
              'obj': report
          });
          grunt.file.write(this.data.junit, template);
      }

      // checkstyle junit xml
      if (this.data.checkstyle) {
          template = underscore.template(templates.checkstyle, {
              'obj': report
          });
          grunt.file.write(this.data.checkstyle, template);
      }

    if ( hadErrors ) {
      return false;
    }
    grunt.log.ok( files.length + " files lint free." );
  });

  grunt.registerMultiTask( "cssmin", "Minify CSS files with clean-css.", function() {
    var options = this.options({
      banner: ''
    });
    var src = grunt.file.read( this.filesSrc );
    var min = require( "clean-css" ).process( src, options );
    if ( options.banner ) {
      min = options.banner + grunt.util.linefeed + min;
    }
    grunt.file.write( this.files[0].dest, min );
    grunt.log.writeln( "File '" + this.files[0].dest + "' written." );
    min_max( min, src );
  });

};
