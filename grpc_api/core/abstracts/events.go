package abstracts

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingAbstract(abstract *pb.Abstract) bool
	Subscribe(fn func(abstract *pb.Abstract))
}

const abstractEvents = "abstractEvents"

type events struct {
	publisher events2.Publisher
	abstract  *pb.Abstract
	cancel    bool
}

func NewEvents(publisher events2.Publisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(fn func(abstract *pb.Abstract) bool) {
	e.publisher.Subscribe(abstractEvents, func() {
		if !e.cancel {
			errorhandler.TryCatchError(func() {
				e.cancel = fn(e.abstract)
			}, func(err error) {
				e.cancel = true
			})
		}
	})
}

func (e *events) RemovingAbstract(abstract *pb.Abstract) bool {
	e.abstract = abstract
	e.publisher.Publish(abstractEvents)
	result := e.cancel
	e.cancel = false
	return result
}
