package common

import (
	"google.golang.org/grpc"
)

type Receiver interface {
	Receive(state interface{})
}

type receiver struct {
	channel chan interface{}
}

func NewReceiver(stream grpc.ServerStream) *receiver {
	result := &receiver{channel: make(chan interface{}, 1)}
	go func() {
		for {
			stream.SendMsg(<-result.channel)
		}
	}()
	return result
}

func (this *receiver) Receive(state interface{}) {
	this.channel <- state
}
