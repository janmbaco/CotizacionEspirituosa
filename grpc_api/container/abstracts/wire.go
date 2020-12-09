//+build wireinject

package abstracts

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/context"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/abstracts"
	"reflect"
)

func NewAbstractsContainer(context *context.Context) *Container {
	wire.Build(newContainer, abstracts.NewActions, abstracts.NewEntity, abstracts.NewService, abstracts.NewRepository, newDataAccess, newEvents)
	return &Container{}
}

func newEvents(context *context.Context) abstracts.Events {
	return abstracts.NewEvents(context.Publisher)
}

func newDataAccess(context *context.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Abstract{}), reflect.TypeOf(&pb.Abstract{}), abstracts.GetIds)
}
