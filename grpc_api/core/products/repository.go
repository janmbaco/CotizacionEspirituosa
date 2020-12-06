package products

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

type WhereFunc func(product *models.Product) bool

type Repository interface {
	Insert(product *models.Product) *models.Product
	Select(whereFunc WhereFunc) []*models.Product
	Update(productName string, whereFunc WhereFunc) []*models.Product
	Delete(whereFunc WhereFunc) []*models.Product
}
