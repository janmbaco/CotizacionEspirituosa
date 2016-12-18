"use strict";

var sqlite3 = require('sqlite3').verbose()
    , fs = require("fs")
    , path = require("path")
    , global = require("./global")
    , db = module.exports = (function() {
        var archDatabase = path.resolve(".\\basededatos\\CotizacionEspirituosa.db")
            , database = null
            , arrTablas = [{Tabla: 'Propiedades', Indice: 'Nombre'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS  Propiedades \
                                            ( \
                                                Nombre VARCHAR(150) PRIMARY KEY \
                                            ,	Valor VARCHAR(300) NULL \
                                            );'},
                {Tabla: 'Grupos_Bebida', Indice: 'Id_G_Bebida'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Grupos_Bebida (	\
                                                 Id_G_Bebida NUMERIC(3,0) PRIMARY KEY	\
                                            ,	Nombre VARCHAR(150) UNIQUE\n\
                                            ,   Tipos_Genericos NUMERIC(1,0) \n\
                                            ,   Color NUMERIC(10) NULL \n\
                                            ,   Orden NUMERIC(3,0) NULL \
                                             );'}
                , {Tabla: 'Bebidas', Indice: 'Id_Bebida'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Bebidas (\n\
                                        Id_Bebida NUMERIC(5,0) PRIMARY KEY\n\
                                    ,	Id_G_Bebida NUMERIC(3,0) REFERENCES \n\
                                            Grupo_Bebidas (Id_G_Bebida) ON DELETE CASCADE\n\
                                                                 ON UPDATE CASCADE\n\
                                    , 	Nombre VARCHAR(150) NOT NULL\n\
                                    , 	Cantidad_Botella NUMERIC(5,0) NOT NULL\n\
                                    , 	Cantidad_Stock NUMERIC(10,0) NULL\n\
                                    );'}
                , {Tabla: 'Tipos_Servicio', Indice: 'Id_T_Servicio'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Tipos_Servicio (	\
                                                    Id_T_Servicio NUMERIC(3,0) PRIMARY KEY	\
                                            ,	Nombre VARCHAR(150) UNIQUE	\
                                            ,	Cantidad NUMERIC(5,0) NOT NULL	\n\
                                            ,   Color NUMERIC(10,0) NULL \
                                            );'}
                , {Tabla: 'Sesiones', Indice: 'Id_Sesion'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Sesiones (\n\
                                                Id_Sesion NUMERIC(5,0) PRIMARY KEY\n\
                                            ,	Inicio DATETIME NOT NULL\n\
                                            ,	Fin	DATETIME NULL\n\
                                            ,	Pausada NUMERIC(1,0) NULL\n\
                                            , 	CHECK (Fin > Inicio)\n\
                                            );'}
                , {Tabla: 'Bebidas_Sesiones', Indice: 'CAST(Id_Sesion AS STRING)+CAST(Id_Bebida AS STRING)'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Bebidas_Sesiones(\n\
                                                Id_Sesion NUMERIC(5,0) NOT NULL REFERENCES \n\
                                                    Sesiones(Id_Sesion) ON DELETE CASCADE \n\
                                                                        ON UPDATE CASCADE\n\
                                            ,	Id_Bebida NUMERIC(5,0) NOT NULL REFERENCES \n\
                                                    Bebidas(Id_Bebida) ON DELETE CASCADE \n\
                                                                        ON UPDATE CASCADE\n\
                                            ,	Cantidad_Stock NUMERIC(10, 0) NULL \n\
                                            ,	PRIMARY KEY (Id_Sesion, Id_Bebida)\n\
                                            );'}
                , {Tabla: 'TPV', Indice: 'Id_TPV'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS  TPV ( \n\
                                                Id_TPV NUMERIC(3,0) PRIMARY KEY \n\
                                            ,   Nombre VARCHAR(20) NOT NULL \n\
                                            ,   IP  VARCHAR(20) NOT NULL \n\
                                            ,   Fecha DATETIME NULL \n\
                                            );'}
                , {Tabla: 'Acciones', Indice: 'Id_Accion'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS  Acciones ( \n\
                                                Id_Accion NUMERIC(8,0) PRIMARY KEY \n\
                                            ,   Tipo_Accion NUMERIC(2,0) NOT NULL \n\
                                            ,   Descripcion VARCHAR(150) NULL\n\
                                            ,   Id_TPV NUMERIC(3,0) NOT NULL REFERENCES \n\
                                                    TPV(Id_TPV) ON DELETE CASCADE \n\
                                                                ON UPDATE CASCADE \n\
                                            ,   Fecha DATETIME NOT NULL\n\
                                            );'}
                , {Tabla: 'Precios', Indice: 'CAST(Id_G_Bebida AS STRING)+CAST(Id_T_Servicio AS STRING)'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Precios (\n\
                                                Id_G_Bebida NUMERIC(3,0) NOT NULL REFERENCES\n\
                                                    Grupo_Bebidas(Id_G_Bebida) ON DELETE CASCADE\n\
                                                                         ON UPDATE CASCADE\n\
                                            ,	Id_T_Servicio NUMERIC(3,0) NOT NULL REFERENCES\n\
                                                    Tipo_Servicios(Id_T_Servicio) ON DELETE CASCADE\n\
                                                                            ON UPDATE CASCADE\n\
                                            , 	Precio NUMERIC(5,2) NULL\n\
                                            , 	Maximo NUMERIC(5,2) NULL\n\
                                            ,	Minimo NUMERIC(5,2) NULL\n\
                                            , 	Tramo NUMERIC(5,2) NULL\n\
                                            , 	PRIMARY KEY (Id_G_Bebida, Id_T_Servicio)\n\
                                            );'}
                , {Tabla: 'Cotizacion', Indice: 'CAST(Id_Bebida AS STRING)+CAST(Id_T_Servicio AS STRING)'
                    , CreacionTabla: 'CREATE TABLE  IF NOT EXISTS  Cotizacion (\n\
                                                Id_Bebida NUMERIC(5,0) NOT NULL REFERENCES\n\
                                                    Bebidas(Id_Bebida) ON DELETE CASCADE\n\
                                                                    ON UPDATE CASCADE\n\
                                            ,	Id_T_Servicio NUMERIC(3,0) NOT NULL REFERENCES\n\
                                                    Tipos_Servicio(Id_T_Servicio) ON DELETE CASCADE\n\
                                                                           ON UPDATE CASCADE\n\
                                            ,	Precio NUMERIC(5,2) NULL\n\
                                            ,   Fijado NUMERIC(1,0) NULL\n\
                                            , 	PRIMARY KEY (Id_Bebida, Id_T_Servicio) \n\
                                            );'}

                , {Tabla: 'Permisos', Indice: 'Id_Permiso'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Permisos (\n\
                                            Id_Permiso NUMERIC(3,0) PRIMARY KEY\n\
                                        ,   Paquete VARCHAR(50) NOT NULL\n\
                                        ,   Funcion VARCHAR(50) NOT NULL\n\
                                        );'}
                , {Tabla: 'Perfiles', Indice: 'Id_Perfil'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Perfiles (\n\
                                           Id_Perfil NUMERIC(3,0) PRIMARY KEY\n\
                                        ,   Nombre VARCHAR(50) NOT NULL\n\
                                        );'}
                , {Tabla: 'Perfiles_Permisos', Indice: 'CAST(Id_Perfil AS STRING)+CAST(Id_Permiso AS STRING)'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Perfiles_Permisos (\n\
                                            Id_Perfil NUMERIC(3,0) NOT NULL REFERENCES\n\
                                                    Perfiles(Id_Perfil) ON DELETE CASCADE \n\
                                                                        ON UPDATE CASCADE\n\
                                        ,   Id_Permiso NUMERIC(3,0) NOT NULL REFERENCES\n\
                                                    Permisos(Id_Permiso) ON DELETE CASCADE\n\
                                                                        ON UPDATE CASCADE\n\
                                        ,   PRIMARY KEY(Id_Perfil, Id_Permiso)\n\
                                        );'}
                , {Tabla: 'Empleados', Indice: 'Id_Empleado'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Empleados (\n\
                                            Id_Empleado NUMERIC(3,0) PRIMARY KEY\n\
                                        ,   Nombre VARCHAR(150) NOT NULL\n\
                                        ,   Id_Perfil NUMERIC(3,0) NOT NULL REFERENCES\n\
                                                    Perfiles(Id_Perfil) ON DELETE SET NULL\n\
                                                                        ON UPDATE CASCADE\n\
                                        ,   Sal VARCHAR(200) NULL\n\
                                        ,   Password VARCHAR(200) NULL\n\
                                        ,   Color NUMERIC(10) NULL \n\
                                        );'}
                , {Tabla: 'Servicios', Indice: 'Id_Servicio'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Servicios ( \n\
                                                Id_Sesion NUMERIC(8,0) NOT NULL REFERENCES \n\
                                                    Sesiones(Id_Sesion) ON DELETE CASCADE \n\
                                                                    ON UPDATE CASCADE \n\
                                            ,	Id_Servicio NUMERIC(5,0) NOT NULL PRIMARY KEY\n\
                                            , 	Fecha DATETIME NOT NULL \n\
                                            ,   Id_TPV NUMERIC(3,0) NOT NULL REFERENCES \n\
                                                    TPV(Id_TPV) ON DELETE CASCADE \n\
                                                                ON UPDATE CASCADE \n\
                                            ,   Id_Empleado NUMERIC(5,0) NOT NULL REFERENCES \n\
                                                    Empleados(Id_Empleado) ON DELETE CASCADE\n\
                                                                           ON UPDATE CASCADE\n\
                                            );'}
                , {Tabla: 'Ordenes', Indice: 'Id_Servicio'
                    , CreacionTabla: 'CREATE TABLE IF NOT EXISTS Ordenes ( \n\
                                            Id_Servicio NUMERIC(8,0) NOT NULL REFERENCES \n\
                                                    Servicios (Id_Servicio) ON DELETE CASCADE\n\
                                                                            ON UPDATE CASCADE\n\
                                            ,   Id_Orden NUMERIC (2,0) NOT NULL \n\
                                            ,	Id_T_Servicio NUMERIC(3,0) NOT NULL REFERENCES \n\
                                                    Tipo_Servicios (Id_T_Servicio) ON DELETE CASCADE \n\
                                                                            ON UPDATE CASCADE \n\
                                            ,   Id_Bebida NUMERIC(3,0) NOT NULL REFERENCES \n\
                                                    Bebidas (Id_Bebida) ON DELETE CASCADE\n\
                                                                        ON UPDATE CASCADE\n\
                                            ,   Cantidad NUMERIC(3,0) NOT NULL\n\
                                            ,   Precio NUMERIC(5,2) NOT NULL \n\
                                            ,	PRIMARY KEY (Id_Servicio, Id_Orden, Id_T_Servicio, Id_Bebida) \n\
                                            );'}
            ]
            , arrValoresxDefecto = [
                "INSERT INTO Propiedades VALUES('Precio','3.5');"
                    , "INSERT INTO Propiedades VALUES('Maximo', '4');"
                    , "INSERT INTO Propiedades VALUES('Minimo', '2');"
                    , "INSERT INTO Propiedades VALUES('Tramo', '0.1');"
                    , "INSERT INTO Propiedades VALUES('Cantidad_Botella','700');"
                    , "INSERT INTO Propiedades VALUES('Cantidad_Stock', '5');"
                    , "INSERT INTO Propiedades VALUES('Contraseña', 'ioLRjQAU1etqsQ+cjSJ2WZwrlOsdmastADxo+v0Zo8mrQqFJzqEf2gNNIzn3dTfSh0hrz4pq4vRyzN30HQGVzO6vSWp2IjO/MgW33Lc++KZT3r8V3NHykpGz7cD+vpzMC1zqGOZ+AtjeB3WjzwrivKPmDKiOAFzVckB3hSCLOMo=');"
                    , "INSERT INTO Propiedades VALUES('Sal', 'F8sarAxrvL2UHf5J8DKV6Tlx3n0AN9g1qfYTzj/vDFdfcesVNTGWyZWkiRsyE7qkOANEvi/pymfHqG3aI+XGmVtMCcgiG6SXOCyyMFQy4VrZQQDMWd6rVk9i8fHrz39u+vZdR1BZnvaoGbKQFBb4WHxqpRzo4Pu9lNn1uMujK0o=');"
                    , "INSERT INTO Grupos_Bebida VALUES(0,'Whisky', 1, 15705344, 1);"
                    , "INSERT INTO Grupos_Bebida VALUES(1,'Ginebra',1 , 255, 2);"
                    , "INSERT INTO Grupos_Bebida VALUES(2,'Ron', 1, 11141120, 3);"
                    , "INSERT INTO Grupos_Bebida VALUES(3,'Vodka', 1, 11519721, 4);"
                    , "INSERT INTO Grupos_Bebida VALUES(4,'Brandy', 1, 3118772, 6);"
                    , "INSERT INTO Grupos_Bebida VALUES(5,'Tequila',1, 10508844, 5);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,0,'100 pipers', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,1,'Ballantines', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,2,'Cardhu', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,3,'Cutty sark', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,4,'Four Roses', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,5,'JB', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,6,'Jack Daniels', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,7,'Jameson', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,8,'Jhonnie Walker', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,9,'Passport', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,10,'Vat 69', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,11,'White Label', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(0,31,'Red Label', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,12,'Beefeater', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,13,'Gordon', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,14,'Larios', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,15,'Seagrams', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(1,16,'Tanqueray', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,17,'Arehucas', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,18,'Bacardi', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,19,'Barceló', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,20,'Brugal', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,21,'Cacique', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,22,'Havana Club', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,23,'Matusalem', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(2,24,'Negrita', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(3,25,'Absolut', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(3,26,'Smirnof', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(4,27,'Soberano', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(4,28,'Terry', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(4,29,'Veterano', 700, 3500);"
                    , "INSERT INTO  Bebidas(Id_G_Bebida, Id_Bebida, Nombre, Cantidad_Botella, Cantidad_Stock) VALUES(5,30,'José Cuervo', 700, 3500);"
                    , "INSERT INTO Tipos_Servicio(Id_T_Servicio, Nombre, Cantidad) VALUES (0, 'Copa', 50);"
                    , "INSERT INTO Tipos_Servicio(Id_T_Servicio, Nombre, Cantidad) VALUES (1, 'Chupito', 25);"
                    , "INSERT INTO Precios(Id_G_Bebida, Id_T_Servicio, Precio, Maximo, Minimo, Tramo) VALUES (-1, 0, 3.5, 4, 2, 0.1);"
                    , "INSERT INTO Precios(Id_G_Bebida, Id_T_Servicio, Precio, Maximo, Minimo, Tramo) VALUES (-1, 1, 1, 1, 1, 1);"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(0, 'cotización', 'IniciarSesión');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(1, 'cotización', 'ListarCotización');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(2, 'cotización', 'ListarGruposBebidaTiposServicio');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(3, 'cotización', 'SesiónIniciada');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(4, 'cotización', 'TiempoSesión');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(5, 'cotización', 'CerrarSesión');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(6, 'cotización', 'PausarSesión');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(7, 'cotización', 'ReanudarSesión');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(62, 'cotización', 'ComprobarCambios');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(8, 'propiedades', 'ListarPropiedades');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(9, 'propiedades', 'ModificarPropiedad');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(10, 'servicios.TiposServicio', 'ListarPrecios');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(11, 'servicios.Precios', 'Añadir');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(12, 'servicios.Precios', 'Modificar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(13, 'servicios.Precios', 'Quitar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(14, 'servicios.Servicio', 'QuitarDatos');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(15, 'servicios.Servicio', 'Quitar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(16, 'servicios.TiposServicio', 'Añadir');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(17, 'servicios.TiposServicio', 'Modificar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(18, 'servicios.TiposServicio', 'Quitar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(19, 'servicios', 'ListarTiposServicio');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(20, 'servicios', 'TotalTiposServicio');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(21, 'servicios.Servicio', 'Añadir');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(22, 'stock.GruposBebida', 'ListarPrecios');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(23, 'servicios.Precios', 'Añadir');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(24, 'servicios.Precios', 'Modificar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(25, 'servicios.Precios', 'Quitar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(26, 'stock.GruposBebida', 'ListarBebidas');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(27, 'stock.Bebidas', 'Añadir');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(28, 'stock.Bebidas', 'Modificar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(29, 'stock.Bebidas', 'Quitar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(30, 'stock.Bebidas', 'ListarTiposServicio');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(31, 'stock.Bebidas', 'CalcularRelacionInicial');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(32, 'servicios.TiposServicio', 'ObtenerPrecio');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(33, 'servicios.TiposServicio', 'FijarPrecio');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(34, 'servicios.TiposServicio', 'LiberarPrecio');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(35, 'servicios.TiposServicio', 'Cotizar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(36, 'stock', 'ListarGruposBebida');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(37, 'stock', 'AñadirGrupoBebida');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(38, 'stock', 'ModificarGrupoBebida');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(39, 'stock', 'QuitarGrupoBebida');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(40, 'stock', 'ListarBebidas');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(41, 'stock', 'TotalBebidas');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(42, 'stock', 'ListarStock');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(43, 'stock', 'StockBebida');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(44, 'stock', 'ReiniciarStock');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(45, 'stock', 'ModificarStockBebida');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(46, 'stock', 'ModificarStockBotellaBebida');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(47, 'empleados', 'Autenticar');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(48, 'empleados', 'AñadirEmpleado');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(49, 'empleados', 'ModificarEmpleado');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(50, 'empleados', 'QuitarEmpleado');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(51, 'empleados', 'ListarEmpleados');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(63, 'empleados', 'ListarPerfiles');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(52, 'empleados.Empleado', 'CambiarNombre');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(53, 'empleados.Empleado', 'CambiarContraseña');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(54, 'tpvs', 'AñadirTPV');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(55, 'tpvs', 'ModificarTPV');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(56, 'tpvs', 'QuitarTPV');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(57, 'tpvs', 'ListarTPV');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(58, 'tpvs', 'EstaRegistradoTPV');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(61, 'tpvs', 'RegistrarActualizacion');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(59, 'aplicación', 'VerificarContraseña');"
                    , "INSERT INTO Permisos(Id_Permiso, Paquete, Funcion) VALUES(60, 'aplicación', 'EmpleadoEnSesión');"
                    , "INSERT INTO Perfiles(Id_Perfil, Nombre) VALUES(-1, 'Anonimo');"
                    , "INSERT INTO Perfiles(Id_Perfil, Nombre) VALUES(0, 'Encargado');"
                    , "INSERT INTO Perfiles(Id_Perfil, Nombre) VALUES(1, 'Camarero');"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) VALUES(-1,1);"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) VALUES(-1,2);"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) VALUES(-1,3);"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) VALUES(-1,47);"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) VALUES(-1,51);"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) VALUES(-1,54);"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) VALUES(-1,59);"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) VALUES(-1,58);"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) VALUES(-1,60);"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) SELECT 0, Id_Permiso FROM Permisos;"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) SELECT 1, Id_Permiso FROM Permisos WHERE Funcion LIKE 'Listar%';"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) SELECT 1, Id_Permiso FROM Permisos WHERE Funcion LIKE 'Total%';"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) SELECT 1, Id_Permiso FROM Permisos WHERE Paquete = 'servicios.Servicio';"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) SELECT 1, Id_Permiso FROM Permisos WHERE Paquete = 'empleados.Empleado';"
                    , "INSERT INTO Perfiles_Permisos(Id_Perfil, Id_Permiso) SELECT 1, Id_Permiso FROM Permisos WHERE Id_Permiso IN (3,4,31,32,35,43,47,58,59,60,61,62);"
                    , "INSERT INTO Empleados(Id_Empleado, Nombre, Id_Perfil, Sal, Password) VALUES(0, 'Encargado', 0, 'Rj6BQ6HuBKcNMnFXEseXYmC1SQfe2cpxBggehCU0Auf5kCAuwg41yliDpP8YZLf7wq1gfXl4LMToNZiXQH6fNmDiKot1Q48EIqiU71DKHuGQaGxIaUwylIreNURTs8CHawDR3BiU4Ab2NQatwhyF5dVsR6RGVZiAlgSpnsg4dYU=', 'XGlPwlyoqTHZjTFvpC8kksfkAi8D2lCC3lSqlZrYZPqhaqYiALtz9WLLXBN33BcdrxKn8Q1jibV10JbxrliYzQlES4zFFMPZwPk+R6/QPSBK0Kzgf1opu3EJvDuzxY9KP9kBioVQYnGIauotiDrlQO9UFzEIfE1UBCdkQkvEOKw=');"
                    , "INSERT INTO Empleados(Id_Empleado, Nombre, Id_Perfil, Sal, Password) VALUES(1, 'Camarero', 1, 'lohTq83IZLvX3DN/KU0e1l55W7nt1BTllrCNvk1yycqjZgw5yQY2bONRK+5roziJzbQe2/oaP6wZ8rb8Oyr9/vynYDXh4Up6mpvrnKe2Y+zazOYv/CwjmPtRAN7PWCbrcjXc57LtbOrAuxB81zWU8MhUCEEQlQ4A/H6wYKRWxCQ=', '+EX7mk2m6/wu9RGiOaYyaQMcvhKGNrpisZ5ir8MFfxfVFGwHiRVzHJKxwf1qxlBqu59tK3d9AdJkte6dH7d90s3ZkJD14o3cHKETtu0rWaE+KIW63hnBnCOH8gbWEedy8oJc6KMuN9mbQ1eppKbnBS3mWc9jvHQyn4GXXDi9o0M=');"
            ]
            , Resultado = function() {
                var ObResultados;
                var self;
                return {
                    ObtenerResultados: function(EvObResults) {
                        ObResultados = EvObResults;
                    }/* evento function(results) */
                    , _self: function(_self) {
                        self = _self;
                    }
                    , fnResultado: function(error, results) {
                        if (error !== null) {
                            console.log("Error: " + this.sql + '\n' + error);
                            if (!global.isUndefined(ObResultados))
                                ObResultados(false, this.sql + '\n' + error, self);
                            return;
                        }
                        if (!global.isUndefined(ObResultados)) {
                            var rowsArray = [];
                            if (!global.isUndefined(results)) {
                                if (results.length > 0) {
                                    for (var i = 0; i < results.length; i++) {
                                        rowsArray[i] = new Array();
                                        for (var key in results[i])
                                            rowsArray[i].push(results[i][key]);
                                    }
                                }
                            }
                            ObResultados(true, rowsArray, self);
                        }
                    }
                };
            }
        , CrearTablas = function() {
            if (!database) {
                console.log('Error: no se ha cargado ninguna base de datos');
                return;
            }
            database.serialize(function() {
                var oResultado = new Resultado();
                var ArrCmdSql = [];
                for (var t = 0; t < arrTablas.length; t++)
                    ArrCmdSql[t] = arrTablas[t].CreacionTabla;
                database.exec(ArrCmdSql.join(" "), oResultado.fnResultado);

            });
        }
        , InsertarValoresxDefecto = function() {
            if (!database) {
                console.log('Error: no se ha cargado ninguna base de datos');
                return;
            }
            database.serialize(function() {
                var oResultado = new Resultado();
                database.exec(arrValoresxDefecto.join(" "), oResultado.fnResultado);
            });
        }
        , BorrarTablas = function(EvResultado) {
            if (!database) {
                console.log('Error: no se ha cargado ninguna base de datos');
                if (!global.isUndefined(EvResultado))
                    EvResultado(false, "Error: no se ha cargado ninguna base de datos", null);
                return;
            }
            database.serialize(
                function() {
                    var ArrCmdSql = [];
                    for (var t = 0; t < arrTablas.length; t++)
                        ArrCmdSql[t] = "DROP TABLE IF EXISTS " + arrTablas[t].Tabla + ";";
                    database.exec(ArrCmdSql);
                });
        }
        , ExecSQL = function(/* Comando SQL */cmdSQL, /* evento resultante */ EvObtenerResultados, _self) {
            if (!database) {
                console.log('Error: no se ha cargado ninguna base de datos');
                if (!global.isUndefined(EvObtenerResultados))
                    EvObtenerResultados(false, "Error: no se ha cargado ninguna base de datos", _self);
                return;
            }
            database.serialize(function() {
                var oResultado = new Resultado();
                oResultado.ObtenerResultados(EvObtenerResultados);
                oResultado._self(_self);
                if (typeof cmdSQL === "string")
                    database.all(cmdSQL, oResultado.fnResultado);
                else {
                    database.exec(cmdSQL.join(" "), oResultado.fnResultado);
                }
            });

        }
        , ObNuevoId = function(oTabla, EvObtenerNuevoId) {
            ExecSQL('SELECT COALESCE(MAX(' + oTabla.Indice + '),0)+1 AS Cantidad FROM ' + oTabla.Tabla + ';'
                , function(bExito, rowsArray) {
                    if (!global.isUndefined(EvObtenerNuevoId))
                        if (bExito)
                            EvObtenerNuevoId(rowsArray[0][0]);
                        else
                            EvObtenerNuevoId(0);
                }
            );
        }
        , ObDatosTabla = function(oTabla, EvObtenerResultados) {
            return ExecSQL('SELECT * FROM ' + oTabla.Tabla + ';', EvObtenerResultados);
        };

        try {
            //crear base de datos ...
            //existe el archivo
            var bExisteBasedeDatos = fs.existsSync(archDatabase);

            if (!bExisteBasedeDatos)
                fs.openSync(archDatabase, 'w');
            database = new sqlite3.Database(archDatabase, sqlite3.OPEN_READWRITE | sqlite3.CREATE
                , function(error) {
                    if (error !== null) {
                        console.log("No se ha podido crear la base de datos.\n" + error);
                        return;
                    }
                    //añadir las tablas una vez creada...
                    CrearTablas();
                    //si no existía el archivo añadir valores por defecto
                    if (!bExisteBasedeDatos)
                        InsertarValoresxDefecto();
                });
        } catch (e) {
            console.log("Error desconocido: " + e + ".");
            return;
        }


        return {
            /* variable de resultados para poder enviarlos cuando se ejecute los comando */
            Tablas: arrTablas

            , ReiniciarBaseDeDatos: function(EvResultado) {
                BorrarTablas(function(bExito, strMensaje) {
                    if (!bExito) {
                        if (!global.isUndefined(EvResultado))
                            EvResultado(bExito, strMensaje);
                        return;
                    }

                    //Creamos las tablas
                    var cmdSQL = [];
                    for (var t = 0; t < arrTablas.length; t++) {
                        cmdSQL[t] = arrTablas[t].CreacionTabla;
                    }
                    ExecSQL(cmdSQL, function(bExito, strMensaje) {
                        if (!bExito) {
                            if (!global.isUndefined(EvResultado))
                                EvResultado(bExito, "No se ha podido generar las tablas debido a: " + strMensaje);
                            return;
                        }
                        //añadir los valores por defecto
                        ExecSQL(arrValoresxDefecto, function(bExito, strMensaje) {
                            if (!bExito) {
                                if (!global.isUndefined(EvResultado))
                                    EvResultado(bExito, "Se han creado las tablas, pero no se han podido añadir los valores por defecto debido a: " + strMensaje);
                                return;
                            }
                            EvResultado(bExito, "Consulta ejecutada con éxito.");
                        });
                    });
                });
            }
            , EjecutarSQL: ExecSQL
            , Grupos_Bebida: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Grupos_Bebida], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Grupos_Bebida], EvObtenerId);
                }
            }
            , Bebidas: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Bebidas], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Bebidas], EvObtenerId);
                }
            }
            , Tipos_Servicio: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Tipos_Servicio], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Tipos_Servicio], EvObtenerId);
                }
            }
            , Sesiones: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Sesiones], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Sesiones], EvObtenerId);
                }
            }
            , Bebidas_Sesiones: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Bebidas_Sesiones], EvObtenerResultados);
                }
            }
            , TPV: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.TPV], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.TPV], EvObtenerId);
                }
            }
            , Acciones: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Acciones], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Acciones], EvObtenerId);
                }
            }
            , Acciones_TPV: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Acciones_TPV], EvObtenerResultados);
                }
            }
            , Servicios: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Servicios], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Servicios], EvObtenerId);
                }
            }
            , Ordenes: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Ordenes], EvObtenerResultados);
                }
            }
            , Precios: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Precios], EvObtenerResultados);
                }
            }
            , Cotización: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Cotización], EvObtenerResultados);
                }
            }
            , Propiedades: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Cotización], EvObtenerResultados);
                }
                , ObtenerPropiedades: function(Propiedades, EvObtResultados, _self) {
                    var cmdSQL = "SELECT Nombre, Valor FROM PROPIEDADES WHERE ";
                    if (typeof Propiedades === "string")
                        cmdSQL += "Nombre = '" + Propiedades + "';";
                    else
                        for (var i = 0, propiedad; propiedad = Propiedades[i], i < Propiedades.length; i++)
                            cmdSQL += (i === 0 ? " Nombre IN ( " : "") + "'" + propiedad + "'" + (i === Propiedades.length - 1 ? ");" : ",");
                    ExecSQL(cmdSQL, function(bExito, rowsArray, _self) {
                        if (!bExito) {
                            if (!global.isUndefined(EvObtResultados))
                                EvObtResultados(bExito, rowsArray, _self);
                            return;
                        }
                        //colocarlos todos en diccionario
                        var valores = {};
                        for (var i = 0; i < rowsArray.length; i++)
                            valores[rowsArray[i][0]] = rowsArray[i][1];
                        if (!global.isUndefined(EvObtResultados))
                            EvObtResultados(bExito, valores, _self);
                    }, _self);
                }
            }
            , Empleados: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Empleados], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Empleados], EvObtenerId);
                }
            }
            , Perfiles: {
                ObtenerDatosTabla: function(EvObtenerResultados) {
                    ObDatosTabla(arrTablas[global.Perfiles], EvObtenerResultados);
                }
                , ObtenerNuevoId: function(EvObtenerId) {
                    ObNuevoId(arrTablas[global.Perfiles], EvObtenerId);
                }
            }
        };
    })();


