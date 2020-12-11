//+build wireinject

package container

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/app"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/abstracts"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/deliveries"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/families"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/groups"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/items"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/products"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/global"
	"github.com/janmbaco/go-infrastructure/config"
)

func NewConfigHandler(file string) config.ConfigHandler {
	return config.NewFileConfigHandler(file)
}

func NewInfrastructure(context *global.Context) *app.Infrastructure {
	wire.Build(
		app.NewInfrastructure,
		products.NewProductsInfrastructure,
		items.NewItemsInfrastructure,
		groups.NewGroupsInfrastructure,
		families.NewFamiliesInfrastructure,
		deliveries.NewDeliveriesInfrastructure,
		abstracts.NewAbstractsInfrastructure,
	)
	return &app.Infrastructure{}
}
