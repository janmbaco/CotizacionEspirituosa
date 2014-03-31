/*
 * Copyright (C) 2013 José Ángel Navarro Martínez (janmbaco@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

var sqlite3 = require('sqlite3').verbose()
    , fs = require("fs")
    , path = require("path")
    , global = require("./global")
    , db = module.exports = (function() {
        var archDatabase = path.resolve(".\\basededatos\\CotizacionEspirituosa.db")
            , database = null
            , arrTablas = [{Tabla: 'Grupos_Bebida', Indice: 'Id_G_Bebida'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Grupos_Bebida (	\
                                                 Id_G_Bebida NUMERIC(3,0) PRIMARY KEY	\
                                            ,	Nombre VARCHAR(150) UNIQUE\n\
                                            ,   Tipos_Genericos NUMERIC(1,0) \n\
                                            ,   Color NUMERIC(10) NULL \n\
                                            ,   Orden NUMERIC(3,0) NULL \
                                             );'}
                , {Tabla: 'Bebidas', Indice: 'Id_Bebida'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Bebidas (\n\
                                        Id_Bebida NUMERIC(5,0) PRIMARY KEY\n\
                                    ,	Id_G_Bebida NUMERIC(3,0) REFERENCES \n\
                                            Grupo_Bebidas (Id_G_Bebida) ON DELETE CASCADE\n\
                                                                 ON UPDATE CASCADE\n\
                                    , 	Nombre VARCHAR(150) NOT NULL\n\
                                    , 	Cantidad_Botella NUMERIC(5,0) NOT NULL\n\
                                    , 	Cantidad_Stock NUMERIC(10,0) NULL\n\
                                    );'}
                , {Tabla: 'Tipos_Servicio', Indice: 'Id_T_Servicio'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Tipos_Servicio (	\
                                                    Id_T_Servicio NUMERIC(3,0) PRIMARY KEY	\
                                            ,	Nombre VARCHAR(150) UNIQUE	\
                                            ,	Cantidad NUMERIC(5,0) NOT NULL	\n\
                                            ,   Color NUMERIC(10,0) NULL \
                                            );'}
                , {Tabla: 'Sesiones', Indice: 'Id_Sesion'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Sesiones (\n\
                                                Id_Sesion NUMERIC(5,0) PRIMARY KEY\n\
                                            ,	Inicio DATETIME NOT NULL\n\
                                            ,	Fin	DATETIME NULL\n\
                                            ,	Pausada NUMERIC(1,0) NULL\n\
                                            , 	CHECK (Fin > Inicio)\n\
                                            );'}
                , {Tabla: 'Bebidas_Sesiones', Indice: 'CAST(Id_Sesion AS STRING)+CAST(Id_Bebida AS STRING)'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Bebidas_Sesiones(\n\
                                                Id_Sesion NUMERIC(5,0) NOT NULL REFERENCES \n\
                                                    Sesiones(Id_Sesion) ON DELETE CASCADE \n\
                                                                        ON UPDATE CASCADE\n\
                                            ,	Id_Bebida NUMERIC(5,0) NOT NULL REFERENCES \n\
                                                    Bebidas(Id_Bebida) ON DELETE CASCADE \n\
                                                                        ON UPDATE CASCADE\n\
                                            ,	Cantidad_Stock NUMERIC(10, 0) NULL \n\
                                            ,	PRIMARY KEY (Id_Sesion, Id_Bebida)\n\
                                            );'}
                , {Tabla: 'TPV', Indice: 'Id_TPV'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS  TPV ( \n\
                                                Id_TPV NUMERIC(3,0) PRIMARY KEY \n\
                                            ,   Nombre VARCHAR(20) NOT NULL \n\
                                            ,   Id_Sesion NUMERIC(5,0) NULL REFERENCES \n\
                                                    Sesiones(Id_Sesion) ON DELETE CASCADE \n\
                                                                        ON UPDATE CASCADE\n\
                                            ,   Fecha DATETIME NULL \n\
                                            );'}
                , {Tabla: 'Acciones', Indice: 'Id_Accion'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS  Acciones ( \n\
                                                Id_Accion NUMERIC(5,0) PRIMARY KEY \n\
                                            ,   Tipo_Accion NUMERIC(2,0) NOT NULL \n\
                                            ,   Id_TPV NUMERIC(3,0) NOT NULL REFERENCES \n\
                                                    TPV(Id_TPV) ON DELETE CASCADE \n\
                                                                ON UPDATE CASCADE \n\
                                            );'}
                , {Tabla: 'Acciones_TPV', Indice: 'CAST(Id_Sesion AS STRING)+CAST(Id_Accion AS STRING)+CAST(Id_TPV AS STRING)'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS  Acciones_TPV( \n\
                                               Id_Accion NUMERIC(5,0) NOT NULL REFERENCES \n\
                                                    Acciones(Id_Accion) ON DELETE CASCADE \n\
                                                                        ON UPDATE CASCADE \n\
                                            ,   Id_TPV NUMERIC(3,0) NOT NULL REFERENCES \n\
                                                    TPV(Id_TPV) ON DELETE CASCADE \n\
                                                                ON UPDATE CASCADE \n\
                                            ,   PRIMARY KEY (Id_Sesion, Id_Accion, Id_TPV) \n\
                                            );'}
                , {Tabla: 'Servicios', Indice: 'Id_Servicio'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Servicios ( \n\
                                                Id_Sesion	NUMERIC(5,0) NOT NULL REFERENCES \n\
                                                    Sesiones(Id_Sesion) ON DELETE CASCADE \n\
                                                                    ON UPDATE CASCADE \n\
                                            ,	Id_Servicio NUMERIC(5,0) NOT NULL PRIMARY KEY\n\
                                            , 	Fecha DATETIME NOT NULL \n\
                                            ,   Id_TPV NUMERIC(3,0) NOT NULL REFERENCES \n\
                                                    TPV(Id_TPV) ON DELETE CASCADE \n\
                                                                ON UPDATE CASCADE \n\
                                            );'}
                , {Tabla: 'Ordenes', Indice: 'Id_Servicio'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Ordenes ( \n\
                                            Id_Servicio NUMERIC(5,0) NOT NULL REFERENCES \n\
                                                    Servicios (Id_Servicio) ON DELETE CASCADE\n\
                                                                            ON UPDATE CASCADE\n\
                                            ,   Id_Orden NUMERIC (2,0) NOT NULL \n\
                                            ,	Id_T_Servicio NUMERIC(3,0) NOT NULL REFERENCES \n\
                                                    Tipo_Servicios (Id_T_Servicio) ON DELETE CASCADE \n\
                                                                            ON UPDATE CASCADE \n\
                                            ,   Id_Bebida NUMERIC(3,0) NOT NULL REFERENCES \n\
                                                    Bebidas (Id_Bebida) ON DELETE CASCADE\n\
                                                                        ON UPDATE CASCADE\n\
                                            ,   Precio NUMERIC(5,2) NOT NULL \n\
                                            ,	PRIMARY KEY (Id_Servicio, Id_Orden, Id_T_Servicio, Id_Bebida) \n\
                                            );'}
                , {Tabla: 'Precios', Indice: 'CAST(Id_G_Bebida AS STRING)+CAST(Id_T_Servicio AS STRING)'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Precios (\n\
                                                Id_G_Bebida NUMERIC(3,0) NOT NULL REFERENCES\n\
                                                    Grupo_Bebidas(Id_G_Bebida) ON DELETE CASCADE\n\
                                                                         ON UPDATE CASCADE\n\
                                            ,	Id_T_Servicio NUMERIC(3,0) NOT NULL REFERENCES\n\
                                                    Tipo_Servicios(Id_T_Servicio) ON DELETE CASCADE\n\
                                                                            ON UPDATE CASCADE\n\
                                            , 	Precio NUMERIC(5,2) NULL\n\
                                            , 	Maximo NUMERIC(5,2) NULL\n\
                                            ,	Minimo NUMERIC(5,2) NULL\n\
                                            , 	Tramo NUMERIC(5,2) NULL\n\
                                            , 	PRIMARY KEY (Id_G_Bebida, Id_T_Servicio)\n\
                                            );'}
                , {Tabla: 'Cotizacion', Indice: 'CAST(Id_Bebida AS STRING)+CAST(Id_T_Servicio AS STRING)'
                    , CreacionTabla: 'CREATE TABLE  IF NOT EXISTS  Cotizacion (\n\
                                                Id_Bebida NUMERIC(5,0) NOT NULL REFERENCES\n\
                                                    Bebidas(Id_Bebida) ON DELETE CASCADE\n\
                                                                    ON UPDATE CASCADE\n\
                                            ,	Id_T_Servicio NUMERIC(3,0) NOT NULL REFERENCES\n\
                                                    Tipos_Servicio(Id_T_Servicio) ON DELETE CASCADE\n\
                                                                           ON UPDATE CASCADE\n\
                                            ,	Precio NUMERIC(5,2) NULL\n\
                                            ,   Fijado NUMERIC(1,0) NULL\n\
                                            , 	PRIMARY KEY (Id_Bebida, Id_T_Servicio) \n\
                                            );'}
                , {Tabla: 'Propiedades', Indice: 'Nombre'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS  Propiedades \
                                            ( \
                                                    Nombre VARCHAR(150) PRIMARY KEY \
                                            ,	Valor VARCHAR(300) NULL \
                                            );'}
            ]
            , arrValoresxDefecto = [
                "INSERT INTO Propiedades VALUES('Precio','3.5');"
                    , "INSERT INTO Propiedades VALUES('Maximo', '4');"
                    , "INSERT INTO Propiedades VALUES('Minimo', '2');"
                    , "INSERT INTO Propiedades VALUES('Tramo', '0.1');"
                    , "INSERT INTO Propiedades VALUES('Cantidad_Botella','700');"
                    , "INSERT INTO Propiedades VALUES('Cantidad_Stock', '5');"
                    , "INSERT INTO Propiedades VALUES('Contraseña_Encargado', '');"
                    , "INSERT INTO Grupos_Bebida VALUES(0,'Whisky', 1, 15705344, 1);"
                    , "INSERT INTO Grupos_Bebida VALUES(1,'Ginebra',1 , 255, 2);"
                    , "INSERT INTO Grupos_Bebida VALUES(2,'Ron', 1, 11141120, 3);"
                    , "INSERT INTO Grupos_Bebida VALUES(3,'Vodka', 1, 11519721, 4);"
                    , "INSERT INTO Grupos_Bebida VALUES(4,'Brandy', 1, 3118772, 6);"
                    , "INSERT INTO Grupos_Bebida VALUES(5,'Tequila',1, 10508844, 5);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,0,'100 pipers', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,1,'Ballantines', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,2,'Cardhu', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,3,'Cutty sark', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,4,'Four Roses', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,5,'JB', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,6,'Jack Daniels', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,7,'Jameson', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,8,'Jhonnie Walker', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,9,'Passport', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,10,'Vat 69', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,11,'White Label', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,31,'Red Label', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,12,'Beefeater', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,13,'Gordon', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,14,'Larios', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,15,'Seagrams', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,16,'Tanqueray', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,17,'Arehucas', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,18,'Bacardi', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,19,'Barceló', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,20,'Brugal', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,21,'Cacique', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,22,'Havana Club', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,23,'Matusalem', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,24,'Negrita', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(3,25,'Absolut', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(3,26,'Smirnof', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(4,27,'Soberano', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(4,28,'Terry', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(4,29,'Veterano', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(5,30,'José Cuervo', 700, 3500);"
                    , "INSERT INTO Tipos_Servicio(Id_T_Servicio, Nombre, Cantidad) VALUES (0, 'Copa', 50);"
                    , "INSERT INTO Tipos_Servicio(Id_T_Servicio, Nombre, Cantidad) VALUES (1, 'Chupito', 25);"
                    , "INSERT INTO Precios(Id_G_Bebida, Id_T_Servicio, Precio, Maximo, Minimo, Tramo) VALUES (-1, 0, 3.5, 4, 2, 0.1);"
                    , "INSERT INTO Precios(Id_G_Bebida, Id_T_Servicio, Precio, Maximo, Minimo, Tramo) VALUES (-1, 1, 1, 1, 1, 1);"
                    , "INSERT INTO TPV(Id_TPV, Nombre) VALUES (0, 'TPV_01');"
                    , "INSERT INTO TPV(Id_TPV, Nombre) VALUES (1, 'TPV_02');"
                    , "INSERT INTO TPV(Id_TPV, Nombre) VALUES (2, 'TPV_03');"
                    , "INSERT INTO TPV(Id_TPV, Nombre) VALUES (3, 'IPAD_01');"
                    , "INSERT INTO TPV(Id_TPV, Nombre) VALUES (4, 'IPAD_02');"
                    , "INSERT INTO TPV(Id_TPV, Nombre) VALUES (5, 'IPAD_03');"
                    , "INSERT INTO TPV(Id_TPV, Nombre) VALUES (6, 'TABLET_01');"
                    , "INSERT INTO TPV(Id_TPV, Nombre) VALUES (7, 'TABLET_02');"
                    , "INSERT INTO TPV(Id_TPV, Nombre) VALUES (8, 'TABLET_03');"
            ]
            , Resultado = function() {
                var ObResultados;
                var self;
                return {
                    ObtenerResultados: function(EvObResults) {
                        ObResultados = EvObResults;
                    }/* evento function(results) */
                    , _self: function(_self) {
                        self = _self;
                    }
                    , fnResultado: function(error, results) {
                        if (error !== null) {
                            console.log("Error: " + this.sql + '\n' + error);
                            if (!global.isUndefined(ObResultados))
                                ObResultados(false, this.sql + '\n' + error, self);
                            return;
                        }
                        if (!global.isUndefined(ObResultados)) {
                            var rowsArray = [];
                            if (!global.isUndefined(results)) {
                                if (results.length > 0) {
                                    for (var i = 0; i < results.length; i++) {
                                        rowsArray[i] = new Array();
                                        for (var key in results[i])
                                            rowsArray[i].push(results[i][key]);
                                    }
                                }
                            }
                            ObResultados(true, rowsArray, self);
                        }
                    }
                };
            }
        , CrearTablas = function() {
            if (!database) {
                console.log('Error: no se ha cargado ninguna base de datos');
                return;
            }
            database.serialize(function() {
                var oResultado = new Resultado();
                var ArrCmdSql = [];
                for (var t = 0; t < arrTablas.length; t++)
                    ArrCmdSql[t] = arrTablas[t].CreacionTabla;
                database.exec(ArrCmdSql.join(" "), oResultado.fnResultado);

            });
        }
        , InsertarValoresxDefecto = function() {
            if (!database) {
                console.log('Error: no se ha cargado ninguna base de datos');
                return;
            }
            database.serialize(function() {
                var oResultado = new Resultado();
                database.exec(arrValoresxDefecto.join(" "), oResultado.fnResultado);
            });
        }
        , BorrarTablas = function(EvResultado) {
            if (!database) {
                console.log('Error: no se ha cargado ninguna base de datos');
                if (!global.isUndefined(EvResultado))
                    EvResultado(false, "Error: no se ha cargado ninguna base de datos", null);
                return;
            }
            database.serialize(
                function() {
                    var ArrCmdSql = [];
                    for (var t = 0; t < arrTablas.length; t++)
                        ArrCmdSql[t] = "DROP TABLE IF EXISTS " + arrTablas[t].Tabla + ";";
                    database.exec(ArrCmdSql);
                });
        }
        , ExecSQL = function(/* Comando SQL */cmdSQL, /* evento resultante */ EvObtenerResultados, _self) {
            if (!database) {
                console.log('Error: no se ha cargado ninguna base de datos');
                if (!global.isUndefined(EvObtenerResultados))
                    EvObtenerResultados(false, "Error: no se ha cargado ninguna base de datos", _self);
                return;
            }
            database.serialize(function() {
                var oResultado = new Resultado();
                oResultado.ObtenerResultados(EvObtenerResultados);
                oResultado._self(_self);
                if (typeof cmdSQL === "string")
                    database.all(cmdSQL, oResultado.fnResultado);
                else {
                    database.exec(cmdSQL.join(" "), oResultado.fnResultado);
                }
            });

        }
        , ObNuevoId = function(oTabla, EvObtenerNuevoId) {
            ExecSQL('SELECT COALESCE(MAX(' + oTabla.Indice + '),0)+1 AS Cantidad FROM ' + oTabla.Tabla + ';'
                , function(bExito, rowsArray) {
                    if (!global.isUndefined(EvObtenerNuevoId))
                        if (bExito)
                            EvObtenerNuevoId(rowsArray[0][0]);
                        else
                            EvObtenerNuevoId(0);
                }
            );
        }
        , ObDatosTabla = function(oTabla, EvObtenerResultados) {
            return ExecSQL('SELECT * FROM ' + oTabla.Tabla + ';', EvObtenerResultados);
        };

        try {
            //crear base de datos ...
            //existe el archivo
            var bExisteBasedeDatos = fs.existsSync(archDatabase);
            if (!bExisteBasedeDatos)
                fs.openSync(archDatabase, 'w');
            database = new sqlite3.Database(archDatabase, sqlite3.OPEN_READWRITE | sqlite3.CREATE
                , function(error) {
                    if (error !== null) {
                        console.log("No se ha podido crear la base de datos.\n" + error);
                        return;
                    }
                    //añadir las tablas una vez creada...
                    CrearTablas();
                    //si no existía el archivo añadir valores por defecto
                    if (!bExisteBasedeDatos)
                        InsertarValoresxDefecto();
                });
        } catch (e) {
            console.log("Error desconocido: " + e + ".");
            return;
        }


        return {
            /* variable de resultados para poder enviarlos cuando se ejecute los comando */
            Tablas: arrTablas

            , ReiniciarBaseDeDatos: function(EvResultado) {
                BorrarTablas(function(bExito, strMensaje) {
                    if (!bExito) {
                        if (!global.isUndefined(EvResultado))
                            EvResultado(bExito, strMensaje);
                        return;
                    }

                    //Creamos las tablas
                    var cmdSQL = [];
                    for (var t = 0; t < arrTablas.length; t++) {
                        cmdSQL[t] = arrTablas[t].CreacionTabla;
                    }
                    ExecSQL(cmdSQL, function(bExito, strMensaje) {
                        if (!bExito) {
                            if (!global.isUndefined(EvResultado))
                                EvResultado(bExito, "No se ha podido generar las tablas debido a: " + strMensaje);
                            return;
                        }
                        //añadir los valores por defecto
                        ExecSQL(arrValoresxDefecto, function(bExito, strMensaje) {
                            if (!bExito) {
                                if (!global.isUndefined(EvResultado))
                                    EvResultado(bExito, "Se han creado las tablas, pero no se han podido añadir los valores por defecto debido a: " + strMensaje);
                                return;
                            }
                            EvResultado(bExito, "Consulta ejecutada con éxito.");
                        });
                    });
                });
            }
            , EjecutarSQL: ExecSQL
            , Grupos_Bebida: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Grupos_Bebida], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Grupos_Bebida], EvObtenerId);
                }
            }
            , Bebidas: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Bebidas], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Bebidas], EvObtenerId);
                }
            }
            , Tipos_Servicio: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Tipos_Servicio], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Tipos_Servicio], EvObtenerId);
                }
            }
            , Sesiones: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Sesiones], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Sesiones], EvObtenerId);
                }
            }
            , Bebidas_Sesiones: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Bebidas_Sesiones], EvObtenerResultados);
                }
            }
            , TPV: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.TPV], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.TPV], EvObtenerId);
                }
            }
            , Acciones: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Acciones], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Acciones], EvObtenerId);
                }
            }
            , Acciones_TPV: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Acciones_TPV], EvObtenerResultados);
                }
            }
            , Servicios: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Servicios], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Servicios], EvObtenerId);
                }
            }
            , Ordenes: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Ordenes], EvObtenerResultados);
                }
            }
            , Precios: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Precios], EvObtenerResultados);
                }
            }
            , Cotización: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Cotización], EvObtenerResultados);
                }
            }
            , Propiedades: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Cotización], EvObtenerResultados);
                }
                , ObtenerPropiedades: function(Propiedades, EvObtResultados, _self) {
                    var cmdSQL = "SELECT Nombre, Valor FROM PROPIEDADES WHERE ";
                    if (typeof Propiedades === "string")
                        cmdSQL += "Nombre = '" + Propiedades + "';";
                    else
                        for (var i = 0, propiedad; propiedad = Propiedades[i], i < Propiedades.length; i++)
                            cmdSQL += (i === 0 ? " Nombre IN ( " : "") + "'" + propiedad + "'" + (i === Propiedades.length - 1 ? ");" : ",");
                    ExecSQL(cmdSQL, function(bExito, rowsArray, _self) {
                        if (!bExito) {
                            if (!global.isUndefined(EvObtResultados))
                                EvObtResultados(bExito, rowsArray, _self);
                            return;
                        }
                        //colocarlos todos en diccionario
                        var valores = {};
                        for (var i = 0; i < rowsArray.length; i++)
                            valores[rowsArray[i][0]] = rowsArray[i][1];
                        if (!global.isUndefined(EvObtResultados))
                            EvObtResultados(bExito, valores, _self);
                    }, _self);
                }
            }
        };
    })();


