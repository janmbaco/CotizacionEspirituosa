import 'package:mobile_app/domain/models/response.pb.dart';
import 'package:mobile_app/src/common/actions/actions.dart' as actions;
import 'package:redux/redux.dart';

final getResponseReducer =
    TypedReducer<ResultResponse, actions.SetResponse>(_getResponseReducer);

ResultResponse _getResponseReducer(
    ResultResponse response, actions.SetResponse action) {
  return action.response;
}
