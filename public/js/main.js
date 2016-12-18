"use strict";
//Incluir los javascripts de los que dependo
document.write(
    '<script src="./js/global.js" type="text/javascript"></script>' +
    '<script src="./js/bootstrap.js" type="text/javascript"></script>' +
    '<script src="./js/servidor.js" type="text/javascript" charset="utf-8"></script>' +
    '<script src="./js/jscolor.js" type="text/javascript" charset="utf-8"></script>');

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
var intervaloComprobaciones = null;
var TimeOutFinalizarServicios;
var Empleado;
var SesionCerrada = false;
var EstaTilde = false;
var EnMayusculas = false;
var SigueMostrandoTeclado = false;
var increment;
var decrement;

//Eventos al cargar la página
$("document").ready(function() {

    if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    }
    //if no hay servidor colocar el servidor 
    if (isUndefined(localStorage["servidor"]))
        localStorage["servidor"] = window.location.origin;
    if (localStorage["servidor"].indexOf("file") > -1) {
        $("#Id_Modal_Registrar_Servidor").modal({backdrop: 'static', keyboard: true}).modal("show");
    } else {
        ComprobarTPV();
    }

    $("body").click(function() {
        if (!SigueMostrandoTeclado) {
            $("#Id_Teclado").hide();
        }
        SigueMostrandoTeclado = false;
    });
    //al hacer click en una clase de pantalla
    $(".pantalla").click(function() {
        sessionStorage["estado"] = this.id;
    });

    $(".tecla").click(function() {
        $("#" + $("#Id_Input").text()).val($("#" + $("#Id_Input").text()).val() + $(this).text());
        if (EstaTilde) {
            MostrarTildes();
        }
        if (EnMayusculas) {
            $(".tecla_minusculas").click();
        }
        SigueMostrandoTeclado = true;
    });
    $(".tecla_atras").click(function() {
        if ($("#" + $("#Id_Input").text()).val())
            $("#" + $("#Id_Input").text()).val($("#" + $("#Id_Input").text()).val().substr(0, $("#" + $("#Id_Input").text()).val().length - 1));
        SigueMostrandoTeclado = true;
    });
    $(".tecla_mayusculas").click(function() {
        $(".teclado_minusculas").hide();
        $(".teclado_mayusculas").show();
        EnMayusculas = true;
        SigueMostrandoTeclado = true;
    });
    $(".tecla_minusculas").click(function() {
        $(".teclado_mayusculas").hide();
        $(".teclado_minusculas").show();
        EnMayusculas = false;
        SigueMostrandoTeclado = true;
    });

    $(".tecla_tilde").click(MostrarTildes);

    $(".tecla_enter").click(function() {
        $("#Id_Teclado").hide(1, function() {
            if ($("#Id_Submit").text() != "")
                $("#" + $("#Id_Submit").text()).click();
            else
                $("#" + $("#Id_Input").text()).trigger("change");
        });
        SigueMostrandoTeclado = true;
    });

    refresh_events();
    $.extend($.expr[":"],
        {
            "contiene-palabra": function(elem, i, match, array) {
                return (elem.textContent || elem.innerText || $(elem).text() || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
            }
        });

});

function refresh_events() {
    jscolor.init();
    $(".boton_mas").unbind("click");
    $(".boton_mas").click(function() {
        clearInterval(increment);
        clearInterval(decrement);
        $(this).parent().children(":input[type='number']").val(
            function()
            {
                var valor = Math.round((parseFloat($(this).val() != "" ? $(this).val() : "0") + parseFloat($(this).attr("step"))) * 100) / 100;
                return parseFloat(valor);
            });
        $(this).parent().children(":input[type='number']").trigger("change");
    });
    $(".boton_menos").unbind("click");
    $(".boton_menos").click(function() {
        clearInterval(increment);
        clearInterval(decrement);
        $(this).parent().children(":input[type='number']").val(
            function()
            {
                var valor = Math.round((parseFloat($(this).val() != "" ? $(this).val() : "0") - parseFloat($(this).attr("step"))) * 100) / 100;
                return parseFloat(valor);
            });
        $(this).parent().children(":input[type='number']").trigger("change");
    });

    $(".boton_mas").unbind("mousedown");
    $(".boton_mas").mousedown(function() {
        var txtNumber = $(this).parent().children(":input[type='number']");
        clearInterval(increment);
        clearInterval(decrement);
        increment = setInterval(
            function() {
                txtNumber.val(
                    function()
                    {
                        var valor = Math.round((parseFloat($(this).val() != "" ? $(this).val() : "0") + parseFloat($(this).attr("step"))) * 100) / 100;
                        return parseFloat(valor);
                    });
            }, 150);
    });
    $(".boton_mas").unbind("mouseup");
    $(".boton_mas").mouseup(function() {
        clearInterval(increment);
        $(this).parent().children(":input[type='number']").trigger("change");
    });
    $(".boton_menos").unbind("mousedown");
    $(".boton_menos").mousedown(function() {
        var txtNumber = $(this).parent().children(":input[type='number']");
        clearInterval(increment);
        clearInterval(decrement);
        decrement = setInterval(
            function() {
                txtNumber.val(
                    function()
                    {
                        var valor = Math.round((parseFloat($(this).val() != "" ? $(this).val() : "0") - parseFloat($(this).attr("step"))) * 100) / 100;
                        return parseFloat(valor);
                    });
            }, 150);
    });
    $(".boton_menos").unbind("mouseup");
    $(".boton_menos").mouseup(function() {
        clearInterval(decrement);
        $(this).parent().children(":input[type='number']").trigger("change");
    });
}

function ComprobarServidor() {

    if ($("#Id_Servidor_A_Registrar").val() == "") {
        window.alert("Debe indicar un servidor para iniciar la aplicación,\nsi desconoce que poner aquí póngase en contacto con su proveedor.");
        return;
    }
    localStorage["servidor"] = $("#Id_Servidor_A_Registrar").val();

    $('#Id_Modal_Registrar_Servidor').modal('hide');
    ComprobarTPV();
}

function ComprobarTPV() {
    servidor.tpvs.EstaRegistradoTPV(
        function(bExito, ObjTPV) {
            if (bExito) {
                localStorage[TPV] = ObjTPV.Id_TPV;
                ComprobarEmpleado();
            }
            if (!bExito) {
                if (ObjTPV !== "No se ha registrado el TPV.") {
                    alert(ObjTPV);
                    return;
                }
                //Debo mostrar una pantalla indicando que debe introducir la contraseña de la aplicacion TPV
                $("#Id_Modal_Contraseña_Aplicacion").modal({backdrop: 'static', keyboard: true}).modal("show");
            }
        });
}

function VerificarContraseña() {
    var Password = $("#Id_Password_App").val();
    if (isUndefined(Password)) {
        alert("Introduzca la contraseña de la aplicación para continuar.");
        return;
    }
    servidor.aplicación.VerificarContraseña(Password
        , function(bExito, Mensaje) {
            if (!bExito) {
                alert(Mensaje);
                return;
            } else {
                //Mostrar el Modal para introducir el TPV
                $("#Id_Modal_Contraseña_Aplicacion").modal("hide");
                $("#Id_Modal_Añadir_TPV").modal({backdrop: 'static', keyboard: false}).modal("show");
            }
        });
}

function AñadirTPV() {
    var Nombre = $("#Id_Nombre_TPV").val();
    if (isUndefined(Nombre)) {
        alert("Introduzca el nombre del TPV para continuar.");
        return;
    }
    servidor.tpvs.AñadirTPV(Nombre
        , function(bExito, idTPV) {
            if (!bExito) {
                alert(idTPV);
                return;
            }
            localStorage[TPV] = idTPV;
            $("#Id_Modal_Añadir_TPV").modal("hide");
            ComprobarEmpleado();
        });
}

function ComprobarEmpleado() {

    servidor.aplicación.EmpleadoEnSesión(
        function(bExito, ObjEmpleado) {
            if (!bExito) {
                //Listar los empleados
                //listar los empleados que van a trabajar aquí
                servidor.empleados.ListarEmpleados(
                    function(bExito, rowsArray) {
                        if (!bExito) {
                            alert(rowsArray);
                            return;
                        }
                        var html = "<table id='Id_TbEmpleados' class='tbEmpleados'><tr>";
                        for (var i = 0; i < rowsArray.length; i++) {
                            //tengo que añadir un botón en
                            if (i % 4 === 0)
                                html += "</tr><tr>";
                            html += "<td>\n\
                                    <a class='btn empleado  form-control' style='" + ColorearBoton(new ColorUtils(rowsArray[i][4])) + "' onclick='$(\".Nombre_Empleado\").html(\"" + rowsArray[i][1] + "\");$(\"#Id_Nombre_Empleado\").val(\"" + rowsArray[i][1] + "\");$(\"#Id_Modal_Password\").modal(\"show\");$(\"#Id_Modal_Seleccionar_Empleado\").modal(\"hide\");'>\n\
                                        <div>" + rowsArray[i][1] + "</div>\n\
                                    </a>\n\
                                </td>";
                        }
                        html += "</tr></table>";
                        $("#Id_Modal_Seleccionar_Empleado .modal-body").html(html);
                        $("#Id_Modal_Seleccionar_Empleado").modal({backdrop: 'static', keyboard: true}).modal("show");

                    });
                return;
            }
            Empleado = ObjEmpleado;
            $("#ID_NombreEmpleado").html(Empleado.Nombre);
            Iniciar();
        });
}

function Autenticar() {
    if (isUndefined($("#Id_Nombre_Empleado").val())) {
        alert("Debe indicar un empleado para poder continuar.");
        return;
    }
    if (isUndefined($("#Id_Password_Empleado").val())) {
        alert("Debe indicar una contraseña para poder continuar.");
        return;
    }
    var Password = $("#Id_Password_Empleado").val();
    $("#Id_Password_Empleado").val("");
    servidor.empleados.AutenticarEmpleado($("#Id_Nombre_Empleado").val(), Password
        , function(bExito, objEmpleado) {
            if (!bExito) {
                alert(objEmpleado);
                return;
            }
            Empleado = objEmpleado;
            $("#ID_NombreEmpleado").html(Empleado.Nombre);
            $("#Id_Modal_Password").modal("hide");
            Iniciar();
        });
}

function CambiarEmpleado() {
    servidor.empleados.ListarEmpleados(
        function(bExito, rowsArray) {
            if (!bExito) {
                alert(rowsArray);
                return;
            }
            var html = "<table id='Id_TbEmpleados' class='tbEmpleados'><tr>";
            for (var i = 0; i < rowsArray.length; i++) {
                //tengo que añadir un botón en
                if (i % 4 === 0)
                    html += "</tr><tr>";
                html += "<td>\n\
                            <a class='btn empleado' style='" + ColorearBoton(new ColorUtils(rowsArray[i][4])) + "' onclick='$(\".Nombre_Empleado\").html(\"" + rowsArray[i][1] + "\");$(\"#Id_Nombre_Empleado\").val(\"" + rowsArray[i][1] + "\");$(\"#Id_Modal_Password\").modal(\"show\");$(\"#Id_Modal_Seleccionar_Empleado\").modal(\"hide\");'>\n\
                                <div>" + rowsArray[i][1] + "</div>\n\
                            </a>\n\
                        </td>";
            }
            html += "</tr></table>";
            $("#Id_Modal_Seleccionar_Empleado .modal-body").html(html);
            $("#Id_Modal_Seleccionar_Empleado").modal({backdrop: 'static', keyboard: true}).modal("show");

        });
}

function Iniciar() {
//comprobar si ya está la sesión abierta
    servidor.cotización.SesiónIniciada(function(bExito, bSesiónIniciada) {
        if (!bExito) {
            window.alert(bSesiónIniciada);
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
                $(".configuración").hide();
                $(".page-header").hide();
                $(".cabecera").css("top", 35);
                $("#Menu_VolverSesion").hide();
                if (Empleado.Id_Perfil === 1) {
                    $("#Menu").hide();
                    $("#PanelSesiónCotización").removeClass("col-lg-10")
                        .addClass("col-lg-12");
                } else {
                    $("#Menu").show();
                    $("#PanelSesiónCotización").removeClass("col-lg-12")
                        .addClass("col-lg-10");
                    $(".sesión").show();
                    $("#Id_TiempoSesión").addClass('active');
                    $("#Menu_VolverSesion").hide();
                    //obtenemos la diferencia
                    var segundos = resultado.TiempoSesión % 60;
                    var minutos = parseInt(resultado.TiempoSesión / 60) % 60;
                    var horas = parseInt(resultado.TiempoSesión / 60 / 60);
                    $("#id_segundos").html((segundos > 9 ? "" : "0") + segundos);
                    $("#id_minutos").html((minutos > 9 ? "" : "0") + minutos);
                    $("#id_horas").html((horas > 9 ? "" : "0") + horas);
                    if (!resultado.Pausada) {
                        $("#Id_ReanudarTemporizador").hide();
                        clearInterval(intervalo);
                        intervalo = initTiempoSesión();
                    } else {
                        $("#Id_PausarTemporizador").hide();
                    }
                }
                //añadir servicios no finalizados
                if (!isUndefined(localStorage[ServiciosNoFinalizados]) && localStorage[ServiciosNoFinalizados] != 0) {
                    var p;
                    try {
                        ArrDatosServicioActual = JSON.parse((localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"]));
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
            if (Empleado.Id_Perfil === 1) {
                $("#Menu").hide();
                $(".panel").hide();
                $("#PanelSesiónCotización").html(
                    "<center><h3>Aún no se ha iniciado la sesión de cotización, por favor, espere a que se inicie la sesión.</h3></center>"
                    )
                    .show()
                    .removeClass("col-lg-10")
                    .addClass("col-lg-12");
                $(".page-header").hide();
                $(".cabecera").css("top", 35);


            } else {
                $("#Menu").show();
                $(".sesión").hide();
                $("#PanelSesiónCotización").removeClass("col-lg-12")
                    .addClass("col-lg-10")
                    .hide();
                $(".configuración").show();
                MostrarOpcionesxDefecto();
                MostrarGruposBebida();
                MostrarTiposServicio();
                MostrarEmpleados();
                $("#PanelPrincipal").show();
                $(".page-header").show();
                $(".cabecera").css("top", 45);
                //voy a ver en que estado estoy y mostrar la pantalla
                if (sessionStorage["estado"])
                    $("#" + sessionStorage["estado"]).click();
            }
        }           //inicio un temporizador para que me Actualice los precios cuando haya cambios o cierre la sesión
        if (!intervaloComprobaciones)
            intervaloComprobaciones = ThreadComprobaciones();
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
                    '<td>\n\
                        <div class="input-group">\n\
                            <input type="text" id="Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Nombre" class="form-control" onchange="ModificarTipoServicio(' + i + ')" value="' + ArrayTiposServicio[i].Nombre + '"/>\n\
                            <span class="btn btn-default input-group-addon" title="Mostrar/Ocultar Teclado" onclick="MostrarTeclado(\'Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Nombre\', \'\')"><span class="glyphicon glyphicon-calendar"></span></span>\n\
                        <div>\n\
                    </td> ' +
                    '<td>\n\
                        <div class="input-group">\n\
                            <input type="number" min="0" step="1" id="Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Cantidad" value="' + null_o_str(ArrayTiposServicio[i].Cantidad) + '" class="form-control numerico" onchange="ModificarTipoServicio(' + i + ')">\n\
                            <span class="boton_mas btn btn-default input-group-addon"><span class="glyphicon glyphicon-plus"></span></span>\n\
                            <span class="boton_menos btn btn-default input-group-addon"><span class="glyphicon glyphicon-minus"></span></span>\n\
                        </div>\n\
                    </td> ' +
                    '<td>\n\
                        <input type="button" id="Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Color" value="' + ArrayTiposServicio[i].Color.ColorHash + '" class="color form-control btn " onchange="ModificarTipoServicio(' + i + ')" />\n\
                    </td>' +
                    '<td  >\n\
                        <button type="button" class="form-control btn btn-default" onclick="EliminarTipoServicio(' + i + ')" ><span class="glyphicon glyphicon-remove" ></span> </button>\n\
                            \n\
                    </td> ' +
                    '<td>\n\
                        <button type="button" class="form-control btn btn-default" onClick="MostrarPrecios(0,' + i + ')" style="font-weight: bold"><span class="glyphicon glyphicon-th-list"> </span> Precios </button> ' +
                    '   <div id="Id_TS_' + ArrayTiposServicio[i].IdTipoServicio + '_Precios" class="modal" >\n\
                                <div class="modal-dialog  modal-lg">\n\
                                    <div class="modal-content">\n\
                                        <div class="modal-header ">\n\
                                            <h4 class="modal-title">Tipos de Servicio - precios de <b>' + ArrayTiposServicio[i].Nombre + '</b></h4>\n\
                                        </div>\n\
                                        <div class="modal-body" style="text-align:left;">\n\
                                        </div>\n\
                                        <div class="modal-footer">\n\
                                            <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn btn-success">Cerrar</a>\n\
                                        </div>\n\
                                    </div>\n\
                                </div>\n\
                            </div>' +
                    '</td>' +
                    '</tr>  '
                    );
                //añadir los elementos del selector
                $(".Select_Tipos_Servicio").append('<option value="' + ArrayTiposServicio[i].IdTipoServicio + '" ' + (ArrayTiposServicio[i][0] == $(".Select_Tipos_Servicio").attr("name") ? "selected=selected" : "") + " >" + ArrayTiposServicio[i].Nombre + "</option>");

            }
            $("#tabla_Tipos_Servicio").append('<tr> ' +
                '<td>\n\
                    <div class="input-group">\n\
                        <input type="text" id="Id_NuevoTS_Nombre" value="" class="form-control">\n\
                        <span class="btn btn-default input-group-addon" title="Mostrar/Ocultar Teclado" onclick="MostrarTeclado(\'Id_NuevoTS_Nombre\', \'\')"> <span class="glyphicon glyphicon-calendar"  > </span></span>\n\
                    </div>\n\
                </td>  ' +
                '<td>\n\
                    <div class="input-group">\n\
                        <input type="number" min="0" step="1"  id="Id_NuevoTS_Cantidad" value="" class="form-control numerico">\n\
                        <span class="boton_mas btn btn-default input-group-addon"><span class="glyphicon glyphicon-plus"></span></span>\n\
                        <span class="boton_menos btn btn-default input-group-addon"><span class="glyphicon glyphicon-minus"></span></span>\n\
                    </div>\n\
                </td> ' +
                '<td><input type="button" id="Id_NuevoTS_Color" value="e6e6e6" class="color form-control btn " /></td>' +
                '<td class="boton" ><button type="button" class="form-control btn btn-default" onClick="AñadirNuevoTipoServicio()"><span class="glyphicon glyphicon-asterisk"></i> </span></button></td> ' +
                '</tr> ');
            refresh_events();
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

    var color = new ColorUtils("#" + $("#Id_NuevoTS_Color").val());

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
    if ($("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Nombre").val() === "") {
        alert("Debe indicar el nombre del tipo de servicio");
        return;
    }
    if ($("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Cantidad").val() === "") {
        alert("Debe indicar la cantidad en ml que se gasta con este servicio");
        return;
    }

    var color = new ColorUtils("#" + $("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Color").val());

    servidor.servicios.ModificarTipoServicio(ArrayTiposServicio[index].IdTipoServicio, $("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Nombre").val(), $("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Cantidad").val(), color.Color
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
    $("#Id_Modal_Advertencia .advertencia-info").html("eliminación de <b> Tipo de Servicio " + ArrayTiposServicio[index].Nombre + "</b>");
    $("#Id_Modal_Advertencia .advertencia-cuerpo").html("<h4>Está seguro de eliminar el tipo de servicio <b>" + ArrayTiposServicio[index].Nombre + "</b>.<br />Recuerde que esta acción no se podrá deshacer.</h4>");
    $("#Id_Modal_Advertencia .advertencia-continuar").html("Eliminarlo de todas formas");
    $("#Id_Modal_Advertencia .advertencia-continuar").addClass("bnt").addClass("btn-danger");
    $("#Id_Modal_Advertencia .advertencia-cancelar").html("<b>NO ELIMINAR</b>");
    $("#Id_Modal_Advertencia .advertencia-cancelar").addClass("bnt").addClass("btn-primary");
    $("#Id_Modal_Advertencia .advertencia-continuar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-cancelar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-continuar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");
        servidor.servicios.QuitarTipoServicio(ArrayTiposServicio[index].IdTipoServicio
            , function(bExito) {
                if (!bExito) {
                    alert("No se ha podido eliminar el tipo de servicio");
                    return;
                }
                MostrarTiposServicio();
            });
    });
    $("#Id_Modal_Advertencia .advertencia-cancelar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");
    });
    $("#Id_Modal_Advertencia").modal({backdrop: 'static', keyboard: false}).modal("show");
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

        $("#Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_Precios").modal({backdrop: 'static', keyboard: false}).modal("show");
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
                refresh_events();
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
                refresh_events();
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
            var html = "<table class='mitabla'><thead><th>" + (!n ? "Grupo de Bebida" : "Tipo de Servicio") + "</th><th>Precio</th><th>Máximo</th><th>Mínimo</th><th>Tramo</th></thead>";
            for (var i = 0; i < self.Precios.length; i++) {
                var precio = self.Precios[i];
                html +=
                    "<tr>\n\
                        <td>\n\
                            <select id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_" + (!n ? "GrupoBebida" : "TipoServicio") + "' class='" + (!n ? 'Select_Grupos_Bebida' : 'Select_Tipos_Servicio') + " form-control'  name='" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "' onchange='ModificarPrecio(" + n + "," + index + "," + i + ")' />\n\
                        </td>\n\
                        <td>\n\
                            <div class='input-group'>\n\
                                <input type='number'  id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Precio' min='0' step='0.1' class='form-control numerico' value='" + precio.Precio + "' onchange='ModificarPrecio(" + n + "," + index + "," + i + ")' />\n\
                                <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                            </div>\n\
                        </td>\n\
                        <td>\n\
                            <div class='input-group'>\n\
                                <input type='number' id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Maximo' min='0' step='0.1' class='form-control numerico' value='" + precio.Maximo + "' onchange='ModificarPrecio(" + n + "," + index + "," + i + ")' />\n\
                                <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                            </div>\n\
                        </td>\n\
                        <td>\n\
                            <div class='input-group'>\n\
                                <input type='number' id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Minimo' min='0' step='0.1' class='form-control numerico' value='" + precio.Minimo + "' onchange='ModificarPrecio(" + n + "," + index + "," + i + ")' />\n\
                                <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                            </div>\n\
                        </td>\n\
                        <td>\n\
                            <div class='input-group'>\n\
                                <input type='number' id='Id_" + (!n ? "TS_" + self.IdTipoServicio : "GB_" + self.IdGrupoBebida) + "_" + (!n ? precio.IdGrupoBebida : precio.IdTipoServicio) + "_Precio_Tramo' min='0' step='0.1' class='form-control numerico' value='" + precio.Tramo + "' onchange='ModificarPrecio(" + n + "," + index + "," + i + ")'/>\n\
                                <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                            </div>\n\
                        </td>\n\
                        <td >\n\
                          <button type='button' class='form-control btn btn-default' onClick='EliminarPrecio(" + n + "," + index + "," + i + ")' class='btn btn-default'><span class='glyphicon glyphicon-remove'> </span></button>\n\
                        </td>\n\
                </tr>";
            }
            //añadir la última linea para poder añadir un precio
            html +=
                "<tr>\n\
                    <td>\n\
                        <select id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_" + (!n ? "GrupoBebida" : "TipoServicio") + "' class='" + (!n ? 'Select_Grupos_Bebida' : 'Select_Tipos_Servicio') + " form-control' />\n\
                    </td>\n\
                    <td>\n\
                            <div class='input-group'>\n\
                                <input type='number' id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_Precio' min='0' step='0.1' class='form-control numerico'  />\n\
                                <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                            </div>\n\
                        </td>\n\
                    <td>\n\
                            <div class='input-group'>\n\
                                <input type='number' id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_Maximo' min='0' step='0.1' class='form-control numerico' >\n\
                                <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                            </div>\n\
                        </td>\n\
                    <td>\n\
                            <div class='input-group'>\n\
                                <input type='number' id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_Minimo' min='0' step='0.1' class='form-control numerico'  />\n\
                                <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                            </div>\n\
                        </td>\n\
                    <td>\n\
                            <div class='input-group'>\n\
                                <input type='number' id='Id_" + (!n ? "TS_Nuevo_" + self.IdTipoServicio : "GB_Nuevo_" + self.IdGrupoBebida) + "_Precio_Tramo' min='0' step='0.1' class='form-control numerico' />\n\
                                <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                            </div>\n\
                        </td>\n\
                    <td ><button type='button' class='btn btn-default'  onclick='AñadirPrecio(" + n + "," + index + ")' class='btn'><span class='glyphicon glyphicon-asterisk'> </span></button>\n\
                    </td>\n\
                </tr>\n\
            </table>";

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
    var Precio = $(cap + "Precio").val() == "" ? $("#Id_Precio").val() : $(cap + "Precio").val()
        , Maximo = $(cap + "Maximo").val() == "" ? $("#Id_Maximo").val() : $(cap + "Maximo").val()
        , Minimo = $(cap + "Minimo").val() == "" ? $("#Id_Minimo").val() : $(cap + "Minimo").val()
        , Tramo = $(cap + "Tramo").val() == "" ? $("#Id_Tramo").val() : $(cap + "Tramo").val();

    for (var i = 0; i < (!n ? ArrayTiposServicio[index].Precios.length : ArrayGruposBebida[index].Precios.length); i++) {
        if ((!n ? ArrayTiposServicio[index].Precios[i].IdGrupoBebida : ArrayGruposBebida[index].Precios[i].IdTipoServicio) == $(cap + (!n ? "GrupoBebida" : "TipoServicio")).val()) {
            alert("El " + (!n ? "grupo de bebidas" : "tipo de servicio") + " que has seleccionado, ya tiene un precio asociado");
            return;
        }
    }

    if (!n) {
        ArrayTiposServicio[index].AñadirPrecio($(cap + "GrupoBebida").val(), Precio, Maximo, Minimo, Tramo
            , function(bExito, EvResultado) {
                if (!bExito) {
                    window.alert(EvResultado);
                    return;
                }
                RellenarTablaPrecios(n, index);

            });
    } else {
        ArrayGruposBebida[index].AñadirPrecio($(cap + "TipoServicio").val(), Precio, Maximo, Minimo, Tramo
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
    $("#Id_Modal_Advertencia .advertencia-info").html("eliminación de <b> precio para " + (!n ? ("Grupo de bebida " + ArrayTiposServicio[index].Precios[i].NombreGrupoBebida) : ("Tipo de Servicio " + ArrayGruposBebida[index].Precios[i].NombreTipoServicio)) + "</b>");
    $("#Id_Modal_Advertencia .advertencia-cuerpo").html("<h4>Está seguro de eliminar el precio para " + (!n ? ("grupo de bebida " + ArrayTiposServicio[index].Precios[i].NombreGrupoBebida) : ("tipo de servicio <b>" + ArrayGruposBebida[index].Precios[i].NombreTipoServicio)) + "</b>.<br />Recuerde que esta acción no se podrá deshacer.</h4>");
    $("#Id_Modal_Advertencia .advertencia-continuar").html("Eliminarlo de todas formas");
    $("#Id_Modal_Advertencia .advertencia-continuar").addClass("bnt").addClass("btn-danger");
    $("#Id_Modal_Advertencia .advertencia-cancelar").html("<b>NO ELIMINAR</b>");
    $("#Id_Modal_Advertencia .advertencia-cancelar").addClass("bnt").addClass("btn-primary");
    $("#Id_Modal_Advertencia .advertencia-continuar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-cancelar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-continuar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");
        if (!n) {
            ArrayTiposServicio[index].QuitarPrecio($(cap + "GrupoBebida").val()
                , function(bExito, EvResultado) {
                    $("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Precios").modal({backdrop: 'static', keyboard: false}).modal("show");
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
                    $("#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_Precios").modal({backdrop: 'static', keyboard: false}).modal("show");
                });
        }
    });
    $("#Id_Modal_Advertencia .advertencia-cancelar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");
        if (!n) {
            $("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Precios").modal({backdrop: 'static', keyboard: false}).modal("show");
        } else {
            $("#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_Precios").modal({backdrop: 'static', keyboard: false}).modal("show");
        }
    });
    if (!n) {
        $("#Id_TS_" + ArrayTiposServicio[index].IdTipoServicio + "_Precios").modal("hide");
    } else {
        $("#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_Precios").modal("hide");
    }
    $("#Id_Modal_Advertencia").modal({backdrop: 'static', keyboard: false}).modal("show");
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
                '	<td>\n\
                        <div class="input-group">\n\
                            <span class="boton_mas btn btn-default input-group-addon"><span class="glyphicon glyphicon-chevron-down"></span></span>\n\
                            <input type="number" max="99" min="0" step="1" id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Orden" value="' + ArrayGruposBebida[i].Orden + '" class="form-control numerico" onchange="ModificarGrupoBebida(' + i + ')" >\n\
                            <span class="boton_menos btn btn-default input-group-addon"><span class="glyphicon glyphicon-chevron-up"></span></span>\n\
                        </div>\n\
                    </td>' +
                '	<td>\n\
                    <div class="input-group">\n\
                        <input type="text" id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Nombre" class="form-control" value="' + ArrayGruposBebida[i].Nombre + '"  onchange="ModificarGrupoBebida(' + i + ')" />\n\
                        <span class="btn btn-default input-group-addon" title="Mostrar/Ocultar Teclado" onclick="MostrarTeclado(\'Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Nombre\', \'\')"> <span class="glyphicon glyphicon-calendar"  > </span></span>\n\
                    </div>\n\
                </td>' +
                '   <td>' +
                '       <select id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_TipoGenerico" style="width:75px; text-align:center;" onchange="ModificarGrupoBebida(' + i + ')" class="form-control"  >' +
                '           <option value="0" ' + (ArrayGruposBebida[i].bTiposGenericos ? '' : 'selected="selected"') + '>No</option>' +
                '           <option value="1" ' + (ArrayGruposBebida[i].bTiposGenericos ? 'selected="selected"' : '') + '>Sí</option>' +
                '       </select>' +
                '   </td>' +
                '   <td><input type="button" id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Color" value="' + ArrayGruposBebida[i].Color.ColorHash + '" class="color form-control btn " onchange="ModificarGrupoBebida(' + i + ')" /></td>' +
                '	<td  >\n\
                        <button type="button" class="form control btn btn-default" onclick="EliminarGrupoBebida(' + i + ')"  ><span class="glyphicon glyphicon-remove" ></span> </button>' +
                '   </td><td>\n\
                        <div class="form-inline">' +
                '       <button type="button" class="form-control btn btn-default" onClick="MostrarGBBebidas(' + i + ')" style="font-weight: bold"><span class="glyphicon glyphicon-tint"> </span> Bebidas </button> ' +
                '       <button type="button" class="form-control btn btn-default" onClick="MostrarPrecios(1,' + i + ')" style="font-weight: bold"><span class="glyphicon glyphicon-th-list"> </span> Precios </button>\n\
                        </div>' +
                '       <div id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Bebidas" class="modal" >\n\
                                <div class="modal-dialog" style="width:480px;">\n\
                                    <div class="modal-content">\n\
                                        <div class="modal-header ">\n\
                                            <h4 class="modal-title">Grupos de Bebida - bebidas en <b>' + ArrayGruposBebida[i].Nombre + '</b></h4>\n\
                                        </div>\n\
                                        <div class="modal-body" style="text-align:left;">\n\
                                        </div>\n\
                                        <div class="modal-footer">\n\
                                            <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn btn-success">Cerrar</a>\n\
                                        </div>\n\
                                    </div>\n\
                                </div>\n\
                            </div>' +
                '       <div id="Id_GB_' + ArrayGruposBebida[i].IdGrupoBebida + '_Precios" class="modal" >\n\
                                <div class="modal-dialog  modal-lg">\n\
                                    <div class="modal-content">\n\
                                        <div class="modal-header ">\n\
                                            <h4 class="modal-title">Grupos de Bebida - precios de <b>' + ArrayGruposBebida[i].Nombre + '</b></h4>\n\
                                        </div>\n\
                                        <div class="modal-body" style="text-align:left;">\n\
                                        </div>\n\
                                        <div class="modal-footer">\n\
                                            <a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn btn-success">Cerrar</a>\n\
                                        </div>\n\
                                    </div>\n\
                                </div>\n\
                            </div>' +
                '   </td> ' +
                '</tr>');

        }
        $("#tabla_Grupos_Bebida").append('<tr>' +
            '<td>\n\
                <div class="input-group">\n\
                    <span class="boton_mas btn btn-default input-group-addon"><span class="glyphicon glyphicon-chevron-down"></span></span>\n\
                    <input type="number" max="99" min="0" step="1"  id="Id_NuevoGB_Orden" value="' + ++Max + '" class="form-control numerico">\n\
                    <span class="boton_menos btn btn-default input-group-addon"><span class="glyphicon glyphicon-chevron-up"></span></span>\n\
                </div>\n\
            </td> ' +
            '<td>\n\
                <div class="input-group">\n\
                    <input type="text"  id="Id_NuevoGB_Nombre" value="" class="form-control">\n\
                    <span class="btn btn-default input-group-addon" title="Mostrar/Ocultar Teclado" onclick="MostrarTeclado(\'Id_NuevoGB_Nombre\', \'\')"> <span class="glyphicon glyphicon-calendar"  > </span></span>\n\
                </div>\n\
            </td> ' +
            '   <td>' +
            '       <select id="Id_NuevoGB_TipoGenerico" class="form-control" >' +
            '           <option value="0" selected="selected">No</option>' +
            '           <option value="1">Sí</option>' +
            '       </select>' +
            '   </td>' +
            '<td><input type="button"  id="Id_NuevoGB_Color" value="#e6e6e6" class="color form-control btn "></td> ' +
            '<td class="boton" ><button type="button" class="form-control btn btn-default"   onClick="AñadirGrupoBebida()" ><span class="glyphicon glyphicon-asterisk"></i> </span></button></td> </tr>');
        refresh_events();
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

    servidor.stock.AñadirGrupoBebida($(cap + "Orden").val(), $(cap + "Nombre").val(), $(cap + "TipoGenerico").val(), (new ColorUtils("#" + $(cap + "Color").val())).Color
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

    servidor.stock.ModificarGrupoBebida(ArrayGruposBebida[index].IdGrupoBebida, $(cap + "Orden").val(), $(cap + "Nombre").val(), $(cap + "TipoGenerico").val(), (new ColorUtils("#" + $(cap + "Color").val())).Color
        , function(bExito, id) {
            if (bExito) {
                MostrarGruposBebida();
            }
            else
                alert(id);
        });
}

function EliminarGrupoBebida(index) {
    if (index > ArrayGruposBebida.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    $("#Id_Modal_Advertencia .advertencia-info").html("eliminación de <b> Grupo de Bebida " + ArrayGruposBebida[index].Nombre + "</b>");
    $("#Id_Modal_Advertencia .advertencia-cuerpo").html("<h4>Está seguro de eliminar el grupo de bebida <b>" + ArrayGruposBebida[index].Nombre + "</b>.<br />Recuerde que esta acción no se podrá deshacer.</h4>");
    $("#Id_Modal_Advertencia .advertencia-continuar").html("Eliminarlo de todas formas");
    $("#Id_Modal_Advertencia .advertencia-continuar").addClass("bnt").addClass("btn-danger");
    $("#Id_Modal_Advertencia .advertencia-cancelar").html("<b>NO ELIMINAR</b>");
    $("#Id_Modal_Advertencia .advertencia-cancelar").addClass("bnt").addClass("btn-primary");
    $("#Id_Modal_Advertencia .advertencia-continuar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-cancelar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-continuar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");
        servidor.stock.QuitarGrupoBebida(ArrayGruposBebida[index].IdGrupoBebida
            , function(bExito, Mensaje) {
                if (!bExito) {
                    alert(Mensaje);
                    return;
                }
                MostrarGruposBebida();
            });
    });
    $("#Id_Modal_Advertencia .advertencia-cancelar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");
    });
    $("#Id_Modal_Advertencia").modal({backdrop: 'static', keyboard: false}).modal("show");
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
        $("#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_Bebidas").modal({backdrop: 'static', keyboard: false}).modal("show");
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
                    var html = "<table><thead><th>Nombre</th><th>Cantidad(ml)</th></thead>";
                    for (var i = 0; i < self.Bebidas.length; i++) {
                        var bebida = self.Bebidas[i];
                        html +=
                            "<tr>\n\
                                <td>\n\
                                    <div class='input-group'>\n\
                                        <input type='text' id='Id_GB_" + self.IdGrupoBebida + "_" + bebida.IdBebida + "_Bebida_Nombre' class='form-control' value='" + bebida.Nombre + "' onchange='ModificarBebida(" + index + "," + i + ")' />\n\
                                        <span class='btn btn-default input-group-addon' title='Mostrar/Ocultar Teclado' onclick=\"MostrarTeclado('Id_GB_" + self.IdGrupoBebida + "_" + bebida.IdBebida + "_Bebida_Nombre', '')\"><span class=\"glyphicon glyphicon-calendar\" ></span></span>\n\
                                    </div>\n\
                                </td>\n\
                                <td >\n\
                                    <div class='input-group'>\n\
                                        <input type='number' id='Id_GB_" + self.IdGrupoBebida + "_" + bebida.IdBebida + "_Bebida_Cantidad_Botella' min='0' step='1' class='form-control numerico' value='" + bebida.Cantidad_Botella + "'  onchange='ModificarBebida(" + index + "," + i + ")' />\n\
                                        <span class=\"boton_mas btn btn-default input-group-addon\"><span class=\"glyphicon glyphicon-plus\"></span></span>\n\
                                        <span class=\"boton_menos btn btn-default input-group-addon\"><span class=\"glyphicon glyphicon-minus\"></span></span>\n\
                                    </div>\n\
                                </td>\n\
                                <td>\n\
                                     <button type=\"button\" class=\"form-control btn btn-default\" onClick='EliminarBebida(" + index + "," + i + ")' ><span class=\"glyphicon glyphicon-remove\" ></span> </button>\n\
                                </td>\n\
                            </tr>";
                    }
                    //añadir la última linea para poder añadir un precio
                    html +=
                        "<tr>\n\
                            <td>\n\
                                <div class='input-group'>\n\
                                    <input type='text' id='Id_GB_Nuevo_" + self.IdGrupoBebida + "_Bebida_Nombre' class='form-control'   />\n\
                                    <span class='btn btn-default input-group-addon' title='Mostrar/Ocultar Teclado' onclick=\"MostrarTeclado('Id_GB_Nuevo_" + self.IdGrupoBebida + "_Bebida_Nombre', '')\"><span class=\"glyphicon glyphicon-calendar\"></span></span>\n\
                                </div>\n\
                            </td>\n\
                            <td >\n\
                                <div class='input-group'>\n\
                                    <input type='number' id='Id_GB_Nuevo_" + self.IdGrupoBebida + "_Bebida_Cantidad_Botella' min='0' step='1' class='form-control numerico'  />\n\
                                    <span class=\"boton_mas btn btn-default input-group-addon\"><span class=\"glyphicon glyphicon-plus\"></span></span>\n\
                                    <span class=\"boton_menos btn btn-default input-group-addon\"><span class=\"glyphicon glyphicon-minus\"></span></span>\n\
                                </div>\n\
                            </td>\n\
                            <td > \n\
                                <button type=\"button\" class=\"form-control btn btn-default\" onclick='AñadirBebida(" + index + ")' class='btn'><span class=\"glyphicon glyphicon-asterisk\" ></span></button>\n\
                            </td>\n\
                        </tr>\n\
                    </table>";

                    return html;
                });
            refresh_events();
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
    if ($(cap + "Nombre").val() == "") {
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
    ArrayGruposBebida[index].ModificarBebida(ArrayGruposBebida[index].Bebidas[i].IdBebida, $(cap + "Nombre").val(), cantidad_botella
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
    $("#Id_Modal_Advertencia .advertencia-info").html("eliminación de <b> bebida para " + ArrayGruposBebida[index].Bebidas[i].Nombre + "</b>");
    $("#Id_Modal_Advertencia .advertencia-cuerpo").html("<h4>Está seguro de eliminar la bebida " + ArrayGruposBebida[index].Bebidas[i].Nombre + " del grupo de bebidas " + ArrayGruposBebida[index].Nombre + "</b>.<br />Recuerde que esta acción no se podrá deshacer.</h4>");
    $("#Id_Modal_Advertencia .advertencia-continuar").html("Eliminarlo de todas formas");
    $("#Id_Modal_Advertencia .advertencia-continuar").addClass("bnt").addClass("btn-danger");
    $("#Id_Modal_Advertencia .advertencia-cancelar").html("<b>NO ELIMINAR</b>");
    $("#Id_Modal_Advertencia .advertencia-cancelar").addClass("bnt").addClass("btn-primary");
    $("#Id_Modal_Advertencia .advertencia-continuar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-cancelar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-continuar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");
        ArrayGruposBebida[index].QuitarBebida(ArrayGruposBebida[index].Bebidas[i].IdBebida
            , function(bExito, EvResultado) {
                $("#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_Bebidas").modal({backdrop: 'static', keyboard: false}).modal("show");
                if (!bExito) {
                    window.alert(EvResultado);
                    return;
                }
                RellenarGbBebidas(index);
            });
    });
    $("#Id_Modal_Advertencia .advertencia-cancelar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");

        $("#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_Bebidas").modal({backdrop: 'static', keyboard: false}).modal("show");
    });
    $("#Id_GB_" + ArrayGruposBebida[index].IdGrupoBebida + "_Bebidas").modal("hide");
    $("#Id_Modal_Advertencia").modal({backdrop: 'static', keyboard: false}).modal("show");
}
///////////////////////////////////////////////////////////////////////////////

//////////////////////Gestión Empleados/////////////////////////////////////////
function MostrarEmpleados() {
    servidor.empleados.ListarEmpleados(function(bExito, rowsArray) {
        if (!bExito) {
            return;
        }

        //debo añadir el grupo de bebidas que he recibido por el ArrayGruposBebida
        $("#tabla_empleados").html("");
        for (var i = 0; i < rowsArray.length; i++) {
            $("#tabla_empleados").append(
                '<tr > ' +
                '	<td>\n\
                    <div class="input-group">\n\
                        <input type="text" id="Id_E_' + rowsArray[i][0] + '_Nombre" class="form-control" value="' + rowsArray[i][1] + '" onchange="ModificarEmpleado(' + rowsArray[i][0] + ')" />\n\
                        <span class="btn btn-default input-group-addon" title="Mostrar/Ocultar Teclado" onclick="MostrarTeclado(\'Id_E_' + rowsArray[i][0] + '_Nombre\', \'\')"> <span class="glyphicon glyphicon-calendar"  > </span></span>\n\
                    </div>\n\
                </td>' +
                '   <td>' +
                '       <select id="Id_E_' + rowsArray[i][0] + '_Perfil"  onchange="ModificarEmpleado(' + rowsArray[i][0] + ')" class="form-control select_perfil" name="' + rowsArray[i][2] + '" >' +
                '       </select>' +
                '   </td>' +
                '   <td><input type="button" id="Id_E_' + rowsArray[i][0] + '_Color" value="' + new ColorUtils(rowsArray[i][4]).ColorHash + '" class="color form-control btn " onchange="ModificarEmpleado(' + rowsArray[i][0] + ')" /></td>' +
                '	<td  >\n\
                        <button type="button" class="form control btn btn-default" onclick="ModificarContraseña(' + rowsArray[i][0] + ')"  >Modificar</button>' +
                '  </td>\n\
                	<td  >\n\
                        <button type="button" class="form control btn btn-default" onclick="EliminarEmpleado(' + rowsArray[i][0] + ')"  ><span class="glyphicon glyphicon-remove" ></span> </button>' +
                '   </td>\n\
                </tr>');

        }
        $("#tabla_empleados").append('<tr>' +
            '<td>\n\
                <div class="input-group">\n\
                    <input type="text"  id="Id_NuevoE_Nombre" value="" class="form-control">\n\
                    <span class="btn btn-default input-group-addon" title="Mostrar/Ocultar Teclado" onclick="MostrarTeclado(\'Id_NuevoE_Nombre\', \'\')"> <span class="glyphicon glyphicon-calendar"  > </span></span>\n\
                </div>\n\
            </td> ' +
            '   <td>' +
            '       <select id="Id_NuevoE_Perfil" class="form-control select_perfil" >' +
            '       </select>' +
            '   </td>' +
            '<td><input type="button"  id="Id_NuevoE_Color" value="#e6e6e6" class="color form-control btn "></td> ' +
            '<td class="boton" ><button type="button" class="form-control btn btn-default"   onClick="AñadirEmpleado()" ><span class="glyphicon glyphicon-asterisk"></i> </span></button></td> </tr>');
        RellenarSelectPerfiles();
        refresh_events();
    });
}

function RellenarSelectPerfiles() {
    servidor.empleados.ListarPerfiles(
        function(bExito, rowsArray) {
            if (!bExito) {
                alert(rowsArray);
                return;
            }
            $(".select_perfil").html("");
            $(".select_perfil").append(
                function() {
                    var html = '';
                    for (var i = 0; i < rowsArray.length; i++) {
                        //añadimos un select 
                        html += '<option value="' + rowsArray[i][0] + '" ' + (rowsArray[i][0] == $(this).attr("name") ? "selected=selected" : "") + " >" + rowsArray[i][1] + "</option>";
                    }
                    return html;
                });
        });
}

function ModificarContraseña(idEmpleado) {
    $("#Id_Modal_Empleados_Password .modal-title").html("Empleados - modificar contraseña de  <b> " + $("#Id_E_" + idEmpleado + "_Nombre").val() + "</b>");
    $("#Id_Submit_Empleado_Password").unbind("click");
    $("#Id_Submit_Empleado_Password").click(function() {
        if ($("#Id_Password_1").val() == "") {
            alert("Debe introducir, al menos, un dígito en la contraseña.");
            return;
        }
        if ($("#Id_Password_1").val() !== $("#Id_Password_2").val()) {
            alert("La contraseñas introducidas no coinciden.\nVuelva a introducir la contraseña.")
            return;
        }
        servidor.empleados.CambiarContraseña(idEmpleado, $("#Id_Password_2").val()
            , function(bExito) {
                if (!bExito) {
                    alert("No se ha podido modificar la contraseña");
                    return;
                }
                alert("Contraseña modificada correctamente");
                $("#Id_Modal_Empleados_Password").modal("hide");
            });
    });

    $("#Id_Modal_Empleados_Password").modal({backdrop: 'static', keyboard: false}).modal("show");
}

function AñadirEmpleado() {
    //debe introducir
    var cap = "#Id_NuevoE_";
    if ($(cap + "Nombre").val() == "") {
        alert("Debe indicar el nombre del empleado");
        return;
    }
    $("#Id_Modal_Empleados_Password .modal-title").html("Empleados - añadir contraseña de  <b> " + $(cap + "Nombre").val() + "</b>");
    $("#Id_Submit_Empleado_Password").unbind("click");
    $("#Id_Submit_Empleado_Password").click(function() {
        if ($("#Id_Password_1").val() == "") {
            alert("Debe introducir, al menos, un dígito en la contraseña.");
            return;
        }
        if ($("#Id_Password_1").val() !== $("#Id_Password_2").val()) {
            alert("La contraseñas introducidas no coinciden.\nVuelva a introducir la contraseña.")
            return;
        }

        $("#Id_Modal_Empleados_Password").modal("hide");
        servidor.empleados.AñadirEmpleado($(cap + "Nombre").val(), $("#Id_Password_1").val(), $(cap + "Perfil").val(), (new ColorUtils("#" + $(cap + "Color").val())).Color
            , function(bExito, id) {
                if (bExito) {
                    MostrarEmpleados();
                }
                else
                    alert(id);
            });
    });

    $("#Id_Modal_Empleados_Password").modal({backdrop: 'static', keyboard: false}).modal("show");



}

function ModificarEmpleado(idEmpleado) {
    //debe introducir
    var cap = "#Id_E_" + idEmpleado + "_";
    if ($(cap + "Nombre").val() == "") {
        alert("Debe indicar el nombre del empleado");
        return;
    }

    servidor.empleados.ModificarEmpleado(idEmpleado, $(cap + "Nombre").val(), $(cap + "Perfil").val(), (new ColorUtils("#" + $(cap + "Color").val())).Color
        , function(bExito, id) {
            if (bExito) {
                MostrarEmpleados();
            }
            else
                alert(id);
        });
}

function EliminarEmpleado(idEmpleado) {

    $("#Id_Modal_Advertencia .advertencia-info").html("eliminación de <b> Empleado " + $("#Id_E_" + idEmpleado + "_Nombre").val() + "</b>");
    $("#Id_Modal_Advertencia .advertencia-cuerpo").html("<h4>Está seguro de eliminar el grupo de bebida <b>" + $("#Id_E_" + idEmpleado + "_Nombre").val() + "</b>.<br />Recuerde que esta acción no se podrá deshacer.</h4>");
    $("#Id_Modal_Advertencia .advertencia-continuar").html("Eliminarlo de todas formas");
    $("#Id_Modal_Advertencia .advertencia-continuar").addClass("bnt").addClass("btn-danger");
    $("#Id_Modal_Advertencia .advertencia-cancelar").html("<b>NO ELIMINAR</b>");
    $("#Id_Modal_Advertencia .advertencia-cancelar").addClass("bnt").addClass("btn-primary");
    $("#Id_Modal_Advertencia .advertencia-continuar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-cancelar").unbind("click");
    $("#Id_Modal_Advertencia .advertencia-continuar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");
        servidor.empleados.QuitarEmpleado(idEmpleado
            , function(bExito, Mensaje) {
                if (!bExito) {
                    alert(Mensaje);
                    return;
                }
                MostrarGruposBebida();
            });
    });
    $("#Id_Modal_Advertencia .advertencia-cancelar").click(function() {
        $("#Id_Modal_Advertencia").modal("hide");
    });
    $("#Id_Modal_Advertencia").modal({backdrop: 'static', keyboard: false}).modal("show");
}

///////////////////////////////////////////////////////////////////////////////

//////////////////////////////Gestionar Stock//////////////////////////////////
function GestionarStock(id) {
    if (!isUndefined(TimeOutFinalizarServicios))
        clearTimeout(TimeOutFinalizarServicios);
    $('#Id_Modal_Resumen_Servicios .modal-body tbody').html("");
    ArrDatosServicioActual = [];
    $(".panel").hide();
    $("#PanelGestionarStock").show();
    if (!id) {
        $(".menu").removeClass("active");
        $("#Menu_GestionarStock").parent().addClass("active");
        $("#Id_Reiniciar_Stock").show();

    } else {
        $("#Id_Reiniciar_Stock").hide();
    }
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
                                    "<td >\n\
                                        <div class='input-group'>\n\
                                            <input type='number' step='1' min='0' max='9999' id='Id_GS_" + rowsArray[i][0] + "_Cantidad_Botella'  class='form-control numerico' value='" + nCantidadxBotella + "'  onchange='ModificarCantidadxBotella(" + rowsArray[i][0] + ")' />\n\
                                            <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                            <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                                        </div>\n\
                                    </td>" +
                                    //Catnidad en stock
                                    "<td >\n\
                                        <div class='input-group'>\n\
                                            <input type='number' step='1' min='0' max='999' id='Id_GS_" + rowsArray[i][0] + "_Cantidad_Botellas_Stock'  class='form-control numerico' value='" + nCantidadStock + "' onchange='ModificarCantidadBotellas(" + rowsArray[i][0] + ")' />\n\
                                            <span class='boton_mas btn btn-default input-group-addon'><span class='glyphicon glyphicon-plus'></span></span>\n\
                                            <span class='boton_menos btn btn-default input-group-addon'><span class='glyphicon glyphicon-minus'></span></span>\n\
                                        </div>\n\
                                    </td>" +
                                    //Cantidad de retales
                                    "<td >\n\
                                        <div class='input-group'>\n\
                                            <input type='number' id='Id_GS_" + rowsArray[i][0] + "_Cantidad_Retales' type='text' class='form-control numerico' disabled='disabled' value='" + nCantidadRetales + "'  />\n\
                                            <a class='btn btn-default' href='#Id_GS_" + rowsArray[i][0] + "_Modal_Retales' data-toggle='modal' ><span class='glyphicon glyphicon-edit'> </span></a>\n\
                                        </div>" +
                                    //añadimos el diálogo modal para mostrar
                                    '<div id="Id_GS_' + rowsArray[i][0] + '_Modal_Retales" class="modal cuadro_retales" >\n\
                                            <div class="modal-dialog modal-md" > \n\
                                                <div class="modal-content" >\n\
                                                    <div class="modal-header"> \n\
                                                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n\
                                                        <h3 class="modal-title">Gestión de Stock - retales de ' + rowsArray[i][1] + '</h3>\n\
                                                    </div>\n\
                                                    <div class="modal-body">\n\
                                                        <p>Indique la cantidad en algún tipo de servicio que le quede a la botella</p>\n\
                                                        <table id="Id_GS_' + rowsArray[i][0] + '_table_Retales" >\n\
                                                            <tr id="Id_GS_' + rowsArray[i][0] + '_tr_Añadir_Retales" >\n\
                                                                <td> \n\
                                                                    <select id="Id_GS_' + rowsArray[i][0] + '_select_add" class="form-control select_retales"></select>\n\
                                                                </td>\n\
                                                                <td >\n\
                                                                    <button type="button" class="btn btn-default" onClick="AñadirRetales(' + rowsArray[i][0] + ')" ><span class="glyphicon glyphicon-plus"></span> </button>\n\
                                                                </td>\n\
                                                            </tr>\n\
                                                        </table>\n\
                                                    </div>\n\
                                                    <div class="modal-footer ">\n\
                                                        <div style="float:left">\n\
                                                        <p>Total retales: <span id="Id_GS_' + rowsArray[i][0] + '_total_Retales">' + nCantidadRetales + '</span>\n\
                                                            <button type="button" onClick="EliminarRetales(' + rowsArray[i][0] + ')" class="btn btn-default">Quitar retales</button>\n\
                                                        </p>\n\
                                                        </div>\n\
                                                        <div><a href="javascript:void(0)" data-dismiss="modal" aria-hidden="true" class="btn btn-success">Cerrar</a></div>\n\
                                                    </div>\n\
                                                </div>\n\
                                            </div>\n\
                                        </div>' +
                                    "</td>" +
                                    //Cantidad en stock en ml
                                    "<td id='Id_GS_" + rowsArray[i][0] + "_Cantidad_Stock' >" + nCantidadTotalStock + "</td></tr>");
                                //añado a la barra el porcentaje que represente
                                $("#bar_Cargando").css("width", (i / (rowsArray.length - 1) * 100) + "%");
                            }

                            RellenarSelectRetales();
                            //clearInterval(intervalo)
                            $("#tr_cargando").hide();
                            $("#bar_Cargando").css("width", "0%");
                            refresh_events();

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
            var cantidad = parseInt($("#Id_GS_" + this.id.replace("Id_GS_", "").replace("_select_add", "") + "_Cantidad_Botella").val());
            var html = "";
            for (var j = 1; ArrayTiposServicio[i].Cantidad * j < cantidad; j++)
                html += "<option value='" + j * ArrayTiposServicio[i].Cantidad + "'> Como para " + j + " " + ArrayTiposServicio[i].Nombre + "</option>";
            return html;
        });
    }

}

function ModificarCantidadxBotella(idBebida) {
    //si se le da a este botón se añade 10 al idBebida
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").val());
    var cantidadStock = cantidad * parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").val()) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").val());
    servidor.stock.ModificarStockBotellaBebida(idBebida, cantidad, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }
            $("#Id_GS_" + idBebida + "_Cantidad_Botella").val(cantidad);
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);
            if (!isUndefined(ArrayBebidas) && ArrayBebidas.length > 0) {
                var oBebida = ArrayBebidas.obBebida(idBebida);
                for (var i = 0; i < oBebida.TiposServicio.length; i++)
                    oBebida.TiposServicio[i].bAcotizar = true;
            }

        });
}

function ModificarCantidadBotellas(idBebida) {
    //si se le da a este botón se añade 10 al idBebida
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").val());
    var cantidadStock = cantidad * (parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").val())) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").val());
    servidor.stock.ModificarStockBebida(idBebida, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }
            $("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").val((parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").val())));
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);
            if (!isUndefined(ArrayBebidas) && ArrayBebidas.length > 0) {
                var oBebida = ArrayBebidas.obBebida(idBebida);
                for (var i = 0; i < oBebida.TiposServicio.length; i++)
                    oBebida.TiposServicio[i].bAcotizar = true;
            }
        });
}

function AñadirRetales(idBebida) {

    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").val());
    var cantidadRetal = parseInt($('#Id_GS_' + idBebida + '_select_add').val());
    var cantidadStock = cantidad * (parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").val())) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").val()) + cantidadRetal;
    var cantidadTotalRetales = cantidadRetal + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").val());
    servidor.stock.ModificarStockBebida(idBebida, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }
            //añadir las cantidades correspondientes
            $('#Id_GS_' + idBebida + '_tr_Añadir_Retales').before(
                '<tr id="Id_GS_' + idBebida + '_tr_Retal_' + $('#Id_GS_' + idBebida + '_table_Retales tr').length + '" class="añadido">\n\
                    <td>' + $('#Id_GS_' + idBebida + '_select_add :selected').text() + '</td>\n\
                    <td  ><button type="button" class="btn btn-default" onClick="QuitarRetal(' + idBebida + ',' + $('#Id_GS_' + idBebida + '_table_Retales tr').length + ',' + cantidadRetal + ')"><span class="glyphicon glyphicon-minus"></span> </button></td>\n\
                </tr>');
            $("#Id_GS_" + idBebida + "_Cantidad_Retales").val(cantidadTotalRetales);
            $("#Id_GS_" + idBebida + "_total_Retales").html(cantidadTotalRetales);
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);
            if (!isUndefined(ArrayBebidas) && ArrayBebidas.length > 0) {
                var oBebida = ArrayBebidas.obBebida(idBebida);
                for (var i = 0; i < oBebida.TiposServicio.length; i++)
                    oBebida.TiposServicio[i].bAcotizar = true;
            }

        });
}

function QuitarRetal(idBebida, fila, cantidadRetal) {
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").val());
    var cantidadStock = cantidad * (parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").val())) + parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").val()) - cantidadRetal;
    var cantidadTotalRetales = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Retales").val()) - cantidadRetal;

    servidor.stock.ModificarStockBebida(idBebida, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }

            $('#Id_GS_' + idBebida + '_tr_Retal_' + fila).remove();
            $("#Id_GS_" + idBebida + "_Cantidad_Retales").val(cantidadTotalRetales);
            $("#Id_GS_" + idBebida + "_total_Retales").html(cantidadTotalRetales);
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);
            if (!isUndefined(ArrayBebidas) && ArrayBebidas.length > 0) {
                var oBebida = ArrayBebidas.obBebida(idBebida);
                for (var i = 0; i < oBebida.TiposServicio.length; i++)
                    oBebida.TiposServicio[i].bAcotizar = true;
            }

        });
}

function EliminarRetales(idBebida) {
    var cantidad = parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botella").val());
    var cantidadStock = cantidad * (parseInt($("#Id_GS_" + idBebida + "_Cantidad_Botellas_Stock").val()));

    servidor.stock.ModificarStockBebida(idBebida, cantidadStock
        , function(bExito, strMensaje) {
            if (!bExito) {
                alert(strMensaje);
                return;
            }

            $('#Id_GS_' + idBebida + '_table_Retales .añadido').remove();
            $("#Id_GS_" + idBebida + "_Cantidad_Retales").val(0);
            $("#Id_GS_" + idBebida + "_total_Retales").html(0);
            $("#Id_GS_" + idBebida + "_Cantidad_Stock").html(cantidadStock);
            if (!isUndefined(ArrayBebidas) && ArrayBebidas.length > 0) {
                var oBebida = ArrayBebidas.obBebida(idBebida);
                for (var i = 0; i < oBebida.TiposServicio.length; i++)
                    oBebida.TiposServicio[i].bAcotizar = true;
            }

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
        $(".cabecera").css("top", 35);
        $("#Menu_GestionarStock_Sesion").show();
        $("#Menu_VolverSesion").hide();
        $("#id_horas").html("00");
        $("#id_minutos").html("00");
        $("#id_segundos").html("00");
        clearInterval(intervalo);
        intervalo = initTiempoSesión();
        EliminarDatosAnterioresErroneos();

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

                html += "<button type='button' class='bebidas btn' style='" + ColorearBoton(ArrayBebidas[i].Color) + "' onclick='MostrarDialogoBebida(" + i + ")'>\n\
                            <div class='Titulo'  id='Id_Bebida_" + ArrayBebidas[i].IdBebida + "_div' >\n\
                                <p>" + ArrayBebidas[i].Nombre + "</p>\n\
                                <table class='Precios'>\n\
                                </table>\n\
                            </div>\n\
                        </button>";
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
                            $("#Id_Bebida_" + oTipoServicio._parent.IdBebida + "_div .Precios").append("<tr><td>" + oTipoServicio.Nombre + ": " +
                                '           <span class="Id_Bebida_' + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + '_Precio">' +
                                Left((p = (p = oTipoServicio.PrecioInicial.toString()) + (p.indexOf(".") > 0 ? '' : '.') + '00'), p.split(".")[0].length + 3) +
                                '</span>€</td></tr>');
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

function ThreadComprobaciones() {
    return setInterval(function() {
        servidor.cotización.ComprobarCambios(
            function(bExito, rowsArray) {
                if (!bExito) {
                    return;
                }
                if (!rowsArray.length)
                    return;
                if (rowsArray[0][1] == 0) {
                    //indicar que cuando se finalice el servicio se cierre la sesión
                    if (!ArrDatosServicioActual.length)
                        servidor.tpvs.RegistrarActualizacion(
                            function(bExito, Mensaje) {
                                if (!bExito)
                                    alert(Mensaje);
                                EliminarDatosAnterioresErroneos();
                                clearInterval(intervalo);
                                Iniciar();
                            });
                    else
                        SesionCerrada = true;
                } else if (rowsArray[0][1] == 1) {
                    EliminarDatosAnterioresErroneos();
                    servidor.tpvs.RegistrarActualizacion(
                        function(bExito, Mensaje) {
                            if (!bExito)
                                alert(Mensaje);
                            Iniciar();
                        });

                } else {
                    ActualizarPrecios();
                }
            });

    }, 3000);
}

function ActualizarPrecios() {
    servidor.cotización.ListarCotización(function(bExito, rowsArray) {
        if (!bExito)
            return;
        //ahora añadir los precios
        var p = "";
        for (var i = 0; i < rowsArray.length; i++) {
            var oBebida = ArrayBebidas.obBebida(rowsArray[i][2])
                , oTipoServicio = oBebida.TiposServicio.obTipoServicio(rowsArray[i][4]);
            oTipoServicio.PrecioCotizado = rowsArray[i][6];
            oTipoServicio.PrecioFijado = rowsArray[i][9] != 0;
            $('.Id_Bebida_' + rowsArray[i][2] + '_Id_T_Servicio_' + rowsArray[i][4] + '_Precio')
                .html(Left((p = (p = rowsArray[i][6].toString()) + (p.indexOf(".") > 0 ? '' : '.') + '00'), p.split(".")[0].length + 3));
        }
        servidor.tpvs.RegistrarActualizacion(
            function(bExito, Mensaje) {
                if (!bExito)
                    alert(Mensaje);
            });
    });
}

function MostrarDialogoBebida(index) {
    if (index > ArrayBebidas.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    $("#Id_Modal_Bebida .modal-title").html("Servicios - añadir servicio de <b>" + ArrayBebidas[index].Nombre + "</b>");
    $("#Id_Modal_Bebida .modal-body").html(function() {
        var html = "<table align='center'><tr>";
        for (var i = 0; i < ArrayBebidas[index].TiposServicio.length; i++) {
            var oTipoServicio = ArrayBebidas[index].TiposServicio[i], p = 0;
            html += '<td >\n\
                    <div>\n\
                        <button type="button" onClick="AñadirServicio(' + index + ',' + i + ')" class="bebidas btn" style="' + ColorearBoton(oTipoServicio.Color) + '">\n\
                            <div>\n\
                                <p>' + oTipoServicio.Nombre + '</p>\n\
                                <span style="font-size: 9pt; font-weight: bold;">Precio: <span class="Id_Bebida_' + oTipoServicio._parent.IdBebida + '_Id_T_Servicio_' + oTipoServicio.IdTipoServicio + '_Precio">' + Left((p = (p = oTipoServicio.PrecioCotizado.toString()) + (p.indexOf(".") > 0 ? '' : '.') + '00'), p.split(".")[0].length + 3) + '</span>€</span>\n\
                            </div>\n\
                        </button>\n\
                    </div>\n\
                    <div>' +
                (Empleado.Id_Perfil == 0 ?
                    (oTipoServicio.EnCotización ?
                        ('<button type="button"  class="btn btn-default fijarprecio" onclick="' + (oTipoServicio.PrecioFijado ? "LiberarPrecio(" + index + "," + i + ")" : "FijarPrecio(" + index + "," + i + ")") + '">' + (oTipoServicio.PrecioFijado ? "Liberar Precio" : "Fijar Precio") + '</button>') :
                        '<button type="button" title="Este precio esta fijado mediante configuración"  class="btn " disabled="disabled">Precio fijado</button>')
                    :
                    "") +
                '</div>\n\
                </td>';
        }

        html += "</tr></table>";
        return html;
    });
    $("#Id_Modal_Bebida .modal-footer button").unbind("click");
    $("#Id_Modal_Bebida .modal-footer button").click(function() {
        $("#Id_Modal_Bebida").modal("hide");
    });
    $("#Id_Modal_Bebida").modal({backdrop: 'static', keyboard: false}).modal("show");
}

function AñadirServicio(indexB, indexT) {
    if (!isUndefined(TimeOutFinalizarServicios))
        clearTimeout(TimeOutFinalizarServicios);
    if (indexB > ArrayBebidas.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    if (indexT > ArrayBebidas[indexB].TiposServicio.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    var oTipoServicio = ArrayBebidas[indexB].TiposServicio[indexT];
    var oBebida = ArrayBebidas[indexB];
    oTipoServicio.bAcotizar = true;
    var fila, p = Left((p = oTipoServicio.PrecioCotizado.toString()) + (p.indexOf(".") === -1 ? '.' : '') + '00', p.split(".")[0].length + 3), c = 1;
    var IdDatoServicio = ArrDatosServicioActual.length;
    ArrDatosServicioActual[IdDatoServicio] = new servidor.servicios.CDatoServicio(Empleado.Id_Empleado, IdDatoServicio, oTipoServicio.IdTipoServicio, oTipoServicio.Nombre, oBebida.IdBebida, oBebida.Nombre, c, oTipoServicio.PrecioCotizado);
    //cerrar este cuadro modal y abrir otro con el resumen
    $('#Id_Modal_Bebida').modal("hide");
    $('#Id_Modal_Resumen_Servicios .modal-body tbody').append(
        fila =
        '<tr id="Id_DS_' + IdDatoServicio + '">\n\
                    <td>' + oBebida.Nombre + '</td>\n\
                    <td>' + oTipoServicio.Nombre + '</td>\n\
                    <td>\n\
                        <div class="input-group">\n\
                            <input id="Id_Cantidad_' + IdDatoServicio + '" class="numerico form-control" type="number" max="99" min="0" step="1" value="' + c + '" />\n\
                            <span class="boton_mas btn btn-default input-group-addon"><span class="glyphicon glyphicon-plus"></span></span>\n\
                            <span class="boton_menos btn btn-default input-group-addon"><span class="glyphicon glyphicon-minus"></span></span>\n\
                        </div>\n\
                    </td>\n\
                    <td>\n\
                        <div class="input-group">\n\
                            <input id="Id_Precio_' + IdDatoServicio + '" class="numerico form-control" type="number" max="99" min="0" step="0.1" value="' + p + '" />\n\
                            <span class="boton_mas btn btn-default input-group-addon"><span class="glyphicon glyphicon-plus"></span></span>\n\
                            <span class="boton_menos btn btn-default input-group-addon"><span class="glyphicon glyphicon-minus"></span></span>\n\
                        </div>\n\
                    </td>\n\
                    <td>\n\
                        <button type="button" class="btn btn-default form-control"  onclick="EliminarDatoServicio(' + IdDatoServicio + ')" ><span class="glyphicon glyphicon-remove"> </span></button>\n\
                    </td>\n\
                </tr>');
    $("#Id_Cantidad_" + IdDatoServicio).unbind("change");
    $("#Id_Cantidad_" + IdDatoServicio).change(function() {
        var id = parseInt($(this).attr("id").replace("Id_Cantidad_", ""), 10);
        $("#Id_Precio_" + id).val(parseInt($(this).val(), 10) * oTipoServicio.PrecioCotizado);
        ArrDatosServicioActual[id].Cantidad = $(this).val();
        ArrDatosServicioActual[id].Precio = parseInt($(this).val(), 10) * oTipoServicio.PrecioCotizado;
        var p = 0;
        for (var i = 0; i < ArrDatosServicioActual.length; i++)
            p += parseFloat(ArrDatosServicioActual[i].Precio);
        $("#Id_TotalServicio").html(Left(p = p + (p.toString().indexOf(".") === -1 ? "." : "") + '00', p.split(".")[0].length + 3) + " €");

        localStorage[ServiciosNoFinalizados] = 1;
        localStorage[ServiciosNoFinalizados + "_Filas"] = $('#Id_Modal_Resumen_Servicios .modal-body tbody').html();
        localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"] = JSON.stringify(ArrDatosServicioActual);
    });
    $("#Id_Precio_" + IdDatoServicio).unbind("change");
    $("#Id_Precio_" + IdDatoServicio).change(function() {
        var id = parseInt($(this).attr("id").replace("Id_Precio_", ""), 10);
        ArrDatosServicioActual[id].Precio = parseFloat($(this).val(), 10);
        var p = 0;
        for (var i = 0; i < ArrDatosServicioActual.length; i++)
            p += parseFloat(ArrDatosServicioActual[i].Precio);
        $("#Id_TotalServicio").html(Left(p = p + (p.toString().indexOf(".") === -1 ? "." : "") + '00', p.split(".")[0].length + 3) + " €");

        localStorage[ServiciosNoFinalizados] = 1;
        localStorage[ServiciosNoFinalizados + "_Filas"] = $('#Id_Modal_Resumen_Servicios .modal-body tbody').html();
        localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"] = JSON.stringify(ArrDatosServicioActual);
    });

    $("#Id_Modal_Resumen_Servicios .modal-footer .continuar").unbind("click");
    $("#Id_Modal_Resumen_Servicios .modal-footer .continuar").click(function() {
        $('#Id_Modal_Resumen_Servicios').modal("hide");
        TimeOutFinalizarServicios = setTimeout(function() {
            FinalizarServicio();
        }, 30 * 1000);
    });

    p = 0;
    for (var i = 0; i < ArrDatosServicioActual.length; i++)
        p += parseFloat(ArrDatosServicioActual[i].Precio);
    $("#Id_TotalServicio").html(Left(p = p + (p.toString().indexOf(".") === -1 ? "." : "") + '00', p.split(".")[0].length + 3) + " €");

    localStorage[ServiciosNoFinalizados] = 1;
    localStorage[ServiciosNoFinalizados + "_Filas"] = $('#Id_Modal_Resumen_Servicios .modal-body tbody').html();
    localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"] = JSON.stringify(ArrDatosServicioActual);

    $('#Id_Modal_Resumen_Servicios').modal({backdrop: 'static', keyboard: false}).modal("show");
    refresh_events();
//    });
}

function FijarPrecio(indexB, indexT) {
    if (indexB > ArrayBebidas.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    if (indexT > ArrayBebidas[indexB].TiposServicio.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    var oTipoServicio = ArrayBebidas[indexB].TiposServicio[indexT];
    $("#Id_Modal_FijarPrecio .modal-title").html("Servicios - fijar precio para <b>" + oTipoServicio.Nombre + " de " + oTipoServicio._parent.Nombre + "</b>");
    $("#Id_Modal_FijarPrecio .modal-body").html(function() {
        var html = '<table >\n\
                        <tr>\n\
                            <td>\n\
                                Indique un precio\n\
                            </td>\n\
                            <td style="width:200px">\n\
                                <div class="input-group">\n\
                                    <input type="number" id="Id_PrecioFijado" min="0" max="99" step="0.1" class="form-control" style="text-align:right" value="' + oTipoServicio.PrecioCotizado + '">\n\
                                    <span class="boton_mas btn btn-default input-group-addon"><span class="glyphicon glyphicon-plus"></span></span>\n\
                                    <span class="boton_menos btn btn-default input-group-addon"><span class="glyphicon glyphicon-minus"></span></span>\n\
                                </div>\n\
                            </td>\n\
                            <td>\n\
                                <button type="button" class="btn btn-primary form-control" >Fijar Precio</button>\n\
                            </td>\n\
                        </tr>\n\
                        <tr>\n\
                            <td colspan="3"><h4 id="Id_Mensaje">&nbsp;</h4></td>\n\
                        </tr>\n\
                    </table>';
        return html;
    });
    $("#Id_Modal_FijarPrecio .modal-body button").unbind("click");
    $("#Id_Modal_FijarPrecio .modal-body button").click(function() {
        oTipoServicio.FijarPrecio($("#Id_PrecioFijado").val()
            , function(bExito, Mensaje) {
                if (!bExito) {
                    $("#Id_Mensaje").html("No se ha podido fijar precio debido a: " + Mensaje);
                    return;
                }
                $("#Id_Mensaje").html("El precio se ha fijado correctamente.");
                ActualizarPrecios();
            });
    });
    $("#Id_Modal_FijarPrecio .modal-footer button").unbind("click");
    $("#Id_Modal_FijarPrecio .modal-footer button").click(function() {
        $("#Id_Modal_FijarPrecio").modal("hide");
        MostrarDialogoBebida(indexB);
    });
    $("#Id_Modal_Bebida").modal("hide");
    $("#Id_Modal_FijarPrecio").modal({backdrop: 'static', keyboard: false}).modal("show");
    refresh_events();
}

function LiberarPrecio(indexB, indexT) {
    if (indexB > ArrayBebidas.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    if (indexT > ArrayBebidas[indexB].TiposServicio.length - 1) {
        alert("indice fuera del rango");
        return;
    }
    var oTipoServicio = ArrayBebidas[indexB].TiposServicio[indexT];
    oTipoServicio.LiberarPrecio(
        function(bExito, Mensaje) {
            if (!bExito) {
                window.alert(Mensaje);
                return;
            }
            oTipoServicio.Cotizar(function(bExito, Mensaje) {
                if (!bExito) {
                    window.alert(Mensaje);
                    return;
                }
                ActualizarPrecios();
                $("#Id_Modal_Bebida .modal-body .fijarprecio").text("Fijar Precio");
                $("#Id_Modal_Bebida .modal-body .fijarprecio").click(function() {
                    FijarPrecio(indexB, indexT);
                });
            });

        });
}

function DuplicarDatoServicio(index) {
    if (!isUndefined(TimeOutFinalizarServicios))
        clearTimeout(TimeOutFinalizarServicios);
    var IdDatoServicio = ArrDatosServicioActual.length;
    ArrDatosServicioActual[IdDatoServicio] = new servidor.servicios.CDatoServicio(Empleado.Id_Empleado, IdDatoServicio, ArrDatosServicioActual[index].IdTipoServicio, ArrDatosServicioActual[index].NombreTipoServicio, ArrDatosServicioActual[index].IdBebida, ArrDatosServicioActual[index].NombreBebida, ArrDatosServicioActual[index].Precio);

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

function EliminarDatosAnterioresErroneos() {
    //eliminar las tablas del servicio
    $('#Id_Modal_Resumen_Servicios .modal-body tbody').html("");
    //eliminar la cache del localstorage con respecto a este servicio
    localStorage[ServiciosNoFinalizados + "_Filas"] = "";
    localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"] = "";
    localStorage[ServiciosNoFinalizados] = 0;
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
                localStorage[ServiciosNoFinalizados + "_Filas"] = "";
                localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"] = "";
                Cotizar();
            });
    } else {
        //eliminar las tablas del servicio
        $('#Id_Modal_Resumen_Servicios .modal-body tbody').html("");
        //eliminar la cache del localstorage con respecto a este servicio
        localStorage[ServiciosNoFinalizados] = 0;
        localStorage[ServiciosNoFinalizados + "_Filas"] = "";
        localStorage[ServiciosNoFinalizados + "_ArrDatoServicio"] = "";
    }

}

function Cotizar() {
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
                if (SesionCerrada) {
                    SesionCerrada = false;
                    servidor.tpvs.RegistrarActualizacion(
                        function(bExito, Mensaje) {
                            if (!bExito)
                                alert(Mensaje);
                            clearInterval(intervalo);
                            Iniciar();
                        });

                } else {
                    ActualizarPrecios();
                }
            } else {
                Cotizar(ArrTiposServicioACotizar[sec]);
            }
        });
    };
    if (ArrTiposServicioACotizar.length > 0)
        Cotizar(ArrTiposServicioACotizar[0]);
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
        Iniciar();
    });
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

function Teclado() {
    var Teclas = ["1234567890? qwertyuiop¿+asdfghjklñ´-zxcvbnm,.", "@#$%&/()='! QWERTYUIOP¡ªASDFGHJKLÑ´ºZXCVBNM;:"]
        , html = "<div class='btn-group-verticarl'>";

    for (var i = 0; i < Teclas.length; i++) {
        html += "<div class='" + (!i ? "teclado_minusculas" : "teclado_mayusculas") + " btn-group'>";
        for (var l = 0; l < Teclas[i].length; l++) {
            if (l === 11)
                continue;
            if (l > 12 && !(l % 12))
                html += "</div><div class='" + (!i ? "teclado_minusculas" : "teclado_mayusculas") + " btn-group'>";
            html += "<button type='button'  class='" + (Teclas[i][l] === "´" ? "tecla_tilde" : "tecla") + " btn-default btn-lg  '>" + Teclas[i][l] + "</button>";
            if (Teclas[i][l] === "?" || Teclas[i][l] === "!") {
                html += '<button type="button"  class="tecla_atras btn-default btn-lg "><i class="glyphicon glyphicon-arrow-left"></i></button>';
                html += "</div><div class='" + (!i ? "teclado_minusculas" : "teclado_mayusculas") + " btn-group'>";
            }
            if (Teclas[i][l] === ".") {
                html += '<button type="button"  class="tecla_mayusculas btn-default btn-lg " >Mayúsculas</button>';
            }
            if (Teclas[i][l] === ":") {
                html += '<button type="button"  class="tecla_minusculas btn-default btn-lg " >Minúsculas</button>';
            }
        }
        html += "</div>";
    }
    html += "<div class='  btn-group'>";
    html += '<button type="button"  class="tecla tecla_espacio  btn-default   btn-lg " >&nbsp;</button>';
    html += '<button type="button"  class="tecla_enter  btn-lg btn-primary" >Continuar</button>';
    html += "</div></div>";
    return html;
}

function MostrarTeclado(Id_Input, Id_Submit) {
    if ($("#Id_Teclado").css("display") !== "none" && $("#Id_Input").html() !== Id_Input) {
        $("#Id_Teclado").hide();
    }
    if ($("#Id_Teclado").css("display") === "none") {
        $("#Id_Input").html(Id_Input);
        $("#Id_Submit").html(Id_Submit);
        var top = $("#" + Id_Input).offset().top + $("#" + Id_Input).height() + 16;
        var left = $("#" + Id_Input).offset().left;
        if (top + $("#Id_Teclado").height() > $(window).height()) {
            //lo hacemos por arriba
            top = $("#" + Id_Input).offset().top - $("#Id_Teclado").height();
        }
        if (left + $("#Id_Teclado").width() > $(window).width()) {
            left = $(window).width() - $("#Id_Teclado").width();
        }
        $("#Id_Teclado").css("top", top).css("left", left);
        $("#Id_Teclado").show();
    } else {
        $("#Id_Input").html("");
        $("#Id_Submit").html("");
        $("#Id_Teclado").hide();
    }
    SigueMostrandoTeclado = true;
}

function MostrarTildes() {
    var letras = ["aeiouAEIOU", "áéíóúÁÉÍÓÚ"]
        , i = EstaTilde ? 1 : 0
        , j = EstaTilde ? 0 : 1;
    $(".tecla").each(function() {
        if (letras[i].indexOf($(this).text()) > -1) {
            $(this).text(letras[j][letras[i].indexOf($(this).text())]);
            if (!i)
                $(this).addClass("btn-success");
            else
                $(this).removeClass("btn-success");
        } else {
            if (!i) {
                $(this).attr("disabled", "disabled");
                $(this).removeClass("btn-default");
            }
            else {
                $(this).removeAttr("disabled");
                $(this).addClass("btn-default");
            }
        }
    });
    EstaTilde = !EstaTilde;
    $(".tecla_tilde").each(function() {
        if (EstaTilde)
            $(this).addClass("btn-success");
        else
            $(this).removeClass("btn-success");
    });
    SigueMostrandoTeclado = true;
}

function ColorearBoton(Color) {
    return  "color: " + (Math.round(Color.Luminosidad) ? '#000' : '#FFF') + "; \n\
            background-color: " + Color.Inc(5) + ";\n\
            background-image: -webkit-gradient(linear, 0 0, 0 100%, from(" + Color.Inc(70) + "), to(" + Color.Dec(0) + "));\n\
            background-image: -moz-linear-gradient(top, " + Color.Inc(70) + ", " + Color.Dec(0) + ");\n\
            background-image: -webkit-linear-gradient(top, " + Color.Inc(70) + ", " + Color.Dec(0) + ");\n\
            background-image: -o-linear-gradient(top, " + Color.Inc(70) + ", " + Color.Dec(0) + ");\n\
            background-image: linear-gradient(to bottom, " + Color.Inc(70) + ", " + Color.Dec(0) + ");\n\
            text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);\n\
            background-repeat: repeat-x;\n\
            border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);";
}
///////////////////////////////////////////////////////////////////////////////