package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/groups"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
)

type GroupServer struct {
	*ps.UnimplementedGroupServer
	*BaseServer
	actions *groups.Actions
	entity  *groups.Entity
}

func (s *GroupServer) Get(_ *pb.NullRequest, stream ps.Delivery_GetServer) error {
	s.subscribeReceiver(s.entity, common.NewReceiver(stream))
	return nil
}

func (s *GroupServer) Set(_ context.Context, group *pb.Group) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Set.With(group)), nil
}

func (s *GroupServer) Remove(_ context.Context, group *pb.Group) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Remove.With(group)), nil
}
