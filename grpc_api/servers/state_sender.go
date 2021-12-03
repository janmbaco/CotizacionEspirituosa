package servers

import (
	redux "github.com/janmbaco/go-redux/src"
	"google.golang.org/grpc"
)

type StateSender interface {
	Initialize()
}

type stateSender struct {
	store   redux.Store
	selector string
	stream  grpc.ServerStream
	channel chan interface{}
	receiver func(interface{})
}

func NewStateSender(store redux.Store, selector string, stream grpc.ServerStream) *stateSender {
	stateSender := &stateSender{store: store, selector: selector, stream: stream, channel: make(chan interface{}, 1)}
	stateSender.receiver = func(state interface{}) {
		stateSender.channel <- state
	}
	return stateSender
}

func (this *stateSender) Initialize() {
	this.store.SubscribeTo(this.selector, &this.receiver)
	for {
		
		if this.stream.SendMsg(<-this.channel) != nil {
			this.store.UnSubscribeFrom(this.selector, &this.receiver)
			break
		}
	}
}

