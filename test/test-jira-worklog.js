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

      if (req.method === 'POST'){
        var body = '';
        req.on('data', function(data){
          body += data;

          body.length > 1e6 && req.connection.destroy(); // too much post data
        });
        req.on('end', function(){
          body = JSON.parse(body);

          if (/\/issue\/(\d)\/worklog/.test(req.url)){
            var log = {
              timeSpent: body.timeSpent
            };
            switch(RegExp.$1){
              case 1:
                assert(!body.started);
                assert(!body.comment);
                break;
              case 2:
                assert(!body.started);
                break;
              case 3:
                assert(!body.comment);
                break;
            }
            res.end(JSON.stringify(log));
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

  describe('#worklog', function(){

    it('should post a new worklog', function(done){
      jira.worklog(1, '1h', null, null, function(err, response, worklog){
        assert(!err, 'Should not receive an error.');
        assert(typeof worklog === 'object', 'should receive a JSON object.');
        done();
      });
    });

    it('should add a message when present', function(done){
      jira.worklog(2, '1h', null, 'stuff I did', function(err, response, worklog){
        assert(!err, 'Should not receive an error.');
        assert(typeof worklog === 'object', 'should receive a JSON object.');
        done();
      });
    });

    it('should set the start time when given', function(done){
      jira.worklog(3, '1h', '1412432870', null, function(err, response, worklog){
        assert(!err, 'Should not receive an error.');
        assert(typeof worklog === 'object', 'should receive a JSON object.');
        done();
      });
    });

  });
});