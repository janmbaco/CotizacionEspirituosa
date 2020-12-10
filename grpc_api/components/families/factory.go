//+build wireinject

package families

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/app"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"reflect"
)

func NewFamiliesInfrastructure(context *app.Context) *Infrastructure {
	wire.Build(newInfrastructure, NewActions, NewEntity, NewService, NewRepository, newDataAccess, newEvents)
	return &Infrastructure{}
}

func newEvents(context *app.Context) Events {
	return NewEvents(context.Publisher)
}

func newDataAccess(context *app.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Family{}), reflect.TypeOf(&pb.Family{}), GetIds)
}
