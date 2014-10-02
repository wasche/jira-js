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
  this.project_id = json.fields.project.id;
  this.project = json.fields.project.name;
  this.id = json.key;
  this.summary = json.fields.summary;
  this.description = json.fields.description;
  this.type = json.fields.issuetype && json.fields.issuetype.name;
  this.status = json.fields.status && json.fields.status.name;
  this.priority = json.fields.priority && json.fields.priority.name;
  this.reporter = json.fields.reporter && json.fields.reporter.name;
  this.assignee = json.fields.assignee && json.fields.assignee.name;
  this.fixVersions = json.fields.fixVersions && json.fields.fixVersions.map(function(o){ return o.name; });
  this.resolution = json.fields.resolution;
  this.resolutionDate = json.fields.resolutiondate;
  this.progress = json.fields.aggregateprogress;
  this.originalLOE = json.fields.timeoriginalestimate || 0;
  this._jira._config.customFields && _.each(this._jira._config.customFields, function(value, field){
    this[field] = typeof value === 'function' ? value(json.fields) : json.fields[value];
  }, this);
}

/**
 * Load the work logs for this issue. Callback is of the form `fn(Issue)`.
 *
 * @param {Function} [callback]
 * @return {Issue} this
 * @api public
 */

Issue.prototype.loadWorkLog = function(callback){
  this._jira
    .request(
      'issue/' + this.id + '/worklog',
      function(data){
        this.worklogs = data.worklogs.map(function(log){
          return {
            author: log.author.name
          , started: new Date(log.started).getTime()
          , time: log.timeSpentSeconds
          , comment: log.comment || ''
          , hours: log.timeSpentSeconds/60/60
          };
        });
        callback && callback(this);
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
  return Issue.projectTypes.index(this.type) >= 0;
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
