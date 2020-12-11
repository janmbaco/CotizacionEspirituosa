package global

type DBEngine uint8

const (
	SqlServer DBEngine = iota
	Postgres
	MySql
	Sqlite
)

type DataBaseInfo struct {
	Engine       DBEngine `json:"engine"`
	Host         string   `json:"host"`
	Port         string   `json:"port"`
	Name         string   `json:"name"`
	UserName     string   `json:"user_name"`
	UserPassword string   `json:"user_password"`
}

func NewDataBaseInfo(engine DBEngine, host string, port string, name string, userName string, userPassword string) *DataBaseInfo {
	return &DataBaseInfo{Engine: engine, Host: host, Port: port, Name: name, UserName: userName, UserPassword: userPassword}
}
