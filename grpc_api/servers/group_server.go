package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/groups"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/core"
)

type GroupServer struct {
	*ps.UnimplementedGroupServer
	store   redux.Store
	actions *groups.Actions
	entity  groups.Entity
}

func NewGroupServer(store redux.Store, actions *groups.Actions, entity groups.Entity) *GroupServer {
	return &GroupServer{store: store, actions: actions, entity: entity}
}

func (s *GroupServer) Get(_ *pb.NullRequest, stream ps.Delivery_GetServer) error {
	NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *GroupServer) Set(_ context.Context, group *pb.Group) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(group)), nil
}

func (s *GroupServer) Remove(_ context.Context, group *pb.Group) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(group)), nil
}
