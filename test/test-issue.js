/* global describe, it */

var assert = require('assert');

describe('Issue', function(){

  var jira = require('../lib/Jira')({
      strictSSL: false,
      uri: 'http://localhost:7002/test-issue'
    })
    , Issue = require('../lib/Issue')
    ;


  describe('#ctor', function(){

    it('should have the right url', function(){
      var issue = new Issue(jira, {
        key: 1,
        fields: {
          project: {}
        }
      });

      assert.equal(issue.url, 'http://localhost:7002/browse/1');
    });

  });

});