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


var global = module.exports = (function() {
    return {
        Grupos_Bebida: 0
        , Bebidas: 1
        , Tipos_Servicio: 2
        , Sesiones: 3
        , Bebidas_Sesiones: 4
        , TPV: 5
        , Acciones: 6
        , Acciones_TPV: 7
        , Servicios: 8
        , Ordenes: 9
        , Precios: 10
        , Cotización: 11
        , Propiedades: 12
        , isUndefined: function(obj) {
            return obj === void 0;
        }

        , str_o_null: function(obj) {
            if (obj == null || obj === "")
                return " NULL ";
            else
                return obj;
        }

        , null_o_str: function(obj) {
            if (obj == null || obj === "null")
                return "";
            else
                return obj;
        }

        , eq_id_o_null: function(id) {
            if (id == null || id === "")
                return " IS NULL ";
            else
                return " = " + id + " ";
        }

        , Right: function(texto, hasta) {
            var ret = "";
            for (var i = 0, j = texto.length - 1; i < hasta && j >= 0; i++, j--)
                ret = texto[j] + ret;
            return ret;
        }

        , Left: function(texto, hasta) {
            var ret = "";
            for (var i = 0; i < hasta && i < texto.length; i++)
                ret += texto[i];
            return ret;
        }

        , ColorUtils: function(color) {

            if (color == null) {
                color = "#e6e6e6";
            }
            if (typeof color === "string") {
                this.ColorHash = color;
                this.Color = parseInt(color.substring(1, 7), 16);
            } else {
                this.Color = color;
                this.ColorHash = "#" + Right('000000' + color.toString(16), 6);
            }
            //el color puede ser un número o un  color hash
            if (this.ColorHash.substring(1, 1) !== '#') {
                this.ColorHash = "#" + Right('000000' + color.toString(16), 6);
            }

            this.R = parseInt(this.ColorHash.substring(1, 3), 16);
            this.G = parseInt(this.ColorHash.substring(3, 5), 16);
            this.B = parseInt(this.ColorHash.substring(5, 7), 16);
            this.RGB = [this.R, this.G, this.B];
            this.Luminosidad = (0.269 * this.R + 0.587 * this.G + 0.114 * this.B) / 255;

            this.Inc = function(val) {
                var ret = "#", v;
                for (var i = 0; i < 3; i++)
                    ret += Right('00' + (v = (v = this.RGB[i] + val) > 255 ? 255 : v).toString(16), 2);
                return ret;
            };
            this.Dec = function(val) {
                var ret = "#", v;
                for (var i = 0; i < 3; i++)
                    ret += Right('00' + (v = (v = this.RGB[i] - val) < 0 ? 0 : v).toString(16), 2);
                return ret;
            };
        }
        , DateTime: function() {
            function getDaySuffix(a) {
                var b = "" + a,
                    c = b.length,
                    d = parseInt(b.substring(c - 2, c - 1)),
                    e = parseInt(b.substring(c - 1));
                if (c == 2 && d == 1)
                    return "th";
                switch (e) {
                    case 1:
                        return "st";
                        break;
                    case 2:
                        return "nd";
                        break;
                    case 3:
                        return "rd";
                        break;
                    default:
                        return "th";
                        break;
                }
                ;
            }
            ;

            this.getDoY = function(a) {
                var b = new Date(a.getFullYear(), 0, 1);
                return Math.ceil((a - b) / 86400000);
            }

            this.date = arguments.length == 0 ? new Date() : new Date(arguments);

            this.weekdays = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
            this.months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
            this.daySuf = new Array("st", "nd", "rd", "th");

            this.day = {
                index: {
                    week: "0" + this.date.getDay(),
                    month: (this.date.getDate() < 10) ? "0" + this.date.getDate() : this.date.getDate()
                },
                name: this.weekdays[this.date.getDay()],
                of: {
                    week: ((this.date.getDay() < 10) ? "0" + this.date.getDay() : this.date.getDay()) + getDaySuffix(this.date.getDay()),
                    month: ((this.date.getDate() < 10) ? "0" + this.date.getDate() : this.date.getDate()) + getDaySuffix(this.date.getDate())
                }
            }

            this.month = {
                index: (this.date.getMonth() + 1) < 10 ? "0" + (this.date.getMonth() + 1) : this.date.getMonth() + 1,
                name: this.months[this.date.getMonth()]
            };

            this.year = this.date.getFullYear();

            this.time = {
                hour: {
                    meridiem: (this.date.getHours() > 12) ? (this.date.getHours() - 12) < 10 ? "0" + (this.date.getHours() - 12) : this.date.getHours() - 12 : (this.date.getHours() < 10) ? "0" + this.date.getHours() : this.date.getHours(),
                    military: (this.date.getHours() < 10) ? "0" + this.date.getHours() : this.date.getHours(),
                    noLeadZero: {
                        meridiem: (this.date.getHours() > 12) ? this.date.getHours() - 12 : this.date.getHours(),
                        military: this.date.getHours()
                    }
                },
                minute: (this.date.getMinutes() < 10) ? "0" + this.date.getMinutes() : this.date.getMinutes(),
                seconds: (this.date.getSeconds() < 10) ? "0" + this.date.getSeconds() : this.date.getSeconds(),
                milliseconds: (this.date.getMilliseconds() < 100) ? (this.date.getMilliseconds() < 10) ? "00" + this.date.getMilliseconds() : "0" + this.date.getMilliseconds() : this.date.getMilliseconds(),
                meridiem: (this.date.getHours() > 12) ? "PM" : "AM"
            };

            this.sym = {
                d: {
                    d: this.date.getDate(),
                    dd: (this.date.getDate() < 10) ? "0" + this.date.getDate() : this.date.getDate(),
                    ddd: this.weekdays[this.date.getDay()].substring(0, 3),
                    dddd: this.weekdays[this.date.getDay()],
                    ddddd: ((this.date.getDate() < 10) ? "0" + this.date.getDate() : this.date.getDate()) + getDaySuffix(this.date.getDate()),
                    m: this.date.getMonth() + 1,
                    mm: (this.date.getMonth() + 1) < 10 ? "0" + (this.date.getMonth() + 1) : this.date.getMonth() + 1,
                    mmm: this.months[this.date.getMonth()].substring(0, 3),
                    mmmm: this.months[this.date.getMonth()],
                    yy: ("" + this.date.getFullYear()).substr(2, 2),
                    yyyy: this.date.getFullYear()
                },
                t: {
                    h: (this.date.getHours() > 12) ? this.date.getHours() - 12 : this.date.getHours(),
                    hh: (this.date.getHours() > 12) ? (this.date.getHours() - 12) < 10 ? "0" + (this.date.getHours() - 12) : this.date.getHours() - 12 : (this.date.getHours() < 10) ? "0" + this.date.getHours() : this.date.getHours(),
                    hhh: this.date.getHours(),
                    m: this.date.getMinutes(),
                    mm: (this.date.getMinutes() < 10) ? "0" + this.date.getMinutes() : this.date.getMinutes(),
                    s: this.date.getSeconds(),
                    ss: (this.date.getSeconds() < 10) ? "0" + this.date.getSeconds() : this.date.getSeconds(),
                    ms: this.date.getMilliseconds(),
                    mss: Math.round(this.date.getMilliseconds() / 10) < 10 ? "0" + Math.round(this.date.getMilliseconds() / 10) : Math.round(this.date.getMilliseconds() / 10),
                    msss: (this.date.getMilliseconds() < 100) ? (this.date.getMilliseconds() < 10) ? "00" + this.date.getMilliseconds() : "0" + this.date.getMilliseconds() : this.date.getMilliseconds()
                }
            };

            this.formats = {
                compound: {
                    commonLogFormat: this.sym.d.dd + "/" + this.sym.d.mmm + "/" + this.sym.d.yyyy + ":" + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    exif: this.sym.d.yyyy + ":" + this.sym.d.mm + ":" + this.sym.d.dd + " " + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    /*iso1: "",
                     iso2: "",*/
                    mySQL: this.sym.d.yyyy + "-" + this.sym.d.mm + "-" + this.sym.d.dd + " " + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    postgreSQL1: this.sym.d.yyyy + "." + this.getDoY(this.date),
                    postgreSQL2: this.sym.d.yyyy + "" + this.getDoY(this.date),
                    soap: this.sym.d.yyyy + "-" + this.sym.d.mm + "-" + this.sym.d.dd + "T" + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss + "." + this.sym.t.mss,
                    //unix: "",
                    xmlrpc: this.sym.d.yyyy + "" + this.sym.d.mm + "" + this.sym.d.dd + "T" + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    xmlrpcCompact: this.sym.d.yyyy + "" + this.sym.d.mm + "" + this.sym.d.dd + "T" + this.sym.t.hhh + "" + this.sym.t.mm + "" + this.sym.t.ss,
                    wddx: this.sym.d.yyyy + "-" + this.sym.d.m + "-" + this.sym.d.d + "T" + this.sym.t.h + ":" + this.sym.t.m + ":" + this.sym.t.s
                },
                constants: {
                    atom: this.sym.d.yyyy + "-" + this.sym.d.mm + "-" + this.sym.d.dd + "T" + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    cookie: this.sym.d.dddd + ", " + this.sym.d.dd + "-" + this.sym.d.mmm + "-" + this.sym.d.yy + " " + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    iso8601: this.sym.d.yyyy + "-" + this.sym.d.mm + "-" + this.sym.d.dd + "T" + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    rfc822: this.sym.d.ddd + ", " + this.sym.d.dd + " " + this.sym.d.mmm + " " + this.sym.d.yy + " " + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    rfc850: this.sym.d.dddd + ", " + this.sym.d.dd + "-" + this.sym.d.mmm + "-" + this.sym.d.yy + " " + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    rfc1036: this.sym.d.ddd + ", " + this.sym.d.dd + " " + this.sym.d.mmm + " " + this.sym.d.yy + " " + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    rfc1123: this.sym.d.ddd + ", " + this.sym.d.dd + " " + this.sym.d.mmm + " " + this.sym.d.yyyy + " " + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    rfc2822: this.sym.d.ddd + ", " + this.sym.d.dd + " " + this.sym.d.mmm + " " + this.sym.d.yyyy + " " + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    rfc3339: this.sym.d.yyyy + "-" + this.sym.d.mm + "-" + this.sym.d.dd + "T" + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    rss: this.sym.d.ddd + ", " + this.sym.d.dd + " " + this.sym.d.mmm + " " + this.sym.d.yy + " " + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss,
                    w3c: this.sym.d.yyyy + "-" + this.sym.d.mm + "-" + this.sym.d.dd + "T" + this.sym.t.hhh + ":" + this.sym.t.mm + ":" + this.sym.t.ss
                },
                pretty: {
                    a: this.sym.t.hh + ":" + this.sym.t.mm + "." + this.sym.t.ss + this.time.meridiem + " " + this.sym.d.dddd + " " + this.sym.d.ddddd + " of " + this.sym.d.mmmm + ", " + this.sym.d.yyyy,
                    b: this.sym.t.hh + ":" + this.sym.t.mm + " " + this.sym.d.dddd + " " + this.sym.d.ddddd + " of " + this.sym.d.mmmm + ", " + this.sym.d.yyyy
                }
            };
        }
        , CalcuarCotización: function(difStock, PrecioInicial, Maximo, Minimo, Tramo) {
            var valorRedondeo;
            var max = Maximo > Minimo ? Maximo : Minimo;
            var min = Maximo > Minimo ? Minimo : Maximo;
            var dff = Maximo > Minimo ? difStock: (-1*difStock);
            
            //console.log(Tramo);
            if(Tramo.toString().indexOf(".") > 0)
                valorRedondeo = Math.pow(10, Tramo.toString().split(".")[1].length);
            else
                valorRedondeo =  Tramo*100;
            var PrecioActual = PrecioInicial;
            
            if (dff >= 0) {
                var valorAIncrementar = Math.abs(Math.round(difStock * (/*Maximo -*/ PrecioInicial) * valorRedondeo) / valorRedondeo);
                var trmos = parseInt(valorAIncrementar / Tramo);
                PrecioActual = PrecioInicial + trmos * Tramo;
                if (PrecioActual > max)
                    PrecioActual = max;

            } else  {
                var valorADecrementar = Math.abs(Math.round(difStock * (PrecioInicial  /**(Cantidad_Bebidas/2) - Minimo*/) * valorRedondeo) / valorRedondeo);
                var trmos = parseInt(valorADecrementar / Tramo);
                PrecioActual = PrecioInicial - trmos * Tramo;
                if (PrecioActual < min)
                    PrecioActual = min;
            }
            return PrecioActual;

        }
    };
})();

