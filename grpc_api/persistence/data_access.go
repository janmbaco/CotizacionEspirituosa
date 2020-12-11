package persistence

import (
	"github.com/janmbaco/go-infrastructure/errorhandler"
	"github.com/janmbaco/go-infrastructure/logs"
	"gorm.io/gorm"
	"reflect"
)

type FnGetIds func(dataArray interface{}) []int64

type DataAccess interface {
	Insert(datarow interface{}) interface{}
	Select(datafilter interface{}) interface{}
	Update(datafilter interface{}, datarow interface{}) interface{}
	Delete(datafilter interface{}) interface{}
}

type dataAccess struct {
	db         *gorm.DB
	datamodel  interface{}
	modelType  reflect.Type
	filterType reflect.Type
	GetIds     FnGetIds
}

func NewDataAccess(db *gorm.DB, modelType reflect.Type, filterType reflect.Type, getIds FnGetIds) DataAccess {
	result := &dataAccess{db: db, datamodel: reflect.New(modelType.Elem()).Interface(), modelType: modelType, filterType: filterType, GetIds: getIds}
	_ = result.db.AutoMigrate(result.datamodel)
	return result
}

func (r *dataAccess) Insert(datarow interface{}) interface{} {
	errorhandler.CheckNilParameter(map[string]interface{}{"datarow": datarow})

	if reflect.TypeOf(datarow) != r.modelType {
		panic("The datarow does not belong to this datamodel!")
	}

	r.db.Model(r.datamodel).Create(datarow)
	return datarow
}

func (r *dataAccess) Select(datafilter interface{}) interface{} {
	errorhandler.CheckNilParameter(map[string]interface{}{"datafilter": datafilter})

	if reflect.TypeOf(datafilter) != r.filterType {
		panic("The datafilter does not belong to this dataAccess!")
	}
	slice := reflect.MakeSlice(reflect.SliceOf(r.modelType), 0, 0)
	pointer := reflect.New(slice.Type())
	pointer.Elem().Set(slice)
	dataArray := pointer.Interface()
	result := r.db.Model(r.datamodel).Where(datafilter).Find(dataArray)
	if result.Error != nil {
		logs.Log.Info(result.Error.Error())
	}
	return reflect.ValueOf(dataArray).Elem().Interface()
}

func (r *dataAccess) Update(datafilter interface{}, datarow interface{}) interface{} {
	errorhandler.CheckNilParameter(map[string]interface{}{"datafilter": datafilter, "datarow": datarow})

	r.db.Model(r.datamodel).Where(datafilter).Updates(datarow)
	return r.Select(datafilter)
}

func (r *dataAccess) Delete(datafilter interface{}) interface{} {
	errorhandler.CheckNilParameter(map[string]interface{}{"datafilter": datafilter})

	dataArray := r.Select(datafilter)
	r.db.Model(r.datamodel).Delete(datafilter, r.GetIds(dataArray))
	return dataArray
}
