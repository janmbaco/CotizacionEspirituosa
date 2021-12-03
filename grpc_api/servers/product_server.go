package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/products"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/src"
)

type ProductServer struct {
	*ps.UnimplementedProductServer
	store   redux.Store
	actions *products.Actions
}

func NewProductServer(store redux.Store, actions *products.Actions) *ProductServer {
	return &ProductServer{store: store, actions: actions}
}

func (s *ProductServer) Get(_ context.Context, _ *pb.NullRequest) (*pb.Products, error) {
	return s.store.GetStateOf(products.Selector).(*pb.Products), nil
}

func (s *ProductServer) Set(_ context.Context, product *pb.Product) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(product)), nil
}

func (s *ProductServer) Remove(_ context.Context, product *pb.Product) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(product)), nil
}

func (s *ProductServer) Subscribe(_ *pb.NullRequest, stream ps.Product_SubscribeServer) error {
	NewStateSender(s.store, products.Selector, stream).Initialize()
	return nil
}
