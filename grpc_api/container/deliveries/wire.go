//+build wireinject

package deliveries

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/context"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/deliveries"
	"reflect"
)

func NewDeliveriesContainer(context *context.Context) *Container {
	wire.Build(newContainer, deliveries.NewActions, deliveries.NewEntity, deliveries.NewService, deliveries.NewRepository, newDataAccess, newEvents)
	return &Container{}
}

func newEvents(context *context.Context) deliveries.Events {
	return deliveries.NewEvents(context.Publisher)
}

func newDataAccess(context *context.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Delivery{}), reflect.TypeOf(&pb.Delivery{}), deliveries.GetIds)
}
