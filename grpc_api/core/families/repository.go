package families

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

type WhereFunc func(family *models.Family) bool

type Repository interface {
	Insert(family *models.Family) *models.Family
	Select(whereFunc WhereFunc) []*models.Family
	Update(familyName string, whereFunc WhereFunc) []*models.Family
	Delete(whereFunc WhereFunc) []*models.Family
}
