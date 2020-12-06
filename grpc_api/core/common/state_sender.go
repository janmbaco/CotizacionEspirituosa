package common

import (
	redux "github.com/janmbaco/go-redux/core"
	"google.golang.org/grpc"
)

type StateSender interface {
	Initialize()
}

type stateSender struct {
	store   redux.Store
	entity  redux.StateEntity
	stream  grpc.ServerStream
	channel chan interface{}
}

func NewStateSender(store redux.Store, entity redux.StateEntity, stream grpc.ServerStream) *stateSender {
	return &stateSender{store: store, entity: entity, stream: stream, channel: make(chan interface{}, 1)}
}

func (this *stateSender) Initialize() {
	this.store.Subscribe(this.entity, this.receiver)
	for {
		if this.stream.SendMsg(<-this.channel) != nil {
			this.store.UnSubscribe(this.entity, this.receiver)
			break
		}
	}
}

func (this *stateSender) receiver(state interface{}) {
	this.channel <- state
}
