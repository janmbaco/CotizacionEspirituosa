package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/families"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/src"
)

type FamilyServer struct {
	*ps.UnimplementedFamilyServer
	store   redux.Store
	actions *families.Actions
}

func NewFamilyServer(store redux.Store, actions *families.Actions) *FamilyServer {
	return &FamilyServer{store: store, actions: actions}
}

func (s *FamilyServer) Get(_ context.Context, _ *pb.NullRequest) (*pb.Families, error) {
	return s.store.GetStateOf(families.Selector).(*pb.Families), nil
}

func (s *FamilyServer) Set(_ context.Context, family *pb.Family) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(family)), nil
}

func (s *FamilyServer) Remove(_ context.Context, family *pb.Family) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(family)), nil
}

func (s *FamilyServer) Subscribe(_ *pb.NullRequest, stream ps.Family_SubscribeServer) error {
	NewStateSender(s.store, families.Selector, stream).Initialize()
	return nil
}
