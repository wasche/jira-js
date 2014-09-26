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

## License

MIT