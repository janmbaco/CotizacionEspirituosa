package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/deliveries"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
)

type DeliveryServer struct {
	*ps.UnimplementedDeliveryServer
	*BaseServer
	actions *deliveries.Actions
	entity  deliveries.Entity
}

func (s *DeliveryServer) Get(_ *pb.NullRequest, stream ps.Delivery_GetServer) error {
	common.NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *DeliveryServer) Set(_ context.Context, delivery *pb.Delivery) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Set.With(delivery)), nil
}

func (s *DeliveryServer) Remove(_ context.Context, delivery *pb.Delivery) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Remove.With(delivery)), nil
}
