CREATE TABLE Propiedades
(
	Nombre VARCHAR(150) PRIMARY KEY
,	Valor VARCHAR(300) NULL
);

CREATE TABLE Grupo_Bebidas (
	Id_G_Bebida NUMERIC(3,0) PRIMARY KEY
,	Nombre VARCHAR(150) UNIQUE
,   Tipos_Genericos NUMERIC(1,0) NULL
,   Color NUMERIC(10,0) NULL
,   Orden NUMERIC(3,0) NULL   
);

CREATE TABLE Bebidas (
	Id_Bebida NUMERIC(5,0) PRIMARY KEY
,	Id_G_Bebida NUMERIC(3,0) REFERENCES 
		Grupo_Bebidas (Id_G_Bebida) ON DELETE CASCADE
							 ON UPDATE CASCADE
, 	Nombre VARCHAR(150) NOT NULL
, 	Cantidad_Botella NUMERIC(5,0) NOT NULL
, 	Cantidad_Stock NUMERIC(10,0) NULL
);

CREATE TABLE Tipo_Servicios (
	Id_T_Servicio NUMERIC(3,0) PRIMARY KEY
,	Nombre VARCHAR(150) UNIQUE
,	Cantidad NUMERIC(5,0) NOT NULL
,	Color NUMERIC(10,0) NULL
);

CREATE TABLE Sesiones (
	Id_Sesion NUMERIC(5,0) PRIMARY KEY
,	Inicio DATETIME NOT NULL
,	Fin	DATETIME NULL
,	Pausada NUMERIC(1,0) NULL
, 	CHECK (Fin > Inicio)
);

CREATE TABLE TPV (
    Id_TPV NUMERIC(3,0) PRIMARY KEY
,   Nombre VARCHAR(20) NOT NULL
);

CREATE TABLE Acciones (
 	Id_Sesion NUMERIC(5,0) NOT NULL REFERENCES
		Sesiones(Id_Sesion) ON DELETE CASCADE
					    ON UPDATE CASCADE
,   Id_Accion NUMERIC(5,0) NOT NULL
,   Tipo_Accion NUMERIC(2,0) NOT NULL
,   Id_TPV NUMERIC(3,0) NOT NULL REFERENCES
        TPV(Id_TPV) ON DELETE CASCADE
                    ON UPDATE CASCADE
,   PRIMARY KEY (Id_Sesion, Id_Accion)
);

CREATE TABLE Acciones_TPV(
   	Id_Sesion NUMERIC(5,0) NOT NULL REFERENCES
		Sesiones(Id_Sesion) ON DELETE CASCADE
					    ON UPDATE CASCADE
,   Id_Accion NUMERIC(5,0) NOT NULL REFERENCES
        Acciones(Id_Accion) ON DELETE CASCADE
                            ON UPDATE CASCADE
,   Id_TPV NUMERIC(3,0) NOT NULL REFERENCES
        TPV(Id_TPV) ON DELETE CASCADE
                    ON UPDATE CASCADE
,   PRIMARY KEY (Id_Sesion, Id_Accion, Id_TPV)
);

CREATE TABLE Bebidas_Sesiones(
	Id_Sesion NUMERIC(5,0) NOT NULL REFERENCES
		Sesiones(Id_Sesion) ON DELETE CASCADE
					    ON UPDATE CASCADE
,	Id_Bebida NUMERIC(5,0) NOT NULL REFERENCES
		Bebidas(Id_Bebida) ON DELETE CASCADE
					   ON UPDATE CASCADE
,	Cantidad_Stock NUMERIC(10, 0) NULL 
,	PRIMARY KEY (Id_Sesion, Id_Bebida)
);

CREATE TABLE Servicios (
	Id_Sesion	NUMERIC(5,0) NOT NULL REFERENCES
		Sesiones(Id_Sesion) ON DELETE CASCADE 
					    ON UPDATE CASCADE
,	Id_Servicio NUMERIC(5,0) NOT NULL PRIMARY KEY
, 	Fecha DATETIME NOT NULL
,   Id_TPV NUMERIC(3,0) NOT NULL REFERENCES
        TPV(Id_TPV) ON DELETE CASCADE
                    ON UPDATE CASCADE
);

CREATE TABLE Ordenes (
    Id_Servicio NUMERIC(5,0) NOT NULL REFERENCES 
        Servicios(Id_Servicio) ON DELETE CASCADE
                                ON UPDATE CASCADE
,   Id_Orden NUMERIC(2,0) NOT NULL 
,   Id_T_Servicio NUMERIC(3,0) NOT NULL REFERENCES
        Tipos_Servicio(Id_T_Servicio) ON DELETE CASCADE
                                        ON UPDATE CASCADE
,   Id_Bebida NUMERIC(5,0) NOT NULL REFERENCES
        Bebidas(Id_Bebida) ON DELETE CASCADE
                            ON UPDATE CASCADE
,   Precio NUMERIC(5,2) NOT NULL
,   PRIMARY KEY (Id_Servicio, Id_Orden, Id_T_Servicio, Id_Bebida)
);

CREATE TABLE Precios (
	Id_G_Bebida NUMERIC(3,0) NOT NULL REFERENCES
		Grupo_Bebidas(Id_G_Bebida) ON DELETE CASCADE
							 ON UPDATE CASCADE
,	Id_T_Servicio NUMERIC(3,0) NOT NULL REFERENCES
		Tipo_Servicios(Id_T_Servicio) ON DELETE CASCADE
							    ON UPDATE CASCADE
, 	Precio NUMERIC(5,2) NULL
, 	Maximo NUMERIC(5,2) NULL
,	Minimo NUMERIC(5,2) NULL
, 	Tramo NUMERIC(5,2) NULL
, 	PRIMARY KEY (Id_G_Bebida, Id_T_Servicio)
);

CREATE TABLE Cotizacion (
	Id_Bebida NUMERIC(5,0) NOT NULL REFERENCES
		Bebidas(Id_Bebida) ON DELETE CASCADE
				        ON UPDATE CASCADE
,	Id_T_Servicio NUMERIC(3,0) NOT NULL REFERENCES
		Tipos_Servicio(Id_T_Servicio) ON DELETE CASCADE
							   ON UPDATE CASCADE
,	Precio NUMERIC(5,2) NULL
,   Fijado NUMERIC(1,0) NULL
, 	PRIMARY KEY (Id_Bebida, Id_T_Servicio) 
);