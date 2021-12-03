import 'package:mobile_app/src/common/reducers/connection_reducer.dart';
import 'package:mobile_app/src/common/reducers/get_response_reducer.dart';
import 'package:mobile_app/src/common/reducers/set_loaded_reducer.dart';
import 'package:mobile_app/src/common/state/app_state.dart';
import 'package:mobile_app/src/features/abstracts/reducers/get_abstracts_reducer.dart';
import 'package:mobile_app/src/features/deliveries/reducers/get_deliveries_reducer.dart';
import 'package:mobile_app/src/features/families/reducers/get_families_reducer.dart';
import 'package:mobile_app/src/features/groups/reducers/get_groups_reducer.dart';
import 'package:mobile_app/src/features/items/reducers/get_items_reducer.dart';
import 'package:mobile_app/src/features/products/reducers/get_products_reducer.dart';

AppState appReducer(AppState state, action) {
  return AppState(
      isLoaded: loadingReducer(state.isLoaded, action),
      abstracts: getAbstractsReducer(state.abstracts, action),
      deliveries: getDeliveriesReducer(state.deliveries, action),
      families: getFamiliesReducer(state.families, action),
      groups: getGroupsReducer(state.groups, action),
      items: getItemsReducer(state.items, action),
      products: getProductsReducer(state.products, action),
      serverResponse: getResponseReducer(state.serverResponse, action),
      isErrorConnection: connectionReducer(state.isErrorConnection, action));
}
