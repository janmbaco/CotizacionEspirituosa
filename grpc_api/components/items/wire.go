//+build wireinject

package items

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/context"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"reflect"
)

func NewItemsContainer(context *context.Context) *Container {
	wire.Build(newContainer, NewActions, NewEntity, NewService, NewRepository, newDataAccess)
	return &Container{}
}

func newDataAccess(context *context.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Item{}), reflect.TypeOf(&pb.Item{}), GetIds)
}
