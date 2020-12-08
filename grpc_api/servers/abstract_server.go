package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/abstracts"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/core"
)

type AbstractsServer struct {
	*ps.UnimplementedAbstractServer
	store   redux.Store
	actions *abstracts.Actions
	entity  abstracts.Entity
}

func (s *AbstractsServer) Get(_ *pb.NullRequest, stream ps.Abstract_GetServer) error {
	common.NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *AbstractsServer) Set(_ context.Context, abstract *pb.Abstract) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(abstract)), nil
}

func (s *AbstractsServer) Remove(_ context.Context, abstract *pb.Abstract) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(abstract)), nil
}
