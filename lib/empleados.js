"use strict";

var global = require("./global")
    , db = require("./database")
    , empleados = module.exports = (function() {
        return {
            Autenticar: function(Nombre, Password, EvResultado) {
                //obtener el nombre de la base de datos
                db.EjecutarSQL("SELECT E.Id_Empleado, E.Nombre, E.Sal, E.Password, P.Id_Perfil, P.Nombre NombrePerfil \n\
                                FROM Empleados E\n\
                                JOIN Perfiles P ON E.Id_Perfil = P.Id_Perfil\n\
                                WHERE E.Nombre = '" + Nombre + "'"
                    , function(bExito, rowsArray) {
                        if (!bExito) {
                            if (!global.isUndefined(EvResultado))
                                EvResultado(bExito, "No se ha podido autenticar al empleado");
                            return;
                        }
                        if (rowsArray.length === 0) {
                            if (!global.isUndefined(EvResultado))
                                EvResultado(bExito, "El empleado no está registrado");
                            return;
                        }
                        global.hash(Password, rowsArray[0][2], function(err, pass) {
                            if (err) {
                                if (!global.isUndefined(EvResultado))
                                    EvResultado(bExito, "Usuario o contraseña no válidos.");
                                return;
                            }
                            if (pass == rowsArray[0][3]) {
                                var empleado = {Id_Empleado: rowsArray[0][0]
                                    , Nombre: rowsArray[0][1]
                                    , Id_Perfil: rowsArray[0][4]
                                    , NombrePerfil: rowsArray[0][5]};

                                if (!global.isUndefined(EvResultado))
                                    EvResultado(true, empleado);
                            } else {
                                if (!global.isUndefined(EvResultado))
                                    EvResultado(false, "Usuario o contraseña no válidos.");
                            }
                        });
                    });
            }
            , ListarEmpleados: function(EvObtResultados) {
                db.EjecutarSQL("SELECT E.Id_Empleado, E.Nombre, P.Id_Perfil, P.Nombre NombrePerfil, E.Color \n\
                                FROM Empleados E\n\
                                JOIN Perfiles P ON E.Id_Perfil = P.Id_Perfil;", EvObtResultados);
            }
            , AñadirEmpleado: function(Nombre, Password, Id_Perfil, Color, EvResultado) {
                db.Empleados.ObtenerNuevoId(
                    function(id) {
                        if (!id) {
                            if (!global.isUndefined(EvResultado))
                                EvResultado(false, "No se ha podido añadir el empleado");
                            return;
                        }
                        if (!global.isUndefined(Password)) {
                            //calcular el hash del password
                            global.hash(Password
                                , function(err, sal, pwd) {
                                    if (err) {
                                        if (!global.isUndefined(EvResultado))
                                            EvResultado(false, err);
                                        return;
                                    }
                                    console.log("INSERT INTO Empleados(Id_Empleado, Nombre, Sal, Password, Id_Perfil, Color) VALUES(" + id + ",'" + Nombre + "','" + sal + "','" + pwd + "'," + Id_Perfil + ","+Color+")");
                                    db.EjecutarSQL("INSERT INTO Empleados(Id_Empleado, Nombre, Sal, Password, Id_Perfil, Color) VALUES(" + id + ",'" + Nombre + "','" + sal + "','" + pwd + "'," + Id_Perfil + ","+Color+")"
                                        , function(bExito, Mensaje) {
                                            if (!global.isUndefined(EvResultado))
                                                EvResultado(bExito, bExito ? id : Mensaje);
                                            return;
                                        });
                                });
                        } else {
                            if (!global.isUndefined(EvResultado))
                                EvResultado(false, "Debe introducir una contraseña para el empleado.");
                        }
                    });

            }
            , ModificarEmpleado: function(Id_Empleado, Nombre, Id_Perfil, Color, EvResultado) {
                //TODO: Comprobaciones del Id_Empleado y el Id_Perfil
                db.EjecutarSQL("UPDATE Empleados SET Nombre = '" + Nombre + "', Id_Perfil = " + Id_Perfil + ", Color = "+Color+" WHERE Id_Empleado = " + Id_Empleado, EvResultado);
            }
            , QuitarEmpleado: function(Id_Empleado, EvResultado) {
                db.EjecutarSQL("DELETE FROM Empleados WHERE Id_Empleado = " + Id_Empleado, EvResultado);
            }
            , ListarPerfiles: function(EvResultados){
                db.EjecutarSQL("SELECT Id_Perfil, Nombre FROM Perfiles WHERE Id_Perfil > -1", EvResultados);
            }
            , Empleado: (function() {
                return {
                    CambiarNombre: function(Id_Empleado, Nombre, EvResultado) {
                        db.EjecutarSQL("UPDATE Empleados SET Nombre = '" + Nombre + "' WHERE Id_Empleado = " + Id_Empleado, EvResultado);
                    }
                    , CambiarContraseña: function(Id_Empleado, Password, EvResultado) {
                        global.hash(Password, function(err, sal, pwd) {
                            if (err) {
                                if (!global.isUndefined(EvResultado))
                                    EvResultado(false, err);
                                return;
                            }
                            db.EjecutarSQL("UPDATE Empleados SET Sal = '" + sal + "', Password = '" + pwd + "' WHERE Id_Empleado = " + Id_Empleado, EvResultado);
                        });
                    }
                };
            })()
        };
    })();
