//+build wireinject

package abstracts

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/context"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"reflect"
)

func NewAbstractsContainer(context *context.Context) *Container {
	wire.Build(newContainer, NewActions, NewEntity, NewService, NewRepository, newDataAccess, newEvents)
	return &Container{}
}

func newEvents(context *context.Context) Events {
	return NewEvents(context.Publisher)
}

func newDataAccess(context *context.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Abstract{}), reflect.TypeOf(&pb.Abstract{}), GetIds)
}
