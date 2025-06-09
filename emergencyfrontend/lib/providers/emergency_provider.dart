// import 'dart:async';
// import 'package:flutter/foundation.dart';
// import '../models/ambulance_models.dart';
// import '../models/user_models.dart';
// import '../services/websocket_service.dart';
// import '../services/location_service.dart';

// class EmergencyProvider extends ChangeNotifier {
//   final WebSocketService _webSocketService = WebSocketService();
//   final LocationService _locationService = LocationService();

//   List<EmergencyRequest> _emergencyRequests = [];
//   List<EmergencyUpdate> _emergencyUpdates = [];
//   EmergencyRequest? _currentEmergency;
//   HospitalFleet? _hospitalFleet;
//   bool _isConnected = false;
//   bool _isLoading = false;
//   String? _error;
//   LocationData? _currentLocation;

//   StreamSubscription<WebSocketMessage>? _messageSubscription;
//   StreamSubscription<LocationData>? _locationSubscription;
//   // Getters
//   List<EmergencyRequest> get emergencyRequests => _emergencyRequests;
//   List<EmergencyUpdate> get emergencyUpdates => _emergencyUpdates;
//   EmergencyRequest? get currentEmergency => _currentEmergency;
//   HospitalFleet? get hospitalFleet => _hospitalFleet;
//   bool get isConnected => _isConnected;
//   bool get isLoading => _isLoading;
//   String? get error => _error;

//   // Convenience getter for ambulances from hospitalFleet
//   List<AmbulanceInfo> get ambulances => _hospitalFleet?.ambulances ?? [];
//   LocationData? get currentLocation => _currentLocation;

//   Future<void> initialize(AppUser user) async {
//     _setLoading(true);

//     try {
//       // Initialize location service
//       await _locationService.initialize();
//       _currentLocation = _locationService.currentLocation;

//       // Connect to WebSocket
//       final connected = await _webSocketService.connect(
//         userId: user.id,
//         userRole: user.role,
//         hospitalId: user.hospitalId,
//       );

//       if (connected) {
//         _isConnected = true;
//         _setupMessageListener();
//         _setupLocationListener();

//         if (user.role == UserRole.hospital) {
//           _webSocketService.getHospitalFleet();
//         }
//       }

//       _setLoading(false);
//     } catch (e) {
//       _setError('Failed to initialize: ${e.toString()}');
//       _setLoading(false);
//     }
//   }

//   void _setupMessageListener() {
//     _messageSubscription = _webSocketService.messageStream.listen(
//       (WebSocketMessage message) {
//         _handleWebSocketMessage(message);
//       },
//       onError: (error) {
//         _setError('WebSocket error: ${error.toString()}');
//       },
//     );
//   }

//   void _setupLocationListener() {
//     _locationSubscription = _locationService.locationStream.listen((
//       LocationData location,
//     ) {
//       _currentLocation = location;
//       notifyListeners();

//       // If there's an active emergency and user is paramedic, send location updates
//       if (_currentEmergency != null &&
//           _currentEmergency!.status == EmergencyStatus.inProgress) {
//         _webSocketService.updateAmbulanceLocation(
//           emergencyId: _currentEmergency!.emergencyId,
//           location: location,
//         );
//       }
//     });
//   }

//   void _handleWebSocketMessage(WebSocketMessage message) {
//     switch (message.type) {
//       case WebSocketMessageType.emergencyRequest:
//         _handleNewEmergencyRequest(message);
//         break;
//       case WebSocketMessageType.emergencyUpdate:
//         _handleEmergencyUpdate(message);
//         break;
//       case WebSocketMessageType.locationUpdate:
//         _handleLocationUpdate(message);
//         break;
//       case WebSocketMessageType.fleetStatusUpdate:
//         _handleFleetStatusUpdate(message);
//         break;
//       case WebSocketMessageType.trackingRoomJoined:
//         _handleTrackingRoomJoined(message);
//         break;
//       case WebSocketMessageType.error:
//         _setError(message.data['message'] ?? 'Unknown error');
//         break;
//       default:
//         break;
//     }
//   }

//   void _handleNewEmergencyRequest(WebSocketMessage message) {
//     try {
//       final request = EmergencyRequest.fromJson(message.data);
//       _emergencyRequests.add(request);
//       notifyListeners();
//     } catch (e) {
//       debugPrint('Error handling emergency request: $e');
//     }
//   }

//   void _handleEmergencyUpdate(WebSocketMessage message) {
//     try {
//       final update = EmergencyUpdate.fromJson(message.data);
//       _emergencyUpdates.add(update);

//       // Update current emergency if it matches
//       if (_currentEmergency?.emergencyId == update.emergencyId) {
//         _currentEmergency = _currentEmergency!.copyWith(status: update.status);
//       }

//       notifyListeners();
//     } catch (e) {
//       debugPrint('Error handling emergency update: $e');
//     }
//   }

//   void _handleLocationUpdate(WebSocketMessage message) {
//     try {
//       if (message.data['ambulanceLocation'] != null) {
//         final location = LocationData.fromJson(
//           message.data['ambulanceLocation'],
//         );
//         // Handle ambulance location update for tracking
//         notifyListeners();
//       }
//     } catch (e) {
//       debugPrint('Error handling location update: $e');
//     }
//   }

//   void _handleFleetStatusUpdate(WebSocketMessage message) {
//     try {
//       _hospitalFleet = HospitalFleet.fromJson(message.data);
//       notifyListeners();
//     } catch (e) {
//       debugPrint('Error handling fleet status update: $e');
//     }
//   }

//   void _handleTrackingRoomJoined(WebSocketMessage message) {
//     // Handle successful tracking room join
//     debugPrint('Joined tracking room for emergency: ${message.emergencyId}');
//   }

//   // Emergency Request Methods
//   Future<void> createEmergencyRequest({
//     required String patientName,
//     required String patientPhone,
//     required String severity,
//     required String description,
//     required List<String> hospitalIds,
//     LocationData? destinationLocation,
//   }) async {
//     if (_currentLocation == null) {
//       _setError('Current location not available');
//       return;
//     }

//     _setLoading(true);

//     try {
//       _webSocketService.sendEmergencyRequest(
//         patientId: 'patient_${DateTime.now().millisecondsSinceEpoch}',
//         patientName: patientName,
//         patientPhone: patientPhone,
//         pickupLocation: _currentLocation!,
//         destinationLocation: destinationLocation,
//         severity: severity,
//         description: description,
//         hospitalIds: hospitalIds,
//       );

//       _setLoading(false);
//     } catch (e) {
//       _setError('Failed to create emergency request: ${e.toString()}');
//       _setLoading(false);
//     }
//   }

//   Future<void> submitEmergencyRequest(EmergencyRequest request) async {
//     if (_currentLocation == null) {
//       _setError('Current location not available');
//       return;
//     }

//     _setLoading(true);

//     try {
//       _webSocketService.sendEmergencyRequest(
//         patientId: request.patientId,
//         patientName: request.patientName,
//         patientPhone: request.patientPhone,
//         pickupLocation: request.pickupLocation,
//         destinationLocation: request.destinationLocation,
//         severity: request.severity,
//         description: request.description,
//         hospitalIds: request.hospitalIds,
//       );

//       _setLoading(false);
//     } catch (e) {
//       _setError('Failed to submit emergency request: ${e.toString()}');
//       _setLoading(false);
//     }
//   }

//   void acceptEmergency({
//     required String emergencyId,
//     required String hospitalId,
//     required String ambulanceId,
//   }) {
//     _webSocketService.acceptEmergency(
//       emergencyId: emergencyId,
//       hospitalId: hospitalId,
//       ambulanceId: ambulanceId,
//     );
//   }

//   void joinTrackingRoom(String emergencyId) {
//     _webSocketService.joinTrackingRoom(emergencyId: emergencyId);

//     // Set as current emergency if joining as participant
//     final emergency =
//         _emergencyRequests
//             .where((e) => e.emergencyId == emergencyId)
//             .firstOrNull;
//     if (emergency != null) {
//       _currentEmergency = emergency;
//       notifyListeners();
//     }
//   }

//   void leaveTrackingRoom(String emergencyId) {
//     _webSocketService.leaveTrackingRoom(emergencyId: emergencyId);

//     if (_currentEmergency?.emergencyId == emergencyId) {
//       _currentEmergency = null;
//       notifyListeners();
//     }
//   }

//   void startLocationTracking() {
//     _locationService.startLocationTracking();
//   }

//   void stopLocationTracking() {
//     _locationService.stopLocationTracking();
//   }

//   void stopEmergencyTracking(String emergencyId) {
//     _webSocketService.stopAmbulanceTracking(emergencyId: emergencyId);

//     if (_currentEmergency?.emergencyId == emergencyId) {
//       _currentEmergency = null;
//       notifyListeners();
//     }
//   }

//   void refreshHospitalFleet() {
//     _webSocketService.getHospitalFleet();
//   }

//   void _setLoading(bool loading) {
//     _isLoading = loading;
//     notifyListeners();
//   }

//   void _setError(String? error) {
//     _error = error;
//     notifyListeners();
//   }

//   void clearError() {
//     _error = null;
//     notifyListeners();
//   }

//   @override
//   void dispose() {
//     _messageSubscription?.cancel();
//     _locationSubscription?.cancel();
//     _webSocketService.dispose();
//     _locationService.dispose();
//     super.dispose();
//   }
// }

// // Extension to add copyWith method to EmergencyRequest
// extension EmergencyRequestExtension on EmergencyRequest {
//   EmergencyRequest copyWith({
//     String? emergencyId,
//     String? patientId,
//     String? patientName,
//     String? patientPhone,
//     LocationData? pickupLocation,
//     LocationData? destinationLocation,
//     String? severity,
//     String? description,
//     List<String>? hospitalIds,
//     DateTime? requestTime,
//     EmergencyStatus? status,
//     String? acceptedHospitalId,
//     String? assignedAmbulanceId,
//     String? emergencyType,
//     DateTime? timestamp,
//   }) {
//     return EmergencyRequest(
//       emergencyId: emergencyId ?? this.emergencyId,
//       patientId: patientId ?? this.patientId,
//       patientName: patientName ?? this.patientName,
//       patientPhone: patientPhone ?? this.patientPhone,
//       pickupLocation: pickupLocation ?? this.pickupLocation,
//       destinationLocation: destinationLocation ?? this.destinationLocation,
//       severity: severity ?? this.severity,
//       description: description ?? this.description,
//       hospitalIds: hospitalIds ?? this.hospitalIds,
//       requestTime: requestTime ?? this.requestTime,
//       status: status ?? this.status,
//       acceptedHospitalId: acceptedHospitalId ?? this.acceptedHospitalId,
//       assignedAmbulanceId: assignedAmbulanceId ?? this.assignedAmbulanceId,
//       emergencyType: emergencyType ?? this.emergencyType,
//       timestamp: timestamp ?? this.timestamp,
//     );
//   }
// }

// import 'dart:async';
// import 'package:flutter/foundation.dart';
// import '../models/ambulance_models.dart';
// import '../models/user_models.dart';
// import '../services/websocket_service.dart';
// import '../services/location_service.dart';

// class EmergencyProvider extends ChangeNotifier {
//   final WebSocketService _webSocketService = WebSocketService();
//   final LocationService _locationService = LocationService();

//   List<EmergencyRequest> _emergencyRequests = [];
//   List<EmergencyUpdate> _emergencyUpdates = [];
//   EmergencyRequest? _currentEmergency;
//   HospitalFleet? _hospitalFleet;
//   bool _isConnected = false;
//   bool _isLoading = false;
//   String? _error;
//   LocationData? _currentLocation;

//   StreamSubscription<WebSocketMessage>? _messageSubscription;
//   StreamSubscription<LocationData>? _locationSubscription;

//   // Getters
//   List<EmergencyRequest> get emergencyRequests => _emergencyRequests;
//   List<EmergencyUpdate> get emergencyUpdates => _emergencyUpdates;
//   EmergencyRequest? get currentEmergency => _currentEmergency;
//   HospitalFleet? get hospitalFleet => _hospitalFleet;
//   bool get isConnected => _isConnected;
//   bool get isLoading => _isLoading;
//   String? get error => _error;

//   // Convenience getter for ambulances from hospitalFleet
//   List<AmbulanceInfo> get ambulances => _hospitalFleet?.ambulances ?? [];
//   LocationData? get currentLocation => _currentLocation;

//   Future<void> initialize(AppUser user) async {
//     _setLoading(true);

//     try {
//       // Initialize location service
//       await _locationService.initialize();
//       _currentLocation = _locationService.currentLocation;

//       // Connect to WebSocket
//       final connected = await _webSocketService.connect(
//         userId: user.id,
//         userRole: user.role,
//         hospitalId: user.hospitalId,
//       );

//       if (connected) {
//         _isConnected = true;
//         _setupMessageListener();
//         _setupLocationListener();

//         if (user.role == UserRole.hospital) {
//           // Add a small delay before requesting fleet data
//           await Future.delayed(const Duration(milliseconds: 2000));
//           _webSocketService.getHospitalFleet();
//         }
//       }

//       _setLoading(false);
//     } catch (e) {
//       _setError('Failed to initialize: ${e.toString()}');
//       _setLoading(false);
//     }
//   }

//   void _setupMessageListener() {
//     _messageSubscription = _webSocketService.messageStream.listen(
//       (WebSocketMessage message) {
//         debugPrint('🎧 EmergencyProvider received message: ${message.type}');
//         _handleWebSocketMessage(message);
//       },
//       onError: (error) {
//         debugPrint('❌ EmergencyProvider WebSocket error: $error');
//         _setError('WebSocket error: ${error.toString()}');
//       },
//     );
//   }

//   void _setupLocationListener() {
//     _locationSubscription = _locationService.locationStream.listen((
//       LocationData location,
//     ) {
//       _currentLocation = location;
//       notifyListeners();

//       // If there's an active emergency and user is paramedic, send location updates
//       if (_currentEmergency != null &&
//           _currentEmergency!.status == EmergencyStatus.inProgress) {
//         _webSocketService.updateAmbulanceLocation(
//           emergencyId: _currentEmergency!.emergencyId,
//           location: location,
//         );
//       }
//     });
//   }

//   void _handleWebSocketMessage(WebSocketMessage message) {
//     debugPrint('🔄 Handling message type: ${message.type}');

//     switch (message.type) {
//       case WebSocketMessageType.emergencyRequest:
//         _handleNewEmergencyRequest(message);
//         break;
//       case WebSocketMessageType.emergencyUpdate:
//         _handleEmergencyUpdate(message);
//         break;
//       case WebSocketMessageType.locationUpdate:
//         _handleLocationUpdate(message);
//         break;
//       case WebSocketMessageType.fleetStatusUpdate:
//         _handleFleetStatusUpdate(message);
//         break;
//       case WebSocketMessageType.hospitalFleetStatus: // Add this case
//         _handleHospitalFleetStatus(message);
//         break;
//       case WebSocketMessageType.trackingRoomJoined:
//         _handleTrackingRoomJoined(message);
//         break;
//       case WebSocketMessageType.error:
//         _setError(message.data['message'] ?? 'Unknown error');
//         break;
//       default:
//         debugPrint('⚠️ Unhandled message type: ${message.type}');
//         break;
//     }
//   }

//   void _handleNewEmergencyRequest(WebSocketMessage message) {
//     try {
//       final request = EmergencyRequest.fromJson(message.data);
//       _emergencyRequests.add(request);
//       debugPrint('✅ Added new emergency request: ${request.emergencyId}');
//       notifyListeners();
//     } catch (e) {
//       debugPrint('❌ Error handling emergency request: $e');
//     }
//   }

//   void _handleEmergencyUpdate(WebSocketMessage message) {
//     try {
//       final update = EmergencyUpdate.fromJson(message.data);
//       _emergencyUpdates.add(update);

//       // Update current emergency if it matches
//       if (_currentEmergency?.emergencyId == update.emergencyId) {
//         _currentEmergency = _currentEmergency!.copyWith(status: update.status);
//       }

//       debugPrint('✅ Added emergency update: ${update.emergencyId}');
//       notifyListeners();
//     } catch (e) {
//       debugPrint('❌ Error handling emergency update: $e');
//     }
//   }

//   void _handleLocationUpdate(WebSocketMessage message) {
//     try {
//       if (message.data['ambulanceLocation'] != null) {
//         final location = LocationData.fromJson(
//           message.data['ambulanceLocation'],
//         );
//         debugPrint('✅ Received ambulance location update');
//         // Handle ambulance location update for tracking
//         notifyListeners();
//       }
//     } catch (e) {
//       debugPrint('❌ Error handling location update: $e');
//     }
//   }

//   void _handleFleetStatusUpdate(WebSocketMessage message) {
//     try {
//       _hospitalFleet = HospitalFleet.fromJson(message.data);
//       debugPrint(
//         '✅ Updated fleet status: ${_hospitalFleet?.ambulances.length} ambulances',
//       );
//       notifyListeners();
//     } catch (e) {
//       debugPrint('❌ Error handling fleet status update: $e');
//     }
//   }

//   // // New method to handle hospitalFleetStatus message
//   // void _handleHospitalFleetStatus(WebSocketMessage message) {
//   //   try {
//   //     debugPrint('🏥 Processing hospital fleet status message');
//   //     debugPrint('📋 Fleet data: ${message.data}');

//   //     // The message data contains the fleet status directly
//   //     if (message.data['fleetStatus'] != null) {
//   //       _hospitalFleet = HospitalFleet.fromJson(message.data['fleetStatus']);
//   //       debugPrint(
//   //         '✅ Hospital fleet updated: ${_hospitalFleet?.ambulances.length} ambulances',
//   //       );

//   //       // Print ambulance details for debugging
//   //       _hospitalFleet?.ambulances.forEach((ambulance) {
//   //         debugPrint(
//   //           '🚑 Ambulance: ${ambulance.vehicleNumber} - Status: ${ambulance.status}',
//   //         );
//   //       });

//   //       notifyListeners();
//   //     } else {
//   //       debugPrint('⚠️ No fleetStatus found in message data');
//   //     }
//   //   } catch (e) {
//   //     debugPrint('❌ Error handling hospital fleet status: $e');
//   //     debugPrint('📋 Raw message data: ${message.data}');
//   //   }
//   // }
//   void _handleHospitalFleetStatus(WebSocketMessage message) {
//     try {
//       debugPrint('🏥 Processing hospital fleet status message');
//       debugPrint('📋 Fleet data: ${message.data}');

//       if (message.data['fleetStatus'] != null) {
//         final fleetData = message.data['fleetStatus'] as Map<String, dynamic>;
//         _hospitalFleet = _parseHospitalFleet(fleetData);

//         debugPrint(
//           '✅ Hospital fleet updated: ${_hospitalFleet?.ambulances.length} ambulances',
//         );

//         // Print ambulance details for debugging
//         _hospitalFleet?.ambulances.forEach((ambulance) {
//           debugPrint(
//             '🚑 Ambulance: ${ambulance.vehicleNumber} - Status: ${ambulance.status}',
//           );
//         });

//         notifyListeners();
//       } else {
//         debugPrint('⚠️ No fleetStatus found in message data');
//         _setError('Invalid fleet status data received');
//       }
//     } catch (e, stackTrace) {
//       debugPrint('❌ Error handling hospital fleet status: $e');
//       debugPrint('Stack trace: $stackTrace');
//       debugPrint('📋 Raw message data: ${message.data}');
//       _setError('Failed to process fleet status: ${e.toString()}');
//     }
//   }

//   void _handleTrackingRoomJoined(WebSocketMessage message) {
//     // Handle successful tracking room join
//     debugPrint('✅ Joined tracking room for emergency: ${message.emergencyId}');
//   }

//   // Emergency Request Methods
//   Future<void> createEmergencyRequest({
//     required String patientName,
//     required String patientPhone,
//     required String severity,
//     required String description,
//     required List<String> hospitalIds,
//     LocationData? destinationLocation,
//   }) async {
//     if (_currentLocation == null) {
//       _setError('Current location not available');
//       return;
//     }

//     _setLoading(true);

//     try {
//       _webSocketService.sendEmergencyRequest(
//         patientId: 'patient_${DateTime.now().millisecondsSinceEpoch}',
//         patientName: patientName,
//         patientPhone: patientPhone,
//         pickupLocation: _currentLocation!,
//         destinationLocation: destinationLocation,
//         severity: severity,
//         description: description,
//         hospitalIds: hospitalIds,
//       );

//       _setLoading(false);
//     } catch (e) {
//       _setError('Failed to create emergency request: ${e.toString()}');
//       _setLoading(false);
//     }
//   }

//   Future<void> submitEmergencyRequest(EmergencyRequest request) async {
//     if (_currentLocation == null) {
//       _setError('Current location not available');
//       return;
//     }

//     _setLoading(true);

//     try {
//       _webSocketService.sendEmergencyRequest(
//         patientId: request.patientId,
//         patientName: request.patientName,
//         patientPhone: request.patientPhone,
//         pickupLocation: request.pickupLocation,
//         destinationLocation: request.destinationLocation,
//         severity: request.severity,
//         description: request.description,
//         hospitalIds: request.hospitalIds,
//       );

//       _setLoading(false);
//     } catch (e) {
//       _setError('Failed to submit emergency request: ${e.toString()}');
//       _setLoading(false);
//     }
//   }

//   void acceptEmergency({
//     required String emergencyId,
//     required String hospitalId,
//     required String ambulanceId,
//   }) {
//     debugPrint(
//       '🚑 Accepting emergency: $emergencyId with ambulance: $ambulanceId',
//     );
//     _webSocketService.acceptEmergency(
//       emergencyId: emergencyId,
//       hospitalId: hospitalId,
//       ambulanceId: ambulanceId,
//     );
//   }

//   void joinTrackingRoom(String emergencyId) {
//     debugPrint('🎯 Joining tracking room: $emergencyId');
//     _webSocketService.joinTrackingRoom(emergencyId: emergencyId);

//     // Set as current emergency if joining as participant
//     final emergency =
//         _emergencyRequests
//             .where((e) => e.emergencyId == emergencyId)
//             .firstOrNull;
//     if (emergency != null) {
//       _currentEmergency = emergency;
//       notifyListeners();
//     }
//   }

//   void leaveTrackingRoom(String emergencyId) {
//     debugPrint('🚪 Leaving tracking room: $emergencyId');
//     _webSocketService.leaveTrackingRoom(emergencyId: emergencyId);

//     if (_currentEmergency?.emergencyId == emergencyId) {
//       _currentEmergency = null;
//       notifyListeners();
//     }
//   }

//   HospitalFleet _parseHospitalFleet(Map<String, dynamic> json) {
//     try {
//       return HospitalFleet(
//         hospitalId: json['hospitalId'] as String? ?? '',
//         totalAmbulances: (json['totalAmbulances'] as num?)?.toInt() ?? 0,
//         availableAmbulances:
//             (json['availableAmbulances'] as num?)?.toInt() ?? 0,
//         activeAmbulances: (json['activeAmbulances'] as num?)?.toInt() ?? 0,
//         ambulances:
//             (json['ambulances'] as List<dynamic>?)?.map((ambulance) {
//               try {
//                 return AmbulanceInfo.fromJson(
//                   ambulance as Map<String, dynamic>,
//                 );
//               } catch (e) {
//                 debugPrint('Error parsing ambulance: $ambulance');
//                 debugPrint('Error: $e');
//                 // Return a default ambulance with error status
//                 return AmbulanceInfo(
//                   ambulanceId: 'error-${DateTime.now().millisecondsSinceEpoch}',
//                   driverName: 'Unknown',
//                   driverPhone: '',
//                   vehicleNumber: 'ERROR',
//                   hospitalId: json['hospitalId'] as String? ?? '',
//                   currentLocation: null,
//                   status: AmbulanceStatus.offline,
//                   currentEmergencyId: null,
//                   estimatedArrivalTime: null,
//                 );
//               }
//             }).toList() ??
//             [],
//         lastUpdated:
//             json['lastUpdated'] != null
//                 ? DateTime.parse(json['lastUpdated'] as String)
//                 : DateTime.now(),
//       );
//     } catch (e, stackTrace) {
//       debugPrint('Error parsing hospital fleet: $e');
//       debugPrint('Stack trace: $stackTrace');
//       // Return an empty fleet with error information
//       return HospitalFleet(
//         hospitalId: json['hospitalId'] as String? ?? 'error',
//         totalAmbulances: 0,
//         availableAmbulances: 0,
//         activeAmbulances: 0,
//         ambulances: [],
//         lastUpdated: DateTime.now(),
//       );
//     }
//   }

//   void startLocationTracking() {
//     debugPrint('📍 Starting location tracking');
//     _locationService.startLocationTracking();
//   }

//   void stopLocationTracking() {
//     _locationService.stopLocationTracking();
//   }

//   void stopEmergencyTracking(String emergencyId) {
//     _webSocketService.stopAmbulanceTracking(emergencyId: emergencyId);

//     if (_currentEmergency?.emergencyId == emergencyId) {
//       _currentEmergency = null;
//       notifyListeners();
//     }
//   }

//   void refreshHospitalFleet() {
//     _webSocketService.getHospitalFleet();
//   }

//   void _setLoading(bool loading) {
//     _isLoading = loading;
//     notifyListeners();
//   }

//   void _setError(String? error) {
//     _error = error;
//     notifyListeners();
//   }

//   void clearError() {
//     _error = null;
//     notifyListeners();
//   }

//   @override
//   void dispose() {
//     _messageSubscription?.cancel();
//     _locationSubscription?.cancel();
//     _webSocketService.dispose();
//     _locationService.dispose();
//     super.dispose();
//   }
// }

// // Extension to add copyWith method to EmergencyRequest
// extension EmergencyRequestExtension on EmergencyRequest {
//   EmergencyRequest copyWith({
//     String? emergencyId,
//     String? patientId,
//     String? patientName,
//     String? patientPhone,
//     LocationData? pickupLocation,
//     LocationData? destinationLocation,
//     String? severity,
//     String? description,
//     List<String>? hospitalIds,
//     DateTime? requestTime,
//     EmergencyStatus? status,
//     String? acceptedHospitalId,
//     String? assignedAmbulanceId,
//     String? emergencyType,
//     DateTime? timestamp,
//   }) {
//     return EmergencyRequest(
//       emergencyId: emergencyId ?? this.emergencyId,
//       patientId: patientId ?? this.patientId,
//       patientName: patientName ?? this.patientName,
//       patientPhone: patientPhone ?? this.patientPhone,
//       pickupLocation: pickupLocation ?? this.pickupLocation,
//       destinationLocation: destinationLocation ?? this.destinationLocation,
//       severity: severity ?? this.severity,
//       description: description ?? this.description,
//       hospitalIds: hospitalIds ?? this.hospitalIds,
//       requestTime: requestTime ?? this.requestTime,
//       status: status ?? this.status,
//       acceptedHospitalId: acceptedHospitalId ?? this.acceptedHospitalId,
//       assignedAmbulanceId: assignedAmbulanceId ?? this.assignedAmbulanceId,
//       emergencyType: emergencyType ?? this.emergencyType,
//       timestamp: timestamp ?? this.timestamp,
//     );
//   }
// }

// import 'dart:async';
// import 'package:flutter/foundation.dart';
// import '../models/ambulance_models.dart';
// import '../models/user_models.dart';
// import '../services/websocket_service.dart';
// import '../services/location_service.dart';

// class EmergencyProvider extends ChangeNotifier {
//   final WebSocketService _webSocketService = WebSocketService();
//   final LocationService _locationService = LocationService();

//   List<EmergencyRequest> _emergencyRequests = [];
//   List<EmergencyUpdate> _emergencyUpdates = [];
//   EmergencyRequest? _currentEmergency;
//   HospitalFleet? _hospitalFleet;
//   bool _isConnected = false;
//   bool _isLoading = false;
//   String? _error;
//   LocationData? _currentLocation;

//   StreamSubscription<WebSocketMessage>? _messageSubscription;
//   StreamSubscription<LocationData>? _locationSubscription;

//   // Getters
//   List<EmergencyRequest> get emergencyRequests => _emergencyRequests;
//   List<EmergencyUpdate> get emergencyUpdates => _emergencyUpdates;
//   EmergencyRequest? get currentEmergency => _currentEmergency;
//   HospitalFleet? get hospitalFleet => _hospitalFleet;
//   bool get isConnected => _isConnected;
//   bool get isLoading => _isLoading;
//   String? get error => _error;

//   // Convenience getter for ambulances from hospitalFleet
//   List<AmbulanceInfo> get ambulances => _hospitalFleet?.ambulances ?? [];
//   LocationData? get currentLocation => _currentLocation;

//   Future<void> initialize(AppUser user) async {
//     _setLoading(true);

//     try {
//       // Initialize location service
//       await _locationService.initialize();
//       _currentLocation = _locationService.currentLocation;

//       //Connect to WebSocket
//       final connected = await _webSocketService.connect(
//         userId: user.id,
//         userRole: user.role,
//         hospitalId: user.hospitalId,
//       );
//       // final connected = await _webSocketService.connect(
//       //   userId: user.id,
//       //   userRole: user.role,
//       //   hospitalId: user.hospitalId,
//       //   department:
//       //       user.role == UserRole.hospital
//       //           ? 'Emergency Department' // Critical for routing
//       //           : null,
//       //   specialization:
//       //       user.role == UserRole.hospital
//       //           ? 'Emergency Medicine' // Critical for routing
//       //           : null,
//       // );
//       if (connected) {
//         _isConnected = true;
//         _setupMessageListener();
//         _setupLocationListener();

//         if (user.role == UserRole.hospital) {
//           // Add a small delay before requesting fleet data
//           await Future.delayed(const Duration(milliseconds: 2000));
//           _webSocketService.getHospitalFleet();
//         }
//       }

//       _setLoading(false);
//     } catch (e) {
//       _setError('Failed to initialize: ${e.toString()}');
//       _setLoading(false);
//     }
//   }

//   void _setupMessageListener() {
//     _messageSubscription = _webSocketService.messageStream.listen(
//       (WebSocketMessage message) {
//         debugPrint('🎧 EmergencyProvider received message: ${message.type}');
//         _handleWebSocketMessage(message);
//       },
//       onError: (error) {
//         debugPrint('❌ EmergencyProvider WebSocket error: $error');
//         _setError('WebSocket error: ${error.toString()}');
//       },
//     );
//   }

//   void _setupLocationListener() {
//     _locationSubscription = _locationService.locationStream.listen((
//       LocationData location,
//     ) {
//       _currentLocation = location;
//       notifyListeners();

//       // If there's an active emergency and user is paramedic, send location updates
//       if (_currentEmergency != null &&
//           _currentEmergency!.status == EmergencyStatus.inProgress) {
//         _webSocketService.updateAmbulanceLocation(
//           emergencyId: _currentEmergency!.emergencyId,
//           location: location,
//         );
//       }
//     });
//   }

//   void _handleWebSocketMessage(WebSocketMessage message) {
//     debugPrint('🔄 Handling message type: ${message.type}');

//     switch (message.type) {
//       case WebSocketMessageType.emergencyRequest:
//         _handleNewEmergencyRequest(message);
//         break;
//       case WebSocketMessageType.emergencyUpdate:
//         _handleEmergencyUpdate(message);
//         break;
//       case WebSocketMessageType.locationUpdate:
//         _handleLocationUpdate(message);
//         break;
//       case WebSocketMessageType.fleetStatusUpdate:
//         _handleFleetStatusUpdate(message);
//         break;
//       case WebSocketMessageType.hospitalFleetStatus: // Add this case
//         _handleHospitalFleetStatus(message);
//         break;
//       case WebSocketMessageType.trackingRoomJoined:
//         _handleTrackingRoomJoined(message);
//         break;
//       case WebSocketMessageType.error:
//         _setError(message.data['message'] ?? 'Unknown error');
//         break;
//       default:
//         debugPrint('⚠️ Unhandled message type: ${message.type}');
//         break;
//     }
//   }

//   void _handleNewEmergencyRequest(WebSocketMessage message) {
//     try {
//       final request = EmergencyRequest.fromJson(message.data);
//       _emergencyRequests.add(request);
//       debugPrint('✅ Added new emergency request: ${request.emergencyId}');
//       notifyListeners();
//     } catch (e) {
//       debugPrint('❌ Error handling emergency request: $e');
//     }
//   }

//   void _handleEmergencyUpdate(WebSocketMessage message) {
//     try {
//       final update = EmergencyUpdate.fromJson(message.data);
//       _emergencyUpdates.add(update);

//       // Update current emergency if it matches
//       if (_currentEmergency?.emergencyId == update.emergencyId) {
//         _currentEmergency = _currentEmergency!.copyWith(status: update.status);
//       }

//       debugPrint('✅ Added emergency update: ${update.emergencyId}');
//       notifyListeners();
//     } catch (e) {
//       debugPrint('❌ Error handling emergency update: $e');
//     }
//   }

//   void _handleLocationUpdate(WebSocketMessage message) {
//     try {
//       if (message.data['ambulanceLocation'] != null) {
//         final location = LocationData.fromJson(
//           message.data['ambulanceLocation'],
//         );
//         debugPrint('✅ Received ambulance location update');
//         // Handle ambulance location update for tracking
//         notifyListeners();
//       }
//     } catch (e) {
//       debugPrint('❌ Error handling location update: $e');
//     }
//   }

//   void _handleFleetStatusUpdate(WebSocketMessage message) {
//     try {
//       _hospitalFleet = HospitalFleet.fromJson(message.data);
//       debugPrint(
//         '✅ Updated fleet status: ${_hospitalFleet?.ambulances.length} ambulances',
//       );
//       notifyListeners();
//     } catch (e) {
//       debugPrint('❌ Error handling fleet status update: $e');
//     }
//   }

//   // // New method to handle hospitalFleetStatus message
//   // void _handleHospitalFleetStatus(WebSocketMessage message) {
//   //   try {
//   //     debugPrint('🏥 Processing hospital fleet status message');
//   //     debugPrint('📋 Fleet data: ${message.data}');

//   //     // The message data contains the fleet status directly
//   //     if (message.data['fleetStatus'] != null) {
//   //       _hospitalFleet = HospitalFleet.fromJson(message.data['fleetStatus']);
//   //       debugPrint(
//   //         '✅ Hospital fleet updated: ${_hospitalFleet?.ambulances.length} ambulances',
//   //       );

//   //       // Print ambulance details for debugging
//   //       _hospitalFleet?.ambulances.forEach((ambulance) {
//   //         debugPrint(
//   //           '🚑 Ambulance: ${ambulance.vehicleNumber} - Status: ${ambulance.status}',
//   //         );
//   //       });

//   //       notifyListeners();
//   //     } else {
//   //       debugPrint('⚠️ No fleetStatus found in message data');
//   //     }
//   //   } catch (e) {
//   //     debugPrint('❌ Error handling hospital fleet status: $e');
//   //     debugPrint('📋 Raw message data: ${message.data}');
//   //   }
//   // }
//   void _handleHospitalFleetStatus(WebSocketMessage message) {
//     try {
//       debugPrint('🏥 Processing hospital fleet status message');
//       debugPrint('📋 Fleet data: ${message.data}');

//       if (message.data['fleetStatus'] != null) {
//         final fleetData = message.data['fleetStatus'] as Map<String, dynamic>;
//         _hospitalFleet = _parseHospitalFleet(fleetData);

//         debugPrint(
//           '✅ Hospital fleet updated: ${_hospitalFleet?.ambulances.length} ambulances',
//         );

//         // Print ambulance details for debugging
//         _hospitalFleet?.ambulances.forEach((ambulance) {
//           debugPrint(
//             '🚑 Ambulance: ${ambulance.vehicleNumber} - Status: ${ambulance.status}',
//           );
//         });

//         notifyListeners();
//       } else {
//         debugPrint('⚠️ No fleetStatus found in message data');
//         _setError('Invalid fleet status data received');
//       }
//     } catch (e, stackTrace) {
//       debugPrint('❌ Error handling hospital fleet status: $e');
//       debugPrint('Stack trace: $stackTrace');
//       debugPrint('📋 Raw message data: ${message.data}');
//       _setError('Failed to process fleet status: ${e.toString()}');
//     }
//   }

//   void _handleTrackingRoomJoined(WebSocketMessage message) {
//     // Handle successful tracking room join
//     debugPrint('✅ Joined tracking room for emergency: ${message.emergencyId}');
//   }

//   // Emergency Request Methods
//   Future<void> createEmergencyRequest({
//     required String patientName,
//     required String patientPhone,
//     required String severity,
//     required String description,
//     required List<String> hospitalIds,
//     LocationData? destinationLocation,
//   }) async {
//     if (_currentLocation == null) {
//       _setError('Current location not available');
//       return;
//     }

//     _setLoading(true);

//     try {
//       _webSocketService.sendEmergencyRequest(
//         patientId: 'patient_${DateTime.now().millisecondsSinceEpoch}',
//         patientName: patientName,
//         patientPhone: patientPhone,
//         pickupLocation: _currentLocation!,
//         destinationLocation: destinationLocation,
//         severity: severity,
//         description: description,
//         hospitalIds: hospitalIds,
//       );

//       _setLoading(false);
//     } catch (e) {
//       _setError('Failed to create emergency request: ${e.toString()}');
//       _setLoading(false);
//     }
//   }

//   Future<void> submitEmergencyRequest(EmergencyRequest request) async {
//     if (_currentLocation == null) {
//       _setError('Current location not available');
//       return;
//     }

//     _setLoading(true);

//     try {
//       _webSocketService.sendEmergencyRequest(
//         patientId: request.patientId,
//         patientName: request.patientName,
//         patientPhone: request.patientPhone,
//         pickupLocation: request.pickupLocation,
//         destinationLocation: request.destinationLocation,
//         severity: request.severity,
//         description: request.description,
//         hospitalIds: request.hospitalIds,
//       );

//       _setLoading(false);
//     } catch (e) {
//       _setError('Failed to submit emergency request: ${e.toString()}');
//       _setLoading(false);
//     }
//   }

//   void acceptEmergency({
//     required String emergencyId,
//     required String hospitalId,
//     required String ambulanceId,
//   }) {
//     debugPrint(
//       '🚑 Accepting emergency: $emergencyId with ambulance: $ambulanceId',
//     );
//     _webSocketService.acceptEmergency(
//       emergencyId: emergencyId,
//       hospitalId: hospitalId,
//       ambulanceId: ambulanceId,
//     );
//   }

//   void joinTrackingRoom(String emergencyId) {
//     debugPrint('🎯 Joining tracking room: $emergencyId');
//     _webSocketService.joinTrackingRoom(emergencyId: emergencyId);

//     // Set as current emergency if joining as participant
//     final emergency =
//         _emergencyRequests
//             .where((e) => e.emergencyId == emergencyId)
//             .firstOrNull;
//     if (emergency != null) {
//       _currentEmergency = emergency;
//       notifyListeners();
//     }
//   }

//   void leaveTrackingRoom(String emergencyId) {
//     debugPrint('🚪 Leaving tracking room: $emergencyId');
//     _webSocketService.leaveTrackingRoom(emergencyId: emergencyId);

//     if (_currentEmergency?.emergencyId == emergencyId) {
//       _currentEmergency = null;
//       notifyListeners();
//     }
//   }

//   HospitalFleet _parseHospitalFleet(Map<String, dynamic> json) {
//     try {
//       return HospitalFleet(
//         hospitalId: json['hospitalId'] as String? ?? '',
//         totalAmbulances: (json['totalAmbulances'] as num?)?.toInt() ?? 0,
//         availableAmbulances:
//             (json['availableAmbulances'] as num?)?.toInt() ?? 0,
//         activeAmbulances: (json['activeAmbulances'] as num?)?.toInt() ?? 0,
//         ambulances:
//             (json['ambulances'] as List<dynamic>?)?.map((ambulance) {
//               return _parseAmbulanceInfo(ambulance as Map<String, dynamic>);
//             }).toList() ??
//             [],
//         lastUpdated:
//             json['lastUpdated'] != null
//                 ? DateTime.parse(json['lastUpdated'] as String)
//                 : DateTime.now(),
//       );
//     } catch (e, stackTrace) {
//       debugPrint('Error parsing hospital fleet: $e');
//       debugPrint('Stack trace: $stackTrace');
//       // Return an empty fleet with error information
//       return HospitalFleet(
//         hospitalId: json['hospitalId'] as String? ?? 'error',
//         totalAmbulances: 0,
//         availableAmbulances: 0,
//         activeAmbulances: 0,
//         ambulances: [],
//         lastUpdated: DateTime.now(),
//       );
//     }
//   }

//   void startLocationTracking() {
//     debugPrint('📍 Starting location tracking');
//     _locationService.startLocationTracking();
//   }

//   void stopLocationTracking() {
//     _locationService.stopLocationTracking();
//   }

//   void stopEmergencyTracking(String emergencyId) {
//     _webSocketService.stopAmbulanceTracking(emergencyId: emergencyId);

//     if (_currentEmergency?.emergencyId == emergencyId) {
//       _currentEmergency = null;
//       notifyListeners();
//     }
//   }

//   void refreshHospitalFleet() {
//     _webSocketService.getHospitalFleet();
//   }

//   void _setLoading(bool loading) {
//     _isLoading = loading;
//     notifyListeners();
//   }

//   void _setError(String? error) {
//     _error = error;
//     notifyListeners();
//   }

//   void clearError() {
//     _error = null;
//     notifyListeners();
//   }

//   @override
//   void dispose() {
//     _messageSubscription?.cancel();
//     _locationSubscription?.cancel();
//     _webSocketService.dispose();
//     _locationService.dispose();
//     super.dispose();
//   }
// }

// // Add this to your EmergencyProvider class
// AmbulanceInfo _parseAmbulanceInfo(Map<String, dynamic> json) {
//   try {
//     // Handle status mapping - convert 'idle' to 'available'
//     String status = json['status'] as String? ?? 'offline';
//     if (status == 'idle') {
//       status = 'available'; // Map idle to available
//     }

//     // Handle location mapping - backend sends 'lastLocation', model expects 'currentLocation'
//     LocationData? currentLocation;
//     if (json['lastLocation'] != null) {
//       currentLocation = LocationData.fromJson(
//         json['lastLocation'] as Map<String, dynamic>,
//       );
//     }

//     return AmbulanceInfo(
//       ambulanceId:
//           json['ambulanceId'] as String? ??
//           json['vehicleNumber'] as String? ??
//           'unknown_${DateTime.now().millisecondsSinceEpoch}',
//       driverName:
//           json['driverName'] as String? ??
//           'Driver ${json['vehicleNumber'] ?? 'Unknown'}',
//       driverPhone: json['driverPhone'] as String? ?? '',
//       vehicleNumber: json['vehicleNumber'] as String? ?? 'UNKNOWN',
//       hospitalId: json['hospitalId'] as String? ?? '',
//       currentLocation: currentLocation,
//       status: _parseAmbulanceStatus(status),
//       currentEmergencyId:
//           json['currentEmergencyId'] as String? ??
//           (() {
//             final emergencyId = json['emergencyId'] as String?;
//             return (emergencyId == null || emergencyId.isEmpty)
//                 ? null
//                 : emergencyId;
//           })(),
//       estimatedArrivalTime: (json['estimatedArrivalTime'] as num?)?.toInt(),
//     );
//   } catch (e) {
//     debugPrint('Error parsing ambulance info: $e');
//     debugPrint('Raw ambulance data: $json');

//     // Return a fallback ambulance
//     return AmbulanceInfo(
//       ambulanceId: 'error_${DateTime.now().millisecondsSinceEpoch}',
//       driverName: 'Unknown Driver',
//       driverPhone: '',
//       vehicleNumber: json['vehicleNumber'] as String? ?? 'ERROR',
//       hospitalId: json['hospitalId'] as String? ?? '',
//       currentLocation: null,
//       status: AmbulanceStatus.offline,
//       currentEmergencyId: null,
//       estimatedArrivalTime: null,
//     );
//   }
// }

// AmbulanceStatus _parseAmbulanceStatus(String statusString) {
//   switch (statusString.toLowerCase()) {
//     case 'available':
//       return AmbulanceStatus.available;
//     case 'idle': // Handle idle status
//       return AmbulanceStatus
//           .available; // Or add AmbulanceStatus.idle if you prefer
//     case 'dispatched':
//       return AmbulanceStatus.dispatched;
//     case 'en_route':
//       return AmbulanceStatus.enRoute;
//     case 'at_pickup':
//       return AmbulanceStatus.atPickup;
//     case 'transporting':
//       return AmbulanceStatus.transporting;
//     case 'at_hospital':
//       return AmbulanceStatus.atHospital;
//     case 'offline':
//       return AmbulanceStatus.offline;
//     default:
//       debugPrint(
//         'Unknown ambulance status: $statusString, defaulting to offline',
//       );
//       return AmbulanceStatus.offline;
//   }
// }

// // Extension to add copyWith method to EmergencyRequest
// extension EmergencyRequestExtension on EmergencyRequest {
//   EmergencyRequest copyWith({
//     String? emergencyId,
//     String? patientId,
//     String? patientName,
//     String? patientPhone,
//     LocationData? pickupLocation,
//     LocationData? destinationLocation,
//     String? severity,
//     String? description,
//     List<String>? hospitalIds,
//     DateTime? requestTime,
//     EmergencyStatus? status,
//     String? acceptedHospitalId,
//     String? assignedAmbulanceId,
//     String? emergencyType,
//     DateTime? timestamp,
//   }) {
//     return EmergencyRequest(
//       emergencyId: emergencyId ?? this.emergencyId,
//       patientId: patientId ?? this.patientId,
//       patientName: patientName ?? this.patientName,
//       patientPhone: patientPhone ?? this.patientPhone,
//       pickupLocation: pickupLocation ?? this.pickupLocation,
//       destinationLocation: destinationLocation ?? this.destinationLocation,
//       severity: severity ?? this.severity,
//       description: description ?? this.description,
//       hospitalIds: hospitalIds ?? this.hospitalIds,
//       requestTime: requestTime ?? this.requestTime,
//       status: status ?? this.status,
//       acceptedHospitalId: acceptedHospitalId ?? this.acceptedHospitalId,
//       assignedAmbulanceId: assignedAmbulanceId ?? this.assignedAmbulanceId,
//       emergencyType: emergencyType ?? this.emergencyType,
//       timestamp: timestamp ?? this.timestamp,
//     );
//   }
// }

import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/ambulance_models.dart';
import '../models/user_models.dart';
import '../services/websocket_service.dart';
import '../services/location_service.dart';

class EmergencyProvider extends ChangeNotifier {
  final WebSocketService _webSocketService = WebSocketService();
  final LocationService _locationService = LocationService();

  List<EmergencyRequest> _emergencyRequests = [];
  List<EmergencyUpdate> _emergencyUpdates = [];
  EmergencyRequest? _currentEmergency;
  HospitalFleet? _hospitalFleet;
  bool _isConnected = false;
  bool _isLoading = false;
  String? _error;
  LocationData? _currentLocation;

  StreamSubscription<WebSocketMessage>? _messageSubscription;
  StreamSubscription<LocationData>? _locationSubscription;

  // Getters
  List<EmergencyRequest> get emergencyRequests => _emergencyRequests;
  List<EmergencyUpdate> get emergencyUpdates => _emergencyUpdates;
  EmergencyRequest? get currentEmergency => _currentEmergency;
  HospitalFleet? get hospitalFleet => _hospitalFleet;
  bool get isConnected => _isConnected;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Convenience getter for ambulances from hospitalFleet
  List<AmbulanceInfo> get ambulances => _hospitalFleet?.ambulances ?? [];
  LocationData? get currentLocation => _currentLocation;

  Future<void> initialize(AppUser user) async {
    _setLoading(true);

    try {
      // Initialize location service
      await _locationService.initialize();
      _currentLocation = _locationService.currentLocation;

      // Connect to WebSocket with proper department and specialization for hospitals
      final connected = await _webSocketService.connect(
        userId: user.id,
        userRole: user.role,
        hospitalId: user.hospitalId,
        department:
            user.role == UserRole.hospital
                ? 'Emergency Department'
                : _getDefaultDepartment(user.role),
        specialization:
            user.role == UserRole.hospital
                ? 'Emergency Medicine'
                : _getDefaultSpecialization(user.role),
      );

      if (connected) {
        _isConnected = true;
        _setupMessageListener();
        _setupLocationListener();

        if (user.role == UserRole.hospital) {
          // Add a small delay before requesting fleet data
          await Future.delayed(const Duration(milliseconds: 2000));
          _webSocketService.getHospitalFleet();
        }
      }

      _setLoading(false);
    } catch (e) {
      _setError('Failed to initialize: ${e.toString()}');
      _setLoading(false);
    }
  }

  String _getDefaultDepartment(UserRole role) {
    switch (role) {
      case UserRole.hospital:
        return 'Emergency Department';
      case UserRole.paramedic:
        return 'Emergency Medical Services';
      case UserRole.patient:
        return 'General';
      default:
        return 'General';
    }
  }

  String _getDefaultSpecialization(UserRole role) {
    switch (role) {
      case UserRole.hospital:
        return 'Emergency Medicine';
      case UserRole.paramedic:
        return 'Emergency Medical Technician';
      case UserRole.patient:
        return 'None';
      default:
        return 'General';
    }
  }

  void _setupMessageListener() {
    _messageSubscription = _webSocketService.messageStream.listen(
      (WebSocketMessage message) {
        debugPrint('🎧 EmergencyProvider received message: ${message.type}');
        _handleWebSocketMessage(message);
      },
      onError: (error) {
        debugPrint('❌ EmergencyProvider WebSocket error: $error');
        _setError('WebSocket error: ${error.toString()}');
      },
    );
  }

  void _setupLocationListener() {
    _locationSubscription = _locationService.locationStream.listen((
      LocationData location,
    ) {
      _currentLocation = location;
      notifyListeners();

      // If there's an active emergency and user is paramedic, send location updates
      if (_currentEmergency != null &&
          _currentEmergency!.status == EmergencyStatus.inProgress) {
        _webSocketService.updateAmbulanceLocation(
          emergencyId: _currentEmergency!.emergencyId,
          location: location,
        );
      }
    });
  }

  void _handleWebSocketMessage(WebSocketMessage message) {
    debugPrint('🔄 Handling message type: ${message.type}');

    switch (message.type) {
      case WebSocketMessageType.emergency_request:
        // This is when a patient sends an emergency request
        _handleNewEmergencyRequest(message);
        break;
      case WebSocketMessageType.emergency_alert: // <-- Add this case
        _handleEmergencyAlert(message);
        break;
      case WebSocketMessageType.emergencyRequestReceived:
        // This is when hospital receives an emergency request
        _handleNewEmergencyRequest(message);
        break;
      case WebSocketMessageType.emergencyUpdate:
        _handleEmergencyUpdate(message);
        break;
      case WebSocketMessageType.locationUpdate:
        _handleLocationUpdate(message);
        break;
      case WebSocketMessageType.fleetStatusUpdate:
        _handleFleetStatusUpdate(message);
        break;
      case WebSocketMessageType.hospitalFleetStatus:
        _handleHospitalFleetStatus(message);
        break;
      case WebSocketMessageType.trackingRoomJoined:
        _handleTrackingRoomJoined(message);
        break;
      case WebSocketMessageType.error:
        _setError(message.data['message'] ?? 'Unknown error');
        break;
      default:
        debugPrint('⚠️ Unhandled message type: ${message.type}');
        break;
    }
  }

  void _handleEmergencyAlert(WebSocketMessage message) {
    try {
      debugPrint('🚨 Handling emergency alert');
      debugPrint('📋 Full message: ${message.toJson()}');

      // Extract the emergency data from the nested structure
      final emergencyData = message.data['data'] ?? message.data;
      debugPrint('📋 Emergency data: $emergencyData');

      // Convert the timestamp string to DateTime
      final timestampString = emergencyData['timestamp'] as String?;
      final timestamp =
          timestampString != null
              ? DateTime.parse(timestampString)
              : DateTime.now();

      // Create a modified map with default values for required fields
      final modifiedData =
          Map<String, dynamic>.from(emergencyData)
            ..putIfAbsent(
              'emergencyType',
              () => 'medical',
            ) // Default emergency type
            ..putIfAbsent(
              'requestTime',
              () => timestamp,
            ) // Use timestamp for requestTime
            ..putIfAbsent(
              'status',
              () => EmergencyStatus.requested.name,
            ) // Default status
            ..['timestamp'] = timestamp; // Ensure timestamp is DateTime

      debugPrint('📋 Modified emergency data: $modifiedData');

      final emergencyRequest = EmergencyRequest.fromJson(modifiedData);

      // Check if this emergency already exists
      final existingIndex = _emergencyRequests.indexWhere(
        (e) => e.emergencyId == emergencyRequest.emergencyId,
      );

      if (existingIndex != -1) {
        _emergencyRequests[existingIndex] = emergencyRequest;
        debugPrint(
          '✅ Updated existing emergency: ${emergencyRequest.emergencyId}',
        );
      } else {
        _emergencyRequests.add(emergencyRequest);
        debugPrint('✅ Added new emergency: ${emergencyRequest.emergencyId}');
      }

      notifyListeners();
    } catch (e, stackTrace) {
      debugPrint('❌ Error handling emergency alert: $e');
      debugPrint('Stack trace: $stackTrace');
      _setError('Failed to process emergency alert: ${e.toString()}');
    }
  }

  void _handleNewEmergencyRequest(WebSocketMessage message) {
    try {
      debugPrint('🚨 Processing new emergency request');
      debugPrint('📋 Message data: ${message.data}');

      // Handle both direct emergency data and nested emergency data
      Map<String, dynamic> emergencyData;
      if (message.data.containsKey('emergency')) {
        emergencyData = message.data['emergency'] as Map<String, dynamic>;
      } else {
        emergencyData = message.data;
      }

      final request = EmergencyRequest.fromJson(emergencyData);

      // Check if we already have this emergency request
      final existingIndex = _emergencyRequests.indexWhere(
        (existing) => existing.emergencyId == request.emergencyId,
      );

      if (existingIndex != -1) {
        // Update existing request
        _emergencyRequests[existingIndex] = request;
        debugPrint(
          '✅ Updated existing emergency request: ${request.emergencyId}',
        );
      } else {
        // Add new request
        _emergencyRequests.add(request);
        debugPrint('✅ Added new emergency request: ${request.emergencyId}');
      }

      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error handling emergency request: $e');
      debugPrint('❌ Message data: ${message.data}');
      _setError('Failed to process emergency request: ${e.toString()}');
    }
  }

  void _handleEmergencyUpdate(WebSocketMessage message) {
    try {
      final update = EmergencyUpdate.fromJson(message.data);
      _emergencyUpdates.add(update);

      // Update current emergency if it matches
      if (_currentEmergency?.emergencyId == update.emergencyId) {
        _currentEmergency = _currentEmergency!.copyWith(status: update.status);
      }

      // Update emergency in the list
      final requestIndex = _emergencyRequests.indexWhere(
        (request) => request.emergencyId == update.emergencyId,
      );
      if (requestIndex != -1) {
        _emergencyRequests[requestIndex] = _emergencyRequests[requestIndex]
            .copyWith(status: update.status);
      }

      debugPrint('✅ Added emergency update: ${update.emergencyId}');
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error handling emergency update: $e');
    }
  }

  void _handleLocationUpdate(WebSocketMessage message) {
    try {
      if (message.data['ambulanceLocation'] != null) {
        final location = LocationData.fromJson(
          message.data['ambulanceLocation'],
        );
        debugPrint('✅ Received ambulance location update');
        // Handle ambulance location update for tracking
        notifyListeners();
      }
    } catch (e) {
      debugPrint('❌ Error handling location update: $e');
    }
  }

  void _handleFleetStatusUpdate(WebSocketMessage message) {
    try {
      _hospitalFleet = HospitalFleet.fromJson(message.data);
      debugPrint(
        '✅ Updated fleet status: ${_hospitalFleet?.ambulances.length} ambulances',
      );
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error handling fleet status update: $e');
    }
  }

  void _handleHospitalFleetStatus(WebSocketMessage message) {
    try {
      debugPrint('🏥 Processing hospital fleet status message');
      debugPrint('📋 Fleet data: ${message.data}');

      if (message.data['fleetStatus'] != null) {
        final fleetData = message.data['fleetStatus'] as Map<String, dynamic>;
        _hospitalFleet = _parseHospitalFleet(fleetData);

        debugPrint(
          '✅ Hospital fleet updated: ${_hospitalFleet?.ambulances.length} ambulances',
        );

        // Print ambulance details for debugging
        _hospitalFleet?.ambulances.forEach((ambulance) {
          debugPrint(
            '🚑 Ambulance: ${ambulance.vehicleNumber} - Status: ${ambulance.status}',
          );
        });

        notifyListeners();
      } else {
        debugPrint('⚠️ No fleetStatus found in message data');
        _setError('Invalid fleet status data received');
      }
    } catch (e, stackTrace) {
      debugPrint('❌ Error handling hospital fleet status: $e');
      debugPrint('Stack trace: $stackTrace');
      debugPrint('📋 Raw message data: ${message.data}');
      _setError('Failed to process fleet status: ${e.toString()}');
    }
  }

  void _handleTrackingRoomJoined(WebSocketMessage message) {
    // Handle successful tracking room join
    debugPrint('✅ Joined tracking room for emergency: ${message.emergencyId}');
  }

  // Emergency Request Methods
  Future<void> createEmergencyRequest({
    required String patientName,
    required String patientPhone,
    required String severity,
    required String description,
    required List<String> hospitalIds,
    LocationData? destinationLocation,
  }) async {
    if (_currentLocation == null) {
      _setError('Current location not available');
      return;
    }

    _setLoading(true);

    try {
      _webSocketService.sendEmergencyRequest(
        patientId: 'patient_${DateTime.now().millisecondsSinceEpoch}',
        patientName: patientName,
        patientPhone: patientPhone,
        pickupLocation: _currentLocation!,
        destinationLocation: destinationLocation,
        severity: severity,
        description: description,
        hospitalIds: hospitalIds,
      );

      _setLoading(false);
    } catch (e) {
      _setError('Failed to create emergency request: ${e.toString()}');
      _setLoading(false);
    }
  }

  Future<void> submitEmergencyRequest(EmergencyRequest request) async {
    if (_currentLocation == null) {
      _setError('Current location not available');
      return;
    }

    _setLoading(true);

    try {
      _webSocketService.sendEmergencyRequest(
        patientId: request.patientId,
        patientName: request.patientName,
        patientPhone: request.patientPhone,
        pickupLocation: request.pickupLocation,
        destinationLocation: request.destinationLocation,
        severity: request.severity,
        description: request.description,
        hospitalIds: request.hospitalIds,
      );

      _setLoading(false);
    } catch (e) {
      _setError('Failed to submit emergency request: ${e.toString()}');
      _setLoading(false);
    }
  }

  void acceptEmergency({
    required String emergencyId,
    required String hospitalId,
    required String ambulanceId,
  }) {
    debugPrint(
      '🚑 Accepting emergency: $emergencyId with ambulance: $ambulanceId',
    );
    _webSocketService.acceptEmergency(
      emergencyId: emergencyId,
      hospitalId: hospitalId,
      ambulanceId: ambulanceId,
    );
  }

  void joinTrackingRoom(String emergencyId) {
    debugPrint('🎯 Joining tracking room: $emergencyId');
    _webSocketService.joinTrackingRoom(emergencyId: emergencyId);

    // Set as current emergency if joining as participant
    final emergency =
        _emergencyRequests
            .where((e) => e.emergencyId == emergencyId)
            .firstOrNull;
    if (emergency != null) {
      _currentEmergency = emergency;
      notifyListeners();
    }
  }

  void leaveTrackingRoom(String emergencyId) {
    debugPrint('🚪 Leaving tracking room: $emergencyId');
    _webSocketService.leaveTrackingRoom(emergencyId: emergencyId);

    if (_currentEmergency?.emergencyId == emergencyId) {
      _currentEmergency = null;
      notifyListeners();
    }
  }

  HospitalFleet _parseHospitalFleet(Map<String, dynamic> json) {
    try {
      return HospitalFleet(
        hospitalId: json['hospitalId'] as String? ?? '',
        totalAmbulances: (json['totalAmbulances'] as num?)?.toInt() ?? 0,
        availableAmbulances:
            (json['availableAmbulances'] as num?)?.toInt() ?? 0,
        activeAmbulances: (json['activeAmbulances'] as num?)?.toInt() ?? 0,
        ambulances:
            (json['ambulances'] as List<dynamic>?)?.map((ambulance) {
              return _parseAmbulanceInfo(ambulance as Map<String, dynamic>);
            }).toList() ??
            [],
        lastUpdated:
            json['lastUpdated'] != null
                ? DateTime.parse(json['lastUpdated'] as String)
                : DateTime.now(),
      );
    } catch (e, stackTrace) {
      debugPrint('Error parsing hospital fleet: $e');
      debugPrint('Stack trace: $stackTrace');
      // Return an empty fleet with error information
      return HospitalFleet(
        hospitalId: json['hospitalId'] as String? ?? 'error',
        totalAmbulances: 0,
        availableAmbulances: 0,
        activeAmbulances: 0,
        ambulances: [],
        lastUpdated: DateTime.now(),
      );
    }
  }

  void startLocationTracking() {
    debugPrint('📍 Starting location tracking');
    _locationService.startLocationTracking();
  }

  void stopLocationTracking() {
    _locationService.stopLocationTracking();
  }

  void stopEmergencyTracking(String emergencyId) {
    _webSocketService.stopAmbulanceTracking(emergencyId: emergencyId);

    if (_currentEmergency?.emergencyId == emergencyId) {
      _currentEmergency = null;
      notifyListeners();
    }
  }

  void refreshHospitalFleet() {
    _webSocketService.getHospitalFleet();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _messageSubscription?.cancel();
    _locationSubscription?.cancel();
    _webSocketService.dispose();
    _locationService.dispose();
    super.dispose();
  }
}

// Add this to your EmergencyProvider class
AmbulanceInfo _parseAmbulanceInfo(Map<String, dynamic> json) {
  try {
    // Handle status mapping - convert 'idle' to 'available'
    String status = json['status'] as String? ?? 'offline';
    if (status == 'idle') {
      status = 'available'; // Map idle to available
    }

    // Handle location mapping - backend sends 'lastLocation', model expects 'currentLocation'
    LocationData? currentLocation;
    if (json['lastLocation'] != null) {
      currentLocation = LocationData.fromJson(
        json['lastLocation'] as Map<String, dynamic>,
      );
    }

    return AmbulanceInfo(
      ambulanceId:
          json['ambulanceId'] as String? ??
          json['vehicleNumber'] as String? ??
          'unknown_${DateTime.now().millisecondsSinceEpoch}',
      driverName:
          json['driverName'] as String? ??
          'Driver ${json['vehicleNumber'] ?? 'Unknown'}',
      driverPhone: json['driverPhone'] as String? ?? '',
      vehicleNumber: json['vehicleNumber'] as String? ?? 'UNKNOWN',
      hospitalId: json['hospitalId'] as String? ?? '',
      currentLocation: currentLocation,
      status: _parseAmbulanceStatus(status),
      currentEmergencyId:
          json['currentEmergencyId'] as String? ??
          (() {
            final emergencyId = json['emergencyId'] as String?;
            return (emergencyId == null || emergencyId.isEmpty)
                ? null
                : emergencyId;
          })(),
      estimatedArrivalTime: (json['estimatedArrivalTime'] as num?)?.toInt(),
    );
  } catch (e) {
    debugPrint('Error parsing ambulance info: $e');
    debugPrint('Raw ambulance data: $json');

    // Return a fallback ambulance
    return AmbulanceInfo(
      ambulanceId: 'error_${DateTime.now().millisecondsSinceEpoch}',
      driverName: 'Unknown Driver',
      driverPhone: '',
      vehicleNumber: json['vehicleNumber'] as String? ?? 'ERROR',
      hospitalId: json['hospitalId'] as String? ?? '',
      currentLocation: null,
      status: AmbulanceStatus.offline,
      currentEmergencyId: null,
      estimatedArrivalTime: null,
    );
  }
}

AmbulanceStatus _parseAmbulanceStatus(String statusString) {
  switch (statusString.toLowerCase()) {
    case 'available':
      return AmbulanceStatus.available;
    case 'idle': // Handle idle status
      return AmbulanceStatus
          .available; // Or add AmbulanceStatus.idle if you prefer
    case 'dispatched':
      return AmbulanceStatus.dispatched;
    case 'en_route':
      return AmbulanceStatus.enRoute;
    case 'at_pickup':
      return AmbulanceStatus.atPickup;
    case 'transporting':
      return AmbulanceStatus.transporting;
    case 'at_hospital':
      return AmbulanceStatus.atHospital;
    case 'offline':
      return AmbulanceStatus.offline;
    default:
      debugPrint(
        'Unknown ambulance status: $statusString, defaulting to offline',
      );
      return AmbulanceStatus.offline;
  }
}

// Extension to add copyWith method to EmergencyRequest
extension EmergencyRequestExtension on EmergencyRequest {
  EmergencyRequest copyWith({
    String? emergencyId,
    String? patientId,
    String? patientName,
    String? patientPhone,
    LocationData? pickupLocation,
    LocationData? destinationLocation,
    String? severity,
    String? description,
    List<String>? hospitalIds,
    DateTime? requestTime,
    EmergencyStatus? status,
    String? acceptedHospitalId,
    String? assignedAmbulanceId,
    String? emergencyType,
    DateTime? timestamp,
  }) {
    return EmergencyRequest(
      emergencyId: emergencyId ?? this.emergencyId,
      patientId: patientId ?? this.patientId,
      patientName: patientName ?? this.patientName,
      patientPhone: patientPhone ?? this.patientPhone,
      pickupLocation: pickupLocation ?? this.pickupLocation,
      destinationLocation: destinationLocation ?? this.destinationLocation,
      severity: severity ?? this.severity,
      description: description ?? this.description,
      hospitalIds: hospitalIds ?? this.hospitalIds,
      requestTime: requestTime ?? this.requestTime,
      status: status ?? this.status,
      acceptedHospitalId: acceptedHospitalId ?? this.acceptedHospitalId,
      assignedAmbulanceId: assignedAmbulanceId ?? this.assignedAmbulanceId,
      emergencyType: emergencyType ?? this.emergencyType,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}
