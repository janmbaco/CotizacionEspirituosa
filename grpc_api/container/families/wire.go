//+build wireinject

package families

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/context"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/families"
	"reflect"
)

func NewFamiliesContainer(context *context.Context) *Container {
	wire.Build(newContainer, families.NewActions, families.NewEntity, families.NewService, families.NewRepository, newDataAccess, newEvents)
	return &Container{}
}

func newEvents(context *context.Context) families.Events {
	return families.NewEvents(context.Publisher)
}

func newDataAccess(context *context.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Family{}), reflect.TypeOf(&pb.Family{}), families.GetIds)
}
