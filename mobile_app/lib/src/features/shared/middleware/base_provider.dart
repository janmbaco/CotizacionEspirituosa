import 'dart:async';

import 'package:mobile_app/domain/models/response.pb.dart';
import 'package:mobile_app/src/common/actions/actions.dart' as actions;
import 'package:mobile_app/src/common/state/app_state.dart';
import 'package:redux/redux.dart';

abstract class BaseProvider<State, Item> {
  StreamView<State> streamView;
  Future<ResultResponse> Function(Item) setFunc;
  Future<ResultResponse> Function(Item) removeFunc;

  BaseProvider(this.streamView, this.setFunc, this.removeFunc);

  void Function(
    Store<AppState> store,
    actions.Connect<State> action,
    NextDispatcher next,
  ) connectReducer(Store<AppState> store) {
    return (store, action, next) {
      next(action);
      streamView.listen((value) {
        store.dispatch(actions.LoadState(value));
      });
    };
  }

  void Function(
    Store<AppState> store,
    actions.SetItem<Item> action,
    NextDispatcher next,
  ) setReducer(Store<AppState> store) {
    return (store, action, next) {
      next(action);
      setFunc(action.item).then((value) {
        store.dispatch(actions.SetResponse(value));
      });
    };
  }

  void Function(
    Store<AppState> store,
    actions.RemoveItem<Item> action,
    NextDispatcher next,
  ) removeReducer(Store<AppState> store) {
    return (store, action, next) {
      next(action);
      removeFunc(action.item).then((value) {
        store.dispatch(actions.SetResponse(value));
      });
    };
  }
}
