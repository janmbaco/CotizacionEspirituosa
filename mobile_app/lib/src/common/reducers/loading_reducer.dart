import 'package:mobile_app/src/common/actions/loading.dart';
import 'package:redux/redux.dart';

final loadingReducer = TypedReducer<bool, Loading>(_setLoaded);

bool _setLoaded(bool state, action) {
  return false;
}
