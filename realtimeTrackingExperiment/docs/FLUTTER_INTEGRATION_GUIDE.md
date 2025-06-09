# Flutter Integration Guide for Ambulance Tracking System

## Overview

This guide provides comprehensive instructions for integrating the Ambulance Tracking System with Flutter applications. The integration supports three main user types: Patients, Hospital Staff, and Ambulance Crew members.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Flutter Dependencies](#flutter-dependencies)
3. [WebSocket Client Setup](#websocket-client-setup)
4. [Patient App Integration](#patient-app-integration)
5. [Hospital App Integration](#hospital-app-integration)
6. [Ambulance Crew App Integration](#ambulance-crew-app-integration)
7. [Real-Time Location Tracking](#real-time-location-tracking)
8. [UI Components](#ui-components)
9. [State Management](#state-management)
10. [Error Handling](#error-handling)
11. [Testing](#testing)
12. [Best Practices](#best-practices)

## Prerequisites

Before integrating the ambulance tracking system, ensure you have:

- Flutter SDK 3.0 or higher
- Dart 2.17 or higher
- Location permissions configured for both Android and iOS
- WebSocket connectivity to the backend server
- Valid authentication tokens for different user types

## Flutter Dependencies

Add the following dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # WebSocket and HTTP communication
  web_socket_channel: ^2.4.0
  http: ^1.1.0
  
  # Location services
  geolocator: ^10.1.0
  location: ^5.0.3
  
  # Maps integration
  google_maps_flutter: ^2.5.0
  flutter_polyline_points: ^2.0.0
  
  # State management
  provider: ^6.1.1
  # OR use your preferred state management solution
  # riverpod: ^2.4.9
  # bloc: ^8.1.2
  
  # Utilities
  uuid: ^4.1.0
  permission_handler: ^11.0.1
  connectivity_plus: ^5.0.1
  
  # Local storage
  shared_preferences: ^2.2.2
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.2
  integration_test:
    sdk: flutter
```

## WebSocket Client Setup

### 1. WebSocket Service Class

Create a WebSocket service to manage connections and message handling:

```dart
// lib/services/ambulance_websocket_service.dart
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';

class AmbulanceWebSocketService {
  static const String _baseUrl = 'ws://your-server-url:port';
  
  WebSocketChannel? _channel;
  StreamController<Map<String, dynamic>>? _messageController;
  Timer? _reconnectTimer;
  bool _isConnected = false;
  String? _userToken;
  String? _userId;
  String? _userType;
  
  Stream<Map<String, dynamic>> get messageStream => 
      _messageController?.stream ?? const Stream.empty();
  
  bool get isConnected => _isConnected;
  
  Future<void> connect({
    required String userToken,
    required String userId,
    required String userType,
  }) async {
    try {
      _userToken = userToken;
      _userId = userId;
      _userType = userType;
      
      _messageController ??= StreamController<Map<String, dynamic>>.broadcast();
      
      _channel = IOWebSocketChannel.connect(
        '$_baseUrl/ambulance-tracking',
        headers: {
          'Authorization': 'Bearer $userToken',
          'User-Type': userType,
          'User-Id': userId,
        },
      );
      
      _isConnected = true;
      
      _channel!.stream.listen(
        _onMessage,
        onError: _onError,
        onDone: _onDisconnected,
      );
      
      print('WebSocket connected successfully');
    } catch (e) {
      print('WebSocket connection error: $e');
      _scheduleReconnect();
    }
  }
  
  void _onMessage(dynamic message) {
    try {
      final Map<String, dynamic> data = json.decode(message);
      _messageController?.add(data);
    } catch (e) {
      print('Error parsing WebSocket message: $e');
    }
  }
  
  void _onError(error) {
    print('WebSocket error: $error');
    _isConnected = false;
    _scheduleReconnect();
  }
  
  void _onDisconnected() {
    print('WebSocket disconnected');
    _isConnected = false;
    _scheduleReconnect();
  }
  
  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      if (!_isConnected && _userToken != null) {
        connect(
          userToken: _userToken!,
          userId: _userId!,
          userType: _userType!,
        );
      }
    });
  }
  
  void sendMessage(Map<String, dynamic> message) {
    if (_isConnected && _channel != null) {
      _channel!.sink.add(json.encode(message));
    } else {
      print('WebSocket not connected. Message not sent.');
    }
  }
  
  void disconnect() {
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _messageController?.close();
    _isConnected = false;
  }
}
```

### 2. Message Models

Create data models for WebSocket messages:

```dart
// lib/models/ambulance_tracking_models.dart

class EmergencyRequest {
  final String emergencyId;
  final String patientId;
  final List<String> hospitalIds;
  final String emergencyType;
  final LocationData location;
  final DateTime requestedAt;
  final String status;
  
  EmergencyRequest({
    required this.emergencyId,
    required this.patientId,
    required this.hospitalIds,
    required this.emergencyType,
    required this.location,
    required this.requestedAt,
    required this.status,
  });
  
  factory EmergencyRequest.fromJson(Map<String, dynamic> json) {
    return EmergencyRequest(
      emergencyId: json['emergencyId'],
      patientId: json['patientId'],
      hospitalIds: List<String>.from(json['hospitalIds']),
      emergencyType: json['emergencyType'],
      location: LocationData.fromJson(json['location']),
      requestedAt: DateTime.parse(json['requestedAt']),
      status: json['status'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'emergencyId': emergencyId,
      'patientId': patientId,
      'hospitalIds': hospitalIds,
      'emergencyType': emergencyType,
      'location': location.toJson(),
      'requestedAt': requestedAt.toIso8601String(),
      'status': status,
    };
  }
}

class LocationData {
  final double latitude;
  final double longitude;
  final String? address;
  
  LocationData({
    required this.latitude,
    required this.longitude,
    this.address,
  });
  
  factory LocationData.fromJson(Map<String, dynamic> json) {
    return LocationData(
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
      address: json['address'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      if (address != null) 'address': address,
    };
  }
}

class AmbulanceLocation {
  final String emergencyId;
  final String hospitalId;
  final String driverId;
  final String paramedicId;
  final String vehicleNumber;
  final double latitude;
  final double longitude;
  final DateTime timestamp;
  final double? speed;
  final double? heading;
  final String status;
  
  AmbulanceLocation({
    required this.emergencyId,
    required this.hospitalId,
    required this.driverId,
    required this.paramedicId,
    required this.vehicleNumber,
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    this.speed,
    this.heading,
    required this.status,
  });
  
  factory AmbulanceLocation.fromJson(Map<String, dynamic> json) {
    return AmbulanceLocation(
      emergencyId: json['emergencyId'],
      hospitalId: json['hospitalId'],
      driverId: json['driverId'],
      paramedicId: json['paramedicId'],
      vehicleNumber: json['vehicleNumber'],
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
      timestamp: DateTime.parse(json['timestamp']),
      speed: json['speed']?.toDouble(),
      heading: json['heading']?.toDouble(),
      status: json['status'],
    );
  }
}

class LimitedEmergencyData {
  final String emergencyId;
  final String patientName;
  final String emergencyType;
  final String? estimatedArrival;
  final LocationData? ambulanceLocation;
  final String status;
  
  LimitedEmergencyData({
    required this.emergencyId,
    required this.patientName,
    required this.emergencyType,
    this.estimatedArrival,
    this.ambulanceLocation,
    required this.status,
  });
  
  factory LimitedEmergencyData.fromJson(Map<String, dynamic> json) {
    return LimitedEmergencyData(
      emergencyId: json['emergencyId'],
      patientName: json['patientName'],
      emergencyType: json['emergencyType'],
      estimatedArrival: json['estimatedArrival'],
      ambulanceLocation: json['ambulanceLocation'] != null 
          ? LocationData.fromJson(json['ambulanceLocation'])
          : null,
      status: json['status'],
    );
  }
}

enum AmbulanceStatus {
  idle,
  dispatched,
  enRouteToPatient,
  onScene,
  enRouteToHospital,
  atHospital,
  completed,
  emergency,
}

enum EmergencyRequestStatus {
  pending,
  accepted,
  rejected,
  cancelled,
  completed,
}
```

## Patient App Integration

### 1. Emergency Request Service

```dart
// lib/services/patient_emergency_service.dart
import 'package:uuid/uuid.dart';
import 'package:geolocator/geolocator.dart';

class PatientEmergencyService {
  final AmbulanceWebSocketService _webSocketService;
  final Uuid _uuid = const Uuid();
  
  PatientEmergencyService(this._webSocketService);
  
  Future<String?> requestEmergency({
    required String patientId,
    required List<String> hospitalIds,
    required String emergencyType,
    String? address,
  }) async {
    try {
      // Get current location
      final position = await _getCurrentPosition();
      if (position == null) return null;
      
      final emergencyId = _uuid.v4();
      
      final request = {
        'type': 'emergency_request',
        'emergencyId': emergencyId,
        'patientId': patientId,
        'hospitalIds': hospitalIds,
        'emergencyType': emergencyType,
        'location': {
          'latitude': position.latitude,
          'longitude': position.longitude,
          if (address != null) 'address': address,
        },
      };
      
      _webSocketService.sendMessage(request);
      return emergencyId;
    } catch (e) {
      print('Error requesting emergency: $e');
      return null;
    }
  }
  
  Future<Position?> _getCurrentPosition() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        final requestedPermission = await Geolocator.requestPermission();
        if (requestedPermission == LocationPermission.denied) {
          return null;
        }
      }
      
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      print('Error getting location: $e');
      return null;
    }
  }
  
  void joinTrackingRoom(String trackingRoomId, String patientId) {
    _webSocketService.sendMessage({
      'type': 'join_tracking_room',
      'trackingRoomId': trackingRoomId,
      'userId': patientId,
      'userType': 'patient',
    });
  }
}
```

### 2. Patient Tracking Screen

```dart
// lib/screens/patient_tracking_screen.dart
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';

class PatientTrackingScreen extends StatefulWidget {
  final String emergencyId;
  final String patientId;
  
  const PatientTrackingScreen({
    Key? key,
    required this.emergencyId,
    required this.patientId,
  }) : super(key: key);
  
  @override
  _PatientTrackingScreenState createState() => _PatientTrackingScreenState();
}

class _PatientTrackingScreenState extends State<PatientTrackingScreen> {
  GoogleMapController? _mapController;
  LimitedEmergencyData? _emergencyData;
  String? _trackingRoomId;
  late AmbulanceWebSocketService _webSocketService;
  
  @override
  void initState() {
    super.initState();
    _webSocketService = context.read<AmbulanceWebSocketService>();
    _listenToWebSocketMessages();
  }
  
  void _listenToWebSocketMessages() {
    _webSocketService.messageStream.listen((message) {
      switch (message['type']) {
        case 'emergency_accepted':
          setState(() {
            _trackingRoomId = message['trackingRoomId'];
          });
          _joinTrackingRoom();
          break;
          
        case 'ambulance_location_update':
          _updateAmbulanceLocation(message);
          break;
          
        case 'trackingRoomJoined':
          if (message['success'] == true) {
            _showSnackBar('Successfully joined tracking room');
          }
          break;
          
        case 'error':
          _showSnackBar(message['message'], isError: true);
          break;
      }
    });
  }
  
  void _joinTrackingRoom() {
    if (_trackingRoomId != null) {
      final service = PatientEmergencyService(_webSocketService);
      service.joinTrackingRoom(_trackingRoomId!, widget.patientId);
    }
  }
  
  void _updateAmbulanceLocation(Map<String, dynamic> message) {
    final locationData = message['location'];
    if (locationData != null) {
      setState(() {
        _emergencyData = LimitedEmergencyData.fromJson(locationData);
      });
      
      if (_emergencyData?.ambulanceLocation != null) {
        _updateMapCamera();
      }
    }
  }
  
  void _updateMapCamera() {
    if (_mapController != null && _emergencyData?.ambulanceLocation != null) {
      final location = _emergencyData!.ambulanceLocation!;
      _mapController!.animateCamera(
        CameraUpdate.newLatLng(
          LatLng(location.latitude, location.longitude),
        ),
      );
    }
  }
  
  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Tracking'),
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Emergency Status Card
          _buildStatusCard(),
          
          // Map View
          Expanded(
            child: _buildMapView(),
          ),
          
          // ETA Information
          _buildETAInfo(),
        ],
      ),
    );
  }
  
  Widget _buildStatusCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: _getStatusColor(),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Emergency ID: ${widget.emergencyId}',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Status: ${_getStatusText()}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildMapView() {
    return GoogleMap(
      onMapCreated: (GoogleMapController controller) {
        _mapController = controller;
      },
      initialCameraPosition: const CameraPosition(
        target: LatLng(0, 0),
        zoom: 15,
      ),
      markers: _buildMarkers(),
      myLocationEnabled: true,
      myLocationButtonEnabled: true,
    );
  }
  
  Widget _buildETAInfo() {
    if (_emergencyData?.estimatedArrival == null) {
      return const SizedBox.shrink();
    }
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      color: Colors.blue,
      child: Text(
        'Estimated Arrival: ${_emergencyData!.estimatedArrival}',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
  
  Set<Marker> _buildMarkers() {
    final markers = <Marker>{};
    
    if (_emergencyData?.ambulanceLocation != null) {
      final location = _emergencyData!.ambulanceLocation!;
      markers.add(
        Marker(
          markerId: const MarkerId('ambulance'),
          position: LatLng(location.latitude, location.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          infoWindow: const InfoWindow(
            title: 'Ambulance',
            snippet: 'En route to you',
          ),
        ),
      );
    }
    
    return markers;
  }
  
  Color _getStatusColor() {
    final status = _emergencyData?.status ?? 'pending';
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'accepted':
        return Colors.blue;
      case 'en_route_to_patient':
        return Colors.green;
      case 'on_scene':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }
  
  String _getStatusText() {
    final status = _emergencyData?.status ?? 'pending';
    switch (status) {
      case 'pending':
        return 'Waiting for hospital response';
      case 'accepted':
        return 'Emergency accepted, ambulance dispatching';
      case 'en_route_to_patient':
        return 'Ambulance en route to you';
      case 'on_scene':
        return 'Ambulance arrived at scene';
      case 'en_route_to_hospital':
        return 'En route to hospital';
      default:
        return status.replaceAll('_', ' ').toUpperCase();
    }
  }
}
```

## Hospital App Integration

### 1. Hospital Emergency Service

```dart
// lib/services/hospital_emergency_service.dart

class HospitalEmergencyService {
  final AmbulanceWebSocketService _webSocketService;
  
  HospitalEmergencyService(this._webSocketService);
  
  void acceptEmergency({
    required String emergencyId,
    required String hospitalId,
    required String driverId,
    required String paramedicId,
    required String vehicleNumber,
    required String acceptedBy,
  }) {
    _webSocketService.sendMessage({
      'type': 'emergency_acceptance',
      'emergencyId': emergencyId,
      'hospitalId': hospitalId,
      'driverId': driverId,
      'paramedicId': paramedicId,
      'vehicleNumber': vehicleNumber,
      'acceptedBy': acceptedBy,
    });
  }
  
  void rejectEmergency(String emergencyId, String hospitalId, String reason) {
    _webSocketService.sendMessage({
      'type': 'emergency_rejection',
      'emergencyId': emergencyId,
      'hospitalId': hospitalId,
      'reason': reason,
    });
  }
  
  void joinTrackingRoom(String trackingRoomId, String staffId) {
    _webSocketService.sendMessage({
      'type': 'join_tracking_room',
      'trackingRoomId': trackingRoomId,
      'userId': staffId,
      'userType': 'hospital',
    });
  }
}
```

### 2. Hospital Dashboard Screen

```dart
// lib/screens/hospital_dashboard_screen.dart
import 'package:flutter/material.dart';

class HospitalDashboardScreen extends StatefulWidget {
  final String hospitalId;
  
  const HospitalDashboardScreen({
    Key? key,
    required this.hospitalId,
  }) : super(key: key);
  
  @override
  _HospitalDashboardScreenState createState() => _HospitalDashboardScreenState();
}

class _HospitalDashboardScreenState extends State<HospitalDashboardScreen> {
  final List<EmergencyRequest> _pendingRequests = [];
  final List<AmbulanceLocation> _activeAmbulances = [];
  late AmbulanceWebSocketService _webSocketService;
  late HospitalEmergencyService _emergencyService;
  
  @override
  void initState() {
    super.initState();
    _webSocketService = context.read<AmbulanceWebSocketService>();
    _emergencyService = HospitalEmergencyService(_webSocketService);
    _listenToWebSocketMessages();
  }
  
  void _listenToWebSocketMessages() {
    _webSocketService.messageStream.listen((message) {
      switch (message['type']) {
        case 'emergency_request':
          _addPendingRequest(message);
          break;
          
        case 'hospital_fleet_update':
          _updateFleetStatus(message);
          break;
          
        case 'ambulance_location_update':
          _updateAmbulanceLocation(message);
          break;
      }
    });
  }
  
  void _addPendingRequest(Map<String, dynamic> message) {
    final request = EmergencyRequest.fromJson(message);
    setState(() {
      _pendingRequests.add(request);
    });
  }
  
  void _updateFleetStatus(Map<String, dynamic> message) {
    final fleetStatus = message['fleetStatus'];
    if (fleetStatus != null && fleetStatus['ambulances'] != null) {
      setState(() {
        _activeAmbulances.clear();
        for (final ambulanceData in fleetStatus['ambulances']) {
          if (ambulanceData['lastLocation'] != null) {
            _activeAmbulances.add(
              AmbulanceLocation.fromJson(ambulanceData['lastLocation']),
            );
          }
        }
      });
    }
  }
  
  void _updateAmbulanceLocation(Map<String, dynamic> message) {
    final location = AmbulanceLocation.fromJson(message['location']);
    setState(() {
      final index = _activeAmbulances.indexWhere(
        (ambulance) => ambulance.emergencyId == location.emergencyId,
      );
      if (index >= 0) {
        _activeAmbulances[index] = location;
      } else {
        _activeAmbulances.add(location);
      }
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hospital Dashboard'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: DefaultTabController(
        length: 2,
        child: Column(
          children: [
            const TabBar(
              tabs: [
                Tab(text: 'Emergency Requests'),
                Tab(text: 'Active Ambulances'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildEmergencyRequestsTab(),
                  _buildActiveAmbulancesTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildEmergencyRequestsTab() {
    if (_pendingRequests.isEmpty) {
      return const Center(
        child: Text('No pending emergency requests'),
      );
    }
    
    return ListView.builder(
      itemCount: _pendingRequests.length,
      itemBuilder: (context, index) {
        final request = _pendingRequests[index];
        return _buildEmergencyRequestCard(request);
      },
    );
  }
  
  Widget _buildEmergencyRequestCard(EmergencyRequest request) {
    return Card(
      margin: const EdgeInsets.all(8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Emergency: ${request.emergencyType.toUpperCase()}',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 8),
            Text('Emergency ID: ${request.emergencyId}'),
            Text('Patient ID: ${request.patientId}'),
            Text('Location: ${request.location.latitude}, ${request.location.longitude}'),
            if (request.location.address != null)
              Text('Address: ${request.location.address}'),
            Text('Requested: ${_formatDateTime(request.requestedAt)}'),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () => _showAcceptDialog(request),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Accept'),
                ),
                ElevatedButton(
                  onPressed: () => _rejectEmergency(request),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Reject'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildActiveAmbulancesTab() {
    if (_activeAmbulances.isEmpty) {
      return const Center(
        child: Text('No active ambulances'),
      );
    }
    
    return ListView.builder(
      itemCount: _activeAmbulances.length,
      itemBuilder: (context, index) {
        final ambulance = _activeAmbulances[index];
        return _buildAmbulanceCard(ambulance);
      },
    );
  }
  
  Widget _buildAmbulanceCard(AmbulanceLocation ambulance) {
    return Card(
      margin: const EdgeInsets.all(8),
      child: ListTile(
        leading: const Icon(Icons.local_hospital, color: Colors.blue),
        title: Text('Vehicle: ${ambulance.vehicleNumber}'),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Emergency: ${ambulance.emergencyId}'),
            Text('Status: ${ambulance.status}'),
            Text('Driver: ${ambulance.driverId}'),
            Text('Paramedic: ${ambulance.paramedicId}'),
            if (ambulance.speed != null)
              Text('Speed: ${ambulance.speed!.toStringAsFixed(1)} km/h'),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.map),
          onPressed: () => _showAmbulanceOnMap(ambulance),
        ),
      ),
    );
  }
  
  void _showAcceptDialog(EmergencyRequest request) {
    final driverController = TextEditingController();
    final paramedicController = TextEditingController();
    final vehicleController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Accept Emergency'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: driverController,
              decoration: const InputDecoration(labelText: 'Driver ID'),
            ),
            TextField(
              controller: paramedicController,
              decoration: const InputDecoration(labelText: 'Paramedic ID'),
            ),
            TextField(
              controller: vehicleController,
              decoration: const InputDecoration(labelText: 'Vehicle Number'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              _acceptEmergency(
                request,
                driverController.text,
                paramedicController.text,
                vehicleController.text,
              );
              Navigator.pop(context);
            },
            child: const Text('Accept'),
          ),
        ],
      ),
    );
  }
  
  void _acceptEmergency(
    EmergencyRequest request,
    String driverId,
    String paramedicId,
    String vehicleNumber,
  ) {
    _emergencyService.acceptEmergency(
      emergencyId: request.emergencyId,
      hospitalId: widget.hospitalId,
      driverId: driverId,
      paramedicId: paramedicId,
      vehicleNumber: vehicleNumber,
      acceptedBy: 'current-user-id', // Replace with actual user ID
    );
    
    setState(() {
      _pendingRequests.removeWhere(
        (r) => r.emergencyId == request.emergencyId,
      );
    });
  }
  
  void _rejectEmergency(EmergencyRequest request) {
    _emergencyService.rejectEmergency(
      request.emergencyId,
      widget.hospitalId,
      'Hospital unavailable',
    );
    
    setState(() {
      _pendingRequests.removeWhere(
        (r) => r.emergencyId == request.emergencyId,
      );
    });
  }
  
  void _showAmbulanceOnMap(AmbulanceLocation ambulance) {
    // Navigate to map screen showing ambulance location
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AmbulanceMapScreen(ambulance: ambulance),
      ),
    );
  }
  
  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year} '
        '${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
```

## Ambulance Crew App Integration

### 1. Ambulance Location Service

```dart
// lib/services/ambulance_location_service.dart
import 'dart:async';
import 'package:geolocator/geolocator.dart';

class AmbulanceLocationService {
  final AmbulanceWebSocketService _webSocketService;
  Timer? _locationTimer;
  String? _currentEmergencyId;
  String? _currentHospitalId;
  String? _currentDriverId;
  String? _currentVehicleNumber;
  
  AmbulanceLocationService(this._webSocketService);
  
  void startTracking({
    required String emergencyId,
    required String hospitalId,
    required String driverId,
    required String vehicleNumber,
  }) {
    _currentEmergencyId = emergencyId;
    _currentHospitalId = hospitalId;
    _currentDriverId = driverId;
    _currentVehicleNumber = vehicleNumber;
    
    _locationTimer = Timer.periodic(
      const Duration(seconds: 5),
      (_) => _sendLocationUpdate(),
    );
  }
  
  void stopTracking() {
    _locationTimer?.cancel();
    _locationTimer = null;
    _currentEmergencyId = null;
    _currentHospitalId = null;
    _currentDriverId = null;
    _currentVehicleNumber = null;
  }
  
  Future<void> _sendLocationUpdate() async {
    if (_currentEmergencyId == null) return;
    
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      final locationData = {
        'emergencyId': _currentEmergencyId,
        'hospitalId': _currentHospitalId,
        'driverId': _currentDriverId,
        'paramedicId': _currentDriverId, // Assuming same for demo
        'vehicleNumber': _currentVehicleNumber,
        'latitude': position.latitude,
        'longitude': position.longitude,
        'timestamp': DateTime.now().toIso8601String(),
        'speed': position.speed,
        'heading': position.heading,
        'accuracy': position.accuracy,
        'status': 'en_route_to_patient', // This should be dynamic
      };
      
      _webSocketService.sendMessage({
        'type': 'location_update',
        'emergencyId': _currentEmergencyId,
        'hospitalId': _currentHospitalId,
        'driverId': _currentDriverId,
        'locationData': locationData,
      });
    } catch (e) {
      print('Error sending location update: $e');
    }
  }
  
  void updateStatus(String status) {
    if (_currentEmergencyId != null) {
      _webSocketService.sendMessage({
        'type': 'status_update',
        'emergencyId': _currentEmergencyId,
        'status': status,
      });
    }
  }
}
```

### 2. Ambulance Crew Screen

```dart
// lib/screens/ambulance_crew_screen.dart
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class AmbulanceCrewScreen extends StatefulWidget {
  final String emergencyId;
  final String driverId;
  final String vehicleNumber;
  
  const AmbulanceCrewScreen({
    Key? key,
    required this.emergencyId,
    required this.driverId,
    required this.vehicleNumber,
  }) : super(key: key);
  
  @override
  _AmbulanceCrewScreenState createState() => _AmbulanceCrewScreenState();
}

class _AmbulanceCrewScreenState extends State<AmbulanceCrewScreen> {
  late AmbulanceLocationService _locationService;
  String _currentStatus = 'dispatched';
  Position? _currentPosition;
  EmergencyRequest? _emergencyDetails;
  
  @override
  void initState() {
    super.initState();
    final webSocketService = context.read<AmbulanceWebSocketService>();
    _locationService = AmbulanceLocationService(webSocketService);
    _startLocationTracking();
    _listenToWebSocketMessages();
  }
  
  void _startLocationTracking() {
    _locationService.startTracking(
      emergencyId: widget.emergencyId,
      hospitalId: 'current-hospital-id', // Replace with actual hospital ID
      driverId: widget.driverId,
      vehicleNumber: widget.vehicleNumber,
    );
  }
  
  void _listenToWebSocketMessages() {
    final webSocketService = context.read<AmbulanceWebSocketService>();
    webSocketService.messageStream.listen((message) {
      switch (message['type']) {
        case 'emergency_details':
          setState(() {
            _emergencyDetails = EmergencyRequest.fromJson(message);
          });
          break;
      }
    });
  }
  
  @override
  void dispose() {
    _locationService.stopTracking();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Emergency ${widget.emergencyId}'),
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          _buildStatusSelector(),
          _buildEmergencyInfo(),
          Expanded(child: _buildMap()),
          _buildActionButtons(),
        ],
      ),
    );
  }
  
  Widget _buildStatusSelector() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: DropdownButtonFormField<String>(
        value: _currentStatus,
        decoration: const InputDecoration(
          labelText: 'Current Status',
          border: OutlineInputBorder(),
        ),
        items: const [
          DropdownMenuItem(value: 'dispatched', child: Text('Dispatched')),
          DropdownMenuItem(value: 'en_route_to_patient', child: Text('En Route to Patient')),
          DropdownMenuItem(value: 'on_scene', child: Text('On Scene')),
          DropdownMenuItem(value: 'en_route_to_hospital', child: Text('En Route to Hospital')),
          DropdownMenuItem(value: 'at_hospital', child: Text('At Hospital')),
          DropdownMenuItem(value: 'completed', child: Text('Completed')),
        ],
        onChanged: (value) {
          if (value != null) {
            setState(() {
              _currentStatus = value;
            });
            _locationService.updateStatus(value);
          }
        },
      ),
    );
  }
  
  Widget _buildEmergencyInfo() {
    if (_emergencyDetails == null) {
      return const Card(
        margin: EdgeInsets.all(16),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text('Loading emergency details...'),
        ),
      );
    }
    
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Emergency Type: ${_emergencyDetails!.emergencyType.toUpperCase()}',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 8),
            Text('Patient ID: ${_emergencyDetails!.patientId}'),
            Text('Emergency ID: ${_emergencyDetails!.emergencyId}'),
            if (_emergencyDetails!.location.address != null)
              Text('Address: ${_emergencyDetails!.location.address}'),
            Text(
              'Coordinates: ${_emergencyDetails!.location.latitude}, '
              '${_emergencyDetails!.location.longitude}',
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildMap() {
    return GoogleMap(
      onMapCreated: (GoogleMapController controller) {
        // Map controller setup
      },
      initialCameraPosition: CameraPosition(
        target: _emergencyDetails != null
            ? LatLng(
                _emergencyDetails!.location.latitude,
                _emergencyDetails!.location.longitude,
              )
            : const LatLng(0, 0),
        zoom: 15,
      ),
      markers: _buildMapMarkers(),
      myLocationEnabled: true,
      myLocationButtonEnabled: true,
    );
  }
  
  Set<Marker> _buildMapMarkers() {
    final markers = <Marker>{};
    
    if (_emergencyDetails != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('patient'),
          position: LatLng(
            _emergencyDetails!.location.latitude,
            _emergencyDetails!.location.longitude,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          infoWindow: const InfoWindow(
            title: 'Patient Location',
            snippet: 'Emergency location',
          ),
        ),
      );
    }
    
    return markers;
  }
  
  Widget _buildActionButtons() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          ElevatedButton.icon(
            onPressed: _callPatient,
            icon: const Icon(Icons.phone),
            label: const Text('Call Patient'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
          ),
          ElevatedButton.icon(
            onPressed: _callHospital,
            icon: const Icon(Icons.local_hospital),
            label: const Text('Call Hospital'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
            ),
          ),
          ElevatedButton.icon(
            onPressed: _openNavigation,
            icon: const Icon(Icons.navigation),
            label: const Text('Navigate'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
  
  void _callPatient() {
    // Implement phone call functionality
  }
  
  void _callHospital() {
    // Implement phone call functionality
  }
  
  void _openNavigation() {
    // Open external navigation app
  }
}
```

## Real-Time Location Tracking

### Location Permission Setup

#### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```

#### iOS (ios/Runner/Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to track ambulance location during emergencies.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to track ambulance location during emergencies.</string>
```

## State Management

### Provider Setup

```dart
// lib/providers/ambulance_tracking_provider.dart
import 'package:flutter/foundation.dart';

class AmbulanceTrackingProvider extends ChangeNotifier {
  final AmbulanceWebSocketService _webSocketService = AmbulanceWebSocketService();
  
  List<EmergencyRequest> _emergencyRequests = [];
  List<AmbulanceLocation> _ambulanceLocations = [];
  Map<String, LimitedEmergencyData> _patientTrackingData = {};
  
  List<EmergencyRequest> get emergencyRequests => _emergencyRequests;
  List<AmbulanceLocation> get ambulanceLocations => _ambulanceLocations;
  Map<String, LimitedEmergencyData> get patientTrackingData => _patientTrackingData;
  
  AmbulanceWebSocketService get webSocketService => _webSocketService;
  
  void addEmergencyRequest(EmergencyRequest request) {
    _emergencyRequests.add(request);
    notifyListeners();
  }
  
  void removeEmergencyRequest(String emergencyId) {
    _emergencyRequests.removeWhere((r) => r.emergencyId == emergencyId);
    notifyListeners();
  }
  
  void updateAmbulanceLocation(AmbulanceLocation location) {
    final index = _ambulanceLocations.indexWhere(
      (l) => l.emergencyId == location.emergencyId,
    );
    
    if (index >= 0) {
      _ambulanceLocations[index] = location;
    } else {
      _ambulanceLocations.add(location);
    }
    
    notifyListeners();
  }
  
  void updatePatientTrackingData(String emergencyId, LimitedEmergencyData data) {
    _patientTrackingData[emergencyId] = data;
    notifyListeners();
  }
}
```

### Main App Setup

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AmbulanceTrackingProvider()),
      ],
      child: MaterialApp(
        title: 'Ambulance Tracking System',
        theme: ThemeData(
          primarySwatch: Colors.red,
        ),
        home: const AuthenticationScreen(),
      ),
    );
  }
}
```

## Error Handling

### Connection Error Handler

```dart
// lib/utils/error_handler.dart
class ErrorHandler {
  static void handleWebSocketError(dynamic error, BuildContext context) {
    String message = 'Connection error occurred';
    
    if (error is WebSocketException) {
      message = 'WebSocket connection failed';
    } else if (error is FormatException) {
      message = 'Data format error';
    }
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        action: SnackBarAction(
          label: 'Retry',
          textColor: Colors.white,
          onPressed: () => _retryConnection(context),
        ),
      ),
    );
  }
  
  static void _retryConnection(BuildContext context) {
    final provider = context.read<AmbulanceTrackingProvider>();
    provider.webSocketService.connect(
      userToken: 'stored-token',
      userId: 'stored-user-id',
      userType: 'stored-user-type',
    );
  }
}
```

## Testing

### Unit Tests

```dart
// test/services/ambulance_websocket_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('AmbulanceWebSocketService', () {
    late AmbulanceWebSocketService service;
    
    setUp(() {
      service = AmbulanceWebSocketService();
    });
    
    test('should connect successfully with valid credentials', () async {
      await service.connect(
        userToken: 'valid-token',
        userId: 'user-123',
        userType: 'patient',
      );
      
      expect(service.isConnected, true);
    });
    
    test('should send message when connected', () {
      service.sendMessage({'type': 'test', 'data': 'test-data'});
      // Verify message was sent
    });
  });
}
```

### Integration Tests

```dart
// integration_test/ambulance_tracking_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Ambulance Tracking Integration Tests', () {
    testWidgets('Patient can request emergency and track ambulance', (tester) async {
      await tester.pumpWidget(const MyApp());
      
      // Navigate to emergency request screen
      await tester.tap(find.text('Request Emergency'));
      await tester.pumpAndSettle();
      
      // Fill emergency form
      await tester.enterText(find.byType(TextField).first, 'cardiac_arrest');
      await tester.tap(find.text('Submit'));
      await tester.pumpAndSettle();
      
      // Verify tracking screen appears
      expect(find.text('Emergency Tracking'), findsOneWidget);
    });
  });
}
```

## Best Practices

### 1. Security
- Always validate user authentication before WebSocket connections
- Implement proper token refresh mechanisms
- Use HTTPS/WSS in production environments
- Validate all incoming data on both client and server sides

### 2. Performance
- Implement efficient state management to avoid unnecessary rebuilds
- Use connection pooling for WebSocket connections
- Implement proper memory management for location data
- Use background services for continuous location tracking

### 3. User Experience
- Provide clear feedback for all user actions
- Implement offline capabilities where possible
- Use proper loading states and error messages
- Ensure accessibility compliance

### 4. Reliability
- Implement automatic reconnection for WebSocket connections
- Use proper error handling and recovery mechanisms
- Implement data persistence for critical information
- Test thoroughly on different devices and network conditions

## Conclusion

This Flutter integration guide provides a comprehensive foundation for building ambulance tracking applications. The modular architecture allows for easy customization and extension based on specific requirements. Remember to thoroughly test all functionality and follow platform-specific guidelines for location services and background processing.
