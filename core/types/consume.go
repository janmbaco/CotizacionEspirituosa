package types

type Consume struct{
	Identity int64
	QuoteItems []*QuoteItem
}
