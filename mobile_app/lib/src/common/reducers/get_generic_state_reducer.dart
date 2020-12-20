import 'package:mobile_app/src/common/actions/actions.dart' as actions;

State getGenericStateReducer<State>(
    State state, actions.LoadState<State> action) {
  return action.state;
}
