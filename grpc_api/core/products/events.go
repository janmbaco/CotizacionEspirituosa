package products

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingProduct(product *pb.Product)
	Subscribe(fn func(product *pb.Product))
}

const productEvents = "productEvents"

type events struct {
	publisher events2.Publisher
	product   *pb.Product
}

func NewEvents(publisher events2.Publisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(product *pb.Product)) {
	e.publisher.Subscribe(productEvents, func() {
		fn(e.product)
	})
}

func (e *events) RemovingProduct(product *pb.Product) {
	e.product = product
	e.publisher.Publish(productEvents)
}
