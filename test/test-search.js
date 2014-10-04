/* global describe, it, before, beforeEach */

var assert = require('assert')
  , jira = require('../lib/Jira')({
    strictSSL: false,
    uri: 'http://localhost:6767'
  }),
  Search = require('../lib/Search')
  ;

describe('Jira', function(){

  describe('#search', function(){

    it('should return a Search instance', function(){
      var search = jira.search();
      assert.equal(Object.getPrototypeOf(search).constructor, Search);
    });

  });

});

describe('Search', function(){

  describe('#quote', function(){

    var search;

    before(function(){
      search = jira.search();
    });

    it('should handle nulls', function(){
      assert.equal(search.quote(null), null);
    });

    it('should handle blank or empty strings', function(){
      assert.equal(search.quote(''), '');
      assert.equal(search.quote(' '), ' ');
      assert.equal(search.quote('    '), '    ');
    });

    it('should ignore already quoted strings', function(){
      assert.equal(search.quote('"quote"'), '"quote"');
    });

    it('should ignore single words', function(){
      assert.equal(search.quote('foo'), 'foo');
    });

    it('shuold ignore non-strings', function(){
      assert.strictEqual(search.quote(1), 1);
      assert.strictEqual(search.quote(false), false);
    });

    it('should quote everything else', function(){
      assert.equal(search.quote('foo bar'), '"foo bar"');
    });

  });

  describe('#where', function(){

    var search;

    beforeEach(function(){
      search = jira.search();
    });

    it('should handle null', function(){
      search.where('foo', null);
      assert.equal(search.query(), 'foo = null');
    });

    it('should quote keys and values', function(){
      search.where('foo bar', 'baz qux');
      assert.equal(search.query(), '"foo bar" = "baz qux"');
    });

    it('should join multiple where calls with ANDs', function(){
      search.where('a', 1);
      search.where('b', 2);
      assert.equal(search.query(), 'a = 1 AND b = 2');
    });

  });

  describe('#whereIn', function(){

    var search;

    beforeEach(function(){
      search = jira.search();
    });

    it('should handle in functions', function(){
      search.whereIn('workLogged', 'after yesterday');
      assert.equal(search.query(), 'workLogged in "after yesterday"');
    });

  });
  
  describe('#any', function(){

    var search;

    beforeEach(function(){
      search = jira.search();
    });

  });
  
  describe('#orderBy', function(){

  });
  
  describe('#query', function(){

  });

});