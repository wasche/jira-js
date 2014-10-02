/* global describe, it, before, after */

var http = require('http')
  , assert = require('assert')
  , _ = require('underscore')
  , jira = require('../lib/Jira')({
    strictSSL: false,
    uri: 'http://localhost:6767'
  })
  ;

describe('Jira', function(){

  var server;

  before(function(){
    server = http.createServer(function(req, res){
      console.error(req.method, req.url);

      if (req.method === 'GET'){
        if (req.url === '/issue/1?fields=*all'){
          res.end(JSON.stringify(require('./data/issue-1.json')));
          return;
        }
      }

      if (req.method === 'PUT'){
        var body = '';
        req.on('data', function(data){
          body += data;

          body.length > 1e6 && req.connection.destroy(); // too much post data
        });
        req.on('end', function(){
          body = JSON.parse(body);

          if (req.url === '/issue/1?fields=*all'){
            var i = require('./data/issue-1.json');
            body.fields && _.each(body.fields, function(value, key){
              i.fields[key] = value;
            });
            res.end(JSON.stringify(i));
            return;
          }

          res.statusCode = 400;
          res.end('400');
        });
        return;
      }

      res.statusCode = 400;
      res.end('400');
    });
    server.listen(6767);
  });

  after(function(){
    server.close();
  });

  describe('#issue', function(){

    it('should return an issue when given an id', function(done){
      jira.issue(1, function(err, response, issue){
        assert(!err, 'Should not receive an error.');
        assert(typeof issue === 'object', 'should receive an Issue object.');
        assert.equal(issue.id, 'MY-1', 'should fill issue fields from response json');
        done();
      });
    });

    it('should update an issue when given fields', function(done){
      jira.issue(1, null, {summary: 'new summary!'}, function(err, res, issue){
        assert(!err, 'Should not receive an error.');
        assert(typeof issue === 'object', 'should receive an Issue object.');
        assert.equal(issue.id, 'MY-1', 'should fill issue fields from response json');
        assert.equal(issue.summary, 'new summary!', 'should have the updated fields');
        done();
      });
    });

  });

});
