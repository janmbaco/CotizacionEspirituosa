package servers

import (
	"context"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/items"
	redux "github.com/janmbaco/go-redux/core"
)

type ItemServer struct {
	*ps.UnimplementedItemServer
	store   redux.Store
	actions *items.Actions
	entity  items.Entity
}

func NewItemServer(store redux.Store, actions *items.Actions, entity items.Entity) *ItemServer {
	return &ItemServer{store: store, actions: actions, entity: entity}
}

func (s *ItemServer) Get(_ *pb.NullRequest, stream ps.Item_GetServer) error {
	NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *ItemServer) Set(_ context.Context, item *pb.Item) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(item)), nil
}

func (s *ItemServer) Remove(_ context.Context, item *pb.Item) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(item)), nil
}
