package persistence

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/configs"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
)

func NewDB(info *configs.DataBaseInfo) *gorm.DB {
	errorhandler.CheckNilParameter(map[string]interface{}{"info": info})
	db, err := gorm.Open(newDialector(info), &gorm.Config{})
	errorhandler.TryPanic(err)
	return db
}

func newDialector(info *configs.DataBaseInfo) gorm.Dialector {
	switch info.Engine {
	case configs.SqlServer:
		return sqlserver.Open(fmt.Sprintf("sqlserver://%v:%v@%v:%v?database=%v", info.UserName, info.UserPassword, info.Host, info.Port, info.Name))
	case configs.Postgres:
		return postgres.Open(fmt.Sprintf("host=%v port=%v user=%v dbname=%v password=%v\"", info.Host, info.Port, info.UserName, info.Name, info.UserPassword))
	case configs.MySql:
		return mysql.Open(fmt.Sprintf("%v:%v@tcp(%v:%v)/%v?charset=utf8&parseTime=True&loc=Local", info.UserName, info.UserPassword, info.Host, info.Port, info.Name))
	case configs.Sqlite:
		_ = os.MkdirAll(filepath.Dir(info.Host), 0666)
		return sqlite.Open(info.Host)
	}
	return nil
}
