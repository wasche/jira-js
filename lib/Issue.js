'use strict';

/**
 * Module dependencies.
 */

var _ = require('underscore');
var sprintf = require('sprintf-js').sprintf;

/**
 * Initialize a new `Issue`.
 *
 * @param {Object} json
 * @api public
 */

function Issue(jira, json){
  this._jira = jira;
  this._json = json;
  this.project_id = json.fields.project.id;
  this.project = json.fields.project.name;
  this.id = json.key;
  this.url = this._jira._config.rootUri + '/browse/' + this.id;
  this.summary = json.fields.summary;
  this.description = json.fields.description;
  this.type = json.fields.issuetype && json.fields.issuetype.name;
  this.status = json.fields.status && json.fields.status.name;
  this.priority = json.fields.priority && json.fields.priority.name;
  this.reporter = json.fields.reporter && json.fields.reporter.name;
  this.assignee = json.fields.assignee && json.fields.assignee.name;
  this.fixVersions = json.fields.fixVersions && json.fields.fixVersions.map(function(o){ return o.name; });
  this.resolution = json.fields.resolution && json.fields.resolution.name;
  this.resolutionDate = json.fields.resolutiondate;
  this.progress = json.fields.aggregateprogress;
  this.originalLOE = json.fields.timeoriginalestimate || 0;
  this._jira._config.customFields && _.each(this._jira._config.customFields, function(value, field){
    if (typeof value === 'function'){
      this[field] = value(json.fields);
    } else if (value.indexOf('.') > 0){
      var s = value.split('.');
      this[field] = json.fields[s[0]] && json.fields[s[0]][s[1]];
    } else {
      this[field] = json.fields[value];
    }
  }, this);
  // todo: parse worklogs
}

/**
 * Load the work logs for this issue. Callback is of the form `fn(Issue)`.
 *
 * @param {Function} [callback] receives (err, issue)
 * @return {Issue} this
 * @api public
 */

Issue.prototype.loadWorkLog = function(callback){
  this._jira
    .request(
      '/issue/' + this.id + '/worklog',
      function(err, res, data){
        this.worklogs = data.worklogs.map(function(log){
          return {
            author: log.author.name
          , started: new Date(log.started).getTime()
          , time: log.timeSpentSeconds
          , comment: log.comment || ''
          , hours: log.timeSpentSeconds/60/60
          };
        });
        callback && callback(null, this);
      }.bind(this)
    );
  return this;
};

/**
 * Format a string using fields from this issue. Uses `sprintf`.
 *
 * Examples:
 *
 *     issue.format('%(id)-11s: %(summary)')
 *
 * @param {String} fmt
 * @return {String} the formatted string
 * @api public
 */

Issue.prototype.format = function(fmt){
  return sprintf(fmt, this);
};

/**
 * Test if this issue is a bug. (type == 'Bug').
 *
 * @return {Boolean}
 * @api public
 */

Issue.prototype.isBug = function(){
  return 'Bug' === this.type;
};

/**
 * List of types considered to be a project or "feature work".
 *
 * @api public
 */

Issue.projectTypes = ['Feature', 'Improvement', 'Task'];

/**
 * Test if this issue is a project. (type in projectTypes)
 *
 * @return {Boolean}
 * @api public
 */

Issue.prototype.isProject = function(){
  return Issue.projectTypes.indexOf(this.type) >= 0;
};

/**
 * Test if an issue is a bug. (type == 'Bug').
 *
 * @param {Issue} issue
 * @return {Boolean}
 * @api public
 */

Issue.isBug = function(issue){
  return issue.isBug();
};

/**
 * Test if an issue is a project. (type in projectTypes)
 *
 * @param {Issue} issue
 * @return {Boolean}
 * @api public
 */

Issue.isProject = function(issue){
  return issue.isProject();
};

/**
 * Expose `Issue`.
 */

exports = module.exports = Issue;
