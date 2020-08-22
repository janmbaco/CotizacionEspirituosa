package services

import (
	"context"

	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services/grpc_services"
)

type StatusService struct {
	grpc_services.UnimplementedStatusServiceServer
}

func (this *StatusService) GetStatus(context.Context, *models.StatusRequest) (*models.StatusResponse, error) {
	return &models.StatusResponse{Status: "OK"}, nil
}
