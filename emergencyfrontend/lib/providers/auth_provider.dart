import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/user_models.dart';
import '../models/ambulance_models.dart';
import '../services/websocket_service.dart';
import '../services/location_service.dart';

class AuthProvider extends ChangeNotifier {
  AppUser? _currentUser;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _error;

  AppUser? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<bool> login({
    required UserRole role,
    String? username,
    String? hospitalId,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      late AppUser user;

      switch (role) {
        case UserRole.hospital:
          user = AppUser.hospitalAdmin(hospitalId ?? 'default_hospital');
          break;
        case UserRole.paramedic:
          user = AppUser(
            id:
                username ??
                'paramedic_${DateTime.now().millisecondsSinceEpoch}',
            name: 'Paramedic ${username ?? 'User'}',
            email: '${username ?? 'paramedic'}@hospital.com',
            role: UserRole.paramedic,
            hospitalId: hospitalId,
          );
          break;
        case UserRole.patient:
          user = AppUser(
            id: username ?? 'patient_${DateTime.now().millisecondsSinceEpoch}',
            name: 'Patient ${username ?? 'User'}',
            email: '${username ?? 'patient'}@email.com',
            role: UserRole.patient,
            hospitalId: "hos_001",
          );
          break;
      }

      _currentUser = user;
      _isAuthenticated = true;

      await Future.delayed(
        const Duration(milliseconds: 500),
      ); // Simulate API call

      _setLoading(false);
      return true;
    } catch (e) {
      _setError('Login failed: ${e.toString()}');
      _setLoading(false);
      return false;
    }
  }

  void logout() {
    _currentUser = null;
    _isAuthenticated = false;
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }
}
