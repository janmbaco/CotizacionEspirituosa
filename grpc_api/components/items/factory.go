//+build wireinject

package items

import (
	"github.com/google/wire"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/global"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"reflect"
)

func NewItemsInfrastructure(context *global.Context) *Infrastructure {
	wire.Build(newInfrastructure, NewActions, NewEntity, NewService, NewRepository, newDataAccess)
	return &Infrastructure{}
}

func newDataAccess(context *global.Context) persistence.DataAccess {
	return persistence.NewDataAccess(context.DB, reflect.TypeOf(&pb.Item{}), reflect.TypeOf(&pb.Item{}), GetIds)
}
