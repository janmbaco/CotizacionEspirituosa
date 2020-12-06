package families

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingAbstract(family *pb.Family)
	Subscribe(fn func(family *pb.Family))
}

const familyEvents = "familyEvents"

type events struct {
	publisher events2.EventPublisher
	family    *pb.Family
}

func NewEvents(publisher events2.EventPublisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(family *pb.Family)) {
	e.publisher.Subscribe(familyEvents, func() {
		fn(e.family)
	})
}

func (e *events) RemovingAbstract(family *pb.Family) {
	e.family = family
	e.publisher.Publish(familyEvents)
}
