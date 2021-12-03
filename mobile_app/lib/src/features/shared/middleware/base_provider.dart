import 'dart:async';

import 'package:mobile_app/domain/models/request.pb.dart';
import 'package:mobile_app/domain/models/response.pb.dart';
import 'package:mobile_app/src/common/actions/actions.dart' as actions;
import 'package:mobile_app/src/common/state/app_state.dart';
import 'package:redux/redux.dart';

abstract class BaseProvider<State, Item> {
  String _name;
  StreamView<State> Function() _getStreamView;
  Future<State> Function(NullRequest) _getFunc;
  Future<ResultResponse> Function(Item) _setFunc;
  Future<ResultResponse> Function(Item) _removeFunc;

  BaseProvider(this._name, this._getStreamView, this._getFunc, this._setFunc,
      this._removeFunc);

  connectReducer(
      Store<AppState> store, actions.Connect action, NextDispatcher next) {
    next(action);
    _getStreamView().listen((value) {
      store.dispatch(actions.LoadState(value));
    }, onError: (e) {
      store.dispatch(actions.ConnectionError());
    });
  }

  getReducer(
      Store<AppState> store, actions.Connect action, NextDispatcher next) {
    next(action);
    _getFunc(NullRequest()).then((value) {
      store.dispatch(actions.LoadState(value));
      store.dispatch(actions.SetLoaded(this._name));
      if (store.state.isErrorConnection) {
        store.dispatch(actions.ConnectionRestored());
      }
    }, onError: (e) {
      store.dispatch(actions.ConnectionError());
    });
  }

  setReducer(Store<AppState> store, actions.SetItem<Item> action,
      NextDispatcher next) {
    next(action);
    _setFunc(action.item).then((value) {
      store.dispatch(actions.SetResponse(value));
    }, onError: (e) {
      store.dispatch(actions.ConnectionError());
    });
  }

  removeReducer(Store<AppState> store, actions.RemoveItem<Item> action,
      NextDispatcher next) {
    next(action);
    _removeFunc(action.item).then((value) {
      store.dispatch(actions.SetResponse(value));
    }, onError: (e) {
      store.dispatch(actions.ConnectionError());
    });
  }
}
