package deliveries

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingDelivery(delivery *pb.Delivery)
	Subscribe(fn func(delivery *pb.Delivery))
}

const deliveryEvents = "deliveryEvents"

type events struct {
	publisher events2.EventPublisher
	delivery  *pb.Delivery
}

func NewEvents(publisher events2.EventPublisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(delivery *pb.Delivery)) {
	e.publisher.Subscribe(deliveryEvents, func() {
		fn(e.delivery)
	})
}

func (e *events) RemovingAbstract(delivery *pb.Delivery) {
	e.delivery = delivery
	e.publisher.Publish(deliveryEvents)
}
