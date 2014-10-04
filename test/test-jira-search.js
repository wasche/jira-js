/* global describe, it */

var assert = require('assert')
  , jira = require('../lib/Jira')({
    strictSSL: false,
    uri: 'http://localhost:6767'
  })
  , Search = require('../lib/Search')
  ;

describe('Jira', function(){

  describe('#search', function(){

    it('should return a Search instance', function(){
      var search = jira.search();
      assert.equal(Object.getPrototypeOf(search).constructor, Search);
    });

  });

});
