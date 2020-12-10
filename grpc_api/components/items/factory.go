//+build wireinject

package items

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/app"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"reflect"
)

func NewItemsInfrastructure(context *app.Context) *Infrastructure {
	wire.Build(newInfrastructure, NewActions, NewEntity, NewService, NewRepository, newDataAccess)
	return &Infrastructure{}
}

func newDataAccess(context *app.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Item{}), reflect.TypeOf(&pb.Item{}), GetIds)
}
