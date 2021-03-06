'use strict';

/**
 * Module dependencies.
 */

var _ = require('underscore');
var url = require('url');
var path = require('path');
var request = require('request');
var Search = require('./Search');
var Issue = require('./Issue');

var DEFAULT_OPTIONS = {
  strictSSL: true
};

/**
 * Initialize a new `Jira`.
 *
 * @param {String} [authString]
 * @api public
 */

var Jira = function(options){
  this._config = _.extend({}, DEFAULT_OPTIONS, options);
  if (this._config.uri){
    var uri = url.parse(this._config.uri);
    this._config.rootUri = uri.protocol + '//' + uri.host;
  }
};

/**
 * Returns the current user from the auth string, if given.
 *
 * @return {String} auth user, or false
 * @api public
 */

Jira.prototype.currentUser = function(){
  return this._config.authString && new Buffer(this._config.authString, 'base64').toString().split(':').shift();
};

/**
 * Make a request to Jira's REST API.
 *
 * @param {String}   pathname
 * @param {Object}   [requestOptions]
 * @param {Function} [fn] callback, receives (err, response, json)
 * @return {Request} the request
 * @api public
 */

Jira.prototype.request = function(pathname, requestOptions, fn){
  if (!fn && typeof requestOptions === 'function'){
    fn = requestOptions;
    requestOptions = null;
  }
  pathname += '.json';

  if (pathname.indexOf('://') < 0){
    var uri = url.parse(this._config.uri);
    pathname = uri.protocol + '//' + uri.host + path.join(uri.pathname, pathname);
  }

  requestOptions = _.extend(
      {
        url: pathname,
        headers: {
          'Authorization': 'Basic ' + this._config.authString,
          'Content-Type': 'application/json'
        },
        strictSSL: this._config.strictSSL
      },
      requestOptions
    );
  return request(
    requestOptions,
    function(err, res, body){
      if (body && typeof body === 'string' && (body.slice(0, 9) === '<!DOCTYPE') || res.statusCode === 401){
        err = /<title>(.*)<\/title>/.test(body) && RegExp.$1;
        body = null;
      }
      var o = typeof body === 'object' && body || null;
      if (res && !o && body){
        try{
          o = JSON.parse(body);
        } catch (e){
          err || (err = e);
        }
      }
      !err && res.statusCode >= 400 && o && (err = o.errorMessages || o.message);
      fn && fn(err, res, o);
    }
  );
};

/**
 * Fetches the value of a project field.
 *
 * @param {Number} fieldId
 * @param {Number} projectId
 * @param {Function} [fn] callback, receives (err, response, json)
 * @return {Request} the request
 * @api public
 */

// todo: move to .mixin
Jira.prototype.projectField = function(fieldId, projectId, fn){
  return this.request(this._config.profieldsUri + '/field/' + fieldId + '/value/' + projectId, null, fn);
};

/**
 * Return a new `Search` instance bound to this Jira object.
 *
 * @return {Search} the search object
 * @api public
 */

Jira.prototype.search = function(){
  return new Search(this);
};

/**
 * Retrieves or updates an issue. If fields is passed, update must be also. The callback
 * receives (err, response, Issue).
 *
 * @param {Number}    issueId issue id
 * @param {Array}     [update] list of update fields
 * @param {Array}     [fields] list of fields to set
 * @param {Function}  [fn] callback, receives (err, response, Issue)
 * @return {Request} the request
 * @api public
 */

Jira.prototype.issue = function(issueId, update, fields, fn){
  if (typeof update === 'function'){
    fn = update;
    update = null;
  }
  if (update || fields){
    return this.request(
      '/issue/' + issueId,
      {
        method: 'PUT',
        qs: {
          fields: '*all'
        },
        json: {
          update: update,
          fields: fields
        }
      },
      function(err, res, json){
        fn(err, res, !err && json && new Issue(this, json));
      }.bind(this)
    );
  }
  return this.request(
    '/issue/' + issueId,
    {
      qs: {
        fields: '*all'
      }
    },
    function(err, res, json){
      fn(err, res, !err && json && new Issue(this, json));
    }.bind(this)
  );
};

/**
 * Post a work log.
 *
 * @param {Number} issue
 * @param {String} duration
 * @param {String} [started]
 * @param {String} [comment]
 * @param {Function} [fn] callback
 * @return {Request} the request
 * @api public
 */

Jira.prototype.worklog = function(issue, duration, started, comment, fn){
  var json = {
    timeSpent: duration
  };
  started && (json.started = started);
  comment && (json.comment = comment);
  return this.request(
    '/issue/' + issue + '/worklog',
    {
      method: 'POST',
      json: json
    },
    fn
  );
};

/**
 * Expose a setup function.
 */

exports = module.exports = function(options){
  var j = new Jira(options);
  j.Issue = Issue;
  j.Search = Search;
  return j;
};
