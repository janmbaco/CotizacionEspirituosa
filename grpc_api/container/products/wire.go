//+build wireinject

package products

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/context"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/products"
	"reflect"
)

func NewProductsContainer(context *context.Context) *Container {
	wire.Build(newContainer, products.NewActions, products.NewEntity, products.NewService, products.NewRepository, newDataAccess, newEvents)
	return &Container{}
}

func newEvents(context *context.Context) products.Events {
	return products.NewEvents(context.Publisher)
}

func newDataAccess(context *context.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Product{}), reflect.TypeOf(&pb.Product{}), products.GetIds)
}
