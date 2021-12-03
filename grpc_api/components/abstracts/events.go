package abstracts

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Events interface {
	RemovingAbstract(abstract *pb.Abstract) bool
	OnRemovingSubscribe(fn func(abstract *pb.Abstract) bool)
}

const abstractEvents = "abstractEvents"

type events struct {
	publisher events2.Publisher
	abstract  *pb.Abstract
	cancel    bool
}

func NewEvents(publisher events2.Publisher) Events {
	return &events{publisher: publisher}
}

func (e *events) OnRemovingSubscribe(fn func(abstract *pb.Abstract) bool) {
	onRemoving := func() {
		if !e.cancel {
			errorhandler.TryCatchError(func() {
				e.cancel = fn(e.abstract)
			}, func(err error) {
				e.cancel = true
			})
		}
	}
	e.publisher.Subscribe(abstractEvents, &onRemoving)
}

func (e *events) RemovingAbstract(abstract *pb.Abstract) bool {
	e.abstract = abstract
	e.publisher.Publish(abstractEvents)
	result := e.cancel
	e.cancel = false
	return result
}
