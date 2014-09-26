'use strict';

var Search = function(jira){
  this._jira = jira;
  this._where = [];
};

Search.prototype.quote = function(str){
  return str && str.indexOf(' ') > 0 && str.indexOf('"') < 0 && '"' + str + '"' || str;
};

Search.prototype.where = function(key, value){
  value && this._where.push(this.quote(key) + ' = ' + this.quote(value));
  return this;
};

Search.prototype.whereIn = function(key){
  var value = Array.apply(null, arguments).slice(1);
  value = value.length > 1 ? '(' + value.map(this.quote).join(', ') + ')' : this.quote(value[0]);
  this._where.push(this.quote(key) + ' in ' + value);
  return this;
};

Search.prototype.any = function(){
  var arr = [];
  for (var i = 0; i < arguments.length; i += 2){
    arguments[i+1] && arr.push(this.quote(arguments[i]) + ' = ' + this.quote(arguments[i + 1]));
  }
  arr.length && this._where.push('(' + arr.join(' OR ') + ')');
  return this;
};

Search.prototype.orderBy = function(str){
  if (!str){ return this._orderBy; }
  this._orderBy = str;
  return this;
};

Search.prototype.query = function(query){
  if (!query){
    this._query = this._where.join(' AND ');
    this._orderBy && (this._query += ' ORDER BY ' + this._orderBy);
    return this._query;
  }
  this._query = query;
  return this;
};

Search.prototype.run = function(fn){
  return this._jira.request(
    'search',
    {
      qs: {
        jql: this.query(),
        fields: '*all'
      }
    },
    fn
  );
};

exports = module.exports = Search;
