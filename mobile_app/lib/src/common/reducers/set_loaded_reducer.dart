import 'package:mobile_app/src/common/actions/actions.dart' as actions;
import 'package:redux/redux.dart';

Map<String, bool> loaded = <String, bool>{
  "abstracts": false,
  "deliveries": false,
  "families": false,
  "groups": false,
  "items": false,
  "products": false
};

final loadingReducer = TypedReducer<bool, actions.SetLoaded>(_setLoaded);

bool _setLoaded(bool state, actions.SetLoaded actions) {
  loaded[actions.item] = true;
  bool newState = true;
  loaded.forEach((key, value) {
    if (!value) {
      newState = false;
    }
  });
  return newState;
}
