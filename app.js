
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var global = require('./lib/global');
var propiedades = require('./lib/propiedades');
var stock = require('./lib/stock');
var servicios = require('./lib/servicios');
var cotización = require('./lib/cotización');
var app = express();

// all environments
app.set('port', process.env.PORT || 2222);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('4567uyPweyhKKIJ471254'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/wsjson', function(req, res) {

    var EvResultado = function(bExito, rowsArray) {
        //enviar este objeto como respuesta
        res.set('Content-Type', 'application/json');
        res.send({bExito: bExito, rowsArray: rowsArray});
    };

    var paquete = req.query.paquete;
    var funcion = req.query.funcion;
    var params = "";
    if (!global.isUndefined(req.query.param)) {
        console.log(JSON.stringify(req.query.param));
        if (typeof req.query.param === "object") {
            for (var i = 0; i < req.query.param.length; i++)
            {
                if (typeof req.query.param[i] === "string")
                    params += req.query.param[i] + ",";
                else {
                    params += "[";
                    for (var j = 0; j < req.query.param[i].length; j++) {
                        if (typeof req.query.param[i][j] === "string")
                            params += req.query.param[i][j] + (j === req.query.param[i].length - 1 ? "" : ",");
                        else
                            params += JSON.stringify(req.query.param[i][j]) + (j === req.query.param[i].length - 1 ? "" : ",");
                    }
                    params += "],";
                }
            }
        }
    }
    params += "EvResultado";
    //en el req.query recibo un objeto que tiene como minimo paquete y funcion
    eval(paquete + "." + funcion + "(" + params + ");");

});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
