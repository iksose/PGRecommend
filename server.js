var express = require('express')
    , path = require('path')
    , basic_routes = require('./routes/user')


var app = module.exports = express();
var server = require('http').createServer(app);
// var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/client/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.session({ secret: 'keyboard cat' }));
app.use(app.router);

// clearly denote public content
app.use(express.static(path.join(__dirname, 'client')));

// Basic pages
app.get('/', basic_routes.index);

app.get('/_vti_bin/ProfitguardRecommendationsWCF.svc/GetRecommendations/1', basic_routes.recommendations);

app.get('/_vti_bin/ProfitguardRecommendationsWCF.svc/GetPurchases/1', basic_routes.purchases);

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
