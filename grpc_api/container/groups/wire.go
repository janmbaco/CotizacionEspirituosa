//+build wireinject

package groups

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/context"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/groups"
	"reflect"
)

func NewGroupsContainer(context *context.Context) *Container {
	wire.Build(newContainer, groups.NewActions, groups.NewEntity, groups.NewService, groups.NewRepository, newDataAccess, newEvents)
	return &Container{}
}

func newEvents(context *context.Context) groups.Events {
	return groups.NewEvents(context.Publisher)
}

func newDataAccess(context *context.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Group{}), reflect.TypeOf(&pb.Group{}), groups.GetIds)
}
