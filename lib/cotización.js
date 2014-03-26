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


var global = require("./global")
    , db = require("./database")
    , cotización = module.exports = (function() {


        return {
            IniciarSesión: function(ArrayIdGruposBebida, EvResultado) {
                //generar una nueva sesión y darle la fecha de inicio la actual
                debugger;
                db.Sesiones.ObtenerNuevoId(function(id) {
                    if (!id) {
                        if (!global.isUndefined(EvResultado))
                            EvResultado(false, "No se ha podido identificar la sesión");
                        return;
                    }
                    //crear una nueva sesión y cargar grupos bebida sesiones y bebida sesiones
                    var cmdSQL = ["INSERT INTO Sesiones(Id_Sesion, Inicio) VALUES (" + id + ",'" + (new global.DateTime()).formats.compound.mySQL + "');"];
                    for (var i = 0; i < ArrayIdGruposBebida.length; i++) {
                        cmdSQL[i+1] = "INSERT INTO Bebidas_Sesiones \n\
                                    SELECT " + id + " Id_Sesion, Id_Bebida, Cantidad_Stock \n\
                                    FROM Bebidas \n\
                                    WHERE Id_G_Bebida = " + ArrayIdGruposBebida[i] + ";";
                    }
                    //Eliminar la cotización anterior
                    cmdSQL[cmdSQL.length] = "DELETE FROM Cotizacion;"; 
                    db.EjecutarSQL(cmdSQL, EvResultado);

                });
            }
            , ListarCotización: function(EvObtResultados) {
                db.EjecutarSQL("SELECT GB.Id_G_Bebida, GB.Nombre Grupo_Bebida, B.Id_Bebida, B.Nombre Bebida, T.Id_T_Servicio, T.Nombre Tipo_Servicio,  C.Precio, COALESCE(SBS.Cantidad_Servicios, 0), B.Cantidad_Stock / T.Cantidad Cantidad_Restante, IFNULL(C.Fijado, 0) \n\
                                FROM Cotizacion C \n\
                                JOIN Bebidas B ON B.Id_Bebida = C.Id_Bebida\n\
                                JOIN Grupos_Bebida GB ON B.Id_G_Bebida = GB.Id_G_Bebida \n\
                                JOIN Tipos_Servicio T ON T.Id_T_Servicio = C.Id_T_Servicio \n\
                                LEFT JOIN (SELECT COUNT(O.Id_Servicio) Cantidad_Servicios, Id_T_Servicio, Id_Bebida \n\
                                        FROM Ordenes O\n\
                                        JOIN Servicios S ON O.Id_Servicio = S.Id_Servicio AND S.Id_Sesion = (SELECT Id_Sesion From Sesiones WHERE Fin IS NULL)\n\
                                        GROUP BY Id_T_Servicio, Id_Bebida) SBS ON SBS.Id_Bebida = B.Id_Bebida AND T.Id_T_Servicio = SBS.Id_T_Servicio\n\
                                ORDER BY GB.Orden, B.Nombre ;\n\
                                ", EvObtResultados);
            }
            , SesiónIniciada: function(EvObtResultados) {
                db.EjecutarSQL("SELECT COUNT(*) FROM Sesiones WHERE Fin IS NULL"
                    , function(bExito, rowsArray) {
                        if (!bExito) {
                            if (!global.isUndefined(EvObtResultados))
                                EvObtResultados(bExito, rowsArray);
                            return;
                        }
                        if (!global.isUndefined(EvObtResultados))
                            EvObtResultados(bExito, rowsArray[0][0]);
                    });
            }
            , TiempoSesión: function(EvObtTiempoSesión) {
                db.EjecutarSQL("SELECT Inicio, Pausada FROM Sesiones WHERE Fin is NULL", function(bExito, rowsArray) {
                    if (!bExito) {
                        if (!global.isUndefined(EvObtTiempoSesión)) {
                            EvObtTiempoSesión(bExito, rowsArray);
                        }
                        return;
                    }
                    //comprobar que no sea NULL
                    if (!rowsArray.length) {
                        if (!global.isUndefined(EvObtTiempoSesión)) {
                            EvObtTiempoSesión(false, "No existe un sesión iniciada");
                        }
                        return;
                    }
                    //retorno un resultado con el Tiempo de sesión e indico si está en pausa
                    var resultado = {Inicio: new Date(rowsArray[0][0])
                        , TiempoSesión: parseInt(((new Date()).getTime() - (new Date(rowsArray[0][0])).getTime()) / 1000, 10)
                        , Pausada: rowsArray[0][1] != null
                    };
                    if (!global.isUndefined(EvObtTiempoSesión))
                        EvObtTiempoSesión(true, resultado);
                });
            }
            , CerrarSesión: function(EvResultado) {
                db.EjecutarSQL("UPDATE Sesiones SET Fin = '" + (new global.DateTime()).formats.compound.mySQL + "' WHERE Fin is NULL;"
                    , EvResultado);
            }
            , PausarSesión: function(EvResultado) {
                db.EjecutarSQL("UPDATE Sesiones SET Pausada = 1 WHERE Fin IS NULL"
                    , EvResultado);
            }
            , ReanudarSesión: function(EvResultado) {
                db.EjecutarSQL("UPDATE Sesiones SET Pausada = NULL WHERE Fin IS NULL"
                    , EvResultado);
                 
            }
        };
    })();
