package common

import (
	"github.com/janmbaco/go-infrastructure/errorhandler"
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
	return &dataAccess{db: db, modelType: modelType, filterType: filterType, GetIds: getIds}
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

	dataArray := reflect.MakeSlice(reflect.SliceOf(r.modelType), 0, 10)
	r.db.Model(r.modelType).Where(datafilter).Find(dataArray)
	return dataArray
}

func (r *dataAccess) Update(datafilter interface{}, datarow interface{}) interface{} {
	errorhandler.CheckNilParameter(map[string]interface{}{"datafilter": datafilter, "datarow": datarow})

	r.db.Model(r.datamodel).Where(datafilter).Updates(datarow)
	return r.Select(datafilter)
}

func (r *dataAccess) Delete(datafilter interface{}) interface{} {
	errorhandler.CheckNilParameter(map[string]interface{}{"datafilter": datafilter})

	dataArray := r.Select(datafilter)
	r.db.Model(r.modelType).Delete(datafilter, r.GetIds(dataArray))
	return dataArray
}
