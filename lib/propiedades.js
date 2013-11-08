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

var global = require("./global")
    , db = require("./database")
    , propiedades = module.exports = (function() {
        return {
             ListarPropiedades: function(EvResultado) {
                db.EjecutarSQL("SELECT Nombre, Valor FROM Propiedades", EvResultado);
            }
            , ModificarPropiedad: function(Nombre, Valor, EvResultado){
                db.EjecutarSQL("UPDATE Propiedades SET Valor='" + Valor + "' WHERE Nombre='" + Nombre + "';", EvResultado);
            }
        };
    })();
