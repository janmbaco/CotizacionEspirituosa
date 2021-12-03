package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/deliveries"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/src"
)

type DeliveryServer struct {
	*ps.UnimplementedDeliveryServer
	store   redux.Store
	actions *deliveries.Actions
}

func NewDeliveryServer(store redux.Store, actions *deliveries.Actions) *DeliveryServer {
	return &DeliveryServer{store: store, actions: actions}
}

func (s *DeliveryServer) Get(_ context.Context, _ *pb.NullRequest) (*pb.Deliveries, error) {
	return s.store.GetStateOf(deliveries.Selector).(*pb.Deliveries), nil
}

func (s *DeliveryServer) Set(_ context.Context, delivery *pb.Delivery) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(delivery)), nil
}

func (s *DeliveryServer) Remove(_ context.Context, delivery *pb.Delivery) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(delivery)), nil
}

func (s *DeliveryServer) Subscribe(_ *pb.NullRequest, stream ps.Delivery_SubscribeServer) error {
	NewStateSender(s.store, deliveries.Selector, stream).Initialize()
	return nil
}
