/*
 * Copyright (C) José Ángel Navarro Martínez (janmbaco@gmail.com)
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
    , tpvs = module.exports = (function() {
        return {
            AñadirTPV: function(Nombre, IP, EvResultado) {
                db.TPV.ObtenerNuevoId(
                    function(id) {
                        if (id === 0) {
                                if (!global.isUndefined(EvResultado))
                                    EvResultado(false, "Error no se ha podido incrementear el índice");
                                return;
                            }
                        db.EjecutarSQL("INSERT INTO TPV(Id_TPV, Nombre, IP) VALUES(" + id + ",'" + Nombre + "','" + IP + "')"
                            , function(bExito, Mensaje) {
                                if (!global.isUndefined(EvResultado))
                                    EvResultado(bExito, bExito ? id : Mensaje);
                                return;
                            });

                    });

            }
            , ModificarTPV: function(Id_TPV, Nombre, EvResultado) {
                //TODO: Comprobaciones del Id_Empleado y el Id_Perfil
                db.EjecutarSQL("UPDATE TPV SET Nombre = '" + Nombre + "' WHERE Id_TPV = " + Id_TPV, EvResultado);
            }
            , QuitarTPV: function(Id_TPV, EvResultado) {
                db.EjecutarSQL("DELETE FROM TPV WHERE Id_TPV = " + Id_TPV, EvResultado);
            }
            , ListarTPV: function(EvObtResultados){
                db.EjecutarSQL("SELECT Id_TPV, Nombre FROM TPV", EvObtResultados);
            }
            , RegistrarActualizacion: function(Id_TPV, EvResultado){
                db.EjecutarSQL("UPDATE TPV SET FECHA = '" + (new global.DateTime()).formats.compound.mySQL + "' WHERE Id_TPV = "+Id_TPV, EvResultado);
            }
           
        };
    })();
