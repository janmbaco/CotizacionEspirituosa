package app

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/abstracts"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/deliveries"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/families"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/groups"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/items"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/products"
)

type Infrastructure struct {
	AbstractsInfrastructure  *abstracts.Infrastructure
	DeliveriesInfrastructure *deliveries.Infrastructure
	FamiliesInfrastructure   *families.Infrastructure
	GroupsInfrastructure     *groups.Infrastructure
	ItemsInfrastructure      *items.Infrastructure
	ProductsInfrastructure   *products.Infrastructure
}

func NewInfrastructure(abstractsInfrastructure *abstracts.Infrastructure, deliveriesInfrastructure *deliveries.Infrastructure, familiesInfrastructure *families.Infrastructure, groupsInfrastructure *groups.Infrastructure, itemsInfrastructure *items.Infrastructure, productsInfrastructure *products.Infrastructure) *Infrastructure {
	return &Infrastructure{AbstractsInfrastructure: abstractsInfrastructure, DeliveriesInfrastructure: deliveriesInfrastructure, FamiliesInfrastructure: familiesInfrastructure, GroupsInfrastructure: groupsInfrastructure, ItemsInfrastructure: itemsInfrastructure, ProductsInfrastructure: productsInfrastructure}
}
