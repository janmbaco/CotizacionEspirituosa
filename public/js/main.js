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
//Incluir los javascripts de los que dependo
document.write(
    '<script src="./js/global.js" type="text/javascript"></script>' +
    '<script src="./js/bootstrap.js" type="text/javascript"></script>' +
    '<script src="./js/servidor.js" type="text/javascript" charset="utf-8"></script>');

//Lista de Grupos de bebida
var ArrayGruposBebida = [];
//Lista de Tipos de Servicios
var ArrayTiposServicio = [];
//Lista de las bebidas
var ArrayBebidas = [];
//el objeto del servicio en si
var ArrDatosServicioActual = [];
//Tengo que contabilizar el stock
var bStock = false;

var SesiónIniciada = false;



var intervalo = null;
var TimeOutFinalizarServicios;

//Eventos al cargar la página
$("document").ready(function() {
    //if no hay servidor colocar el servidor 
    if (isUndefined(localStorage["servidor"]))
        localStorage["servidor"] = window.location.origin;
    if(localStorage["servidor"].indexOf("file")> -1){
        $("#Id_Modal_Servidor").modal("show");
    } else{
        Iniciar();
    }

    //al hacer click en una clase de pantalla
    $(".pantalla").click(function() {
        sessionStorage["estado"] = this.id;
    });

    $.extend($.expr[":"],
        {
            "contiene-palabra": function(elem, i, match, array) {
                return (elem.textContent || elem.innerText || $(elem).text() || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
            }
        });
});

function ComprobarServidor() {

    if ($("#IdTxtServidor").val() == "") {
        window.alert("Debe indicar un servidor para iniciar la herramienta");
        return;
    }
    localStorage["servidor"] = $("#IdTxtServidor").val();
    Iniciar();
    $('#Id_Modal_Servidor').modal('hide');
}

function Iniciar() {
//comprobar si ya está la sesión abierta
    servidor.cotización.SesiónIniciada(function(bExito, bSesiónIniciada) {
        if (!bExito) {
            window.alert(resultados);
            return;
        }
        SesiónIniciada = bSesiónIniciada;
        if (bSesiónIniciada) {


            //iniciar el temporizador con el tiempo que se nos indique en la sesión de servidor.cotización
            servidor.cotización.TiempoSesión(function(bExito, resultado) {
                if (!bExito)
                {
                    window.alert(resultado);
                    return;
                }
                //muestro los menus de sesion
                $(".panel").hide();
                $("#PanelSesiónCotización").show();
                $(".sesión").show();
                $("#Id_TiempoSesión").addClass('active');
                $(".configuración").hide();
                $(".page-header").hide();

                //obtenemos la diferencia
                var segundos = resultado.TiempoSesión % 60;
                var minutos = parseInt(resultado.TiempoSesión / 60) % 60;
                var horas = parseInt(resultado.TiempoSesión / 60 / 60);
                $("#id_segundos").html((segundos > 9 ? "" : "0") + segundos);
                $("#id_minutos").html((minutos > 9 ? "" : "0") + minutos);
                $("#id_horas").html((horas > 9 ? "" : "0") + horas);
                if (!resultado.Pausada) {
                    $("#Id_ReanudarTemporizador").hide();
                    intervalo = initTiempoSesión();
                } else {
                    $("#Id_PausarTemporizador").hide();
                }            //vamos a comprobar si está listo este tpv
                if (isUndefined(localStorage[TPV])) {
                    //mostrar la página para introducir un nombre del TPV
                    $(".configuración").hide();
                    MostrarPanelSesiónCotización();
                    return;
                }
                //añadir servicios no finalizados
                if (!isUndefined(localStorage[ServiciosNoFinalizados])) {
                    var p;
                    try {
                        ArrDatosServicioActual[i] = JSON.parse((localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"]));
                        $('#Id_Modal_Resumen_Servicios .modal-body tbody').append(localStorage[ServiciosNoFinalizados + "_Filas"]);

                    } catch (e) {
                    }

                    if (ArrDatosServicioActual.length > 0) {
                        for (var i = 0; i < ArrDatosServicioActual.length; i++)
                            p += parseFloat(ArrDatosServicioActual[i].Precio);
                        $("#Id_TotalServicio").html(Left(p = p + (p.toString().indexOf(".") === -1 ? "." : "") + '00', p.split(".")[0].length + 3) + " €");
                        TimeOutFinalizarServicios = setTimeout(function() {
                            FinalizarServicio();
                        }, 30 * 1000);
                    }
                }
                AbrirSesiónCotizacion();
            });

        }
        else {
            $(".sesión").hide();
            $(".configuración").show();
            MostrarOpcionesxDefecto();
            MostrarGruposBebida();
            MostrarTiposServicio();
            $("#PanelPrincipal").show();
            //voy a ver en que estado estoy y mostrar la pantalla
            if (sessionStorage["estado"])
                $("#" + sessionStorage["estado"]).click();

        }
    });
}

//Rellenar las propiedades de configuración
function MostrarOpcionesxDefecto() {
    $("#Id_Servidor").val(localStorage["servidor"]);
    servidor.propiedades.ListarPropiedades(
        function(bExito, rowsArray) {
            if (!bExito) {
                alert(rowsArray);
                return;
            }
            for (var i = 0; i < rowsArray.length; i++)
                $("#Id_" + rowsArray[i][0]).val(null_o_str(rowsArray[i][1]));

        });
}

function ModificarServidor() {
    if (!isUndefined(localStorage["servidor"])) {
        if (localStorage["servidor"] !== $("#Id_Servidor").val()) {
            localStorage["servidor"] = $("#Id_Servidor").val();
            MostrarOpcionesxDefecto();
            return;
        }
    }
}

function ModificarPreferencias(id) {
    servidor.propiedades.ModificarPropiedad(id.replace("#Id_", ""), $(id).val()
        , function(bExito) {
            if (!bExito) {
                alert("No se ha podido actualizar,\npor favor, pruebe más tarde");
                return;
            }
            MostrarOpcionesxDefecto();
        });
}

///////////////////////Tipos de Servicio///////////////////////////////////////
function MostrarTiposServicio() {
    servidor.servicios.ListarTiposServicio(
        function(bExito, rowsArray) {
            if (!bExito) {
                alert(rowsArray);
                return;
            }
            ArrayTiposServicio = rowsArray;
            $("#tabla_Tipos_Servicio").html("");
            $(".Select_Tipos_Servicio").html("");
            for (var i = 0; i < ArrayTiposServicio.length; i++) {
                //vamos a rellenar la tabla de tipos de servicios
                $("#tabla_Tipos_Servicio").append('<tr> ' +
                    '<td><span id="Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Nombre" class="uneditable-input" >' + ArrayTiposServicio[i].Nombre + '</span></td> ' +
                    '<td><input type="number" min="0" step="1" id="Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Cantidad" value="' + null_o_str(ArrayTiposServicio[i].Cantidad) + '" class="input-mini numerico" onchange="ModificarTipoServicio(' + i + ')"></td> ' +
                    '<td><input type="color" id="Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Color" value="' + ArrayTiposServicio[i].Color.ColorHash + '" class="input-mini" onchange="ModificarTipoServicio(' + i + ')" /></td>' +
                    '<td class="boton" >\n\
                        <!--<a class="btn" onClick="ModificarTipoServicio(' + i + ')"  href="javascript:void(0)"><i class="icon-refresh"></i> </a>-->\n\
                        <a class="btn"   data-toggle="modal" data-target="#Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Eliminar_Modal" ><i class="icon-minus" ></i> </a>\n\
                            <div id="Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Eliminar_Modal" class="modal hide " >\n\
                                <div class="modal-header">\n\
                                <h3>Eliminación del tipo de servicio <b>' + ArrayTiposServicio[i].Nombre + '</b></h3>\n\
                                </div>\n\
                                <div class="modal-body" style="text-align:left;">\n\
                                    <p>\n\
                                    ¿Está seguro que desea eliminar este Tipo de Servicio <b>' + ArrayTiposServicio[i].Nombre + '</b>? \n\
                                    </p>\n\
                                    <p>\n\
                                     &nbsp; &nbsp;Tenga en cuenta que esta acción no se puede deshacer.\n\
                                    </p>\n\
                                </div>\n\
                                <div class="modal-footer">\n\
                                    <a href="javascript:void(0);" onClick="EliminarTipoServicio(' + i + ')"  data-dismiss="modal" >Eliminar</a> <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn btn-success">Cancelar</a>\n\
                                </div>\n\
                            </div>\n\
                    </td> ' +
                    '<td class="boton"><a class="btn" href="javascript:void()" onClick="MostrarPrecios(0,' + i + ')" style="font-weight: bold"><i class="icon-th-list"> </i> Precios </a> ' +
                    '   <div id="Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Precios" class="modal hide " style="min-width: 750px" >\n\
                            <div class="modal-header">\n\
                            <h3> Precios - ' + ArrayTiposServicio[i].Nombre + '</h3>\n\
                            </div>\n\
                            <div class="modal-body" style="text-align:left;">\n\
                            </div>\n\
                            <div class="modal-footer">\n\
                                <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn">Cerrar</a>\n\
                            </div>\n\
                        </div>' +
                    '</td>' +
                    '</tr>  '
                    );
                //añadir los elementos del selector
                $(".Select_Tipos_Servicio").append('<option value="' + ArrayTiposServicio[i].IdTipoServicio + '" ' + (ArrayTiposServicio[i][0] == $(".Select_Tipos_Servicio").attr("name") ? "selected=selected" : "") + " >" + ArrayTiposServicio[i].Nombre + "</option>");

            }
            $("#tabla_Tipos_Servicio").append('<tr> ' +
                '<td><input type="text" id="Id_NuevoTS_Nombre" value="" class="enfocar"></td>  ' +
                '<td><input type="number" min="0" step="1"  id="Id_NuevoTS_Cantidad" value="" class="input-mini numerico"></td> ' +
                '<td><input type="color" id="Id_NuevoTS_Color" value="#e6e6e6" class="input-mini" /></td>' +
                '<td class="boton" ><a class="btn" onClick="AñadirNuevoTipoServicio()" href="javascript:void(0)"><i class="icon-plus"></i> </a></td> ' +
                '</tr> ');

        });
}

function AñadirNuevoTipoServicio() {
    //Comprobar que haya datos en los campos copa y ml
    if ($("#Id_NuevoTS_Nombre").val() === "") {
        alert("Debe indicar el nombre del tipo de servicio");
        return;
    }
    if ($("#Id_NuevoTS_Cantidad").val() === "") {
        alert("Debe indicar la cantidad en ml que se gasta con este servicio");
        return;
    }

    var color = new ColorUtils($("#Id_NuevoTS_Color").val());

    //debo añadir el tipo de servicio
    servidor.servicios.AñadirTipoServicio($("#Id_NuevoTS_Nombre").val(), $("#Id_NuevoTS_Cantidad").val(), color.Color
        , function(bExito, idTipoServicio) {
            if (!bExito) {
                alert(idTipoServicio);
                return;
            }
            MostrarTiposServicio();
        });

}

function ModificarTipoServicio(index) {
    //Comprobar que haya datos en los campos copa y ml
    if (index > ArrayTiposServicio.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    if ($("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Nombre").html() === "") {
        alert("Debe indicar el nombre del tipo de servicio");
        return;
    }
    if ($("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Cantidad").val() === "") {
        alert("Debe indicar la cantidad en ml que se gasta con este servicio");
        return;
    }

    var color = new ColorUtils($("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Color").val());

    servidor.servicios.ModificarTipoServicio(ArrayTiposServicio[index].IdTipoServicio, $("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Nombre").html(), $("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Cantidad").val(), color.Color
        , function(bExito) {
            if (!bExito) {
                alert("No se ha podido modificar el tipo de servicio");
                return;
            }
            MostrarTiposServicio();
        });
}

function EliminarTipoServicio(index) {
    if (index > ArrayTiposServicio.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    servidor.servicios.QuitarTipoServicio(ArrayTiposServicio[index].IdTipoServicio
        , function(bExito) {
            if (!bExito) {
                alert("No se ha podido eliminar el tipo de servicio");
                return;
            }
            MostrarTiposServicio();
        });
}
///////////////////////////////////////////////////////////////////////////////

////////////////////////Precios////////////////////////////////////////////////
function MostrarPrecios(n, index) {

    if (index > (!n ? ArrayTiposServicio.length - 1 : ArrayGruposBebida.length - 1)) {
        alert("indice fuera del rango");
        return;
    }
    RellenarTablaPrecios(n, index, function(bExito, self) {
        if (!bExito) {
            window.alert(self);
            return;
        }
        $("#Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_Precios").modal("show");
    }
    );
}

function RellenarTablaPrecios(n, index, Callback) {
    if (!n) {
        ArrayTiposServicio[index].ListarPrecios(
            function(bExito, self) {
                if (!bExito) {
                    if (!isUndefined(Callback))
                        Callback(bExito, self);
                    return;
                }
                //añadir los precios para que puedan ser modificados
                AñadirFilasTablaPrecios(n, index, self);
                RellenarSelectGruposBebida();
                if (!isUndefined(Callback)) {
                    Callback(bExito, self);
                }
            });
    }
    else {
        ArrayGruposBebida[index].ListarPrecios(
            function(bExito, self) {
                if (!bExito) {
                    if (!isUndefined(Callback))
                        Callback(bExito, self);
                    return;
                }
                //añadir los precios para que puedan ser modificados
                AñadirFilasTablaPrecios(n, index, self);
                RellenarSelectTiposServicio();
                if (!isUndefined(Callback)) {
                    Callback(bExito, self);
                }
            });
    }
}

function AñadirFilasTablaPrecios(n, index, self) {
    $("#Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_Precios .modal-body").html("");
    $("#Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_Precios .modal-body").append(
        function() {
            var html = "<table><thead><th>Grupo Bebida</th><th>Precio</th><th>Máximo</th><th>Mínimo</th><th>Tramo</th></thead>";
            for (var i = 0; i < self.Precios.length; i++) {
                var precio = self.Precios[i];
                html +=
                    "<tr>\n\
                                <td><span id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Nombre" + (!n ? "GrupoBebida" : "TipoServicio") + "' class='" + /*(!n ? 'Select_Grupos_Bebida' : 'Select_Tipos_Servicio') +*/ " uneditable-input'>" + (!n ? precio.NombreGrupoBebida : precio.NombreTipoServicio) + "</span/>\n\
                                    <input type='hidden' id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_" + (!n ? "GrupoBebida" : "TipoServicio") + "' value='" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "'/></td>\n\
                                <td><input type='number'  id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Precio' min='0' step='0.1' class='input-mini numerico' value='" + precio.Precio + "' onchange='ModificarPrecio(" + n + "," + index + "," + i + ")' /></td>\n\
                                <td><input type='number' id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Maximo' min='0' step='0.1' class='input-mini numerico' value='" + precio.Maximo + "' onchange='ModificarPrecio(" + n + "," + index + "," + i + ")' /></td>\n\
                                <td><input type='number' id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Minimo' min='0' step='0.1' class='input-mini numerico' value='" + precio.Minimo + "' onchange='ModificarPrecio(" + n + "," + index + "," + i + ")' /></td>\n\
                                <td><input type='number' id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Tramo' min='0' step='0.1' class='input-mini numerico' value='" + precio.Tramo + "' onchange='ModificarPrecio(" + n + "," + index + "," + i + ")'/></td>\n\
                                <td class='boton'>\n\
                                                <!--<a class='btn' href='javascript:void()' onclick='ModificarPrecio(" + n + "," + index + "," + i + ")' class='btn'><i class='icon-refresh'> </i></a>-->\n\
                                                  <a class='btn' data-toggle='modal' data-target='#Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Eliminar_Modal' class='btn'><i class='icon-minus'> </i></a>\n\
                                                    <div id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Eliminar_Modal'" + ' class="modal hide " >\n\
                                                        <div class="modal-header">\n\
                                                        <h3>Eliminación del Precio para <b>' + (!n ? precio.NombreGrupoBebida : precio.NombreTipoServicio) + '</b></h3>\n\
                                                        </div>\n\
                                                        <div class="modal-body" style="text-align:left;">\n\
                                                            <p>\n\
                                                            ¿Está seguro que desea eliminar el precio a <b>' + (!n ? precio.NombreGrupoBebida : precio.NombreTipoServicio) + '</b>? \n\
                                                            </p>\n\
                                                            <p>\n\
                                                             &nbsp; &nbsp;Tenga en cuenta que esta acción no se puede deshacer.\n\
                                                            </p>\n\
                                                        </div>\n\
                                                        <div class="modal-footer">\n\
                                                            <a href="javascript:void(0);" onclick="EliminarPrecio(' + n + ',' + index + ',' + i + ')"  data-dismiss="modal" >Eliminar</a> <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn btn-success">Cancelar</a>\n\
                                                        </div>\n\
                                                    </div>' +
                    "</td>\n\
                            </tr>";
            }
            //añadir la última linea para poder añadir un precio
            html +=
                "<tr>\n\
                                <td><select id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_" + (!n ? "GrupoBebida" : "TipoServicio") + "' class='" + (!n ? 'Select_Grupos_Bebida' : 'Select_Tipos_Servicio') + "' /></td>\n\
                                <td><input type='number' id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_Precio' min='0' step='0.1' class='input-mini numerico'  /></td>\n\
                                <td><input type='number' id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_Maximo' min='0' step='0.1' class='input-mini numerico' ></td>\n\
                                <td><input type='number' id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_Minimo' min='0' step='0.1' class='input-mini numerico'  /></td>\n\
                                <td><input type='number' id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_Tramo' min='0' step='0.1' class='input-mini numerico' /></td>\n\
                                <td class='boton'><a class='btn' href='javascript:void()' onclick='AñadirPrecio(" + n + "," + index + ")' class='btn'><i class='icon-plus'> </i></a>\n\
                                </td>\n\
                            </tr></table>";

            return html;
        });
}

function AñadirPrecio(n, index) {

    if (index > (!n ? ArrayTiposServicio.length - 1 : ArrayGruposBebida.length - 1)) {
        alert("indice fuera del rango");
        return;
    }
    var cap = (!n ? "#Id_TS_Nuevo_" + ArrayTiposServicio[index].IdTipoServicio + "_Precio_" :
        "#Id_GB_Nuevo_" + ArrayGruposBebida[index].IdGrupoBebida + "_Precio_");
    //comprobaciones
    if ($(cap + "Precio").val() == "") {
        alert("Debe indicar un precio");
        return;
    }
    if ($(cap + "Maximo").val() == "") {
        alert("Debe indicar un Máximo");
        return;
    }
    if ($(cap + "Minimo").val() == "") {
        alert("Debe indicar un Mínimo");
        return;
    }
    if ($(cap + "Tramo").val() == "") {
        alert("Debe indicar un Tramo");
        return;
    }
    for (var i = 0; i < (!n ? ArrayTiposServicio[index].Precios.length : ArrayGruposBebida[index].Precios.length); i++) {
        if ((!n ? ArrayTiposServicio[index].Precios[i].IdGrupoBebida : ArrayGruposBebida[index].Precios[i].IdTipoServicio) == $(cap + (!n ? "GrupoBebida" : "TipoServicio")).val()) {
            alert("El " + (!n ? "grupo de bebidas" : "tipo de servicio") + " que has seleccionado, ya tiene un precio asociado");
            return;
        }
    }

    if (!n) {
        ArrayTiposServicio[index].AñadirPrecio($(cap + "GrupoBebida").val(), $(cap + "Precio").val(), $(cap + "Maximo").val(), $(cap + "Minimo").val(), $(cap + "Tramo").val()
            , function(bExito, EvResultado) {
                if (!bExito) {
                    window.alert(EvResultado);
                    return;
                }
                RellenarTablaPrecios(n, index);

            });
    } else {
        ArrayGruposBebida[index].AñadirPrecio($(cap + "TipoServicio").val(), $(cap + "Precio").val(), $(cap + "Maximo").val(), $(cap + "Minimo").val(), $(cap + "Tramo").val()
            , function(bExito, EvResultado) {
                if (!bExito) {
                    window.alert(EvResultado);
                    return;
                }
                RellenarTablaPrecios(n, index);

            });
    }
}

function ModificarPrecio(n, index, i) {

    if (index > (!n ? ArrayTiposServicio.length - 1 : ArrayGruposBebida.length - 1)) {
        alert("indice fuera del rango");
        return;
    }
    var cap = (!n ? "#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_" + ArrayTiposServicio[index].Precios[i].IdGrupoBebida + "_Precio_" :
        "#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_" + ArrayGruposBebida[index].Precios[i].IdTipoServicio + "_Precio_");
    //comprobaciones
    if ($(cap + "Precio").val() == "") {
        alert("Debe indicar un precio");
        return;
    }
    if ($(cap + "Maximo").val() == "") {
        alert("Debe indicar un Máximo");
        return;
    }
    if ($(cap + "Minimo").val() == "") {
        alert("Debe indicar un Mínimo");
        return;
    }
    if ($(cap + "Tramo").val() == "") {
        alert("Debe indicar un Tramo");
        return;
    }
    //comprobar que no esté ya indicado el precio
    for (var j = 0; j < (!n ? ArrayTiposServicio[index].Precios.length : ArrayGruposBebida[index].Precios.length); j++) {
        if (i !== j) {
            if ((!n ? ArrayTiposServicio[index].Precios[j].IdGrupoBebida : ArrayGruposBebida[index].Precios[j].IdTipoServicio) == $(cap + (!n ? "GrupoBebida" : "TipoServicio")).val()) {
                alert("El " + (!n ? "grupo de bebidas" : "tipo de servicio") + " que has seleccionado, ya tiene un precio asociado");
                return;
            }
        }
    }
    if (!n) {
        ArrayTiposServicio[index].ModificarPrecio($(cap + "GrupoBebida").val(), $(cap + "Precio").val(), $(cap + "Maximo").val(), $(cap + "Minimo").val(), $(cap + "Tramo").val()
            , function(bExito, EvResultado) {
                if (!bExito) {
                    window.alert(EvResultado);
                    return;
                }
                RellenarTablaPrecios(n, index);

            });
    } else {
        ArrayGruposBebida[index].ModificarPrecio($(cap + "TipoServicio").val(), $(cap + "Precio").val(), $(cap + "Maximo").val(), $(cap + "Minimo").val(), $(cap + "Tramo").val()
            , function(bExito, EvResultado) {
                if (!bExito) {
                    window.alert(EvResultado);
                    return;
                }
                RellenarTablaPrecios(n, index);

            });
    }

}

function EliminarPrecio(n, index, i) {

    if (index > (!n ? ArrayTiposServicio.length - 1 : ArrayGruposBebida.length - 1)) {
        alert("indice fuera del rango");
        return;
    }
    var cap = (!n ? "#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_" + ArrayTiposServicio[index].Precios[i].IdGrupoBebida + "_Precio_" :
        "#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_" + ArrayGruposBebida[index].Precios[i].IdTipoServicio + "_Precio_");
    if (!n) {
        ArrayTiposServicio[index].QuitarPrecio($(cap + "GrupoBebida").val()
            , function(bExito, EvResultado) {
                if (!bExito) {
                    window.alert(EvResultado);
                    return;
                }
                RellenarTablaPrecios(n, index);

            });
    } else {
        ArrayGruposBebida[index].QuitarPrecio($(cap + "TipoServicio").val()
            , function(bExito, EvResultado) {
                if (!bExito) {
                    window.alert(EvResultado);
                    return;
                }
                RellenarTablaPrecios(n, index);

            });
    }
}

function RellenarSelectGruposBebida() {
    if (ArrayGruposBebida.length > 0) {
        //cargamos los grupos de bebeidas
        $(".Select_Grupos_Bebida").html("");
        $(".Select_Grupos_Bebida").append(
            function() {
                var html = '<option value="-1" ' + (-1 == $(this).attr("name") ? "selected=selected" : "") + " >Genérico</option>";
                for (var i = 0; i < ArrayGruposBebida.length; i++) {
                    //añadimos un select 
                    html += '<option value="' + ArrayGruposBebida[i].IdGrupoBebida + '" ' + (ArrayGruposBebida[i].IdGrupoBebida == $(this).attr("name") ? "selected=selected" : "") + " >" + ArrayGruposBebida[i].Nombre + "</option>";
                }
                return html;
            });
        return;
    } else {
        servidor.stock.ListarGruposBebida(
            function(bExito, ArrayGBebida) {
                if (!bExito) {
                    alert(ArrayGBebida);
                    return;
                }
                ArrayGruposBebida = ArrayGBebida;
                RellenarSelectGruposBebida();
            });
    }
}

function RellenarSelectTiposServicio() {
    if (ArrayTiposServicio.length > 0) {
        //cargamos los grupos de bebeidas
        $(".Select_Tipos_Servicio").html("");
        $(".Select_Tipos_Servicio").append(
            function() {
                var html = '';
                for (var i = 0; i < ArrayTiposServicio.length; i++) {
                    //añadimos un select 
                    html += '<option value="' + ArrayTiposServicio[i].IdTipoServicio + '" ' + (ArrayTiposServicio[i].IdTipoServicio == $(this).attr("name") ? "selected=selected" : "") + " >" + ArrayTiposServicio[i].Nombre + "</option>";
                }
                return html;
            });
        return;
    } else {
        servidor.servicios.ListarTiposServicio(
            function(bExito, ArrayTServicios) {
                if (!bExito) {
                    alert(ArrayTServicios);
                    return;
                }
                ArrayTiposServicios = ArrayTServicios;
                RellenarSelectTiposServicio();
            });
    }
}
///////////////////////////////////////////////////////////////////////////////

//////////////////////Grupos de Bebida/////////////////////////////////////////
function MostrarGruposBebida() {
    servidor.stock.ListarGruposBebida(function(bExito, rowsArray) {
        if (!bExito) {
            return;
        }
        ArrayGruposBebida = rowsArray;
        //debo añadir el grupo de bebidas que he recibido por el ArrayGruposBebida
        $("#tabla_Grupos_Bebida").html("");
        var Max = -1;
        for (var i = 0; i < ArrayGruposBebida.length; i++) {
            if (ArrayGruposBebida[i].Orden > Max)
                Max = ArrayGruposBebida[i].Orden;
            $("#tabla_Grupos_Bebida").append(
                '<tr > ' +
                '	<td><input type="number" max="99" min="0" step="1" id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Orden" value="' + ArrayGruposBebida[i].Orden + '" class="input-mini " onchange="ModificarGrupoBebida(' + i + ')" ></td>' +
                '	<td><span id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Nombre" class="input-block-level uneditable-input">' + ArrayGruposBebida[i].Nombre + '</span></td>' +
                '   <td>' +
                '       <select id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_TipoGenerico" style="width:75px; text-align:center;" onchange="ModificarGrupoBebida(' + i + ')"  >' +
                '           <option value="0" ' + (ArrayGruposBebida[i].bTiposGenericos ? '' : 'selected="selected"') + '>No</option>' +
                '           <option value="1" ' + (ArrayGruposBebida[i].bTiposGenericos ? 'selected="selected"' : '') + '>Sí</option>' +
                '       </select>' +
                '   </td>' +
                '   <td><input id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Color" type="color" value="' + ArrayGruposBebida[i].Color.ColorHash + '" class="input-mini" onchange="ModificarGrupoBebida(' + i + ')" /></td>' +
                '	<td class="boton" >\n\
                        <!--<a class="btn" onClick="ModificarGrupoBebida(' + i + ')"  href="javascript:void(0)"><i class="icon-refresh" ></i> </a>-->\n\
                        <a class="btn"  data-toggle="modal" data-target="#Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Eliminar_Modal" ><i class="icon-minus"></i> </a>' +
                '  <div id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Eliminar_Modal" class="modal hide " >\n\
                              <div class="modal-header">\n\
                              <h3>Eliminación del grupo de bebida <b>' + ArrayGruposBebida[i].Nombre + '</b></h3>\n\
                              </div>\n\
                              <div class="modal-body" style="text-align:left;">\n\
                                  <p>\n\
                                  ¿Está seguro que desea eliminar el grupo de bebidas <b>' + ArrayGruposBebida[i].Nombre + '</b>? \n\
                                  </p>\n\
                                  <p>\n\
                                   &nbsp; &nbsp;Tenga en cuenta que esta acción no se puede deshacer.\n\
                                  </p>\n\
                              </div>\n\
                              <div class="modal-footer">\n\
                                  <a href="javascript:void(0);" onClick="EliminarGrupoBebida(' + i + ')"  data-dismiss="modal" >Eliminar</a> <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn btn-success">Cancelar</a>\n\
                              </div>\n\
                          </div>' +
                '   </td><td class="boton" style="text-align:left;">' +
                '       <a class="btn" href="javascript:void(0)" style="font-weight:bold" onclick="MostrarGBBebidas(' + i + ')"><i class="icon-tint"> </i> Bebidas</a> ' +
                '       <a class="btn" href="javascript:void(0)" style="font-weight:bold" onclick="MostrarPrecios(1,' + i + ')" ><i class="icon-th-list"> </i> Precios</a>' +
                '       <div id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Bebidas" class="modal hide " >\n\
                            <div class="modal-header">\n\
                            <h3> Bebidas - ' + ArrayGruposBebida[i].Nombre + '</h3>\n\
                            </div>\n\
                            <div class="modal-body" style="text-align:center;">\n\
                            </div>\n\
                            <div class="modal-footer">\n\
                                <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn">Cerrar</a>\n\
                            </div>\n\
                        </div>' +
                '       <div id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Precios" class="modal hide " style="min-width: 750px" >\n\
                            <div class="modal-header">\n\
                            <h3> Precios - ' + ArrayGruposBebida[i].Nombre + '</h3>\n\
                            </div>\n\
                            <div class="modal-body" style="text-align:left;">\n\
                            </div>\n\
                            <div class="modal-footer">\n\
                                <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn">Cerrar</a>\n\
                            </div>\n\
                        </div>' +
                '   </td> ' +
                '</tr>');

        }
        $("#tabla_Grupos_Bebida").append('<tr>' +
            '<td><input type="number"  id="Id_NuevoGB_Orden" value="' + ++Max + '" class="input-mini"></td> ' +
            '<td><input type="text"  id="Id_NuevoGB_Nombre" value="" class="input-block-level"></td> ' +
            '   <td>' +
            '       <select id="Id_NuevoGB_TipoGenerico" style="width:75px; text-align:center;"   >' +
            '           <option value="0" selected="selected">No</option>' +
            '           <option value="1">Sí</option>' +
            '       </select>' +
            '   </td>' +
            '<td><input type="color"  id="Id_NuevoGB_Color" value="#e6e6e6" class="input-mini"></td> ' +
            '<td class="boton" ><a class="btn" onClick="AñadirGrupoBebida()" href="javascript:void(0)"><i class="icon-plus"></i> </a></td> </tr>');
    });
}

function AñadirGrupoBebida() {
    //debe introducir
    var cap = "#Id_NuevoGB_";
    if ($(cap + "Nombre").val() == "") {
        alert("Debe indicar el nombre del grupo de bebidas (Whisky, Ginebra, Cócteles...,)");
        return;
    }
    if ($(cap + "Orden").val() == "") {
        //vamos a poner le máximo número
        var Max = -1;
        for (var i = 0; i < ArrayGruposBebida.length; i++)
            if (ArrayGruposBebida[i].Orden > Max)
                Max = ArrayGruposBebida[i].Orden;
        $(cap + "Orden").val(++Max);
    }

    servidor.stock.AñadirGrupoBebida($(cap + "Orden").val(), $(cap + "Nombre").val(), $(cap + "TipoGenerico").val(), (new ColorUtils($(cap + "Color").val())).Color
        , function(bExito, id) {
            if (bExito) {
                MostrarGruposBebida();
            }
            else
                alert(id);
        });
}

function ModificarGrupoBebida(index) {
    //debe introducir
    var cap = "#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_";
    if ($(cap + "Nombre").html() == "") {
        alert("Debe indicar el nombre del grupo de bebidas (Whisky, Ginebra, Cócteles...,)");
        return;
    }
    if ($(cap + "Orden").val() == "") {
        //vamos a poner le máximo número
        var Max = -1;
        for (var i = 0; i < ArrayGruposBebida.length; i++)
            if (ArrayGruposBebida[i].Orden > Max)
                Max = ArrayGruposBebida[i].Orden;
        $(cap + "Orden").val(++Max);
    }

    servidor.stock.ModificarGrupoBebida(ArrayGruposBebida[index].IdGrupoBebida, $(cap + "Orden").val(), $(cap + "Nombre").html(), $(cap + "TipoGenerico").val(), (new ColorUtils($(cap + "Color").val())).Color
        , function(bExito, id) {
            if (bExito) {
                MostrarGruposBebida();
            }
            else
                alert(id);
        });
}

function EliminarGrupoBebida(index) {
    servidor.stock.QuitarGrupoBebida(ArrayGruposBebida[index].IdGrupoBebida
        , function(bExito, Mensaje) {
            if (!bExito) {
                alert(Mensaje);
                return;
            }
            MostrarGruposBebida();
        });
}
///////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////Bebidas///////////////////////////////////
function MostrarGBBebidas(index) {

    if (index > ArrayGruposBebida.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    RellenarGbBebidas(index, function(bExito, mensaje) {
        if (!bExito) {
            window.alert(mensaje);
            return;
        }
        $("#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_Bebidas").modal("show");
    });
}

function RellenarGbBebidas(index, Callback) {
    ArrayGruposBebida[index].ListarBebidas(
        function(bExito, self) {
            if (!bExito) {
                if (!isUndefined(Callback))
                    Callback(bExito, self);
                return;
            }
            //añadir los precios para que puedan ser modificados
            $("#Id_GB_" + self.IdGrupoBebida + "_Bebidas .modal-body").html("");
            $("#Id_GB_" + self.IdGrupoBebida + "_Bebidas .modal-body").append(
                function() {
                    var html = "<div style='float:right;width:83%'><table style='text-align:left;'><thead><th>Nombre</th><th>Cantidad(ml)</th></thead>";
                    for (var i = 0; i < self.Bebidas.length; i++) {
                        var bebida = self.Bebidas[i];
                        html +=
                            "<tr>\n\
                                <td><span id='Id_GB_" + self.IdGrupoBebida + "_" + bebida.IdBebida + "_Bebida_Nombre' class='input-block-level uneditable-input' >" + bebida.Nombre + "</span></td>\n\
                                <td ><input type='number' id='Id_GB_" + self.IdGrupoBebida + "_" + bebida.IdBebida + "_Bebida_Cantidad_Botella' min='0' step='50' class='input-mini numerico' value='" + bebida.Cantidad_Botella + "'  onchange='ModificarBebida(" + index + "," + i + ")' /></td>\n\
                                <td class='boton'>\n\
                                                  <!--<a class='btn' href='javascript:void()' onclick='ModificarBebida(" + index + "," + i + ")' class='btn'><i class='icon-refresh'> </i></a>-->\n\
                                                  <a class='btn' data-toggle='modal' data-target='#Id_GB_" + self.IdGrupoBebida + "_" + bebida.IdBebida + "_Eliminar_Modal' class='btn'><i class='icon-minus'> </i></a>" +
                            '  <div id="Id_GB_' + self.IdGrupoBebida + "_" + bebida.IdBebida + '_Eliminar_Modal" class="modal hide " >\n\
                                                      <div class="modal-header">\n\
                                                      <h3>Eliminación de la bebida <b>' + bebida.Nombre + '</b></h3>\n\
                                                      </div>\n\
                                                      <div class="modal-body" style="text-align:left;">\n\
                                                          <p>\n\
                                                          ¿Está seguro que desea eliminar la bebida <b>' + bebida.Nombre + '</b>? \n\
                                                          </p>\n\
                                                          <p>\n\
                                                           &nbsp; &nbsp;Tenga en cuenta que esta acción no se puede deshacer.\n\
                                                          </p>\n\
                                                      </div>\n\
                                                      <div class="modal-footer">\n\
                                                          <a href="javascript:void(0);" onClick="EliminarBebida(' + index + "," + i + ')"  data-dismiss="modal" >Eliminar</a> <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn btn-success">Cancelar</a>\n\
                                                      </div>\n\
                                                  </div>\n\
                                </td>\n\
                            </tr>';
                    }
                    //añadir la última linea para poder añadir un precio
                    html +=
                        "<tr>\n\
                                <td><input type='text' id='Id_GB_Nuevo_" + self.IdGrupoBebida + "_Bebida_Nombre' class='input-block-level'   /></td>\n\
                                <td ><input type='number' id='Id_GB_Nuevo_" + self.IdGrupoBebida + "_Bebida_Cantidad_Botella' min='0' step='50' class='input-mini numerico'  /></td>\n\
                                <td class='boton'><a class='btn' href='javascript:void()' onclick='AñadirBebida(" + index + ")' class='btn'><i class='icon-plus'> </i></a>\n\
                                </td>\n\
                            </tr></table></div>";

                    return html;
                });
            if (!isUndefined(Callback)) {
                Callback(bExito, self);
            }
        });
}

function AñadirBebida(index) {
    if (index > ArrayGruposBebida.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    var cap = "#Id_GB_Nuevo_" + ArrayGruposBebida[index].IdGrupoBebida + "_Bebida_";
    //comprobaciones
    if ($(cap + "Nombre").val() == "") {
        alert("Debe indicar un nombre");
        return;
    }
    var cantidad_botella = null
    if ($(cap + "Cantidad_Botella").val() != "") {
        cantidad_botella = $(cap + "Cantidad_Botella").val();
    }
    for (var i = 0; i < ArrayGruposBebida[index].Bebidas.length; i++) {
        if (ArrayGruposBebida[index].Bebidas[i].Nombre == $(cap + "Nombre").val()) {
            alert("El nombre que utilizas ya existe en este grupo");
            return;
        }
    }
    ArrayGruposBebida[index].AñadirBebida($(cap + "Nombre").val(), cantidad_botella
        , function(bExito, EvResultado) {
            if (!bExito) {
                window.alert(EvResultado);
                return;
            }
            RellenarGbBebidas(index);

        });
}

function ModificarBebida(index, i) {
    if (index > ArrayGruposBebida.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    var cap = "#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_" + ArrayGruposBebida[index].Bebidas[i].IdBebida + "_Bebida_";
    //comprobaciones
    if ($(cap + "Nombre").html() == "") {
        alert("Debe indicar un nombre");
        return;
    }
    var cantidad_botella = null
    if ($(cap + "Cantidad_Botella").val() != "") {
        cantidad_botella = $(cap + "Cantidad_Botella").val();
    }
    for (var j = 0; j < ArrayGruposBebida[index].Bebidas.length; j++) {
        if (i !== j) {
            if (ArrayGruposBebida[index].Bebidas[j].Nombre == $(cap + "Nombre").val()) {
                alert("El nombre que utilizas ya existe en este grupo");
                return;
            }
        }
    }
    ArrayGruposBebida[index].ModificarBebida(ArrayGruposBebida[index].Bebidas[i].IdBebida, $(cap + "Nombre").html(), cantidad_botella
        , function(bExito, EvResultado) {
            if (!bExito) {
                window.alert(EvResultado);
                return;
            }
            RellenarGbBebidas(index);

        });
}

function EliminarBebida(index, i) {
    if (index > ArrayGruposBebida.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    ArrayGruposBebida[index].QuitarBebida(ArrayGruposBebida[index].Bebidas[i].IdBebida
        , function(bExito, EvResultado) {
            if (!bExito) {
                window.alert(EvResultado);
                return;
            }
            RellenarGbBebidas(index);

        });
}
///////////////////////////////////////////////////////////////////////////////

//////////////////////////////Gestionar Stock//////////////////////////////////
function GestionarStock() {
    $(".panel").hide();
    $("#PanelGestionarStock").show();
    $(".menu").removeClass("active");
    $("#Menu_GestionarStock").parent().addClass("active");
    $("#tr_cargando").show();
    $("#bar_Cargando").css("width", "100%");
    servidor.servicios.TotalTiposServicio(
        function(bExito, totalTiposServicio) {
            if (!bExito) {
                alert(totalTiposServicio);
                return;
            }

            if (!totalTiposServicio) {
                alert("Debe introducir, al menos, un tipo de servicio");
                return;
            }
            servidor.stock.TotalBebidas(
                function(bExito, totalBebidas) {
                    if (!bExito) {
                        alert(totalBebidas);
                        return;
                    }
                    if (!totalBebidas) {
                        alert("Debe introducir, al menos, una bebida");
                        return;
                    }
                    ;
                    $("#bar_Cargando").css("width", "100%");
                    //Mostrar en una tabla todo el stock que hay
                    servidor.stock.ListarStock(
                        function(bExito, rowsArray) {

                            if (!bExito) {
                                alert(rowsArray);
                                return;
                            }
                            //$("#tr_cargando").show();
                            $('.fila_bebida').remove();

                            for (var i = 0; i < rowsArray.length; i++) {
                                var nCantidadxBotella = rowsArray[i][3];
                                var nCantidadStock = parseInt(rowsArray[i][4] / rowsArray[i][3]);
                                var nCantidadRetales = parseInt((rowsArray[i][4] - (nCantidadStock * rowsArray[i][3])) % nCantidadxBotella);
                                var nCantidadTotalStock = rowsArray[i][4];
                                $("#Id_Tabla_Bebidas").append("<tr id='Id_GS_" + rowsArray[i][0] + "' class='fila_bebida' >" +
                                    //añadimos la bebida
                                    "<td id='Id_GS_" + rowsArray[i][0] + "_Nombre_Botella' class='a_filtrar'>" + rowsArray[i][1] + "</td>" +
                                    //Grupo de bebida
                                    "<td id='Id_GS_" + rowsArray[i][0] + "_Nombre_Grupo' class='a_filtrar'>" + rowsArray[i][2] + "</td>" +
                                    //Cantidad en cada botella
                                    "<td class='numerico'>" +
                                    "<div class='input-append'>" +
                                    "<span id='Id_GS_" + rowsArray[i][0] + "_Cantidad_Botella' type='text' class='numerico input-mini span2 uneditable-input' >" +
                                    nCantidadxBotella + "</span>" +
                                    "<a class='btn'  herf='javascript:void(0)' onClick='AñadirCantidadxBotella(" + rowsArray[i][0] + ")'><i class='icon-plus'> </i></a>" +
                                    "<a class='btn'  herf='javascript:void(0)' onClick='QuitarCantidadxBotella(" + rowsArray[i][0] + ")'><i class='icon-minus'> </i></a>" +
                                    "</div>" +
                                    "</td>" +
                                    //Catnidad en stock
                                    "<td class='numerico'>" +
                                    "<div class='input-append'>" +
                                    "<span id='Id_GS_" + rowsArray[i][0] + "_Cantidad_Botellas_Stock' type='text' class='span2 numerico uneditable-input'> " +
                                    nCantidadStock + "</span>" +
                                    "<a class='btn'  herf='javascript:void(0)' onClick='AñadirCantidadBotellas(" + rowsArray[i][0] + ")'><i class='icon-plus'> </i></a>" +
                                    "<a class='btn'  herf='javascript:void(0)' onClick='QuitarCantidadBotellas(" + rowsArray[i][0] + ")'><i class='icon-minus'> </i></a>" +
                                    "</div>" +
                                    "</td>" +
                                    //Cantidad de retales
                                    "<td class='numerico'>" +
                                    "<div class='input-append'>" +
                                    "<span id='Id_GS_" + rowsArray[i][0] + "_Cantidad_Retales' type='text' class='span2 numerico uneditable-input' > " +
                                    nCantidadRetales + " </span>" +
                                    "<a class='btn' href='#Id_GS_" + rowsArray[i][0] + "_Modal_Retales' data-toggle='modal' ><i class='icon-edit'> </i></a>" +
                                    "</div>" +
                                    //añadimos el diálogo modal para mostrar
                                    '<div id="Id_GS_' + rowsArray[i][0] + '_Modal_Retales" class="modal hide  cuadro_retales" >' +
                                    '	<div class="modal-header"> ' +
                                    '		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                                    '		<h3>Indicar Retales para ' + rowsArray[i][1] + '</h3>' +
                                    '	</div>' +
                                    '	<div class="modal-body">' +
                                    '		<p>Indique la cantidad en algún tipo de servicio que le quede a la botella</p>' +
                                    '		<table id="Id_GS_' + rowsArray[i][0] + '_table_Retales" > ' +
                                    '			<tr id="Id_GS_' + rowsArray[i][0] + '_tr_Añadir_Retales" > ' +
                                    '				<td> <select id="Id_GS_' + rowsArray[i][0] + '_select_add" class="select_retales">' +
                                    '					</select>' +
                                    '				</td>' +
                                    '				<td ><a class="btn" onClick="AñadirRetales(' + rowsArray[i][0] + ')" href="javascript:void(0)"><i class="icon-plus"></i> </a></td>' +
                                    '			</tr> ' +
                                    '		</table> ' +
                                    '	</div>' +
                                    '	<div class="modal-footer ">' +
                                    '		<div style="float:left">Total retales: <span id="Id_GS_' + rowsArray[i][0] + '_total_Retales">' + nCantidadRetales + '</span> <a href="javascript:void(0)" onClick="EliminarRetales(' + rowsArray[i][0] + ')" class="btn">Quitar retales</a></div>' +
                                    '		<div><a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn">Cerrar</a></div>' +
                                    '	</div>' +
                                    '</div>' +
                                    "</td>" +
                                    //Cantidad en stock en ml
                                    "<td id='Id_GS_" + rowsArray[i][0] + "_Cantidad_Stock' class='numerico'>" + nCantidadTotalStock + "</td></tr>");
                                //añado a la barra el porcentaje que represente
                                // $("#bar_Cargando").css("width", (i / (rowsArray.length - 1) * 100)+"%");
                            }

                            RellenarSelectRetales();
                            //clearInterval(intervalo)
                            $("#tr_cargando").hide();
                            $("#bar_Cargando").css("width", "0%");

                        });
                });
        });

}

function ReiniciarStock() {
    servidor.stock.ReiniciarStock(
        function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }
            GestionarStock();
        });
}

function RellenarSelectRetales() {
    for (var i = 0; i < ArrayTiposServicio.length; i++) {
        $(".select_retales").append(function() {
            var cantidad = parseInt($("#Id_GS_" + this.id.replace("Id_GS_", "").replace("_select_add", "") + "_Cantidad_Botella").html());
            var html = "";
            for (var j = 1; ArrayTiposServicio[i].Cantidad * j < cantidad; j++)
                html += "<option value='" + j * ArrayTiposServicio[i].Cantidad + "'> " + j + " de tipo: " + ArrayTiposServicio[i].Nombre + "</option>";
            return html;
        });
    }

}

function AñadirCantidadxBotella(idBebida) {
    //si se le da a este botón se añade 10 al idBebida
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").html()) + 50;
    var cantidadStock = cantidad * parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html()) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").html());
    servidor.stock.ModificarStockBotellaBebida(idBebida, cantidad, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }
            $("#Id_GS_" + idBebida + "_Cantidad_Botella").html(cantidad);
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);

        });
}

function QuitarCantidadxBotella(idBebida) {
    //si se le da a este botón se añade 10 al idBebida
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").html()) - 50;
    var cantidadStock = cantidad * parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html()) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").html());
    servidor.stock.ModificarStockBotellaBebida(idBebida, cantidad, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }
            $("#Id_GS_" + idBebida + "_Cantidad_Botella").html(cantidad);
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);
        });
}

function AñadirCantidadBotellas(idBebida) {
    //si se le da a este botón se añade 10 al idBebida
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").html());
    var cantidadStock = cantidad * (parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html()) + 1) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").html());
    servidor.stock.ModificarStockBebida(idBebida, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }
            $("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html((parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html()) + 1));
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);
        });
}

function QuitarCantidadBotellas(idBebida) {
    //si se le da a este botón se añade 10 al idBebida
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").html());
    var cantidadStock = cantidad * (parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html()) - 1) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").html());
    servidor.stock.ModificarStockBebida(idBebida, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }
            $("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html((parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html()) - 1));
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);
        });
}

function AñadirRetales(idBebida) {

    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").html());
    var cantidadRetal = parseInt($('#Id_GS_' + idBebida + '_select_add').val());
    var cantidadStock = cantidad * (parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html())) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").html()) + cantidadRetal;
    var cantidadTotalRetales = cantidadRetal + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").html());
    servidor.stock.ModificarStockBebida(idBebida, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }
            //añadir las cantidades correspondientes
            $('#Id_GS_' + idBebida + '_tr_Añadir_Retales').before(
                '<tr id="Id_GS_' + idBebida + '_tr_Retal_' + $('#Id_GS_' + idBebida + '_table_Retales tr').length + '" class="añadido">' +
                '	<td>' + $('#Id_GS_' + idBebida + '_select_add :selected').text() + '</td>' +
                '	<td  ><a class="btn" onClick="QuitarRetal(' + idBebida + ',' + $('#Id_GS_' + idBebida + '_table_Retales tr').length + ',' + cantidadRetal + ')" href="javascript:void(0)"><i class="icon-minus"></i> </a></td>' +
                '</tr>');
            $("#Id_GS_" + idBebida + "_Cantidad_Retales").html(cantidadTotalRetales);
            $("#Id_GS_" + idBebida + "_total_Retales").html(cantidadTotalRetales);
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);

        });
}

function QuitarRetal(idBebida, fila, cantidadRetal) {
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").html());
    var cantidadStock = cantidad * (parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html())) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").html()) - cantidadRetal;
    var cantidadTotalRetales = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").html()) - cantidadRetal;

    servidor.stock.ModificarStockBebida(idBebida, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }

            $('#Id_GS_' + idBebida + '_tr_Retal_' + fila).remove();
            $("#Id_GS_" + idBebida + "_Cantidad_Retales").html(cantidadTotalRetales);
            $("#Id_GS_" + idBebida + "_total_Retales").html(cantidadTotalRetales);
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);

        });
}

function EliminarRetales(idBebida) {
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").html());
    var cantidadStock = cantidad * (parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").html()));

    servidor.stock.ModificarStockBebida(idBebida, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }

            $('#Id_GS_' + idBebida + '_table_Retales .añadido').remove();
            $("#Id_GS_" + idBebida + "_Cantidad_Retales").html(0);
            $("#Id_GS_" + idBebida + "_total_Retales").html(0);
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);

        });
}
///////////////////////////////////////////////////////////////////////////////

/////////////////////////////Sesión de Cotización////////////////////////////////////
function MostrarPanelSesiónCotización() {
    $(".menu").removeClass("active");
    $(".panel").hide();
    $("#Menu_IniciarSesiónCotización").parent().addClass("active");
    if (isUndefined(localStorage[TPV])) {
        //se ha introducido algo como texto en el campo del nombre
        if ($("#Id_Int_TPV").val() == "") {
            //mostramos el panel para introducir el nombre del TPV
            $("#PanelPeguntarNombreTPV").show();
            return;
        } else {
            localStorage[TPV] = $("#Id_Int_TPV").val();
        }
        if (SesiónIniciada) {
            AbrirSesiónCotizacion();
            return;
        }
    }
    $("#PanelIniciarSesiónCotización").show();
    //añadir los grupos de bebida
    RellenarCheckGruposBebida();
}

function RellenarCheckGruposBebida() {
    if (ArrayGruposBebida.length > 0) {
        //cargamos los grupos de bebeidas
        $("#tbody_Sel_Grupos_Bebida .fila_GB").remove();
        $("#tbody_Sel_Grupos_Bebida").append(
            function() {
                var html = "";
                for (var i = 0; i < ArrayGruposBebida.length; i++)
                    html += "<tr class='fila_GB'><td>\n\
                                    <label class='checkbox'><input id='Id_Check_" + i + "' onchange='cambiarCheck(" + i + ")' type='checkbox' value='" + ArrayGruposBebida[i].IdGrupoBebida + "' class='sel_grupo_bebidas_checkbox check_grupos'/>" + ArrayGruposBebida[i].Nombre + "</lable>\n\
                                </td></tr>";

                return html;

            });
        return;
    } else {
        servidor.stock.ListarGruposBebida(
            function(bExito, ArrayGBebida) {
                if (!bExito) {
                    alert(ArrayGBebida);
                    return;
                }
                ArrayGruposBebida = ArrayGBebida;
                RellenarCheckGruposBebida();
            });
    }
}

function cambiarCheck(id) {

    var s_id;

    if (typeof id === "string") {

        s_id = id;

    } else {
        s_id = 'Id_Check_' + id;
    }

    if ($("#" + s_id).is(":checked")) {
        if (typeof id === "string") {
            //deseleccionar todos los de la clase .sel_grupo_bebidas_checkbox
            $(".check_grupos").prop("checked", false);
            if (s_id == "Id_Sel_GB_Todos") {
                $("#Id_Sel_GB_Genericos").prop("checked", false);
            } else {
                $("#Id_Sel_GB_Todos").prop("checked", false);
            }
        }
        else
            $(".check_generico").prop("checked", false);
    }
}

function IniciarSesiónCotización() {
    //Comprobar que se ha seleccionado al menos un grupo
    var ArrayIdGruposBebida = [];
    if ($("#Id_Sel_GB_Todos").is(":checked")) {
        for (var i = 0; i < ArrayGruposBebida.length; i++)
            ArrayIdGruposBebida[ArrayIdGruposBebida.length] = ArrayGruposBebida[i].IdGrupoBebida;
    } else if ($("#Id_Sel_GB_Genericos").is(":checked")) {
        for (var i = 0; i < ArrayGruposBebida.length; i++)
            if (ArrayGruposBebida[i].bTiposGenericos)
                ArrayIdGruposBebida[ArrayIdGruposBebida.length] = ArrayGruposBebida[i].IdGrupoBebida;

    } else {
        $(".sel_grupo_bebidas_checkbox").each(function() {
            if ($(this).val() >= 0 && this.checked)
                ArrayIdGruposBebida[ArrayIdGruposBebida.length] = $(this).val();
        });
    }
    if (!ArrayIdGruposBebida.length) {
        alert("Debe seleccionar al menos un grupo de bebida para poder iniciar la sesión de cotización");
        return;
    }
    bStock = $("input[name='rdStock']:checked").val() == "1";
    //vamos a cargar el stock en la cotización
    servidor.cotización.IniciarSesión(ArrayIdGruposBebida, function(bExito, strMensaje) {
        if (!bExito) {
            alert(strMensaje);
            return;
        }
        $(".panel").hide();
        $("#PanelSesiónCotización").show();
        $(".sesión").show();
        $("#Id_TiempoSesión").addClass('active');
        $(".configuración").hide();
        $(".page-header").hide();
        $("#Id_ReanudarTemporizador").hide();
        initTiempoSesión();
        //Abro la sesión de cotización
        AbrirSesiónCotizacion();
        //abrir en una nueva ventan el visor de regilla

    });

}

function AbrirSesiónCotizacion() {


    //obtener todas las bebidas
    servidor.stock.ListarBebidas(bStock,
        function(bExito, rowsArray) {
            if (!bExito) {
                window.alert(rowsArray);
                return;
            }
            ArrayBebidas = rowsArray;
            var html = "<div style='width: 100%'>";
            //vamos a añadir un botón
            var sec = 0;
            for (var i = 0; i < ArrayBebidas.length; i++) {

                html += "<a class='bebidas btn  ' href='#Id_Bebida_" + ArrayBebidas[i].IdBebida + "' data-toggle='modal'" +
                    " style='color: " + (Math.round(ArrayBebidas[i].Color.Luminosidad) ? '#000' : '#FFF') + ";" +
                    "        background-color: " + ArrayBebidas[i].Color.Inc(5) + ";" +
                    "        background-image: -webkit-gradient(linear, 0 0, 0 100%, from(" + ArrayBebidas[i].Color.Inc(70) + "), to(" + ArrayBebidas[i].Color.Dec(0) + ")); " +
                    "        background-image: -moz-linear-gradient(top, " + ArrayBebidas[i].Color.Inc(70) + ", " + ArrayBebidas[i].Color.Dec(0) + ");" +
                    "        background-image: -webkit-linear-gradient(top, " + ArrayBebidas[i].Color.Inc(70) + ", " + ArrayBebidas[i].Color.Dec(0) + ");" +
                    "        background-image: -o-linear-gradient(top, " + ArrayBebidas[i].Color.Inc(70) + ", " + ArrayBebidas[i].Color.Dec(0) + ");" +
                    "        background-image: linear-gradient(to bottom, " + ArrayBebidas[i].Color.Inc(70) + ", " + ArrayBebidas[i].Color.Dec(0) + ");" +
                    "        text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25); background-repeat: repeat-x; border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25); ' " +
                    "><div class='Titulo'  id='Id_Bebida_" + ArrayBebidas[i].IdBebida + "_div' >" + ArrayBebidas[i].Nombre + "<table class='Precios'></table></div></a>";
                html += '<div id="Id_Bebida_' + ArrayBebidas[i].IdBebida + '" class="modal hide " >\n\
                            <div class="modal-header">\n\
                            <h3>' + ArrayBebidas[i].NombreGrupoBebida + ' - ' + ArrayBebidas[i].Nombre + '</h3>\n\
                            </div>\n\
                            <div id="Id_Bebida_' + ArrayBebidas[i].IdBebida + '_modal_body" class="modal-body" style="text-align:center;">\n\
                                <table align="center" >\n\
                                    <tr id="Id_Bebida_' + ArrayBebidas[i].IdBebida + '_modal_body_tr">\n\
                                    </tr>\n\
                                </table>\n\
                            </div>\n\
                            <div class="modal-footer">\n\
                                <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn">Cerrar</a>\n\
                            </div>\n\
                        </div>';
                ArrayBebidas[i].ListarTiposServicio(function(bExito, rowsArray) {
                    if (!bExito) {
                        alert(rowsArray);
                        return;
                    }
                    sec++;
                    for (var j = 0; j < rowsArray.length; j++) {
                        var oTipoServicio = rowsArray[j];
                        var p;
                        if (oTipoServicio.EnCotización)
                            $("#Id_Bebida_" + oTipoServicio._parent.IdBebida + "_div .Precios").append("<tr><td>" + oTipoServicio.Nombre + "</td><td>" +
                                '           <span class="Id_Bebida_' + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + '_Precio">' +
                                Left((p = (p = oTipoServicio.PrecioInicial.toString()) + (p.indexOf(".") > 0 ? '' : '.') + '00'), p.split(".")[0].length + 3) +
                                '</span>€</td></tr>');
                        //vamos a añadir un botón con el nombre del servicio y el valor
                        $("#Id_Bebida_" + oTipoServicio._parent.IdBebida + "_modal_body_tr").append(
                            '<td ><div><a ' +
                            "   style='color: " + (Math.round(oTipoServicio.Color.Luminosidad) ? '#000' : '#FFF') + ";" +
                            "           background-color: " + oTipoServicio.Color.Inc(5) + ";" +
                            "           background-image: -webkit-gradient(linear, 0 0, 0 100%, from(" + oTipoServicio.Color.Inc(70) + "), to(" + oTipoServicio.Color.Dec(0) + ")); " +
                            "           background-image: -moz-linear-gradient(top, " + oTipoServicio.Color.Inc(70) + ", " + oTipoServicio.Color.Dec(0) + ");" +
                            "           background-image: -webkit-linear-gradient(top, " + oTipoServicio.Color.Inc(70) + ", " + oTipoServicio.Color.Dec(0) + ");" +
                            "           background-image: -o-linear-gradient(top, " + oTipoServicio.Color.Inc(70) + ", " + oTipoServicio.Color.Dec(0) + ");" +
                            "           background-image: linear-gradient(to bottom, " + oTipoServicio.Color.Inc(70) + ", " + oTipoServicio.Color.Dec(0) + ");" +
                            "           text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25); background-repeat: repeat-x; border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25); ' " +
                            '   href="javascript:void(0)" ' +
                            '   onClick="AñadirServicio(' + oTipoServicio._parent.IdBebida + ',' + oTipoServicio.IdTipoServicio + ')" ' +
                            '   class="bebidas btn"> ' +
                            '   <div>' + oTipoServicio.Nombre + '<br />' +
                            '       <span style="font-size: 9pt; font-weight: bold;">Precio: ' +
                            '           <span class="Id_Bebida_' + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + '_Precio">' +
                            '               ' + Left((p = (p = oTipoServicio.PrecioInicial.toString()) + (p.indexOf(".") > 0 ? '' : '.') + '00'), p.split(".")[0].length + 3) +
                            '</span>€' +
                            '       </span>' +
                            '   </div>' +
                            '</a></div>\n\
                            <div>' + (oTipoServicio.EnCotización ?
                                ('<a id="Id_Bebida_' + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + '_FijarPrecio_a" data-toggle="modal" data-target="#Id_Bebida_' + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + '_FijarPrecio"  >Fijar Precio</a>\n\
                                \n\
                                    <div id="Id_Bebida_' + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + '_FijarPrecio" class="modal hide " >\n\
                                        <div class="modal-header">\n\
                                        <h3>Fijar Precio de ' + oTipoServicio.Nombre + ' de ' + oTipoServicio._parent.Nombre + '</h3>\n\
                                        </div>\n\
                                        <div class="modal-body" style="text-align:left; height: 200px;">' +
                                    "<table class='mitabla'><thead><th>Grupo Bebida</th><th>Bebida</th><th>Precio</th></thead>\n\
                                            <tr>\n\
                                            <td>" + oTipoServicio._parent.NombreGrupoBebida + "</td>\n\
                                            <td>" + oTipoServicio._parent.Nombre + "</td>\n\
                                            <td><input type='number' id='Id_Bebida_" + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + "_FijarPrecio_Precio' min='0' step='0.1' class='input-mini numerico' value='" + oTipoServicio.PrecioInicial + "'  /></td>\n\
                                            <td class='boton'>\n\
                                                <a class='btn' id='Id_Bebida_" + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + "_FijarPrecio_btn_Fijar' href='javascript:void()' onclick='FijarPrecio(" + oTipoServicio._parent.IdBebida + "," + oTipoServicio.IdTipoServicio + ")' class='btn'> Fijar Precio</a>\n\
                                                <a class='btn' id='Id_Bebida_" + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + "_FijarPrecio_btn_Liberar' href='javascript:void()' onclick='LiberarPrecio(" + oTipoServicio._parent.IdBebida + "," + oTipoServicio.IdTipoServicio + ")' class='btn' style='display:none'> Liberar Precio Fijado</a>\n\
                                             </td>\n\
                                        </tr></table>" +
                                    '</div>\n\
                                        <div class="modal-footer">\n\
                                             <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" >Cerrar</a>\n\
                                        </div>\n\
                                    </div>') : '<span title="Este precio esta fijado mediante configuración"  class="muted">Precio fijado</span>') +
                            '</div>\n\
                            </td>');
                    }
                    if (sec === ArrayBebidas.length) {
                        ActualizarPrecios();
                    }
                });

            }
            html += "</div>";
            $("#PanelSesiónCotización").html(html);
        });

}

function initTiempoSesión() {
    return setInterval(function() {
        //adelantar un segundo el relog
        var segundos = parseInt($("#id_segundos").html(), 10);

        if (segundos === 59)
        {
            $("#id_segundos").html("00");
            var minutos = parseInt($("#id_minutos").html(), 10);
            if (minutos === 59) {
                $("#id_minutos").html("00");
                var horas = parseInt($("#id_horas").html(), 10);
                horas++;
                $("#id_horas").html((horas > 9 ? "" : "0") + horas);
            } else {
                minutos++;
                $("#id_minutos").html((minutos > 9 ? "" : "0") + minutos);
            }
        } else {
            segundos++;
            $("#id_segundos").html((segundos > 9 ? "" : "0") + segundos);
        }


    }, 1000);
}

function ActualizarPrecios() {

    servidor.cotización.ListarCotización(function(bExito, rowsArray) {
        if (!bExito)
            return;

        //ahora añadir los precios
        var p = "";
        for (var i = 0; i < rowsArray.length; i++) {
            $('.Id_Bebida_' + rowsArray[i][2] + '_Id_T_Servicio_' + rowsArray[i][4] + '_Precio')
                .html(Left((p = (p = rowsArray[i][6].toString()) + (p.indexOf(".") > 0 ? '' : '.') + '00'), p.split(".")[0].length + 3));
            $("#Id_Bebida_" + rowsArray[i][2] + '_Id_T_Servicio_' + rowsArray[i][4] + "_FijarPrecio_a")
                .html(rowsArray[i][9] == "0" ? " Fijar Precio" : "Liberar Precio Fijado");
            if (rowsArray[i][9] == "0") {
                $("#Id_Bebida_" + rowsArray[i][2] + '_Id_T_Servicio_' + rowsArray[i][4] + "_FijarPrecio_btn_Fijar").show();
                $("#Id_Bebida_" + rowsArray[i][2] + '_Id_T_Servicio_' + rowsArray[i][4] + "_FijarPrecio_btn_Liberar").hide();
            } else {

                $("#Id_Bebida_" + rowsArray[i][2] + '_Id_T_Servicio_' + rowsArray[i][4] + "_FijarPrecio_btn_Fijar").hide();
                $("#Id_Bebida_" + rowsArray[i][2] + '_Id_T_Servicio_' + rowsArray[i][4] + "_FijarPrecio_btn_Liberar").show();
                $("#Id_Bebida_" + rowsArray[i][2] + '_Id_T_Servicio_' + rowsArray[i][4] + "_FijarPrecio_Precio").val(rowsArray[i][6]);

            }
        }
    });
}

function AñadirServicio(IdBebida, IdTipoServicio) {
    if (!isUndefined(TimeOutFinalizarServicios))
        clearTimeout(TimeOutFinalizarServicios);

    var oBebida = ArrayBebidas.obBebida(IdBebida)
        , oTipoServicio = oBebida.TiposServicio.obTipoServicio(IdTipoServicio);
    oTipoServicio.ObtenerPrecio(function(bExito, precio) {
        if (!bExito) {
            window.alert(precio);
            return;
        }
        oTipoServicio.bAcotizar = true;
        //añadir un nuevo objeto al arrDatosServicioActual
        var IdDatoServicio = ArrDatosServicioActual.length;
        ArrDatosServicioActual[IdDatoServicio] = new servidor.servicios.CDatoServicio(IdDatoServicio, oTipoServicio.IdTipoServicio, oTipoServicio.Nombre, oBebida.IdBebida, oBebida.Nombre, precio);

        var fila, p = Left(p = (p = (precio === null ? oTipoServicio.PrecioInicial : precio).toString()) + (p.indexOf(".") === -1 ? '.' : '') + '00', p.split(".")[0].length + 3);
        //cerrar este cuadro modal y abrir otro con el resumen
        $('#Id_Bebida_' + IdBebida).modal("hide");
        $('#Id_Modal_Resumen_Servicios .modal-body tbody').append(
            fila =
            '<tr id="Id_DS_' + IdDatoServicio + '">\n\
                    <td>' + oBebida.Nombre + '</td>\n\
                    <td>' + oTipoServicio.Nombre + '</td>\n\
                    <td>' + p + ' €</td>\n\
                    <td><a class="btn" ><i class="icon-plus" href="javascript:void()" onclick="DuplicarDatoServicio(' + IdDatoServicio + ')"> </i></a><a class="btn" href="javascript:void()" onclick="EliminarDatoServicio(' + IdDatoServicio + ')" ><i class="icon-minus"> </i></a>\n\
                </tr>');
        $('#Id_Modal_Resumen_Servicios').modal("show");
        p = 0;
        for (var i = 0; i < ArrDatosServicioActual.length; i++)
            p += parseFloat(ArrDatosServicioActual[i].Precio);
        $("#Id_TotalServicio").html(Left(p = p + (p.toString().indexOf(".") === -1 ? "." : "") + '00', p.split(".")[0].length + 3) + " €");

        localStorage[ServiciosNoFinalizados] = 1;
        localStorage[ServiciosNoFinalizados + "_Filas"] = $('#Id_Modal_Resumen_Servicios .modal-body tbody').html();
        localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"] = JSON.stringify(ArrDatosServicioActual);

        //30 segundos para cotizar esto y finalizar estos servicios
        TimeOutFinalizarServicios = setTimeout(function() {
            FinalizarServicio();
        }, 30 * 1000);
    });
}

function FijarPrecio(IdBebida, IdTipoServicio) {
    var cap = '#Id_Bebida_' + IdBebida + '_Id_T_Servicio_' + IdTipoServicio;
    //comprobaciones
    if ($(cap + "_FijarPrecio_Precio").val() == "") {
        alert("Debe indicar un precio");
        return;
    }
    var oBebida = ArrayBebidas.obBebida(IdBebida)
        , oTipoServicio = oBebida.TiposServicio.obTipoServicio(IdTipoServicio);
    oTipoServicio.FijarPrecio($(cap + "_FijarPrecio_Precio").val()
        , function(bExito, Mensaje) {
            if (!bExito)
                window.alert(Mensaje);
            return;
        });
}

function LiberarPrecio(IdBebida, IdTipoServicio) {
    var oBebida = ArrayBebidas.obBebida(IdBebida)
        , oTipoServicio = oBebida.TiposServicio.obTipoServicio(IdTipoServicio);
    oTipoServicio.LiberarPrecio(
        function(bExito, Mensaje) {
            if (!bExito) {
                window.alert(Mensaje);
                return;
            }
            oTipoServicio.Cotizar(function(bExito, Mensaje) {
                if (!bExito)
                    window.alert(Mensaje);
            });
        });
}

function DuplicarDatoServicio(index) {
    if (!isUndefined(TimeOutFinalizarServicios))
        clearTimeout(TimeOutFinalizarServicios);
    var IdDatoServicio = ArrDatosServicioActual.length;
    ArrDatosServicioActual[IdDatoServicio] = new servidor.servicios.CDatoServicio(IdDatoServicio, ArrDatosServicioActual[index].IdTipoServicio, ArrDatosServicioActual[index].NombreTipoServicio, ArrDatosServicioActual[index].IdBebida, ArrDatosServicioActual[index].NombreBebida, ArrDatosServicioActual[index].Precio);

    var fila, p = Left(p = (p = ArrDatosServicioActual[IdDatoServicio].Precio.toString()) + (p.indexOf(".") === -1 ? '.' : '') + '00', p.split(".")[0].length + 3);
    $('#Id_Modal_Resumen_Servicios .modal-body tbody').append(
        fila =
        '<tr id="Id_DS_' + IdDatoServicio + '">\n\
                    <td>' + ArrDatosServicioActual[IdDatoServicio].NombreBebida + '</td>\n\
                    <td>' + ArrDatosServicioActual[IdDatoServicio].NombreTipoServicio + '</td>\n\
                    <td>' + p + ' €</td>\n\
                    <td><a class="btn" ><i class="icon-plus" href="javascript:void()" onclick="DuplicarDatoServicio(' + IdDatoServicio + ')"> </i></a><a class="btn" href="javascript:void()" onclick="EliminarDatoServicio(' + IdDatoServicio + ')" ><i class="icon-minus"> </i></a>\n\
                </tr>');
    p = 0;
    for (var i = 0; i < ArrDatosServicioActual.length; i++)
        p += parseFloat(ArrDatosServicioActual[i].Precio);
    $("#Id_TotalServicio").html(Left(p = p + (p.toString().indexOf(".") === -1 ? "." : "") + '00', p.split(".")[0].length + 3) + " €");

    localStorage[ServiciosNoFinalizados] = 1;
    localStorage[ServiciosNoFinalizados + "_Filas"] = $('#Id_Modal_Resumen_Servicios .modal-body tbody').html();
    localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"] = JSON.stringify(ArrDatosServicioActual);

    //30 segundos para cotizar esto y finalizar estos servicios
    TimeOutFinalizarServicios = setTimeout(function() {
        FinalizarServicio();
    }, 30 * 1000);
}

function EliminarDatoServicio(index) {
    if (!isUndefined(TimeOutFinalizarServicios))
        clearTimeout(TimeOutFinalizarServicios);
    ArrDatosServicioActual.splice(index, 1);
    $('#Id_DS_' + index).remove();
    if (ArrDatosServicioActual.length > 0) {
        var p = 0;
        for (var i = 0; i < ArrDatosServicioActual.length; i++)
            p += parseFloat(ArrDatosServicioActual[i].Precio);
        $("#Id_TotalServicio").html(Left(p = p + (p.toString().indexOf(".") === -1 ? "." : "") + '00', p.split(".")[0].length + 3) + " €");

        localStorage[ServiciosNoFinalizados] = 1;
        localStorage[ServiciosNoFinalizados + "_Filas"] = $('#Id_Modal_Resumen_Servicios .modal-body tbody').html();
        localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"] = JSON.stringify(ArrDatosServicioActual);

        //30 segundos para cotizar esto y finalizar estos servicios
        TimeOutFinalizarServicios = setTimeout(function() {
            FinalizarServicio();
        }, 30 * 1000);
    } else {
        //eliminar las tablas del servicio
        $('#Id_Modal_Resumen_Servicios .modal-body tbody').html("");

        //eliminar la cache del localstorage con respecto a este servicio
        localStorage[ServiciosNoFinalizados] = 0;
        $('#Id_Modal_Resumen_Servicios').modal('hide');
    }
}

function FinalizarServicio() {
    $('#Id_Modal_Resumen_Servicios').modal('hide');
    if (ArrDatosServicioActual.length > 0) {
        servidor.servicios.AñadirServicio(ArrDatosServicioActual,
            function(bExito, strMensaje) {
                if (!bExito) {
                    window.alert(strMensaje);
                    return;
                }
                ArrDatosServicioActual = [];
                //eliminar las tablas del servicio
                $('#Id_Modal_Resumen_Servicios .modal-body tbody').html("");
                //eliminar la cache del localstorage con respecto a este servicio
                localStorage[ServiciosNoFinalizados] = 0;

                //vamos a cotizar todos aquellos tipos de servicio a cotizar
                var ArrGruposBebidaACotizar = [];
                for (var i = 0; i < ArrayBebidas.length; i++)
                    for (var j = 0; j < ArrayBebidas[i].TiposServicio.length; j++)
                        if (ArrayBebidas[i].TiposServicio[j].bAcotizar)
                            ArrGruposBebidaACotizar[ArrGruposBebidaACotizar.length] = ArrayBebidas[i].IdGrupoBebida;
                var ArrTiposServicioACotizar = [];
                for (var i = 0; i < ArrGruposBebidaACotizar.length; i++)
                    for (var j = 0; j < ArrayBebidas.length; j++)
                        if (ArrayBebidas[j].IdGrupoBebida === ArrGruposBebidaACotizar[i])
                            for (var k = 0; k < ArrayBebidas[j].TiposServicio.length; k++)
                                ArrTiposServicioACotizar[ArrTiposServicioACotizar.length] = ArrayBebidas[j].TiposServicio[k];
                var sec = 0;
                var Cotizar = function(tipoServicio) {
                    tipoServicio.Cotizar(function() {
                        sec++;
                        if (sec == ArrTiposServicioACotizar.length) {
                            ActualizarPrecios();
                        } else {
                            Cotizar(ArrTiposServicioACotizar[sec]);
                        }
                    });
                };
                Cotizar(ArrTiposServicioACotizar[0]);

            });
    } else {
        //eliminar las tablas del servicio
        $('#Id_Modal_Resumen_Servicios .modal-body tbody').html("");
        //eliminar la cache del localstorage con respecto a este servicio
        localStorage[ServiciosNoFinalizados] = 0;
    }

}

function PausarTemporizador() {
    servidor.cotización.PausarSesión(function(bExito, strMensaje) {
        if (!bExito) {
            window.alert(strMensaje);
            return;
        }
        clearInterval(intervalo);
        $("#Id_PausarTemporizador").hide();
        $("#Id_ReanudarTemporizador").show();
    });
}

function ReanudarTemporizador() {
    servidor.cotización.ReanudarSesión(function(bExito, strMensaje) {
        if (!bExito) {
            window.alert(strMensaje);
            return;
        }
        intervalo = initTiempoSesión();
        $("#Id_PausarTemporizador").show();
        $("#Id_ReanudarTemporizador").hide();
    });
}

function CerrarSesión() {
    if (ArrDatosServicioActual.length > 0) {
        servidor.servicios.AñadirServicio(ArrDatosServicioActual,
            function(bExito, strMensaje) {
                if (!bExito) {
                    window.alert(strMensaje);
                    return;
                }
                ArrDatosServicioActual = [];
                //eliminar las tablas del servicio
                $('#Id_Modal_Resumen_Servicios .modal-body tbody').html("");
                //eliminar la cache del localstorage con respecto a este servicio
                localStorage[ServiciosNoFinalizados] = 0;
                $('#Id_Modal_Resumen_Servicios').modal('hide');
                //vamos a cotizar todos aquellos tipos de servicio a cotizar
                var ArrGruposBebidaACotizar = [];
                for (var i = 0; i < ArrayBebidas.length; i++)
                    for (var j = 0; j < ArrayBebidas[i].TiposServicio.length; j++)
                        if (ArrayBebidas[i].TiposServicio[j].bAcotizar)
                            ArrGruposBebidaACotizar[ArrGruposBebidaACotizar.length] = ArrayBebidas[i].IdGrupoBebida;

                for (var i = 0; i < ArrGruposBebidaACotizar.length; i++)
                    for (var j = 0; j < ArrayBebidas.length; j++)
                        if (ArrayBebidas[j].IdGrupoBebida === ArrGruposBebidaACotizar[i])
                            for (var k = 0; k < ArrayBebidas[j].TiposServicio.length; k++)
                                ArrayBebidas[j].TiposServicio[k].Cotizar();
                TerminarSesión();


            });
    } else {
        //eliminar las tablas del servicio
        $('#Id_Modal_Resumen_Servicios .modal-body tbody').html("");
        //eliminar la cache del localstorage con respecto a este servicio
        localStorage[ServiciosNoFinalizados] = 0;
        $('#Id_Modal_Resumen_Servicios').modal('hide');
        TerminarSesión();
    }
}

function TerminarSesión() {

    servidor.cotización.CerrarSesión(function(bExito, strMensaje) {
        if (!bExito) {
            window.alert(strMensaje);
            return;
        }
        $(".panel").hide();
        $("#PanelPrincipal").show();
        $(".sesión").hide();
        $(".configuración").show();
        $(".menu").removeClass("active");
        $("#Menu_panelPrincipal").parent().addClass("active");
        $(".page-header").show();
        MostrarOpcionesxDefecto();
        MostrarGruposBebida();
        MostrarTiposServicio();
        clearInterval(intervalo);
    });
}

function ModificarStockSesión() {
    //tendría que ver todas las bebidas que estan en esta sesión y poder modificarles 
}

function ModificarGruposSesión() {
    //tendría que ver todas las bebidas que estan en esta sesión y poder modificarles 
}

function ModificarPreciosSesión() {
    //tendría que ver todas las bebidas que estan en esta sesión y poder modificarles 
}

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////Utilidades//////////////////////////////////////
function panelPrincipal() {
    $(".menu").removeClass("active");
    $(".panel").hide();
    $("#PanelPrincipal").show();
    $("#Menu_panelPrincipal").parent().addClass("active");
}

function Buscar() {
    if ($("#filtro").val() !== "") {
        $("#Id_Tabla_Bebidas .fila_bebida").hide();
        $("#Id_Tabla_Bebidas .a_filtrar:contiene-palabra('" + $("#filtro").val() + "')").parent("tr").show();
    }
    else {
        $("#Id_Tabla_Bebidas .fila_bebida").show();
    }
}
///////////////////////////////////////////////////////////////////////////////