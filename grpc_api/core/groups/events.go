package groups

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingGroup(group *pb.Group)
	ChangedGroup(group *pb.Group)
	Subscribe(fn func(group *pb.Group))
}

const groupEvents = "groupEvents"

type events struct {
	publisher events2.Publisher
	group     *pb.Group
}

func NewEvents(publisher events2.Publisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(group *pb.Group)) {
	e.publisher.Subscribe(groupEvents, func() {
		fn(e.group)
	})
}

func (e *events) RemovingGroup(group *pb.Group) {
	e.group = group
	e.publisher.Publish(groupEvents)
}
