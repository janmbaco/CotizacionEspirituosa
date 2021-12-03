package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/abstracts"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/src"
)

type AbstractServer struct {
	*ps.UnimplementedAbstractServer
	store   redux.Store
	actions *abstracts.Actions
}

func NewAbstractServer(store redux.Store, actions *abstracts.Actions) *AbstractServer {
	return &AbstractServer{store: store, actions: actions}
}

func (s *AbstractServer) Get(_ context.Context, _ *pb.NullRequest) (*pb.Abstracts, error) {
	return s.store.GetStateOf(abstracts.Selector).(*pb.Abstracts), nil
}

func (s *AbstractServer) Set(_ context.Context, abstract *pb.Abstract) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(abstract)), nil
}

func (s *AbstractServer) Remove(_ context.Context, abstract *pb.Abstract) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(abstract)), nil
}

func (s *AbstractServer) Subscribe(_ *pb.NullRequest, stream ps.Abstract_SubscribeServer) error {
	NewStateSender(s.store, abstracts.Selector, stream).Initialize()
	return nil
}
