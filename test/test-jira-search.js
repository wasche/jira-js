/* global describe, it */

var assert = require('assert');

describe('Jira', function(){

  var jira = require('../lib/Jira')()
    , Search = require('../lib/Search')
    ;


  describe('#search', function(){

    it('should return a Search instance', function(){
      var search = jira.search();
      assert.equal(Object.getPrototypeOf(search).constructor, Search);
    });

  });

});
