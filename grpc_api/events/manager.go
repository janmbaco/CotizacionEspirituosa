package events

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/deliveries"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/groups"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/items"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/products"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	redux "github.com/janmbaco/go-redux/core"
)

type Manager interface {
	OnRemovingAbstract(abstract *pb.Abstract) bool
	OnRemovingGroup(group *pb.Group) bool
	OnRemovingDelivery(delivery *pb.Delivery) bool
	OnRemovingFamily(family *pb.Family) bool
	OnRemovingProduct(product *pb.Product) bool
}

type manager struct {
	store             redux.Store
	groupsActions     *groups.Actions
	deliveriesActions *deliveries.Actions
	itemsActions      *items.Actions
	productsActions   *products.Actions
}

func NewManager(store redux.Store, groupsActions *groups.Actions, deliveriesActions *deliveries.Actions, itemsActions *items.Actions, productsActions *products.Actions) Manager {
	return &manager{store: store, groupsActions: groupsActions, deliveriesActions: deliveriesActions, itemsActions: itemsActions, productsActions: productsActions}
}

func (e manager) OnRemovingAbstract(abstract *pb.Abstract) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.groupsActions.RemoveByAbstract.With(abstract))
	}, func(err error) {
		cancel = true
	})
	return cancel
}

func (e manager) OnRemovingGroup(group *pb.Group) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.deliveriesActions.RemoveByGroup.With(group))
	}, func(err error) {
		cancel = true
	})
	return cancel
}

func (e manager) OnRemovingDelivery(delivery *pb.Delivery) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.itemsActions.RemoveByDelivery.With(delivery))
	}, func(err error) {
		cancel = true
	})
	return cancel
}

func (e manager) OnRemovingFamily(family *pb.Family) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.productsActions.RemoveByFamily.With(family))
	}, func(err error) {
		cancel = true
	})
	return cancel
}

func (e manager) OnRemovingProduct(product *pb.Product) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.itemsActions.RemoveByProduct.With(product))
	}, func(err error) {
		cancel = true
	})
	return cancel
}
