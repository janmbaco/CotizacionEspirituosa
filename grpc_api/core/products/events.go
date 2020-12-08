package products

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingProduct(product *pb.Product) bool
	Subscribe(fn func(product *pb.Product))
}

const productEvents = "productEvents"

type events struct {
	publisher events2.Publisher
	product   *pb.Product
	cancel    bool
}

func NewEvents(publisher events2.Publisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(product *pb.Product) bool) {
	e.publisher.Subscribe(productEvents, func() {
		if !e.cancel {
			errorhandler.TryCatchError(func() {
				e.cancel = fn(e.product)
			}, func(err error) {
				e.cancel = true
			})
		}
	})
}

func (e *events) RemovingProduct(product *pb.Product) bool {
	e.product = product
	e.publisher.Publish(productEvents)
	result := e.cancel
	e.cancel = false
	return result
}
