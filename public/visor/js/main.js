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


$("document").ready(function() {
    setInterval(function() {
        servidor.cotización.ListarCotización(function(bExito, rowsArray) {
            if (!bExito) {
                alert(rowsArray);
                return;
            }
            $("#Id_Tabla_Visor_Ofertas > tbody").html("");
            for (var i = 0; i < rowsArray.length; i++) {
                var fila = "<tr>";
                for (var j = 0; j < rowsArray[i].length; j++) {
                    if (j === 0 || j === 2 || j === 4)
                        continue;
                    fila += "<td>" + rowsArray[i][j] + "</td>";
                }
                fila += "</tr>";
                $("#Id_Tabla_Visor_Ofertas > tbody").append(fila);
            }
        });
    }, 1000);
});


