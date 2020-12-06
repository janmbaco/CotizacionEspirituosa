package common

import (
	"gorm.io/gorm"
	"reflect"
)

type WhereFunc func(datamodel interface{})
type UpdateFunc func(datamodel interface{})

type DataAccess interface {
	Insert(datamodel interface{})
	Select(whereFunc WhereFunc) DataAccess
	Update(ids []int64, updateFunc UpdateFunc) DataAccess
	Delete(ids []int64, result interface{})
	Get(ids []int64, result interface{})
	Find(result interface{})
}

type dataAccess struct {
	db        *gorm.DB
	datamodel interface{}
}

func (r *dataAccess) Insert(datamodel interface{}) {
	r.db.Model(r.datamodel).Create(datamodel)
}

func (r *dataAccess) Select(whereFunc WhereFunc) DataAccess {
	wheremodel := reflect.New(reflect.ValueOf(r.datamodel).Elem().Type()).Interface()
	whereFunc(wheremodel)
	r.db.Model(r.datamodel).Where(wheremodel)
	return r
}

func (r *dataAccess) Update(ids []int64, updateFunc UpdateFunc) DataAccess {
	updatemodel := reflect.New(reflect.ValueOf(r.datamodel).Elem().Type()).Interface()
	updateFunc(updatemodel)
	r.db.Model(r.datamodel).Where(ids).Updates(updatemodel)
	return r
}

func (r *dataAccess) Delete(ids []int64, result interface{}) {
	r.db.Model(r.datamodel).Delete(result, ids)
}

func (r *dataAccess) Get(ids []int64, result interface{}) {
	r.db.Model(r.datamodel).Find(result, ids)
}

func (r *dataAccess) Find(result interface{}) {
	r.db.Model(r.datamodel).Find(result)
}
