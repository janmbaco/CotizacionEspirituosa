package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/abstracts"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/core"
)

type AbstractServer struct {
	*ps.UnimplementedAbstractServer
	store   redux.Store
	actions *abstracts.Actions
	entity  abstracts.Entity
}

func NewAbstractServer(store redux.Store, actions *abstracts.Actions, entity abstracts.Entity) *AbstractServer {
	return &AbstractServer{store: store, actions: actions, entity: entity}
}

func (s *AbstractServer) Get(_ *pb.NullRequest, stream ps.Abstract_GetServer) error {
	NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *AbstractServer) Set(_ context.Context, abstract *pb.Abstract) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(abstract)), nil
}

func (s *AbstractServer) Remove(_ context.Context, abstract *pb.Abstract) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(abstract)), nil
}
