package impls

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
)

type StatusService struct {
	*ps.UnimplementedStatusServiceServer
}

func (this *StatusService) GetStatus(context.Context, *models.StatusRequest) (*models.StatusResponse, error){
	return  &models.StatusResponse{ Status: "OK"}, nil
}