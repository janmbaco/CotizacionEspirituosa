package families

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingFamily(family *pb.Family) bool
	Subscribe(fn func(family *pb.Family))
}

const familyEvents = "familyEvents"

type events struct {
	publisher events2.Publisher
	family    *pb.Family
	cancel    bool
}

func NewEvents(publisher events2.Publisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(family *pb.Family) bool) {
	e.publisher.Subscribe(familyEvents, func() {
		if !e.cancel {
			errorhandler.TryCatchError(func() {
				e.cancel = fn(e.family)
			}, func(err error) {
				e.cancel = true
			})
		}
	})
}

func (e *events) RemovingFamily(family *pb.Family) bool {
	e.family = family
	e.publisher.Publish(familyEvents)
	result := e.cancel
	e.cancel = false
	return result
}
