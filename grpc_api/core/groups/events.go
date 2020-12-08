package groups

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingGroup(group *pb.Group) bool
	Subscribe(fn func(group *pb.Group))
}

const groupEvents = "groupEvents"

type events struct {
	publisher events2.Publisher
	group     *pb.Group
	cancel    bool
}

func NewEvents(publisher events2.Publisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(group *pb.Group) bool) {
	e.publisher.Subscribe(groupEvents, func() {
		if !e.cancel {
			errorhandler.TryCatchError(func() {
				e.cancel = fn(e.group)
			}, func(err error) {
				e.cancel = true
			})
		}
	})
}

func (e *events) RemovingGroup(group *pb.Group) bool {
	e.group = group
	e.publisher.Publish(groupEvents)
	result := e.cancel
	e.cancel = false
	return result
}
