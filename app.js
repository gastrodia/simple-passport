/**
 * Created by ELatA on 14-1-26.
 */

var http = require('http');
var path = require('path');
var express = require('express');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

var app = express();

//all environments

app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
/*app.use(express.logger('dev'));*/
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//cookie and session
app.use(express.cookieParser());

app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db
    })
}));
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(flash());

//权限控制
function authChecker(req, res, next) {
    console.log(req.path);
    if (req.path.split("/")[1] && req.path.split("/")[1]=="sign" && !req.session.user) {
        res.redirect("/user/login");
    } else {
        next();
    }
}
app.use(authChecker);

//注册路由
var routes = require('./routes');
routes(app);

//启动app
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
