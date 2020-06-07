package types

type QuoteItem struct {
	*QuoteGroup
	Product   *Product
	IncPrice  int
	MaxPrice  int
	MinPrice  int
	PriceStep int
	Quantity  int
	Consumes  []*Consume
}
