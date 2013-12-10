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
    , servicios = module.exports = (function() {
        return {
            TiposServicio: (function() {
                return{
                     Añadir: function(Nombre, Cantidad, Color, EvResultado) {
                        db.Tipos_Servicio.ObtenerNuevoId(function(id) {
                            if (id === 0) {
                                if (!global.isUndefined(EvResultado))
                                    EvResultado(false, "Error no se ha podido incrementear el índice");
                                return;
                            }
                            db.EjecutarSQL("INSERT INTO Tipos_Servicio(Id_T_Servicio, Nombre, Cantidad, Color) VALUES (" + id + ",'" + Nombre + "'," + Cantidad + "," + Color + ");"
                                , function(bExito, Mensaje) {
                                    if (!global.isUndefined(EvResultado))
                                        EvResultado(bExito, bExito ? id : Mensaje);
                                }
                            );
                        });
                    }
                    , Modificar: function(idTServicio, Nombre, Cantidad, Color, EvResultado) {
                        db.EjecutarSQL("UPDATE Tipos_Servicio SET Nombre = '" + Nombre + "', Cantidad = " + Cantidad + ", Color = " + Color + " WHERE Id_T_Servicio = " + idTServicio + ";"
                            , EvResultado
                            );
                    }
                    , Quitar: function(idTServicio, EvResultado) {
                        db.EjecutarSQL("DELETE FROM Precios WHERE Id_T_Servicio = " + idTServicio + ";"
                            , function(bExito, Mensaje) {
                                if (!bExito) {
                                    if (!global.isUndefined(EvResultado))
                                        EvResultado(false, Mensaje);
                                    return;
                                }
                                db.EjecutarSQL("DELETE FROM Tipos_Servicio WHERE Id_T_Servicio = " + idTServicio + ";"
                                    , EvResultado);
                            });
                    }
                    , ListarPrecios: function(IdTipoServicio, EvObtResultado) {
                        db.EjecutarSQL("SELECT Precio, Maximo, Minimo, Tramo, P.Id_G_Bebida, IFNULL(Nombre, 'Genérico') FROM Precios P LEFT JOIN Grupos_Bebida G ON G.Id_G_Bebida = P.Id_G_Bebida WHERE Id_T_Servicio = " + IdTipoServicio + ";", EvObtResultado);
                    }
                    , ObtenerPrecio: function(idBebida, idTipoServicio, EvObtResultado) {
                        db.EjecutarSQL("SELECT Precio FROM Cotizacion WHERE Id_Bebida = " + idBebida + " AND Id_T_Servicio = " + idTipoServicio + ";"
                            , function(bExito, rowsArray) {
                                if (!bExito) {
                                    if (!global.isUndefined(EvObtResultado))
                                        EvObtResultado(bExito, rowsArray);
                                    return;
                                }
                                if (rowsArray.length > 0 && rowsArray[0][0] != null) {
                                    if (!global.isUndefined(EvObtResultado))
                                        EvObtResultado(true, parseFloat(rowsArray[0][0]));
                                } else {
                                    if (!global.isUndefined(EvObtResultado))
                                        EvObtResultado(true, null);
                                }
                            });
                    }
                    , FijarPrecio: function(idBebida, idTipoServicio, Precio, EvResultado) {
                        db.EjecutarSQL("UPDATE Cotizacion SET Precio = " + Precio + ", Fijado = 1 WHERE Id_Bebida = " + idBebida + " AND ID_T_Servicio = " + idTipoServicio + ";",
                            EvResultado);
                    }
                    , LiberarPrecio: function(idBebida, idTipoServicio, EvResultado) {
                        db.EjecutarSQL("UPDATE Cotizacion SET Fijado = 0 WHERE id_Bebida = " + idBebida + " AND Id_T_Servicio = " + idTipoServicio + ";",
                            EvResultado);
                    }
                    , Cotizar: function(idGrupoBebida, idBebida, idTipoServicio, RelacionInicial, PrecioInicial, Maximo, Minimo, Tramo, EvObtResultado) {

                        //comprobbar que el precio no lo tenga fijado y al mismo tiempo obtener el precio para cotizar
                        db.EjecutarSQL("SELECT Precio, IFNULL(Fijado, 0) FROM Cotizacion WHERE Id_Bebida = " + idBebida + " AND Id_T_Servicio = " + idTipoServicio + ";"

                            , function(bExito, rowsArray) {
                                if (!bExito) {
                                    if (!global.isUndefined(EvObtResultado)) {
                                        EvObtResultado(bExito, rowsArray);
                                    }
                                    return;
                                }
                                var Precio = parseFloat(rowsArray[0][0]);
                                if (rowsArray[0][1] == 1) {
                                    //no es necesario cotizar
                                    if (!global.isUndefined(EvObtResultado)) {
                                        EvObtResultado(true, Precio);
                                    }
                                    return;
                                }
                                db.EjecutarSQL("SELECT Cantidad_Stock, Cantidad_Total, Cantidad_Bebidas \n\
                                                    FROM Bebidas\n\
                                                    LEFT JOIN (SELECT SUM(Cantidad_Stock) AS Cantidad_Total, COUNT(Id_Bebida) Cantidad_Bebidas\n\
                                                            FROM Bebidas\n\
                                                            WHERE Id_G_Bebida = " + idGrupoBebida + "\n\
                                                         ) T ON  1=1\n\
                                                    WHERE Id_Bebida = " + idBebida + ";"

                                    , function(bExito, rowsArray) {
                                        if (!bExito) {
                                            if (!global.isUndefined(EvObtResultado))
                                                EvObtResultado(bExito, rowsArray);
                                            return;
                                        }
                                        var Cantidad_Bebidas = parseInt(rowsArray[0][2], 10);
                                        var relacionActual = parseFloat(rowsArray[0][0]) / parseFloat(rowsArray[0][1]);
                                        var diff = 1 - relacionActual / RelacionInicial;
                                        var valorRedondeo = Math.pow(10, Tramo.toString().split(".")[1].length);
                                        if (diff >= 0) {
                                            var valorAIncrementar = Math.abs(Math.round(diff * (/*Maximo -*/ PrecioInicial) * valorRedondeo) / valorRedondeo);
                                            var trmos = parseInt(valorAIncrementar / Tramo);
                                            var PrecioActual = PrecioInicial + trmos * Tramo;
                                            if (PrecioActual > Maximo)
                                                PrecioActual = Maximo;
                                            db.EjecutarSQL("Update Cotizacion SET Precio =  " + PrecioActual + " WHERE Id_Bebida = " + idBebida + " AND Id_T_Servicio = " + idTipoServicio + "; "
                                                , function(bExito, strMensaje) {
                                                    if (!bExito) {
                                                        if (!global.isUndefined(EvObtResultado))
                                                            EvObtResultado(bExito, strMensaje);
                                                        return;
                                                    }
                                                    if (!global.isUndefined(EvObtResultado))
                                                        EvObtResultado(bExito, PrecioActual);
                                                });
                                        } else if (diff < 0) {
                                            var valorADecrementar = Math.abs(Math.round(diff * (PrecioInicial  /**(Cantidad_Bebidas/2) - Minimo*/) * valorRedondeo) / valorRedondeo);
                                            var trmos = parseInt(valorADecrementar / Tramo);
                                            var PrecioActual = PrecioInicial - trmos * Tramo;
                                            if (PrecioActual < Minimo)
                                                PrecioActual = Minimo;
                                            db.EjecutarSQL("Update Cotizacion SET Precio =  " + PrecioActual + " WHERE Id_Bebida = " + idBebida + " AND Id_T_Servicio = " + idTipoServicio + "; "
                                                , function(bExito, strMensaje) {
                                                    if (!bExito) {
                                                        if (!global.isUndefined(EvObtResultado))
                                                            EvObtResultado(bExito, strMensaje);
                                                        return;
                                                    }
                                                    if (!global.isUndefined(EvObtResultado))
                                                        EvObtResultado(bExito, PrecioActual);
                                                });
                                        }
                                    });
                            });
                    }

                };
            })()
            , Precios: (function() {
                return {
                    Añadir: function(IdTipoServicio, IdGrupoBebida, Precio, Maximo, Minimo, Tramo, EvResultado) {
                        db.EjecutarSQL("INSERT INTO Precios(Id_T_Servicio, Id_G_Bebida, Precio, Maximo, Minimo, Tramo) VALUES(" + IdTipoServicio + "," + IdGrupoBebida + "," + Precio + "," + Maximo + "," + Minimo + "," + Tramo + ");", EvResultado);
                    }
                    , Modificar: function(IdTipoServicio, IdGrupoBebida, Precio, Maximo, Minimo, Tramo, EvResultado) {
                        db.EjecutarSQL("UPDATE Precios SET Precio = " + Precio + ", Maximo = " + Maximo + ", Minimo = " + Minimo + ", Tramo = " + Tramo + " WHERE Id_T_Servicio = " + IdTipoServicio + " AND Id_G_Bebida = " + IdGrupoBebida + "; ", EvResultado);
                    }
                    , Quitar: function(IdTipoServicio, IdGrupoBebida, EvResultado) {
                        db.EjecutarSQL("DELETE FROM Precios WHERE Id_T_Servicio = " + IdTipoServicio + " AND Id_G_Bebida = " + IdGrupoBebida + ";", EvResultado);
                    }
                };
            })()
            , ListarTiposServicio: function(EvObtResultados) {
                db.EjecutarSQL("SELECT Id_T_Servicio, Nombre, Cantidad, Color FROM Tipos_Servicio", EvObtResultados);
            }
            , TotalTiposServicio: function(EvResultados) {
                db.EjecutarSQL("SELECT  COUNT(Id_T_Servicio) FROM  Tipos_Servicio",
                    function(bExito, rowsArray) {
                        if (!bExito) {
                            if (!global.isUndefined(EvResultados))
                                EvResultados(bExito, rowsArray);
                            return;
                        }
                        if (!global.isUndefined(EvResultados))
                            EvResultados(bExito, rowsArray[0][0]);
                    });
            }
            , ListarServicios: function(EvObtResultados){
                db.EjecutarSQL("SELECT S.Id_Sesion, S.Id_Servicio, O.Id_T_Servicio, TS.Nombre, O.Id_Bebida, B.Nombre, O.Precio, S.Fecha \n\
                                FROM Servicios S \n\
                                JOIN Ordenes O ON S.Id_Servicio = O.Id_servicio\n\
                                JOIN Tipos_Servicio TS ON 0.Id_T_Servicio = TS.Id_T_Servicio \n\
                                JOIN Bebida B ON 0.Id_Bebida = B.Id_Bebida \n\
                                WHERE S.Id_Sesion = (SELECT Id_Sesion FROM Sesiones WHERE Fin IS NULL);", EvObtResultados);
            }
            , Servicio: (function() {
                return {
                    Añadir: function(ArrDatosServicio, EvResultado) {
                        db.Servicios.ObtenerNuevoId(
                            function(id) {
                                if (!id) {
                                    if (!global.isUndefined(EvResultado))
                                        EvResultado(false, "No se ha podido obtener el identificador de servicio");
                                    return;
                                }
                                var ArrCmdSql = [];
                                ArrCmdSql[0] = "INSERT INTO Servicios(Id_Sesion, Id_Servicio, Fecha, TPV) SELECT Id_Sesion, " + id + " Id_Servicio, '" + 
                                        (new global.DateTime()).formats.compound.mySQL + "' Fecha, '"+
                                        ArrDatosServicio[0].TPV + "' TPV FROM Sesiones WHERE FIN IS NULL;";
                                for (var i = 0, j = 1; i < ArrDatosServicio.length; i++, j++){
                                    ArrCmdSql[j] = "INSERT INTO Ordenes(Id_Servicio, Id_Orden, Id_T_Servicio, Id_Bebida, Precio)\n\
                                                        VALUES("+id+", "+ArrDatosServicio[i].IdOrden+","+ArrDatosServicio[i].IdTipoServicio+", " + ArrDatosServicio[i].IdBebida+", "+ArrDatosServicio[i].Precio+");";
                                    ArrCmdSql[++j] = "UPDATE Bebidas SET Cantidad_Stock = Cantidad_Stock - (SELECT Cantidad \n\
                                                                                                            FROM Tipos_Servicio \n\
                                                                                                            WHERE Id_T_Servicio = " + ArrDatosServicio[i].IdTipoServicio + ") \n\
                                                        WHERE Id_Bebida = " + ArrDatosServicio[i].IdBebida + ";";
                                }
                               

                                if (ArrCmdSql.length === 0) {
                                    if (!global.isUndefined(EvResultado))
                                        EvResultado(false, "No existe servicio que añadir");
                                    return;
                                }

                                //añadir en servicios el servicio en si
                                db.EjecutarSQL(ArrCmdSql, function(bExito, strMensaje) {
                                    if (!global.isUndefined(EvResultado))
                                        EvResultado(bExito, bExito ? id : strMensaje);
                                });
                            });
                    }
                    , QuitarDatos: function(IdServicio, ArrDatosServicio, EvResultado) {
                        var ArrCmdSql = [];
                        for (var i = 0; i < ArrDatosServicio.length; i++)
                            ArrCmdSql = ["DELETE FROM Ordenes WHERE Id_Servicio = " + IdServicio + " AND Id_Orden = "+ArrDatosServicio[i].IdOrden+" AND Id_T_Servicio = " + ArrDatosServicio[i].IdTipoServicio + " AND Id_Bebida = " + ArrDatosServicio[i].IdBebida + ";"];

                        if (ArrCmdSql.length === 0) {
                            if (!global.isUndefined(EvResultado))
                                EvResultado(false, "No existe servicio que eliminar");
                            return;
                        }
                        db.EjecutarSQL(ArrCmdSql, EvResultado);
                    }
                    , Quitar: function(IdServicio, EvResultado){
                        db.EjecutarSQL("DELETE FROM Servicios WHERE  Id_Servicio = "+ IdServicio +";", EvResultado);
                    }
                };
            })()
        };
    })();
