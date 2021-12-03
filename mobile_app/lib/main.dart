import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_redux/flutter_redux.dart';
import 'package:grpc/grpc.dart';
import 'package:mobile_app/src/common/actions/actions.dart' as actions;
import 'package:mobile_app/src/common/error_handler.dart';
import 'package:mobile_app/src/common/middleware/client_provider.dart';
import 'package:mobile_app/src/common/middleware/middleware_factory.dart';
import 'package:mobile_app/src/common/reducers/app_state_reducer.dart';
import 'package:mobile_app/src/common/state/app_state.dart';
import 'package:mobile_app/src/common/widgets/app_loading_widget.dart';
import 'package:redux/redux.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(CotizacionEspirituosaApp());
}

class CotizacionEspirituosaApp extends StatelessWidget {
  final Store<AppState> _store;

  CotizacionEspirituosaApp({Key key})
      : _store = Store<AppState>(appReducer,
            initialState: AppState(),
            middleware: MiddlewareFactory(ClientProvider("localhost", 8080,
                    ChannelOptions(credentials: ChannelCredentials.insecure())))
                .createMiddleWareStore()),
        super(key: key) {
    ErrorHandler(_store);
    _store.dispatch(actions.Connect());
  }

  @override
  Widget build(BuildContext context) {
    return StoreProvider(store: _store, child: AppWidget());
  }
}
