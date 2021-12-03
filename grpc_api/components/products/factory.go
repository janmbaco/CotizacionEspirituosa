//+build wireinject

package products

import (
	"github.com/google/wire"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/global"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"reflect"
)

func NewProductsInfrastructure(context *global.Context) *Infrastructure {
	wire.Build(newInfrastructure, NewActions, NewService, NewRepository, newDataAccess, newEvents)
	return &Infrastructure{}
}

func newEvents(context *global.Context) Events {
	return NewEvents(context.Publisher)
}

func newDataAccess(context *global.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Product{}))
}
