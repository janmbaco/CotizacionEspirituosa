import 'package:mobile_app/domain/models/product.pb.dart';
import 'package:mobile_app/src/common/actions/actions.dart' as actions;
import 'package:mobile_app/src/common/reducers/get_generic_state_reducer.dart';
import 'package:redux/redux.dart';

final getProductsReducer =
    TypedReducer<Products, actions.LoadState<Products>>(getGenericStateReducer);
