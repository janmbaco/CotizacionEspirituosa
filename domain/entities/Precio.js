class Precio {
    constructor(grupoBebidas, tipoServicio, precio, máximo, mínimo, tramo) {
        this.GrupoBebidas = grupoBebidas
        this.TipoServicio = tipoServicio
        this.Precio = precio
        this.Máximo = máximo
        this.Mínimo = mínimo
        this.Tramo = tramo
    }
}

module.exports = Precio