package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/deliveries"
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

func (s *DeliveryServer) Get(_ *pb.NullRequest, stream ps.Delivery_GetServer) error {
	common.NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *DeliveryServer) Set(_ context.Context, delivery *pb.Delivery) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(delivery)), nil
}

func (s *DeliveryServer) Remove(_ context.Context, delivery *pb.Delivery) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(delivery)), nil
}
