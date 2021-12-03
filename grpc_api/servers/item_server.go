package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/items"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/src"
)

type ItemServer struct {
	*ps.UnimplementedItemServer
	store   redux.Store
	actions *items.Actions
}

func NewItemServer(store redux.Store, actions *items.Actions) *ItemServer {
	return &ItemServer{store: store, actions: actions}
}

func (s *ItemServer) Get(_ context.Context, _ *pb.NullRequest) (*pb.Items, error) {
	return s.store.GetStateOf(items.Selector).(*pb.Items), nil
}

func (s *ItemServer) Set(_ context.Context, item *pb.Item) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(item)), nil
}

func (s *ItemServer) Remove(_ context.Context, item *pb.Item) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(item)), nil
}

func (s *ItemServer) Subscribe(_ *pb.NullRequest, stream ps.Item_SubscribeServer) error {
	NewStateSender(s.store, items.Selector, stream).Initialize()
	return nil
}
