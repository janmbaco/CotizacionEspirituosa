//+build wireinject

package items

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/context"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/items"
	"reflect"
)

func NewItemsContainer(context *context.Context) *Container {
	wire.Build(newContainer, items.NewActions, items.NewEntity, items.NewService, items.NewRepository, newDataAccess)
	return &Container{}
}

func newDataAccess(context *context.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Item{}), reflect.TypeOf(&pb.Item{}), items.GetIds)
}
