import 'package:flutter/material.dart';
import 'package:mobile_app/src/pages/home_page.dart';
import 'package:mobile_app/src/routes/routes.dart';

void main() => runApp(CotizacionEspirituosaApp());

class CotizacionEspirituosaApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "Cotización Espirituosa",
        initialRoute: '/',
        routes: getApplicationsRoutes(),
        onGenerateRoute: (settings) =>
            MaterialPageRoute(builder: (context) => HomePage())
    );
  }
}

