import 'package:mobile_app/src/common/state/app_state.dart';
import 'package:redux/redux.dart';
import 'package:mobile_app/src/common/actions/actions.dart' as actions;

class ErrorHandler {
  final Store<AppState> _store;
  bool _isTryingRestore = false;

  ErrorHandler(this._store) {
    this._store.onChange.listen((state) => {
          if (state.isErrorConnection) {this._tryReconnect()}
        });
  }

  void _tryReconnect() {
    if (!this._isTryingRestore) {
      this._isTryingRestore = true;
      Future.delayed(Duration(seconds: 1)).then((d) {
        if (this._store.state.isErrorConnection) {
          this._store.dispatch(actions.Connect());
        }
        this._isTryingRestore = false;
      });
    }
  }
}
