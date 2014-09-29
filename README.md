# Jira REST API wrapper

## Installation

```
npm intall jira-wrapper
```

## Usage

```javascript
var jira = require('jira-wrapper')({
  authString: 'base64 of user:pass',
  uri: 'http://jira.example.com/api'
});

// print assigned issues worked on in the past week
jira
  .search
  .any('engineer', 'currentUser()', 'assignee', 'currentUser()')
  .whereIn('issueFunction', 'worklogged("after today -1w")')
  .orderBy('priority DESC, created ASC')
  .run(function(issues){
    issues.forEach(function(i){
      console.log(i.format('%(id)-11s %(status)-17s %(priority)-14s %(summary)s'));
    });
  });
```

## API

### Jira

#### constructor(options)

- `uri` - URL of the JSON REST API (e.g. http://jira.example.com/api)
- `authString` - base64 encoded version of "user:pass"
- `strictSSL` - If `true`, requires SSL certificates to be valid. (default: `true`)
- `customFields` - object defining custom fields defined in the Jira instance
  Should be an object where the keys are the friendly field name and will be set as
  attributes on Issues. The value can either be a string or a function. If a string,
  it should be the name of the field in Jira. If a function, it should take one
  argument: the json object response from Jira, and return the field value.

#### request(path, [options], [callback])

Makes a request to the Jira REST API.

- `path` can either be an absolute url, or the relative API path
- `options`, if specified, is forwarded to the request ([mikeal/request](mikeal/request))
- `callback`, receives `(err, response, json)`

#### search()

Returns a new `Search` instance for building a JQL query.

#### issue(issueId, [update, fields], callback)

Retrieves or updates an issue. If only the id and callback are specified, it
retrieves the issue. If update and fields are also specified, it will make a
POST request to update the issue. The callback receives `(err, response, Issue)`

#### worklog(issue, duration, [started], [comment], [callback])

Post a work log.

### Search

#### where(key, value)

Add a filter to the where clause.

#### whereIn(key, values...)

Add a contains filter to the where clause.

#### any(key, value, key2, value2, ...)

Add multiple where filters, or'd together.

#### orderBy(str)

Set the order by clause.

#### query([query])

Get or set the query.

#### run(callback)

Run the query. Callback receives `(err, response, Issues)`.

### Issue

#### loadWorkLog(callback)

Loads the work logs for the issue. Callback receives one argument: the issue.

#### format(str)

Format a string using fields from this issue. Uses `sprintf`.

e.g.: `issue.format('%(id)-11s: %(summary)')`

#### isBug()

Test if the issue is a bug.

#### isProject()

Test if the issue is a 'project', as defined by `Issue.projectTypes`.

#### Issue.isBug(issue)

Tests if an issue is a bug. Helper function when filtering lists.

#### Issue.isProject(issue)

Tests if an issue is a project, as defined by `Issue.projectTypes`. Helper function when filtering lists.

#### Issue.projectTypes

Array of issue types considered to be a 'project'. Defaults to: `Feature`, `Improvement`, and `Task`.

## License

MIT