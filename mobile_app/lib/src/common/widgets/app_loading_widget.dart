import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_redux/flutter_redux.dart';
import 'package:mobile_app/src/common/state/app_state.dart';
import 'package:mobile_app/src/routes/routes.dart';
import 'package:redux/redux.dart';

class AppWidget extends StatelessWidget {
  AppWidget({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StoreConnector<AppState, bool>(
      distinct: true,
      converter: (Store<AppState> store) {
        return store.state.isLoaded && !store.state.isErrorConnection;
      },
      builder: (BuildContext context, bool isLoaded) {
        log(isLoaded.toString());
        return isLoaded
            ? MaterialApp(
                debugShowCheckedModeBanner: false,
                title: "Cotización Espirituosa",
                initialRoute: '/',
                routes: getApplicationsRoutes(),
              )
            : Center(
                child: CircularProgressIndicator(),
              );
      },
    );
  }
}
