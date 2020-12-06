package deliveries

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

type WhereFunc func(delivery *models.Delivery) bool

type Repository interface {
	Insert(delivery *models.Delivery) *models.Delivery
	Select(whereFunc WhereFunc) []*models.Delivery
	Update(delivery *models.Delivery, whereFunc WhereFunc) []*models.Delivery
	Delete(whereFunc WhereFunc) []*models.Delivery
}
