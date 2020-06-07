package types

type ProductPackage struct {
	Product *Product
	Quantity int
	Stocks []*Stock
}
