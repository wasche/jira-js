'use strict';

/**
 * Module dependencies.
 */

var _ = require('underscore');
var request = require('request');
var Search = require('./Search');
var Issue = require('./Issue');


var config = {
  strictSSL: true
};

/**
 * Initialize a new `Jira`.
 *
 * @param {String} [authString]
 * @api public
 */

var Jira = function(options){
  options && (config = _.extend(config, options));
  this._config = config;
};

/**
 * Make a request to Jira's REST API.
 *
 * @param {String}   path
 * @param {Object}   [requestOptions]
 * @param {Function} [fn] callback, receives (err, response, json)
 * @return {Request} the request
 * @api public
 */

Jira.prototype.request = function(path, requestOptions, fn){
  if (!fn && typeof requestOptions === 'function'){
    fn = requestOptions;
    requestOptions = null;
  }
  path.indexOf('://') > 0 || (path = config.uri + path);
  requestOptions = _.extend(
      {
        url: config.uri + path,
        headers: {
          'Authorization': 'Basic ' + config.authString
        },
        strictSSL: config.strictSSL
      },
      requestOptions
    );
  return request(
    requestOptions,
    function(err, res, body){
      if (res.statusCode >= 200 && res.statusCode < 300 && typeof body !== 'object'){
        try{
          body = JSON.parse(body);
        } catch (e){
          err || (err = e);
        }
      }
      fn(err, res, body);
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
  return this.request(config.profieldsUri + '/field/' + fieldId + '/value/' + projectId, null, fn);
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
 * Retrieves or updates an issue. If fields is passed, update must be also. When retrieving an issue, the callback
 * receives (err, Issue).
 *
 * @param {Number}    issueId issue id
 * @param {Array}     [update] list of update fields
 * @param {Array}     [fields] list of fields to set
 * @param {Function}  [fn] callback, receives (err, response, json)
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
      'issue/' + issueId,
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
        fn(err, res, json && new Issue(json));
      }
    );
  }
  return this.request(
    'issue/' + issueId,
    {
      qs: {
        fields: '*all'
      }
    },
    function(err, res, json){
      fn(err, res, json && new Issue(this, json));
    }
  );
};

/**
 * Post a work log.
 *
 * @param {Number} issue
 * @param {String} duration
 * @param {String} [started]
 * @param {String} [comment]
 * @return {Request} the request
 * @api public
 */

Jira.prototype.worklog = function(issue, duration, started, comment){
  var json = {
    timeSpent: duration
  };
  started && (json.started = started);
  comment && (json.comment = comment);
  return this.request(
    'issue/' + issue + '/worklog',
    {
      method: 'POST',
      json: json
    }
  );
};

/**
 * Expose a setup function.
 */

exports = module.exports = function(options){
  return new Jira(options);
};
