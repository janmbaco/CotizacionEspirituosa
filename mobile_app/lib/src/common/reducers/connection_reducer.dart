import 'package:mobile_app/src/common/actions/actions.dart' as actions;
import 'package:redux/redux.dart';

final connectionReducer = combineReducers<bool>([
  TypedReducer(connectionError),
  TypedReducer(connectionRestored),
]);

bool connectionError(bool state, actions.ConnectionError action) {
  return true;
}

bool connectionRestored(bool state, actions.ConnectionRestored action) {
  return false;
}
