/* global describe, it, before, after */

var http = require('http')
  , assert = require('assert')
  ;

describe('Jira', function(){

  var server
    , jira = require('../lib/Jira')({
      strictSSL: false,
      uri: 'http://localhost:7003/test-jira',
      authString: 'invalid'
    })
    ;

  before(function(){
    server = http.createServer(function(req, res){

      if (req.method === 'GET' && req.headers.authorization && req.headers.authorization === 'Basic invalid'){
        res.statusCode = 401;
        require('fs').createReadStream(require('path').join(__dirname, 'data/401unauthorized.html'), 'r').pipe(res);
        return;
      }

      res.statusCode = 400;
      res.end('400');
    });
    server.listen(7003);
  });

  after(function(){
    server.close();
  });

  describe('#request', function(){

    it('should return an error if authString is invalid', function(done){
      jira.request('/bogus', function(err, response, issue){
        assert.equal(err, 'Unauthorized (401)');
        done();
      });
    });

  });

});
