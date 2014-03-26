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
    , stock = module.exports = (function() {

        return {
            GruposBebida: (function() {
                return{
                    ListarPrecios: function(idGrupoBebida, EvResultado) {
                        db.EjecutarSQL("SELECT Tipos_Servicio.Id_T_Servicio, Tipos_Servicio.Nombre, Precio, Maximo, Minimo, Tramo FROM Precios LEFT JOIN Tipos_Servicio ON Tipos_Servicio.Id_T_Servicio = Precios.Id_T_Servicio WHERE Precios.Id_G_Bebida = " + idGrupoBebida + " ORDER BY Nombre;"
                            , EvResultado);
                    }
                    , ListarBebidas: function(idGrupoBebida, EvResultado) {
                        db.EjecutarSQL("SELECT Id_Bebida, Nombre, Cantidad_Botella FROM Bebidas WHERE Id_G_Bebida = " + idGrupoBebida + " ORDER BY Nombre;"
                            , EvResultado);
                    }
                };
            })()

            , Bebidas: (function() {
                return {
                    ListarTiposServicio: function(idGrupoBebida, idBebida, bTiposGenericos, RelacionInicial, EvResultado) {
                        var TiposServicioxBebida = [];

                        //Lista los tipos de servicios
                        db.EjecutarSQL("SELECT Id_T_Servicio, Nombre, Cantidad, Color FROM Tipos_Servicio;"
                            , function(bExito, arrTiposServicio) {
                                if (!bExito) {
                                    if (!global.isUndefined(EvResultado))
                                        EvResultado(bExito, arrTiposServicio);
                                    return;
                                }
                                var sec = 0;
                                var CargaRecursiva = function() {
                                    //mientras la secuencia sea menor
                                    if (sec === arrTiposServicio.length) {
                                        if (!global.isUndefined(EvResultado))
                                            EvResultado(true, TiposServicioxBebida);
                                        return;
                                    }
                                    //vamos a obtener los datos para este tipo de servicio con esta bebida
                                    db.EjecutarSQL("SELECT Precio, Maximo, Minimo, Tramo, Cantidad_Stock, Cantidad_Total, Cantidad_Bebidas \n\
                                                    FROM Precios \n\
                                                    LEFT JOIN (SELECT Cantidad_Stock, Cantidad_Total, Cantidad_Bebidas \n\
                                                                FROM Bebidas\n\
                                                                 LEFT JOIN (SELECT SUM(Cantidad_Stock) AS Cantidad_Total, COUNT(Id_Bebida) Cantidad_Bebidas\n\
                                                                    FROM Bebidas\n\
                                                                    WHERE Id_G_Bebida = " + idGrupoBebida + "\n\
                                                                    ) T ON  1=1\n\
                                                                    WHERE Id_Bebida = " + idBebida + ") T ON 1=1 \n\
                                                    WHERE Id_T_Servicio = " + arrTiposServicio[sec][0] + " AND Id_G_Bebida = " + idGrupoBebida + ";"

                                        , function(bExito, rowsArray) {

                                            if (!bExito) {
                                                if (!global.isUndefined(EvResultado))
                                                    EvResultado(bExito, rowsArray);
                                                return;
                                            }
                                            if (rowsArray.length === 0) {
                                                debugger;
                                                if (!bTiposGenericos) {
                                                    sec++;
                                                    CargaRecursiva();
                                                    return;
                                                }
                                                db.EjecutarSQL("SELECT Precio, Maximo, Minimo, Tramo, Cantidad_Stock, Cantidad_Total, Cantidad_Bebidas \n\
                                                                FROM Precios \n\
                                                                LEFT JOIN (SELECT Cantidad_Stock, Cantidad_Total, Cantidad_Bebidas \n\
                                                                            FROM Bebidas\n\
                                                                             LEFT JOIN (SELECT SUM(Cantidad_Stock) AS Cantidad_Total, COUNT(Id_Bebida) Cantidad_Bebidas\n\
                                                                                FROM Bebidas\n\
                                                                                WHERE Id_G_Bebida = " + idGrupoBebida + "\n\
                                                                                ) T ON  1=1\n\
                                                                                WHERE Id_Bebida = " + idBebida + ") T ON 1=1 \n\
                                                                WHERE Id_T_Servicio = " + arrTiposServicio[sec][0] + " AND Id_G_Bebida = -1;"
                                                    , function(bExito, rowsArray2) {
                                                        if (!bExito) {
                                                            if (!global.isUndefined(EvResultado))
                                                                EvResultado(bExito, rowsArray2);
                                                            return;
                                                        }
                                                        if (rowsArray2.length === 0) {
                                                            //Continuar
                                                            sec++;
                                                            CargaRecursiva();
                                                            return;
                                                        }
                                                        var i = TiposServicioxBebida.length;
                                                        TiposServicioxBebida[i] = [];
                                                        TiposServicioxBebida[i][0] = parseInt(arrTiposServicio[sec][0], 10);
                                                        TiposServicioxBebida[i][1] = arrTiposServicio[sec][1];
                                                        TiposServicioxBebida[i][2] = parseInt(arrTiposServicio[sec][2], 10);
                                                        TiposServicioxBebida[i][3] = parseInt(arrTiposServicio[sec][3], 10);
                                                        TiposServicioxBebida[i][4] = parseFloat(rowsArray2[0][0]);
                                                        TiposServicioxBebida[i][5] = parseFloat(rowsArray2[0][1]);
                                                        TiposServicioxBebida[i][6] = parseFloat(rowsArray2[0][2]);
                                                        TiposServicioxBebida[i][7] = parseFloat(rowsArray2[0][3]);
                                                        if (parseFloat(rowsArray2[0][0]) === parseFloat(rowsArray2[0][1]) && parseFloat(rowsArray2[0][0]) === parseFloat(rowsArray2[0][2])) {

                                                            TiposServicioxBebida[i][8] = 0;
                                                            sec++;
                                                            CargaRecursiva();
                                                        } else {
                                                            //var Cantidad_Bebidas = parseInt(rowsArray[0][6], 10);
                                                            var relacionActual = parseFloat(rowsArray2[0][4]) / parseFloat(rowsArray2[0][5]);
                                                            var diff = 1 - relacionActual / RelacionInicial;
                                                            var PrecioActual = global.CalcuarCotización(diff, rowsArray2[0][0], rowsArray2[0][1], rowsArray2[0][2], rowsArray2[0][3]);
                                                            db.EjecutarSQL("INSERT INTO Cotizacion VALUES(" + idBebida + "," + arrTiposServicio[sec][0] + "," + PrecioActual + ", 0);"
                                                                , function() {
                                                                    TiposServicioxBebida[i][8] = 1;
                                                                    sec++;
                                                                    CargaRecursiva();
                                                                });
                                                        }

                                                    });
                                            } else {
                                                var i = TiposServicioxBebida.length;
                                                TiposServicioxBebida[i] = [];
                                                TiposServicioxBebida[i][0] = parseInt(arrTiposServicio[sec][0], 10);
                                                TiposServicioxBebida[i][1] = arrTiposServicio[sec][1];
                                                TiposServicioxBebida[i][2] = parseInt(arrTiposServicio[sec][2], 10);
                                                TiposServicioxBebida[i][3] = parseInt(arrTiposServicio[sec][3], 10);
                                                TiposServicioxBebida[i][4] = parseFloat(rowsArray[0][0]);
                                                TiposServicioxBebida[i][5] = parseFloat(rowsArray[0][1]);
                                                TiposServicioxBebida[i][6] = parseFloat(rowsArray[0][2]);
                                                TiposServicioxBebida[i][7] = parseFloat(rowsArray[0][3]);
                                                if (parseFloat(rowsArray[0][0]) === parseFloat(rowsArray[0][1]) && parseFloat(rowsArray[0][0]) === parseFloat(rowsArray[0][2])) {
                                                    TiposServicioxBebida[i][8] = 0;
                                                    sec++;
                                                    CargaRecursiva();
                                                } else {
                                                    //var Cantidad_Bebidas = parseInt(rowsArray[0][6], 10);
                                                    var relacionActual = parseFloat(rowsArray[0][4]) / parseFloat(rowsArray[0][5]);
                                                    var diff = 1 - relacionActual / RelacionInicial;
                                                    var PrecioActual = global.CalcuarCotización(diff, rowsArray[0][0], rowsArray[0][1], rowsArray[0][2], rowsArray[0][3]);
                                                    db.EjecutarSQL("INSERT INTO Cotizacion VALUES(" + idBebida + "," + arrTiposServicio[sec][0] + "," + PrecioActual + ", 0);"
                                                        , function() {
                                                            TiposServicioxBebida[i][8] = 1;
                                                            sec++;
                                                            CargaRecursiva();
                                                        });
                                                }
                                            }
                                        });
                                };
                                CargaRecursiva();
                            });
                    }
                    , CalcularRelacionInicial: function(idGrupoBebida, idBebida, EvResultado) {
                        db.EjecutarSQL("SELECT CAST(BS.Cantidad_Stock AS REAL) /  CAST(T.Cantidad_Total AS REAL) \n\
                                JOIN Bebidas_Sesiones BS \n\
                                JOIN (SELECT SUM(BS2.Cantidad_Stock) Cantidad_Total, B.Id_G_Bebida, BS2.Id_Sesion \n\
                                            FROM Bebidas_Sesiones BS2 \n\
                                            JOIN Bebidas B ON BS2.Id_Bebida = B.Id_Bebida AND B.Id_G_Bebida = " + idGrupoBebida + "\n\
                                            GROUP BY Id_G_Bebida) T ON T.Id_Sesion = BS.Id_Sesion\n\
                                WHERE  BS.Id_Bebida = " + idBebida + " AND BS.Id_Sesion = (SELECT Id_Sesion FROM Sesiones WHERE Fin IS NULL);"
                            , EvResultado);
                    }

                    , Añadir: function(idGrupoBebida, Nombre, CantidadxBotella, EvObtResultados) {
                        db.Bebidas.ObtenerNuevoId(function(id) {
                            if (!id) {
                                if (!global.isUndefined(EvObtResultados))
                                    EvObtResultados(false, "No se ha podido incrementar el índice de Bebidas");
                                return;
                            }

                            //debemos obtener la cantidad de stock por defecto
                            db.Propiedades.ObtenerPropiedades(["Cantidad_Botella", "Cantidad_Stock"]
                                , function(bExito, prop) {
                                    if (!bExito) {
                                        if (!global.isUndefined(EvObtResultados))
                                            EvObtResultados(false, prop);
                                        return;
                                    }
                                    db.EjecutarSQL("INSERT INTO " + db.Tablas[global.Bebidas].Tabla + "(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(" + idGrupoBebida + "," + id + ",'" + Nombre + "'," + (CantidadxBotella == null || CantidadxBotella == "" ? prop.Cantidad_Botella : CantidadxBotella) + ", " + prop.Cantidad_Stock * (CantidadxBotella == null || CantidadxBotella == "" ? prop.Cantidad_Botella : CantidadxBotella) + " );"
                                        , function(bExito, Mensaje) {
                                            if (!global.isUndefined(EvObtResultados))
                                                EvObtResultados(bExito, bExito ? id : Mensaje);
                                        });
                                });
                        });
                    }
                    , Modificar: function(idBebida, Nombre, CantidadxBotella, EvResultado) {
                        db.EjecutarSQL("UPDATE " + db.Tablas[global.Bebidas].Tabla + " SET Nombre = '" + Nombre + "', Cantidad_Botella = " + global.str_o_null(CantidadxBotella) + ", Cantidad_Stock = " + global.str_o_null(CantidadxBotella) + " * (SELECT CAST(Valor AS DECIMAL) FROM Propiedades Where Nombre = 'Cantidad_Stock')" + " WHERE Id_Bebida = " + idBebida + ";"
                            , EvResultado);
                    }
                    , Quitar: function(idBebida, EvtResultado) {
                        db.EjecutarSQL("DELETE FROM " + db.Tablas[global.Bebidas].Tabla + " WHERE Id_Bebida = " + idBebida + ";"
                            , EvtResultado
                            );
                    }
                };
            })()
            , ListarGruposBebida: function(EvObtResultados) {
                db.EjecutarSQL("SELECT Id_G_Bebida, Orden, Nombre, Tipos_Genericos, Color FROM Grupos_Bebida ORDER BY Orden;", EvObtResultados);
            }
            , AñadirGrupoBebida: function(Orden, Nombre, TipoGenerico, Color, EvResultado) {
                db.Grupos_Bebida.ObtenerNuevoId(function(id) {
                    if (!id) {
                        if (!global.isUndefined(EvResultado))
                            EvResultado(false, "No se ha podido incrementar el índice de Bebidas");
                        return;
                    }
                    db.EjecutarSQL("INSERT INTO " + db.Tablas[global.Grupos_Bebida].Tabla + "(Id_G_Bebida, Orden, Nombre, Tipos_Genericos, Color) VALUES(" + id + "," + Orden + ",'" + Nombre + "'," + TipoGenerico + "," + Color + ")"
                        , function(bExito, Mensaje) {
                            if (!global.isUndefined(EvResultado, Mensaje))
                                EvResultado(bExito, bExito ? id : Mensaje);
                        });
                });
            }
            , ModificarGrupoBebida: function(idGrupoBebida, Orden, Nombre, TipoGenerico, Color, EvResultado) {
                db.EjecutarSQL("UPDATE " + db.Tablas[global.Grupos_Bebida].Tabla + " SET Orden = " + Orden + ", Nombre='" + Nombre + "', Tipos_Genericos = " + TipoGenerico + ", Color = " + Color + " WHERE Id_G_Bebida = " + idGrupoBebida + ";"
                    , EvResultado
                    );
            }
            , QuitarGrupoBebida: function(idGrupoBebida, EvResultado) {
                //primero eliminar las bebidas en discordia
                db.EjecutarSQL("DELETE FROM " + db.Tablas[global.Bebidas].Tabla + " WHERE Id_G_Bebida = " + idGrupoBebida + ";"
                    , function(bExito, Mensaje) {
                        if (!bExito) {
                            if (!global.isUndefined(EvResultado))
                                EvResultado(bExito, Mensaje);
                            return;
                        }
                        db.EjecutarSQL("DELETE FROM " + db.Tablas[global.Precios].Tabla + " WHERE Id_G_Bebida = " + idGrupoBebida + ";"
                            , function(bExito, Mensaje) {
                                if (!bExito) {
                                    if (!global.isUndefined(EvResultado))
                                        EvResultado(bExito, Mensaje);
                                    return;
                                }
                                db.EjecutarSQL("DELETE FROM " + db.Tablas[global.Grupos_Bebida].Tabla + " WHERE Id_G_Bebida = " + idGrupoBebida + ";"
                                    , EvResultado
                                    );
                            }
                        );
                    }
                );
            }

            , ListarBebidas: function(EvObtResultados) {
                db.EjecutarSQL("SELECT B.Id_Bebida, B.Nombre, B.Id_G_Bebida, G.Nombre NombreGrupoBebida, CAST(BS.Cantidad_Stock AS REAL) /  CAST(T.Cantidad_Total AS REAL), Z.Cantidad_Bebidas, G.Tipos_Genericos, G.Color \n\
                                FROM Bebidas B\n\
                                LEFT JOIN Grupos_Bebida G ON B.Id_G_Bebida = G.Id_G_Bebida\n\
                                JOIN Bebidas_Sesiones BS ON B.Id_Bebida = BS.Id_Bebida\n\
                                JOIN (SELECT SUM(BS.Cantidad_Stock) Cantidad_Total, Id_G_Bebida, S.Id_Sesion \n\
                                            FROM Bebidas_Sesiones BS \n\
                                            JOIN Bebidas B ON BS.Id_Bebida = B.Id_Bebida\n\
                                            JOIN Sesiones S ON BS.Id_Sesion = S.Id_Sesion \n\
                                            WHERE S.Fin IS NULL\n\
                                            GROUP BY Id_G_Bebida) T ON T.Id_G_Bebida = B.Id_G_Bebida AND T.Id_Sesion = BS.Id_Sesion\n\
                                JOIN (SELECT COUNT(Id_Bebida)Cantidad_Bebidas, Id_G_Bebida  FROM Bebidas GROUP BY Id_G_Bebida) Z on Z.Id_G_Bebida = B.Id_G_Bebida  \n\
                                WHERE BS.Id_Sesion = (SELECT Id_Sesion FROM Sesiones WHERE Fin IS NULL)\n\
                                ORDER BY G.Orden, B.Nombre;"
                    , EvObtResultados);
            }
            , TotalBebidas: function(EvResultado) {
                db.EjecutarSQL("SELECT COUNT(Id_Bebida) FROM Bebidas",
                    function(bExito, rowsArray) {
                        if (!bExito) {
                            if (!global.isUndefined(EvResultado))
                                EvResultado(bExito, rowsArray);
                            return;
                        }
                        if (!global.isUndefined(EvResultado))
                            EvResultado(bExito, rowsArray[0][0]);
                    });
            }
            , ListarStock: function(EvObtResultados) {
                db.EjecutarSQL("SELECT Id_Bebida,  Bebidas.Nombre, Grupos_Bebida.Nombre Grupo, Cantidad_Botella, Cantidad_Stock " +
                    "FROM Bebidas LEFT JOIN Grupos_Bebida ON Bebidas.Id_G_Bebida = Grupos_Bebida.Id_G_Bebida ORDER BY Bebidas.Nombre, Grupos_Bebida.Nombre"
                    , EvObtResultados);
            }
            , StockBebida: function(idBebida, EvObtResultado) {
                db.EjecutarSQL("SELECT Cantidad_Stock FROM Bebidas WHERE Id_Bebida = " + idBebida + ";"
                    , function(bExito, rowsArray) {
                        if (!global.isUndefined(EvObtResultado))
                            EvObtResultado(bExito, bExito ? rowsArray[0][0] : rowsArray);
                    });
            }
            , ReiniciarStock: function(EvResultado) {
                db.EjecutarSQL("UPDATE Bebidas SET Cantidad_Stock = Cantidad_Botella * (SELECT CAST(Valor AS DECIMAL) FROM Propiedades WHERE Nombre = 'Cantidad_Stock') "
                    , EvResultado);
            }

            , ModificarStockBebida: function(idBebida, Cantidad_Stock, EvResultado) {
                db.EjecutarSQL("UPDATE Bebidas SET Cantidad_Stock = " + Cantidad_Stock + " WHERE Id_Bebida = " + idBebida + ";"
                    , EvResultado);
            }
            , ModificarStockBotellaBebida: function(idBebida, Candtidad_Botella, Cantidad_Stock, EvResultado) {
                db.EjecutarSQL("UPDATE Bebidas SET Cantidad_Botella = " + Candtidad_Botella + ", Cantidad_Stock = " + Cantidad_Stock + " WHERE Id_Bebida = " + idBebida + ";"
                    , EvResultado);
            }
        };
    })();
