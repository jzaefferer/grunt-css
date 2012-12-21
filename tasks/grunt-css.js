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

  grunt.registerMultiTask( "csslint", "Lint CSS files with csslint", function() {
    var csslint = require( "csslint" ).CSSLint;
    var files = grunt.file.expandFiles( this.file.src );
    var ruleset = {};
    var verbose = grunt.verbose;
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
    files.forEach(function( filepath ) {
      var file = grunt.file.read( filepath ),
        message = "Linting " + filepath + "...",
        result;

      // skip empty files
      if (file.length) {
        result = csslint.verify( file, ruleset );
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
    if (hadErrors) {
      return false;
    }
    grunt.log.writeln( "Lint free files: " + files.length );
  });

  grunt.registerMultiTask( "cssmin", "Minify CSS files with Sqwish.", function() {
    var options = this.options({
      banner: ''
    });
    var src = grunt.file.read( this.file.src );
    var min = require( "sqwish" ).minify( src, false );
    if ( options.banner ) {
      min = options.banner + grunt.util.linefeed + min;
    }
    grunt.file.write( this.file.dest, min );
    grunt.log.writeln( "File '" + this.file.dest + "' written." );
    min_max( min, src );
  });

};
