package groups

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	events2 "github.com/janmbaco/go-infrastructure/events"
	"strconv"
)

type Subscription uint8

const (
	Removing Subscription = iota
	Changed
)

type Events interface {
	RemovingGroup(group *pb.Group)
	ChangedGroup(group *pb.Group)
	Subscribe(subscription Subscription, fn func(group *pb.Group))
}

const groupEvents = "groupEvents"

type events struct {
	publisher events2.EventPublisher
	group     *pb.Group
}

func NewEvents(publisher events2.EventPublisher) *events {
	return &events{publisher: publisher}
}

func (e *events) Subscribe(subscription Subscription, fn func(group *pb.Group)) {
	e.publisher.Subscribe(groupEvents+strconv.Itoa(int(subscription)), func() {
		fn(e.group)
	})
}

func (e *events) RemovingGroup(group *pb.Group) {
	e.group = group
	e.publisher.Publish(groupEvents + strconv.Itoa(int(Removing)))
}

func (e *events) ChangedGroup(group *pb.Group) {
	e.group = group
	e.publisher.Publish(groupEvents + strconv.Itoa(int(Changed)))
}
