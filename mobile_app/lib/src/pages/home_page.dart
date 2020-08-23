import 'package:flutter/material.dart';
import 'package:mobile_app/src/providers/status_provider.dart';

class HomePage extends StatelessWidget {

  final estilo = TextStyle(fontSize: 30.0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Cotización Esprituosa"),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Hola Mundo', style: estilo),
            _status()
          ],
        ),
      ),
    );
  }

  Widget _status() {
    return FutureBuilder(
        future: statusProvider.runGetStatus(),
        initialData: "Waiting...",
        builder: (context, AsyncSnapshot<String> snapshot) =>
            Text(snapshot.data,style: estilo));
  }
}
