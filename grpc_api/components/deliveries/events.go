package deliveries

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingDelivery(delivery *pb.Delivery) bool
	OnRemovingSubscribe(fn func(delivery *pb.Delivery) bool)
}

const deliveryEvents = "deliveryEvents"

type events struct {
	publisher events2.Publisher
	delivery  *pb.Delivery
	cancel    bool
}

func NewEvents(publisher events2.Publisher) Events {
	return &events{publisher: publisher}
}

func (e *events) OnRemovingSubscribe(fn func(delivery *pb.Delivery) bool) {
	onRemoving := func() {
		if !e.cancel {
			errorhandler.TryCatchError(func() {
				e.cancel = fn(e.delivery)
			}, func(err error) {
				e.cancel = true
			})
		}
	}
	e.publisher.Subscribe(deliveryEvents, &onRemoving)
}

func (e *events) RemovingDelivery(delivery *pb.Delivery) bool {
	e.delivery = delivery
	e.publisher.Publish(deliveryEvents)
	result := e.cancel
	e.cancel = false
	return result
}
