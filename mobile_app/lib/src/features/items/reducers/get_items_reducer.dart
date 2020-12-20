import 'package:mobile_app/domain/models/item.pb.dart';
import 'package:mobile_app/src/common/actions/actions.dart' as actions;
import 'package:mobile_app/src/common/reducers/get_generic_state_reducer.dart';
import 'package:redux/redux.dart';

final getItemsReducer =
    TypedReducer<Items, actions.LoadState<Items>>(getGenericStateReducer);
