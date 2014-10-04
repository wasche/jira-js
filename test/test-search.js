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

    it('should accept variable length arguments', function(){
      search.whereIn('foo', 1, 2, 3, 4, 5, 6);
      assert.equal(search.query(), 'foo in (1, 2, 3, 4, 5, 6)');
    });

  });
  
  describe('#any', function(){

    var search;

    beforeEach(function(){
      search = jira.search();
    });

    it('should AND values then OR pairs', function(){
      search.any('a', 1, 'b', 2);
      assert.equal(search.query(), '(a = 1 OR b = 2)');
    });

    it('should behave as where when given only one pair', function(){
      search.any('a', 1);
      assert.equal(search.query(), '(a = 1)');
    });

    it('should quote arguments', function(){
      search.any('a', 'foo bar', 'baz qux', 2);
      assert.equal(search.query(), '(a = "foo bar" OR "baz qux" = 2)');
    });

  });
  
  describe('#orderBy', function(){

    var search;

    beforeEach(function(){
      search = jira.search();
    });

    it('should set the order clause', function(){
      search.orderBy('id');
      assert.equal(search.query(), ' ORDER BY id');
    });

    it('should return itself for chaining', function(){
      assert.equal(search.orderBy('a'), search);
    });

    it('should join multiple arguments by comma', function(){
      search.orderBy('date DESC', 'priority ASC');
      assert.equal(search.query(), ' ORDER BY date DESC, priority ASC');
    });

  });
  
  describe('#query', function(){

    var search;

    beforeEach(function(){
      search = jira.search();
    });

    it('should build the query when given no arguments', function(){
      search.where('a', 1);
      assert.equal(search.query(), 'a = 1');
    });

    it('should set the query when passed', function(){
      search.query('query');
      assert.equal(search._query, 'query');
    });

    it('should return itself when passed a query', function(){
      assert.equal(search.query('foo'), search);
    });

  });

});