package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/deliveries"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/core"
)

type DeliveryServer struct {
	*ps.UnimplementedDeliveryServer
	store   redux.Store
	actions *deliveries.Actions
	entity  deliveries.Entity
}

func NewDeliveryServer(store redux.Store, actions *deliveries.Actions, entity deliveries.Entity) *DeliveryServer {
	return &DeliveryServer{store: store, actions: actions, entity: entity}
}

func (s *DeliveryServer) Get(_ *pb.NullRequest, stream ps.Delivery_GetServer) error {
	NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *DeliveryServer) Set(_ context.Context, delivery *pb.Delivery) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(delivery)), nil
}

func (s *DeliveryServer) Remove(_ context.Context, delivery *pb.Delivery) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(delivery)), nil
}
