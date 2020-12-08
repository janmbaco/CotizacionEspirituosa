package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/products"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/core"
)

type ProductServer struct {
	*ps.UnimplementedProductServer
	store   redux.Store
	actions *products.Actions
	entity  products.Entity
}

func (s *ProductServer) Get(_ *pb.NullRequest, stream ps.Product_GetServer) error {
	common.NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *ProductServer) Set(_ context.Context, product *pb.Product) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(product)), nil
}

func (s *ProductServer) Remove(_ context.Context, product *pb.Product) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(product)), nil
}
