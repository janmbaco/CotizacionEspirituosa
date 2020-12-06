package items

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	events2 "github.com/janmbaco/go-infrastructure/events"
	"strconv"
)

type Subscription uint8

const (
	Removing Subscription = iota
	Changed
)

type Events interface {
	RemovingItem(item *pb.Item)
	ChangedItem(item *pb.Item)
	Subscribe(subscription Subscription, fn func(item *pb.Item))
}

const itemEvents = "itemEvents"

type events struct {
	publisher events2.EventPublisher
	item      *pb.Item
}

func NewEvents(publisher events2.EventPublisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(subscription Subscription, fn func(abstract *pb.Item)) {
	e.publisher.Subscribe(itemEvents+strconv.Itoa(int(subscription)), func() {
		fn(e.item)
	})
}

func (e *events) ChangedItem(item *pb.Item) {
	e.item = item
	e.publisher.Publish(itemEvents + strconv.Itoa(int(Changed)))
}

func (e *events) RemovingAbstract(item *pb.Item) {
	e.item = item
	e.publisher.Publish(itemEvents + strconv.Itoa(int(Removing)))
}
