import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/user_models.dart';
import '../providers/auth_provider.dart';
import '../providers/emergency_provider.dart';
import 'hospital_dashboard.dart';
import 'paramedic_dashboard.dart';
import 'patient_dashboard.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    _initializeServices();
  }

  Future<void> _initializeServices() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final emergencyProvider = Provider.of<EmergencyProvider>(
      context,
      listen: false,
    );

    if (authProvider.currentUser != null) {
      await emergencyProvider.initialize(authProvider.currentUser!);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.currentUser == null) {
          return const Scaffold(
            body: Center(child: Text('User not authenticated')),
          );
        }

        final user = authProvider.currentUser!;

        switch (user.role) {
          case UserRole.hospital:
            return const HospitalDashboard();
          case UserRole.paramedic:
            return const ParamedicDashboard();
          case UserRole.patient:
            return const PatientDashboard();
        }
      },
    );
  }
}
