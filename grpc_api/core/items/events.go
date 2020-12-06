package items

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingItem(item *pb.Item)
	ChangedItem(item *pb.Item)
	Subscribe(fn func(item *pb.Item))
}

const itemEvents = "itemEvents"

type events struct {
	publisher events2.Publisher
	item      *pb.Item
}

func NewEvents(publisher events2.Publisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(abstract *pb.Item)) {
	e.publisher.Subscribe(itemEvents, func() {
		fn(e.item)
	})
}

func (e *events) RemovingAbstract(item *pb.Item) {
	e.item = item
	e.publisher.Publish(itemEvents)
}
