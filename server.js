var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(5300, function(){
    console.log('Server running on http://localhost:5300...');
});
