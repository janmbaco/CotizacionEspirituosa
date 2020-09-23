var http = require('http');
var express = require('express');
var path = require('path');

var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');


var cookieParser = require('cookie-parser')
var global = require('./lib/global'),
    propiedades = require('./lib/propiedades'),
    stock = require('./lib/stock'),
    servicios = require('./lib/servicios'),
    cotización = require('./lib/cotización'),
    empleados = require('./lib/empleados'),
    tpvs = require('./lib/tpvs'),
    db = require('./lib/database');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.use(favicon(path.join(__dirname, 'public/images/favicon02.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(cookieParser('4567uyPweyhKKIJ471254'));
app.use(session('Udaiea524952QsdkfjioqEr'));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/wsjson', function(req, res) {
    console.log("\n\n" + req.sessionID + "\n\n");
    var Id_Perfil = -1,
        paquete = req.query.paquete,
        funcion = req.query.funcion,
        params = "",
        EvResultado = function(bExito, rowsArray) {
            //si es la respuesta de autenticacion
            if (bExito && paquete === "empleados" && funcion === "Autenticar") {
                req.session.empleado = rowsArray;
            }
            console.log(req.headers.origin);
            //enviar este objeto como respuesta
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.set('Content-Type', 'application/json');
            res.send({ bExito: bExito, rowsArray: rowsArray });
        };
    if (req.session.empleado)
        Id_Perfil = req.session.empleado.Id_Perfil;
    console.log("SELECT COUNT(A.Id_Permiso) FROM Permisos A JOIN Perfiles_Permisos PA ON PA.Id_Permiso = A.Id_Permiso WHERE A.Paquete = '" + paquete + "' AND A.funcion = '" + funcion + "' AND PA.Id_Perfil = " + Id_Perfil);
    db.EjecutarSQL("SELECT COUNT(A.Id_Permiso) FROM Permisos A JOIN Perfiles_Permisos PA ON PA.Id_Permiso = A.Id_Permiso WHERE A.Paquete = '" + paquete + "' AND A.funcion = '" + funcion + "' AND PA.Id_Perfil = " + Id_Perfil, function(bExito, rowsArray) {
        if (!bExito) {
            EvResultado(false, rowsArray);
            return;
        }
        if (rowsArray[0][0] == 0) {
            EvResultado(false, rowsArray + ": No se tienen suficientes permisos para realizar esta acción.");
            return;
        }
        if (paquete === "empleados.Empleado") {
            if (Id_Perfil === -1) {
                EvResultado(false, "No puedes modificar este empleado.");
                return;
            } else if (Id_Perfil === 1 && req.session.empleado.Id_Empleado != req.query.param[0]) {
                EvResultado(false, "No puedes modificar este empleado.");
                return;
            }
        }
        if (paquete === "empleados" && funcion === "QuitarEmpleado" && Id_Perfil == req.query.param[0]) {
            EvResultado(false, "No se puede eliminar este usuario, inicie sesión con otro usuario con permisos para eliminarlo.");
            return;
        }

        if (paquete === "aplicación" && funcion === "VerificarContraseña") {
            //obtenemos el password y la contraseña de la base de datos
            db.EjecutarSQL("SELECT Nombre, Valor FROM Propiedades WHERE Nombre IN ('Contraseña','Sal') ORDER BY Nombre", function(bExito, rowsArray) {
                if (!bExito) {
                    EvResultado(false, "No se ha podido verificar la contraseña");
                    return;
                }
                if (rowsArray.length < 2) {
                    EvResultado(false, "No se ha podido verificar la contraseña");
                    return;
                }
                global.hash(global.replaceAll(req.query.param[0], "'", ""), rowsArray[1][1], function(err, pass) {
                    if (err) {
                        EvResultado(false, "No se ha podido verificar la contraseña");
                        return;
                    }

                    if (pass == rowsArray[0][1]) {
                        //añadir el tpv con la ip
                        req.session.ContraseñaVerificada = true;
                        EvResultado(true, "");
                        return;
                    } else {
                        EvResultado(false, "La contraseña introducida no es correcta.\n Por favor, introduzca la contraseña correcta.");
                        return;
                    }

                });
            });
            return;
        }
        if (paquete === "aplicación" && funcion === "EmpleadoEnSesión") {
            if (!global.isUndefined(req.session.empleado))
                EvResultado(true, req.session.empleado);
            else
                EvResultado(false, "Ningún empleado ha iniciado sesión.");
            return;
        }
        if (paquete === "tpvs" && funcion === "EstaRegistradoTPV") {
            if (req.session.tpv) {
                if (req.session.tpv.ip === req.ip) {
                    EvResultado(true, req.session.tpv);
                    return;
                }
            }
            db.EjecutarSQL("SELECT Id_TPV, Nombre, IP FROM TPV WHERE IP = '" + req.ip + "'", function(bExito, rowsArray) {
                if (!bExito) {
                    EvResultado(false, rowsArray);
                    return;
                }
                if (rowsArray.length == 0) {
                    EvResultado(false, "No se ha registrado el TPV.");
                    return;
                }
                req.session.tpv = { Id_TPV: rowsArray[0][0], Nombre: rowsArray[0][1], IP: rowsArray[0][2] };
                EvResultado(true, req.session.tpv);
                return;
            });
            return;
        }
        if (Id_Perfil === -1 && paquete === "tpvs" && funcion === "AñadirTPV") {
            if (req.session.ContraseñaVerificada) {

                tpvs.AñadirTPV(global.replaceAll(req.query.param[0], "'", ""), req.ip, function(bExito, Mensaje) {
                    if (!bExito) {
                        EvResultado(false, Mensaje);
                        return;
                    }
                    req.session.tpv = { Id_TPV: Mensaje, Nombre: global.replaceAll(req.query.param[0], "'", ""), IP: req.ip };
                    EvResultado(true, Mensaje);
                    return;
                });
            } else {
                EvResultado(false, "Debe verificar la contraseña de la aplicación.");
                return;
            }
            return;
        }
        if (!global.isUndefined(req.query.param)) {
            if (typeof req.query.param === "object") {
                for (var i = 0; i < req.query.param.length; i++) {
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
        if (Id_Perfil > -1 && global.isUndefined(req.session.tpv)) {
            //vamos a ver si podemos identificar el TPV por la IP

            db.EjecutarSQL("SELECT Id_TPV, Nombre, IP FROM TPV WHERE IP = '" + req.ip + "'", function(bExito, rowsArray) {
                if (!bExito) {
                    EvResultado(false, "No se ha identificao el tpv, desde donde realizas la operación.");
                    return;
                }
                if (rowsArray.length == 0) {
                    EvResultado(false, "No se ha identificao el tpv, desde donde realizas la operación.");
                    return;
                }
                req.session.tpv = { Id_TPV: rowsArray[0][0], Nombre: rowsArray[0][1], IP: req.ip };
                eval(paquete + "." + funcion + "(" + params + ");");
            });
            return;

        }
        //en el req.query recibo un objeto que tiene como minimo paquete y funcion
        eval(paquete + "." + funcion + "(" + params + ");");
    });
});

// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

var server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});