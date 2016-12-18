/* 
 * Copyright (C) 2013 baco
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
document.write(
    '<script src="../js/global.js" type="text/javascript"></script>' +
    '<script src="../js/bootstrap.js" type="text/javascript"></script>' +
    '<script src="../js/servidor.js" type="text/javascript" charset="utf-8"></script>');

function EstaEnArray(Array, id) {
    for (var i = 0; i < Array.length; i++)
        if (Array[i].Id === id)
            return true;
    return false;
}

$("document").ready(function() {

    //obtenemos el tipo de servicio por cada grupo de bebida
    servidor.cotización.ListarGruposBebidaTiposServicio(
        function(bExito, rowsArray) {
            if (!bExito) {
                alert(rowsArray);
                return;
            }
            if (rowsArray.length === 0)
                return;
            if (rowsArray[0].length === 0)
                return;
            $("#Id_Corp_Mitos").html("");
            var GrupoBebida = function() {
                this.Id;
                this.Nombre;
                this.colspan;
                this.Bebidas;
                this.TiposServicio;
            };
            var Tipo = function() {
                this.Id;
                this.Nombre;
            };
            var ArrGruposBebida = [];
            var Id_GB_Ant = -1, ID_TS_Ant = -2, ID_B_ANT = -1;
            var iGB = -1, iB = 0, iTS = 0;
            for (var i = 0; i < rowsArray.length; i++) {
                if (rowsArray[i][0] !== Id_GB_Ant) {
                    iGB++;
                    ArrGruposBebida[iGB] = new GrupoBebida();
                    ArrGruposBebida[iGB].Id = rowsArray[i][0];
                    ArrGruposBebida[iGB].Nombre = rowsArray[i][1];
                    iB = 0;
                    iTS = 0;
                    ArrGruposBebida[iGB].colspan = 2;
                    ArrGruposBebida[iGB].TiposServicio = [];
                    ArrGruposBebida[iGB].TiposServicio[iTS] = new Tipo();
                    ArrGruposBebida[iGB].TiposServicio[iTS].Id = rowsArray[i][2];
                    ArrGruposBebida[iGB].TiposServicio[iTS].Nombre = rowsArray[i][3];
                    ArrGruposBebida[iGB].Bebidas = [];
                    ArrGruposBebida[iGB].Bebidas[iB] = new Tipo();
                    ArrGruposBebida[iGB].Bebidas[iB].Id = rowsArray[i][4];
                    ArrGruposBebida[iGB].Bebidas[iB].Nombre = rowsArray[i][5];

                } else {
                    if (rowsArray[i][2] !== ID_TS_Ant) {
                        //compruebo que no esté en el array de grupo de bebidas
                        if (!EstaEnArray(ArrGruposBebida[iGB].TiposServicio, rowsArray[i][2])) {
                            iTS++;
                            ArrGruposBebida[iGB].colspan++;
                            ArrGruposBebida[iGB].TiposServicio[iTS] = new Tipo();
                            ArrGruposBebida[iGB].TiposServicio[iTS].Id = rowsArray[i][2];
                            ArrGruposBebida[iGB].TiposServicio[iTS].Nombre = rowsArray[i][3];
                        }

                    }
                    if (rowsArray[i][4] !== ID_B_ANT) {
                        if (!EstaEnArray(ArrGruposBebida[iGB].Bebidas, rowsArray[i][4])) {
                            iB++;
                            ArrGruposBebida[iGB].Bebidas[iB] = new Tipo();
                            ArrGruposBebida[iGB].Bebidas[iB].Id = rowsArray[i][4];
                            ArrGruposBebida[iGB].Bebidas[iB].Nombre = rowsArray[i][5];
                        }
                    }
                }
                Id_GB_Ant = rowsArray[i][0];
                ID_TS_Ant = rowsArray[i][2];
                ID_B_ANT = rowsArray[i][4];
            }
            $("#Id_Corp_Mitos").append(function() {
                var html = "";
                //crear las tablas
                for (var i = 0; i < ArrGruposBebida.length; i++) {
                    //creo la tabla
                    html += "<div id='Id_" + ArrGruposBebida[i].Id + "' class='col-xs-2' style='padding-bottom: 20px' ><table class='pizarra'>";
                    html += "<tr><th id='Id_GB_" + ArrGruposBebida[i].Id + "_th' colspan=" + ArrGruposBebida[i].colspan + ">" + ArrGruposBebida[i].Nombre + "</th></tr>";

                    html += "<tr><th></th>";
                    for (var j = 0; j < ArrGruposBebida[i].TiposServicio.length; j++) {
                        html += "<td>" + ArrGruposBebida[i].TiposServicio[j].Nombre + "</td>";
                    }
                    html += "</tr>";

                    for (var j = 0; j < ArrGruposBebida[i].Bebidas.length; j++) {
                        html += "<tr id='Id_B_" + ArrGruposBebida[i].Bebidas[j].Id + "' class='"+ (j % 2 ? "par": "impar") +"' > ";
                        html += "<td>" + ArrGruposBebida[i].Bebidas[j].Nombre + "</td>";
                        for (var k = 0; k < ArrGruposBebida[i].TiposServicio.length; k++) {
                            html += "<td id='Id_B_" + ArrGruposBebida[i].Bebidas[j].Id + "_TS_" + ArrGruposBebida[i].TiposServicio[k].Id + "' ></td>";
                        }
                        html += "</tr>";
                    }
                    html += "</table></div>";
                }

                return html;
            });
            setInterval(function() {
                servidor.cotización.ListarCotización(function(bExito, rowsArray) {
                    if (!bExito) {
                        // alert(rowsArray);
                        return;
                    }
                    if (rowsArray.length === 0)
                        return;
                    if (rowsArray[0].length === 0)
                        return;
                    var IB = 2, IP = 6, p, IPI = 10, ITS = 4;
                    for (var i = 0; i < rowsArray.length; i++) {
                        if (rowsArray[i][IP] < rowsArray[i][IPI])
                            $("#Id_B_" + rowsArray[i][IB]).addClass("barato");
                        else
                            $("#Id_B_" + rowsArray[i][IB]).removeClass("barato");
                        $("#Id_B_" + rowsArray[i][IB] + "_TS_" + rowsArray[i][ITS]).html(Left((p = (p = rowsArray[i][IP].toString()) + (p.indexOf(".") > 0 ? '' : '.') + '00'), p.split(".")[0].length + 3) + "€");
                    }
                });
            }, 1000);
        });
});


