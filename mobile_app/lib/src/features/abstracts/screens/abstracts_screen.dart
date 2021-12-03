import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_redux/flutter_redux.dart';
import 'package:mobile_app/src/common/state/app_state.dart';
import 'package:redux/redux.dart';

class AbstractsScreen extends StatelessWidget {
  final estilo = TextStyle(fontSize: 30.0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Cotización Espirituosa"),
      ),
      body: StoreConnector<AppState, List<String>>(
          distinct: true,
          converter: (Store<AppState> store) {
            return store.state.abstracts.abstracts.map((e) => e.name).toList();
          },
          builder: (BuildContext context, List<String> lista) {
            log(lista.toString());
            return ListView.builder(
                itemCount: lista.length,
                itemBuilder: (context, index) => Column(
                      children: <Widget>[
                        Card(
                          elevation: 2.0,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5.0)),
                          child: ListTile(
                            title: Center(
                              child: Text(
                                lista[index],
                                style: estilo,
                              ),
                            ),
                          ),
                        ),
                        SizedBox(height: 5.0),
                      ],
                    ));
          }),
    );
  }
}
