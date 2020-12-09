package events

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/deliveries"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/groups"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/items"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/products"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	redux "github.com/janmbaco/go-redux/core"
)

type EventsManager interface {
	OnRemovingAbstract(abstract *pb.Abstract) bool
	OnRemovingGroup(group *pb.Group) bool
	OnRemovingDelivery(delivery *pb.Delivery) bool
	OnRemovingFamily(family *pb.Family) bool
	OnRemovingProduct(product *pb.Product) bool
}

type eventsManager struct {
	store             redux.Store
	groupsActions     *groups.Actions
	deliveriesActions *deliveries.Actions
	itemsActions      *items.Actions
	productsActions   *products.Actions
}

func NewEventsManager(store redux.Store, groupsActions *groups.Actions, deliveriesActions *deliveries.Actions, itemsActions *items.Actions, productsActions *products.Actions) EventsManager {
	return &eventsManager{store: store, groupsActions: groupsActions, deliveriesActions: deliveriesActions, itemsActions: itemsActions, productsActions: productsActions}
}

func (e eventsManager) OnRemovingAbstract(abstract *pb.Abstract) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.groupsActions.RemoveByAbstract.With(abstract))
	}, func(err error) {
		cancel = true
	})
	return cancel
}

func (e eventsManager) OnRemovingGroup(group *pb.Group) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.deliveriesActions.RemoveByGroup.With(group))
	}, func(err error) {
		cancel = true
	})
	return cancel
}

func (e eventsManager) OnRemovingDelivery(delivery *pb.Delivery) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.itemsActions.RemoveByDelivery.With(delivery))
	}, func(err error) {
		cancel = true
	})
	return cancel
}

func (e eventsManager) OnRemovingFamily(family *pb.Family) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.productsActions.RemoveByFamily.With(family))
	}, func(err error) {
		cancel = true
	})
	return cancel
}

func (e eventsManager) OnRemovingProduct(product *pb.Product) bool {
	var cancel bool
	errorhandler.TryCatchError(func() {
		e.store.Dispatch(e.itemsActions.RemoveByProduct.With(product))
	}, func(err error) {
		cancel = true
	})
	return cancel
}
