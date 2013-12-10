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

var servidor = (function() {
    var cmdAjax = function(paquete, funcion, param, EvResultado, self) {
        var url = (function() {
            if (!isUndefined(localStorage["servidor"])) {
                return localStorage["servidor"] + '/wsjson';
            } else {
                return window.location.origin + "/wsjson";
            }
        })();

        $.getJSON(url
            , (function() {
                var p = [];
                for (var i = 0; i < param.length; i++) {
                    if (isUndefined(param[i]) || param[i] === null || param[i] === "") {
                        p[i] = 'null';
                    } else {
                        p[i] = param[i];
                    }
                }

                return {paquete: paquete, funcion: funcion, param: p};
            })()
            )
            .success(function(data) {
                //abre recibido un objeto que sea bExito y rowsArray
                if (!isUndefined(EvResultado))
                    EvResultado(data.bExito, data.rowsArray, self);
            })
            .error(function(jqXHR, textStatus, err) {
                if (!isUndefined(EvResultado))
                    EvResultado(false, textStatus + '\n' + err, self);
            });

    };
    return {
        cotización: (function() {
            return {
                IniciarSesión: function(ArrayIdGruposBebida, EvResultado) {
                    cmdAjax("cotización", "IniciarSesión", [ArrayIdGruposBebida], EvResultado);
                }
                , ListarCotización: function(EvObtResultados) {
                    cmdAjax("cotización", "ListarCotización", [], EvObtResultados);
                }
                , SesiónIniciada: function(EvObtResultados) {
                    cmdAjax("cotización", "SesiónIniciada", [], EvObtResultados);
                }
                , TiempoSesión: function(EvObtTiempoSesión) {
                    cmdAjax("cotización", "TiempoSesión", [], EvObtTiempoSesión);
                }
                , CerrarSesión: function(EvResultado) {
                    cmdAjax("cotización", "CerrarSesión", [], EvResultado);
                }
                , PausarSesión: function(EvResultado) {
                    cmdAjax("cotización", "PausarSesión", [], EvResultado);
                }
                , ReanudarSesión: function(EvResultado) {
                    cmdAjax("cotización", "ReanudarSesión", [], EvResultado);
                }
            };
        })()
        , propiedades: (function() {
            return {
                ListarPropiedades: function(EvResutado) {
                    cmdAjax("propiedades", "ListarPropiedades", [], EvResutado);
                }
                , ModificarPropiedad: function(Nombre, Valor, EvResultado) {
                    cmdAjax("propiedades", "ModificarPropiedad", ["'" + Nombre + "'", "'" + Valor + "'"], EvResultado);
                }
            };
        })()
        , servicios: (function() {

            var CTipoServicio = function() {
                this.IdTipoServicio;
                this.Nombre;
                this.Cantidad;
                this.Color;
                this.Precios = [];
                //funciones
                this.ListarPrecios = function(EvObtResultados) {
                    cmdAjax("servicios.TiposServicio", "ListarPrecios", [this.IdTipoServicio],
                        function(bExito, rowsArray, self) {
                            if (!bExito) {
                                if (!isUndefined(EvObtResultados))
                                    EvObtResultados(bExito, rowsArray);
                                return;
                            }
                            self.Precios = [];
                            for (var i = 0; i < rowsArray.length; i++) {
                                self.Precios[i] = new CTipoServicioPrecio();
                                self.Precios[i].Precio = rowsArray[i][0];
                                self.Precios[i].Maximo = rowsArray[i][1];
                                self.Precios[i].Minimo = rowsArray[i][2];
                                self.Precios[i].Tramo = rowsArray[i][3];
                                self.Precios[i]._parent = self;
                                self.Precios[i].IdGrupoBebida = rowsArray[i][4];
                                self.Precios[i].NombreGrupoBebida = rowsArray[i][5];
                            }
                            if (!isUndefined(EvObtResultados))
                                EvObtResultados(true, self);
                        }, this);
                };
                this.AñadirPrecio = function(IdGrupoBebida, Precio, Maximo, Minimo, Tramo, EvResultado) {
                    cmdAjax("servicios.Precios", "Añadir", [this.IdTipoServicio, IdGrupoBebida, Precio, Maximo, Minimo, Tramo], EvResultado);
                };
                this.ModificarPrecio = function(idGrupoBebida, Precio, Maximo, Minimo, Tramo, EvResultado) {
                    cmdAjax("servicios.Precios", "Modificar", [this.IdTipoServicio, idGrupoBebida, Precio, Maximo, Minimo, Tramo], EvResultado);
                };
                this.QuitarPrecio = function(IdGrupoBebida, EvResultado) {
                    cmdAjax("servicios.Precios", "Quitar", [this.IdTipoServicio, IdGrupoBebida], EvResultado);
                };
            };

            var CTipoServicioPrecio = function() {

                this.Precio;
                this.Maximo;
                this.Minimo;
                this.Tramo;
                this._parent;
                this.IdGrupoBebida;
                this.NombreGrupoBebida;

            };

            var CServicio = function() {
                this.IdSesion;
                this.IdServicio;
                this.ArrDatosServicio = [];

                this.QuitarDatoServicio = function(index, EvResultado) {
                    if (this.ArrDatosServicio[index] === null) {
                        if (!isUndefined(EvResultado))
                            EvResultado(false, "No existen esos datos en el servidor, es posible que se hayan eliminado ya");
                        return;
                    }
                    cmdAjax("servicios.Servicio", "QuitarDatos", [this.IdServicio, [this.ArrDatosServicio[index]]],
                        function(bExito, strMensaje) {
                            if (!bExito) {
                                if (!isUndefined(EvResultado))
                                    EvResultado(false, strMensaje);
                                return;
                            }
                            this.ArrDatosServicio[index] = null;
                            if (!isUndefined(EvResultado))
                                EvResultado(bExito, strMensaje);
                        });
                };
                this.Quitar = function(EvResultado) {
                    cmdAjax("servicios.Servicio", "Quitar", [this.IdServicio], EvResultado);
                };

            };
            
            return {
                AñadirTipoServicio: function(Nombre, Cantidad, Color, EvResultado) {
                    cmdAjax("servicios.TiposServicio", "Añadir", ["'" + Nombre + "'", Cantidad, Color], EvResultado);
                }
                , ModificarTipoServicio: function(idTServicio, Nombre, Cantidad, Color, EvResultado) {
                    cmdAjax("servicios.TiposServicio", "Modificar", [idTServicio, "'" + Nombre + "'", Cantidad, Color], EvResultado);
                }
                , QuitarTipoServicio: function(idTServicio, EvResultado) {
                    cmdAjax("servicios.TiposServicio", "Quitar", [idTServicio], EvResultado);
                }
                , ListarTiposServicio: function(EvObtResultado) {
                    cmdAjax("servicios", "ListarTiposServicio", []
                        , function(bExito, rowsArray) {
                            if (!bExito) {
                                if (!isUndefined(EvObtResultado))
                                    EvObtResultado(bExito, rowsArray);
                                return;
                            }
                            var ArrTiposServicio = [];
                            for (var i = 0; i < rowsArray.length; i++) {
                                ArrTiposServicio[i] = new CTipoServicio();
                                ArrTiposServicio[i].IdTipoServicio = rowsArray[i][0];
                                ArrTiposServicio[i].Nombre = rowsArray[i][1];
                                ArrTiposServicio[i].Cantidad = rowsArray[i][2];
                                ArrTiposServicio[i].Color = new ColorUtils(rowsArray[i][3]);
                            }
                            if (!isUndefined(EvObtResultado))
                                EvObtResultado(bExito, ArrTiposServicio);
                        });
                }
                , TotalTiposServicio: function(EvResultado) {
                    cmdAjax("servicios", "TotalTiposServicio", [], EvResultado);
                }
                , AñadirServicio: function(ArrDatosServicio, EvResultado) {
                    cmdAjax("servicios.Servicio", "Añadir", [ArrDatosServicio], EvResultado);
                }
                , CDatoServicio: function(idOrden, idTipoServicio, nombreTipoServicio, idBebida, nombreBebida, precio) {
                    this.IdOrden = idOrden;
                    this.IdTipoServicio = idTipoServicio;
                    this.IdBebida = idBebida;
                    this.Precio = precio;
                    this.NombreTipoServicio = nombreTipoServicio;
                    this.NombreBebida = nombreBebida;
                    this.TPV = localStorage[TPV];
                    return this;
                }
            };

        })()
        , stock: (function() {

            var CGrupoBebida = function() {
                this.IdGrupoBebida;
                this.Orden;
                this.Nombre;
                this.bTiposGenericos;
                this.Color;
                this.Precios = [];
                this.Bebidas = [];
                //funciones
                this.ListarPrecios = function(EvResultado) {
                    cmdAjax("stock.GruposBebida", "ListarPrecios", [this.IdGrupoBebida]
                        , function(bExito, rowsArray, self) {
                            if (!bExito) {
                                if (!isUndefined((EvResultado)))
                                    EvResultado(bExito, rowsArray);
                                return;
                            }
                            self.Precios = [];
                            for (var i = 0; i < rowsArray.length; i++) {
                                self.Precios[i] = new CGbPrecios();
                                self.Precios[i].IdTipoServicio = rowsArray[i][0];
                                self.Precios[i].NombreTipoServicio = rowsArray[i][1];
                                self.Precios[i].Precio = rowsArray[i][2];
                                self.Precios[i].Maximo = rowsArray[i][3];
                                self.Precios[i].Minimo = rowsArray[i][4];
                                self.Precios[i].Tramo = rowsArray[i][5];
                                self.Precios[i]._parent = self;
                            }
                            if (!isUndefined((EvResultado)))
                                EvResultado(bExito, self);
                        }, this);
                };
                this.AñadirPrecio = function(idTipoServicio, Precio, Maximo, Minimo, Tramo, EvResultado) {
                    cmdAjax("servicios.Precios", "Añadir", [idTipoServicio, this.IdGrupoBebida, Precio, Maximo, Minimo, Tramo], EvResultado);
                };
                this.ModificarPrecio = function(idTipoServicio, Precio, Maximo, Minimo, Tramo, EvResultado) {
                    cmdAjax("servicios.Precios", "Modificar", [idTipoServicio, this.IdGrupoBebida, Precio, Maximo, Minimo, Tramo], EvResultado);
                };
                this.QuitarPrecio = function(idTipoServicio, EvResultado) {
                    cmdAjax("servicios.Precios", "Quitar", [idTipoServicio, this.IdGrupoBebida], EvResultado);
                };
                this.ListarBebidas = function(EvResultado) {
                    cmdAjax("stock.GruposBebida", "ListarBebidas", [this.IdGrupoBebida]
                        , function(bExito, rowsArray, self) {
                            if (!bExito) {
                                if (!isUndefined((EvResultado)))
                                    EvResultado(bExito, rowsArray);
                                return;
                            }
                            self.Bebidas = [];
                            for (var i = 0; i < rowsArray.length; i++) {
                                self.Bebidas[i] = new CGbBebidas();
                                self.Bebidas[i].IdBebida = rowsArray[i][0];
                                self.Bebidas[i].Nombre = rowsArray[i][1];
                                self.Bebidas[i].Cantidad_Botella = rowsArray[i][2];
                                self.Bebidas[i]._parent = self;
                            }
                            if (!isUndefined((EvResultado)))
                                EvResultado(bExito, self);
                        }, this);
                };
                this.AñadirBebida = function(Nombre, Cantidad_Botella, EvResultado) {
                    cmdAjax("stock.Bebidas", "Añadir", [this.IdGrupoBebida, "'" + Nombre + "'", Cantidad_Botella], EvResultado);
                };
                this.ModificarBebida = function(idBebida, Nombre, Cantidad_Botella, EvResultado) {
                    cmdAjax("stock.Bebidas", "Modificar", [idBebida, "'" + Nombre + "'", Cantidad_Botella], EvResultado);
                };
                this.QuitarBebida = function(idBebida, EvResultado) {
                    cmdAjax("stock.Bebidas", "Quitar", [idBebida], EvResultado);
                };
            };
            var CGbBebidas = function() {
                this.IdBebida;
                this.Nombre;
                this.Cantidad_Botella;
                this._parent;
            };
            var CGbPrecios = function() {
                this.Precio;
                this.Maximo;
                this.Minimo;
                this.Tramo;
                this._parent;
                this.IdTipoServicio;
                this.NombreTipoServicio;
            };

            var CBebida = function() {
                this.IdBebida;
                this.Nombre;
                this.IdGrupoBebida;
                this.NombreGrupoBebida;
                this.RelacionInicial;
                this.Cantidad_Bebidas;
                this.bTiposGenericos;
                this.Color;
                this.TiposServicio = [];
                //funciones
                this.ListarTiposServicio = function(EvResultado) {
                    cmdAjax("stock.Bebidas", "ListarTiposServicio", [this.IdGrupoBebida, this.IdBebida, this.bTiposGenericos]
                        , function(bExito, rowsArray, self) {
                            if (!bExito) {
                                if (!isUndefined(EvResultado))
                                    EvResultado(bExito, rowsArray);
                                return;
                            }
                            self.TiposServicio = [];
                            for (var i = 0; i < rowsArray.length; i++) {
                                self.TiposServicio[i] = new CBebidasTipoServicio();
                                self.TiposServicio[i].IdTipoServicio = parseInt(rowsArray[i][0], 10);
                                self.TiposServicio[i].Nombre = rowsArray[i][1];
                                self.TiposServicio[i].Cantidad = parseInt(rowsArray[i][2], 10);
                                self.TiposServicio[i].Color = new ColorUtils(rowsArray[i][3]);
                                self.TiposServicio[i].PrecioInicial = parseFloat(rowsArray[i][4]);
                                self.TiposServicio[i].Maximo = parseFloat(rowsArray[i][5]);
                                self.TiposServicio[i].Minimo = parseFloat(rowsArray[i][6]);
                                self.TiposServicio[i].Tramo = parseFloat(rowsArray[i][7]);
                                self.TiposServicio[i]._parent = self;
                                self.TiposServicio[i].EnCotización = rowsArray[i][8] == 1;
                            }

                            self.TiposServicio.obTipoServicio = function(IdTipoServicio) {
                                for (var i in this)
                                    if (this[i].IdTipoServicio === IdTipoServicio)
                                        return this[i];
                            };
                            if (!isUndefined(EvResultado))
                                EvResultado(true, self.TiposServicio);
                            return;
                        }, this);
                };
                this.CalcularRelacionInicial = function(EvResultado) {
                    cmdAjax("stock.Bebidas", "CalcularRelacionInicial", [this.IdGrupoBebida, this.IdBebida]
                        , function(bExito, rowsArray, self) {
                            if (!bExito) {
                                if (!isUndefined(EvResultado))
                                    EvResultado(bExito, rowsArra);
                                return;
                            }
                            self.RelacionInicial = parseFloat(rowsArray[0][0]);
                            EvResultado(bExito, self);
                        }, this);
                };

            };
            var CBebidasTipoServicio = function() {
                this.IdTipoServicio;
                this.Nombre;
                this.Cantidad;
                this.Color;
                this.PrecioInicial;
                this.Maximo;
                this.Minimo;
                this.Tramo;
                this.EnCotización = true;
                this.bACotizar = false;
                this._parent;
                //functiones
                this.ObtenerPrecio = function(EvObtResultado) {
                    cmdAjax("servicios.TiposServicio", "ObtenerPrecio", [this._parent.IdBebida, this.IdTipoServicio], 
                    function(bExito, precio, self){
                        if(precio === null) precio = self.PrecioInicial;
                        if(!isUndefined(EvObtResultado))
                            EvObtResultado(bExito, precio);
                    }, this);
                };
                this.FijarPrecio = function(Precio, EvResultado) {
                    cmdAjax("servicios.TiposServicio", "FijarPrecio", [this._parent.IdBebida, this.IdTipoServicio, Precio], EvResultado);
                };
                this.LiberarPrecio = function(EvResultado) {
                    cmdAjax("servicios.TiposServicio", "LiberarPrecio", [this._parent.IdBebida, this.IdTipoServicio], EvResultado);
                };
                this.Cotizar = function(EvObtResultado) {
                    if (!this.EnCotización) {
                        if (!isUndefined(EvObtResultado))
                            EvObtResultado(true, this);
                        return;
                    }
                    cmdAjax("servicios.TiposServicio", "Cotizar", [this._parent.IdGrupoBebida, this._parent.IdBebida, this.IdTipoServicio, this._parent.RelacionInicial, this.PrecioInicial, this.Maximo, this.Minimo, this.Tramo], EvObtResultado);
                };
            };

            return {
                ListarGruposBebida: function(EvObtResultados) {
                    cmdAjax("stock", "ListarGruposBebida", []
                        , function(bExito, rowsArray) {
                            if (!bExito) {
                                if (!isUndefined(EvObtResultados))
                                    EvObtResultados(false, rowsArray);
                                return;
                            }
                            ArrayGruposBebida = [];
                            for (var i = 0; i < rowsArray.length; i++) {
                                ArrayGruposBebida[i] = oGruposBebida = new CGrupoBebida();
                                oGruposBebida.IdGrupoBebida = rowsArray[i][0];
                                oGruposBebida.Orden = rowsArray[i][1];
                                oGruposBebida.Nombre = rowsArray[i][2];
                                oGruposBebida.bTiposGenericos = rowsArray[i][3] == 1;
                                oGruposBebida.Color = new ColorUtils(rowsArray[i][4]);
                            }
                            if (!isUndefined(EvObtResultados))
                                EvObtResultados(true, ArrayGruposBebida);
                        });
                }
                , AñadirGrupoBebida: function(Orden, Nombre, TipoGenerico, Color, EvResultado) {
                    cmdAjax("stock", "AñadirGrupoBebida", [Orden, "'" + Nombre + "'", TipoGenerico, Color], EvResultado);
                }
                , ModificarGrupoBebida: function(idGrupoBebida, Orden, Nombre, TipoGenerico, Color, EvResultado) {
                    cmdAjax("stock", "ModificarGrupoBebida", [idGrupoBebida, Orden, "'" + Nombre + "'", TipoGenerico, Color], EvResultado);
                }
                , QuitarGrupoBebida: function(idGrupoBebida, EvResultado) {
                    cmdAjax("stock", "QuitarGrupoBebida", [idGrupoBebida], EvResultado);
                }
                , ListarBebidas: function(EvObtResultados) {
                    cmdAjax("stock", "ListarBebidas", []
                        , function(bExito, rowsArray) {
                            if (!bExito) {
                                if (!isUndefined(EvObtResultados))
                                    EvObtResultados(bExito, rowsArray);
                                return;
                            }
                            //por cada bebida 
                            var ArrayBebidas = [];
                            for (var i = 0; i < rowsArray.length; i++) {
                                ArrayBebidas[i] = new CBebida();
                                ArrayBebidas[i].IdBebida = parseInt(rowsArray[i][0], 10);
                                ArrayBebidas[i].Nombre = rowsArray[i][1];
                                ArrayBebidas[i].IdGrupoBebida = parseInt(rowsArray[i][2], 10);
                                ArrayBebidas[i].NombreGrupoBebida = rowsArray[i][3];
                                ArrayBebidas[i].RelacionInicial = parseFloat(rowsArray[i][4]);
                                ArrayBebidas[i].Cantidad_Bebidas = parseInt(rowsArray[i][5], 10);
                                ArrayBebidas[i].bTiposGenericos = rowsArray[i][6] == 1;
                                ArrayBebidas[i].Color = new ColorUtils(rowsArray[i][7]);
                            }
                            //Añadir el prototipo de obtenerBeibda
                            ArrayBebidas.obBebida = function(IdBebida) {
                                for (var i in this)
                                    if (this[i].IdBebida === IdBebida)
                                        return this[i];
                            };

                            //devolvemos el array de bebidas
                            if (!isUndefined(EvObtResultados)) {
                                EvObtResultados(true, ArrayBebidas);
                            }

                        });
                }
                , TotalBebidas: function(EvResultado) {
                    cmdAjax("stock", "TotalBebidas", [], EvResultado);
                }
                , ListarStock: function(EvObtResultados) {
                    cmdAjax("stock", "ListarStock", [], EvObtResultados);
                }
                , StockBebida: function(idBebida, EvObtResultado) {
                    cmdAjax("stock", "StockBebida", [idBebida], EvObtResultado);
                }
                , ModificarStockBebida: function(idBebida, Cantidad_Stock, EvResultado) {
                    cmdAjax("stock", "ModificarStockBebida", [idBebida, Cantidad_Stock], EvResultado);
                }
                , ModificarStockBotellaBebida: function(idBebida, Cantidad_Botella, Cantidad_Stock, EvResultado) {
                    cmdAjax("stock", "ModificarStockBotellaBebida", [idBebida, Cantidad_Botella, Cantidad_Stock], EvResultado);
                }
            };
        })()
    };
})();

    