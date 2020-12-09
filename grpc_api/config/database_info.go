package config

type DataBaseInfo struct {
	Engine       string `json:"engine"`
	Host         string `json:"host"`
	Port         string `json:"port"`
	Name         string `json:"name"`
	UserName     string `json:"user_name"`
	UserPassword string `json:"user_password"`
}

func NewDataBaseInfo(engine string, host string, port string, name string, userName string, userPassword string) *DataBaseInfo {
	return &DataBaseInfo{Engine: engine, Host: host, Port: port, Name: name, UserName: userName, UserPassword: userPassword}
}
