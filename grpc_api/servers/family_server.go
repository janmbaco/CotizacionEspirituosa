package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/families"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/core"
)

type FamilyServer struct {
	*ps.UnimplementedFamilyServer
	store   redux.Store
	actions *families.Actions
	entity  families.Entity
}

func (s *FamilyServer) Get(_ *pb.NullRequest, stream ps.Family_GetServer) error {
	common.NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *FamilyServer) Set(_ context.Context, family *pb.Family) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(family)), nil
}

func (s *FamilyServer) Remove(_ context.Context, family *pb.Family) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(family)), nil
}
