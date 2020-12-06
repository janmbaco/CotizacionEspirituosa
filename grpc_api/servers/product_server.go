package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/products"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
)

type ProductServer struct {
	*ps.UnimplementedProductServer
	*BaseServer
	actions *products.Actions
	entity  *products.Entity
}

func (s *ProductServer) Get(_ *pb.NullRequest, stream ps.Product_GetServer) error {
	s.subscribeReceiver(s.entity, common.NewReceiver(stream))
	return nil
}

func (s *ProductServer) Set(_ context.Context, product *pb.Product) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Set.With(product)), nil
}

func (s *ProductServer) Remove(_ context.Context, product *pb.Product) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Remove.With(product)), nil
}
