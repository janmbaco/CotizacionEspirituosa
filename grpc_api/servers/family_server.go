package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/families"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
)

type FamilyServer struct {
	*ps.UnimplementedFamilyServer
	*BaseServer
	actions *families.Actions
	entity  *families.Entity
}

func (s *FamilyServer) Get(_ *pb.NullRequest, stream ps.Family_GetServer) error {
	s.subscribeReceiver(s.entity, common.NewReceiver(stream))
	return nil
}

func (s *FamilyServer) Set(_ context.Context, family *pb.Family) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Set.With(family)), nil
}

func (s *FamilyServer) Remove(_ context.Context, family *pb.Family) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Remove.With(family)), nil
}
