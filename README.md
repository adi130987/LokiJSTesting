LokiJS Testing
===============

To install needed packages make sure you have a recent node version and npm installed.
Run:

```
npm install
```

Start local server running:
```
node server.js
```

The app is set to run on http:://localhost:5300


Notes
-----

This simple app uses a LokiJS database with a collection of dummy data for test purposes.
When the page is loading the database is initialized there are 2 cases:

 * If the data collection is empty we have to request the data from server. 
 When the ajax request is complete, returned data is added to the loki database collection.
 
 * If the data collection is not empty then we just display the data.
 No request to bring data is made as we already have it stored locally
 
 On the interface you will see the data table with sorting options and
 option to delete local database (it will be recreated at refresh - first case from above).
  
 Check js/app.js code and comments for coding details. 
 