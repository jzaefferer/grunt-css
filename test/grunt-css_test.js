var grunt_css = require('../lib/grunt-css.js');

exports['awesome'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no args': function(test) {
    test.expect(1);
    // tests here
    test.equal(grunt_css.awesome(), 'awesome', 'should be awesome.');
    test.done();
  }
};
