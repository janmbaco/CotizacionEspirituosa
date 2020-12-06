package abstracts

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingAbstract(abstract *pb.Abstract)
	Subscribe(fn func(abstracts *pb.Abstract))
}

const abstractEvents = "abstractEvents"

type events struct {
	publisher events2.EventPublisher
	abstract  *pb.Abstract
}

func NewEvents(publisher events2.EventPublisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(abstract *pb.Abstract)) {
	e.publisher.Subscribe(abstractEvents, func() {
		fn(e.abstract)
	})
}

func (e *events) RemovingAbstract(abstract *pb.Abstract) {
	e.abstract = abstract
	e.publisher.Publish(abstractEvents)
}
