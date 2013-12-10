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
            if(rowsArray.length === 0)
                return;
            if(rowsArray[0].length === 0)
                return;
            var Grupo = "";
            var IG = 0, IB = 3, IP = 6;
              $("#Id_Corp_Mitos").html("");
            for (var i = 0; i < rowsArray.length; i++){
               if(rowsArray[i][IG] !== Grupo){
                   //añadimos un div
                   $("#Id_Corp_Mitos").append(function(){
                      return "<div id='Id_"+rowsArray[i][IG]+"' class='span2' ><table class='table'><caption>"+rowsArray[i][1]+"</caption></table></div>";
                   });
                   Grupo = rowsArray[i][IG];
               } 
               //en el div del grupo añadimo la bebida
               $("#Id_"+rowsArray[i][IG]+" table").append(function(){
                   return "<tr><td>"+rowsArray[i][IB]+"</td><td>"+rowsArray[i][IP]+"</td></tr>";
               });
            }
            
        });
    }, 1000);
});


