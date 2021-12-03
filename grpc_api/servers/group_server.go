package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/groups"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/src"
)

type GroupServer struct {
	*ps.UnimplementedGroupServer
	store   redux.Store
	actions *groups.Actions
}

func NewGroupServer(store redux.Store, actions *groups.Actions) *GroupServer {
	return &GroupServer{store: store, actions: actions}
}

func (s *GroupServer) Get(_ context.Context, _ *pb.NullRequest) (*pb.Groups, error) {
	return s.store.GetStateOf(groups.Selector).(*pb.Groups), nil
}

func (s *GroupServer) Set(_ context.Context, group *pb.Group) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(group)), nil
}

func (s *GroupServer) Remove(_ context.Context, group *pb.Group) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(group)), nil
}

func (s *GroupServer) Subscribe(_ *pb.NullRequest, stream ps.Group_SubscribeServer) error {
	NewStateSender(s.store, groups.Selector, stream).Initialize()
	return nil
}
