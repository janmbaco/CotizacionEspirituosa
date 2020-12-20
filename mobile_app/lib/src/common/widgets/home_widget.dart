import 'package:flutter/material.dart';

class HomeWidget extends StatelessWidget {
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
          children: [Text('Hola Mundo', style: estilo)],
        ),
      ),
    );
  }
}
