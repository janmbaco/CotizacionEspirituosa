package items

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

type WhereFunc func(item *models.Item) bool

type Repository interface {
	Insert(item *models.Item) *models.Item
	Select(whereFunc WhereFunc) []*models.Item
	Update(item *models.Item, whereFunc WhereFunc) []*models.Item
	Delete(whereFunc WhereFunc) []*models.Item
}
