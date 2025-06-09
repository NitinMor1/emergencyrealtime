// import 'dart:async';
// import 'dart:convert';
// import 'package:web_socket_channel/web_socket_channel.dart';
// import 'package:logger/logger.dart';
// import '../models/ambulance_models.dart';
// import '../models/user_models.dart';

// enum WebSocketMessageType {
//   emergency_request,
//   emergencyRequestReceived, // Add this for hospital receiving requests
//   emergencyAcceptance,
//   ambulanceLocationUpdate,
//   joinTrackingRoom,
//   leaveTrackingRoom,
//   emergency_alert,
//   getHospitalFleet,
//   stopAmbulanceTracking,
//   emergencyUpdate,
//   locationUpdate,
//   trackingRoomJoined,
//   trackingRoomLeft,
//   fleetStatusUpdate,
//   hospitalFleetStatus,
//   connect,
//   heartbeat,
//   heartbeatAck,
//   error,
// }

// class WebSocketMessage {
//   final WebSocketMessageType type;
//   final Map<String, dynamic> data;
//   final String? emergencyId;
//   final String? userId;
//   final String? hospitalId;

//   WebSocketMessage({
//     required this.type,
//     required this.data,
//     this.emergencyId,
//     this.userId,
//     this.hospitalId,
//   });

//   factory WebSocketMessage.fromJson(Map<String, dynamic> json) {
//     return WebSocketMessage(
//       type: _parseMessageType(json['type']),
//       data: json['data'] ?? json,
//       emergencyId: json['emergencyId'],
//       userId: json['userId'],
//       hospitalId: json['hospitalId'],
//     );
//   }

//   Map<String, dynamic> toJson() {
//     return {
//       'type': _messageTypeToString(type),
//       'data': data,
//       if (emergencyId != null) 'emergencyId': emergencyId,
//       if (userId != null) 'userId': userId,
//       if (hospitalId != null) 'hospitalId': hospitalId,
//     };
//   }

//   static WebSocketMessageType _parseMessageType(String? type) {
//     switch (type) {
//       case 'emergency_request':
//         return WebSocketMessageType.emergency_request;
//       case 'emergency_alert':
//         // TODO: Handle this case.
//         return WebSocketMessageType.emergency_alert;
//       case 'emergencyRequestReceived': // Add this case
//         return WebSocketMessageType.emergencyRequestReceived;
//       case 'emergencyAcceptance':
//         return WebSocketMessageType.emergencyAcceptance;
//       case 'ambulanceLocationUpdate':
//         return WebSocketMessageType.ambulanceLocationUpdate;
//       case 'joinTrackingRoom':
//         return WebSocketMessageType.joinTrackingRoom;
//       case 'leaveTrackingRoom':
//         return WebSocketMessageType.leaveTrackingRoom;
//       case 'getHospitalFleet':
//         return WebSocketMessageType.getHospitalFleet;
//       case 'stopAmbulanceTracking':
//         return WebSocketMessageType.stopAmbulanceTracking;
//       case 'emergencyUpdate':
//         return WebSocketMessageType.emergencyUpdate;
//       case 'locationUpdate':
//         return WebSocketMessageType.locationUpdate;
//       case 'trackingRoomJoined':
//         return WebSocketMessageType.trackingRoomJoined;
//       case 'trackingRoomLeft':
//         return WebSocketMessageType.trackingRoomLeft;
//       case 'fleetStatusUpdate':
//         return WebSocketMessageType.fleetStatusUpdate;
//       case 'hospitalFleetStatus':
//         return WebSocketMessageType.hospitalFleetStatus;
//       case 'connect':
//         return WebSocketMessageType.connect;
//       case 'heartbeat':
//         return WebSocketMessageType.heartbeat;
//       case 'heartbeat_ack':
//         return WebSocketMessageType.heartbeatAck;
//       case 'error':
//         return WebSocketMessageType.error;
//       default:
//         print(
//           '⚠️ Unknown message type: $type, defaulting to error',
//         ); // Add logging
//         return WebSocketMessageType.error;
//     }
//   }

//   static String _messageTypeToString(WebSocketMessageType type) {
//     switch (type) {
//       case WebSocketMessageType.emergency_request:
//         return 'emergency_request';
//       case WebSocketMessageType.emergencyRequestReceived:
//         return 'emergencyRequestReceived';
//       case WebSocketMessageType.emergencyAcceptance:
//         return 'emergencyAcceptance';
//       case WebSocketMessageType.ambulanceLocationUpdate:
//         return 'ambulanceLocationUpdate';
//       case WebSocketMessageType.joinTrackingRoom:
//         return 'joinTrackingRoom';
//       case WebSocketMessageType.leaveTrackingRoom:
//         return 'leaveTrackingRoom';
//       case WebSocketMessageType.getHospitalFleet:
//         return 'getHospitalFleet';
//       case WebSocketMessageType.stopAmbulanceTracking:
//         return 'stopAmbulanceTracking';
//       case WebSocketMessageType.emergencyUpdate:
//         return 'emergencyUpdate';
//       case WebSocketMessageType.locationUpdate:
//         return 'locationUpdate';
//       case WebSocketMessageType.trackingRoomJoined:
//         return 'trackingRoomJoined';
//       case WebSocketMessageType.trackingRoomLeft:
//         return 'trackingRoomLeft';
//       case WebSocketMessageType.fleetStatusUpdate:
//         return 'fleetStatusUpdate';
//       case WebSocketMessageType.hospitalFleetStatus:
//         return 'hospitalFleetStatus';
//       case WebSocketMessageType.connect:
//         return 'connect';
//       case WebSocketMessageType.heartbeat:
//         return 'heartbeat';
//       case WebSocketMessageType.heartbeatAck:
//         return 'heartbeat_ack';
//       case WebSocketMessageType.error:
//         return 'error';
//       case WebSocketMessageType.emergency_alert:
//         // TODO: Handle this case.
//         return 'emergency_alert';
//     }
//   }
// }

// class WebSocketService {
//   static const String _defaultUrl = 'ws://127.0.0.1:5000';

//   WebSocketChannel? _channel;
//   final Logger _logger = Logger();
//   final StreamController<WebSocketMessage> _messageController =
//       StreamController<WebSocketMessage>.broadcast();

//   bool _isConnected = false;
//   String? _currentUserId;
//   UserRole? _currentUserRole;
//   String? _currentHospitalId;
//   String? _currentDepartment;
//   String? _currentSpecialization;
//   Timer? _heartbeatTimer;
//   Timer? _reconnectTimer;

//   Stream<WebSocketMessage> get messageStream => _messageController.stream;
//   bool get isConnected => _isConnected;

//   Future<bool> connect({
//     required String userId,
//     required UserRole userRole,
//     String? hospitalId,
//     String? department,
//     String? specialization,
//     String? customUrl,
//   }) async {
//     print('🔄 Starting WebSocket connection...');
//     print('   User ID: $userId');
//     print('   User Role: $userRole');
//     print('   Hospital ID: $hospitalId');
//     print('   Department: $department');
//     print('   Specialization: $specialization');

//     try {
//       await disconnect();

//       final url = customUrl ?? _defaultUrl;
//       _currentUserId = userId;
//       _currentUserRole = userRole;
//       _currentHospitalId = hospitalId;
//       _currentDepartment = department ?? _getDefaultDepartment(userRole);
//       _currentSpecialization =
//           specialization ?? _getDefaultSpecialization(userRole);

//       print('🌐 Connecting to WebSocket: $url');

//       final queryParams = <String, String>{
//         'userId': userId,
//         'role': _getUserRoleString(userRole),
//         'department': _currentDepartment!,
//         'specialization': _currentSpecialization!,
//       };

//       if (hospitalId != null && hospitalId.isNotEmpty) {
//         queryParams['hospitalId'] = hospitalId;
//       }

//       final uri = Uri.parse(url).replace(queryParameters: queryParams);
//       print('📋 Connection URL with params: $uri');

//       try {
//         _channel = WebSocketChannel.connect(uri);
//         print('✅ WebSocket channel created');

//         _setupMessageListener();
//         await Future.delayed(const Duration(milliseconds: 1000));
//         _sendInitialConnection();

//         _isConnected = true;
//         print('🎉 WebSocket connected successfully!');

//         _startHeartbeat();
//         return true;
//       } catch (e) {
//         print('❌ WebSocket connection error: $e');
//         print('   Error type: ${e.runtimeType}');
//         _isConnected = false;
//         return false;
//       }
//     } catch (e) {
//       print('💥 Fatal connection error: $e');
//       _logger.e('Failed to connect to WebSocket: $e');
//       _isConnected = false;
//       return false;
//     }
//   }

//   String _getDefaultDepartment(UserRole role) {
//     switch (role) {
//       case UserRole.hospital:
//         return 'Emergency Department';
//       case UserRole.paramedic:
//         return 'Emergency Medical Services';
//       case UserRole.patient:
//         return 'General';
//       default:
//         return 'General';
//     }
//   }

//   String _getDefaultSpecialization(UserRole role) {
//     switch (role) {
//       case UserRole.hospital:
//         return 'Emergency Medicine';
//       case UserRole.paramedic:
//         return 'Emergency Medical Technician';
//       case UserRole.patient:
//         return 'None';
//       default:
//         return 'General';
//     }
//   }

//   // void _setupMessageListener() {
//   //   print('🎧 Setting up message listener...');

//   //   _channel?.stream.listen(
//   //     (message) {
//   //       print('📨 Raw message received: $message');

//   //       try {
//   //         final Map<String, dynamic> data = jsonDecode(message);
//   //         print('📋 Parsed message data: $data');

//   //         final wsMessage = WebSocketMessage.fromJson(data);
//   //         print('✅ WebSocket message processed: ${wsMessage.type}');

//   //         // Handle heartbeat acknowledgments quietly
//   //         if (wsMessage.type == WebSocketMessageType.heartbeatAck) {
//   //           print('💓 Heartbeat acknowledged by server');
//   //           return;
//   //         }

//   //         // Log all non-heartbeat messages for debugging
//   //         if (wsMessage.type != WebSocketMessageType.heartbeat) {
//   //           print('🔔 Broadcasting message to UI: ${wsMessage.type}');
//   //         }

//   //         _messageController.add(wsMessage);
//   //         _logger.d('Received message: ${wsMessage.type}');
//   //       } catch (e) {
//   //         print('❌ Error parsing WebSocket message: $e');
//   //         print('❌ Raw message: $message');
//   //         _logger.e('Error parsing WebSocket message: $e');
//   //       }
//   //     },
//   //     onError: (error) {
//   //       print('🚨 WebSocket stream error: $error');
//   //       _logger.e('WebSocket error: $error');
//   //       _isConnected = false;
//   //       _messageController.addError(error);
//   //       _attemptReconnect();
//   //     },
//   //     onDone: () {
//   //       print('🔚 WebSocket connection closed');
//   //       _logger.i('WebSocket connection closed');
//   //       _isConnected = false;
//   //       _attemptReconnect();
//   //     },
//   //   );
//   // }

//   // Update your _setupMessageListener method with this improved version:

//   // void _setupMessageListener() {
//   //   print('🎧 Setting up message listener...');

//   //   _channel?.stream.listen(
//   //     (message) {
//   //       print('📨 Raw message received: $message');

//   //       try {
//   //         final Map<String, dynamic> rawData = jsonDecode(message);
//   //         print('📋 Parsed raw data: $rawData');

//   //         // Handle nested message structure
//   //         Map<String, dynamic> messageData;
//   //         String messageType;

//   //         // Check if the message has a nested structure
//   //         if (rawData.containsKey('data') && rawData['data'] is Map<String, dynamic>) {
//   //           final nestedData = rawData['data'] as Map<String, dynamic>;

//   //           // Use the nested type if available, otherwise use the outer type
//   //           messageType = nestedData['type'] ?? rawData['type'] ?? 'error';

//   //           // For nested messages, use the nested data structure
//   //           messageData = {
//   //             'type': messageType,
//   //             'data': nestedData['data'] ?? nestedData,
//   //             'userId': nestedData['userId'] ?? rawData['userId'],
//   //             'emergencyId': nestedData['emergencyId'] ?? rawData['emergencyId'],
//   //             'hospitalId': nestedData['hospitalId'] ?? rawData['hospitalId'],
//   //           };
//   //         } else {
//   //           // Handle direct message structure
//   //           messageType = rawData['type'] ?? 'error';
//   //           messageData = rawData;
//   //         }

//   //         print('📋 Processed message data: $messageData');
//   //         print('📋 Message type: $messageType');

//   //         final wsMessage = WebSocketMessage.fromJson(messageData);
//   //         print('✅ WebSocket message processed: ${wsMessage.type}');

//   //         // Handle heartbeat acknowledgments quietly
//   //         if (wsMessage.type == WebSocketMessageType.heartbeatAck) {
//   //           print('💓 Heartbeat acknowledged by server');
//   //           return;
//   //         }

//   //         // Log all non-heartbeat messages for debugging
//   //         if (wsMessage.type != WebSocketMessageType.heartbeat) {
//   //           print('🔔 Broadcasting message to UI: ${wsMessage.type}');
//   //         }

//   //         _messageController.add(wsMessage);
//   //         _logger.d('Received message: ${wsMessage.type}');
//   //       } catch (e, stackTrace) {
//   //         print('❌ Error parsing WebSocket message: $e');
//   //         print('❌ Stack trace: $stackTrace');
//   //         print('❌ Raw message: $message');
//   //         _logger.e('Error parsing WebSocket message: $e');

//   //         // Add error message to stream instead of crashing
//   //         _messageController.add(WebSocketMessage(
//   //           type: WebSocketMessageType.error,
//   //           data: {'error': 'Failed to parse message', 'rawMessage': message},
//   //         ));
//   //       }
//   //     },
//   //     onError: (error) {
//   //       print('🚨 WebSocket stream error: $error');
//   //       _logger.e('WebSocket error: $error');
//   //       _isConnected = false;
//   //       _messageController.addError(error);
//   //       _attemptReconnect();
//   //     },
//   //     onDone: () {
//   //       print('🔚 WebSocket connection closed');
//   //       _logger.i('WebSocket connection closed');
//   //       _isConnected = false;
//   //       _attemptReconnect();
//   //     },
//   //   );
//   // }

//   void _setupMessageListener() {
//     print('🎧 Setting up message listener...');

//     _channel?.stream.listen(
//       (message) {
//         print('📨 Raw message received: $message');

//         try {
//           final Map<String, dynamic> rawData = jsonDecode(message);
//           print('📋 Parsed raw data: $rawData');

//           // Handle nested message structure
//           Map<String, dynamic> messageData;
//           String messageType;

//           // Check if the message has a nested structure
//           if (rawData.containsKey('data') &&
//               rawData['data'] is Map<String, dynamic>) {
//             final nestedData = rawData['data'] as Map<String, dynamic>;

//             // Use the nested type if available, otherwise use the outer type
//             messageType = nestedData['type'] ?? rawData['type'] ?? 'error';

//             // For nested messages, use the nested data structure
//             messageData = {
//               'type': messageType,
//               'data': nestedData['data'] ?? nestedData,
//             };

//             // Only add non-null values to avoid logger issues
//             if (nestedData['userId'] != null || rawData['userId'] != null) {
//               messageData['userId'] = nestedData['userId'] ?? rawData['userId'];
//             }
//             if (nestedData['emergencyId'] != null ||
//                 rawData['emergencyId'] != null) {
//               messageData['emergencyId'] =
//                   nestedData['emergencyId'] ?? rawData['emergencyId'];
//             }
//             if (nestedData['hospitalId'] != null ||
//                 rawData['hospitalId'] != null) {
//               messageData['hospitalId'] =
//                   nestedData['hospitalId'] ?? rawData['hospitalId'];
//             }
//           } else {
//             // Handle direct message structure
//             messageType = rawData['type'] ?? 'error';
//             messageData = Map<String, dynamic>.from(rawData);

//             // Remove null values to prevent logger issues
//             messageData.removeWhere((key, value) => value == null);
//           }

//           print('📋 Processed message data: $messageData');
//           print('📋 Message type: $messageType');

//           final wsMessage = WebSocketMessage.fromJson(messageData);
//           print('✅ WebSocket message processed: ${wsMessage.type}');

//           // Handle heartbeat acknowledgments quietly
//           if (wsMessage.type == WebSocketMessageType.heartbeatAck) {
//             print('💓 Heartbeat acknowledged by server');
//             return;
//           }

//           // Log all non-heartbeat messages for debugging
//           if (wsMessage.type != WebSocketMessageType.heartbeat) {
//             print('🔔 Broadcasting message to UI: ${wsMessage.type}');
//           }

//           _messageController.add(wsMessage);

//           // Use safer logging - only log non-null message types
//           if (wsMessage.type != null) {
//             _logger.d('Received message: ${wsMessage.type}');
//           }
//         } catch (e, stackTrace) {
//           print('❌ Error parsing WebSocket message: $e');
//           print('❌ Stack trace: $stackTrace');
//           print('❌ Raw message: $message');

//           // Use safer logging - avoid passing null values to logger
//           try {
//             _logger.e('Error parsing WebSocket message: ${e.toString()}');
//           } catch (logError) {
//             print('❌ Logger error: $logError');
//           }

//           // Add error message to stream instead of crashing
//           _messageController.add(
//             WebSocketMessage(
//               type: WebSocketMessageType.error,
//               data: {
//                 'error': 'Failed to parse message',
//                 'rawMessage': message.toString(),
//               },
//             ),
//           );
//         }
//       },
//       onError: (error) {
//         print('🚨 WebSocket stream error: $error');
//         try {
//           _logger.e('WebSocket error: ${error.toString()}');
//         } catch (logError) {
//           print('❌ Logger error: $logError');
//         }
//         _isConnected = false;
//         _messageController.addError(error);
//         _attemptReconnect();
//       },
//       onDone: () {
//         print('🔚 WebSocket connection closed');
//         try {
//           _logger.i('WebSocket connection closed');
//         } catch (logError) {
//           print('❌ Logger error: $logError');
//         }
//         _isConnected = false;
//         _attemptReconnect();
//       },
//     );
//   }

//   void _sendInitialConnection() {
//     print('🤝 Sending initial connection message...');

//     try {
//       final connectionMessage = {
//         'type': 'connect',
//         'userId': _currentUserId,
//         'role': _getUserRoleString(_currentUserRole!),
//         'hospitalId': _currentHospitalId,
//         'department': _currentDepartment,
//         'specialization': _currentSpecialization,
//         'timestamp': DateTime.now().toIso8601String(),
//       };

//       final jsonMessage = jsonEncode(connectionMessage);
//       print('📤 Sending connection message: $jsonMessage');

//       _channel?.sink.add(jsonMessage);
//       print('✅ Connection message sent successfully');
//     } catch (e) {
//       print('❌ Failed to send connection message: $e');
//     }
//   }

//   String _getUserRoleString(UserRole role) {
//     switch (role) {
//       case UserRole.hospital:
//         return 'hospital';
//       case UserRole.paramedic:
//         return 'paramedic';
//       case UserRole.patient:
//         return 'patient';
//       default:
//         return 'unknown';
//     }
//   }

//   void _startHeartbeat() {
//     print('💓 Starting heartbeat timer...');

//     _heartbeatTimer?.cancel();
//     _heartbeatTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
//       if (_isConnected && _channel != null) {
//         print('💓 Sending heartbeat...');
//         _sendHeartbeat();
//       } else {
//         print('💔 Stopping heartbeat - connection lost');
//         timer.cancel();
//       }
//     });
//   }

//   void _sendHeartbeat() {
//     try {
//       final heartbeat = {
//         'type': 'heartbeat',
//         'userId': _currentUserId,
//         'role': _getUserRoleString(_currentUserRole!),
//         'hospitalId': _currentHospitalId,
//         'department': _currentDepartment,
//         'specialization': _currentSpecialization,
//         'timestamp': DateTime.now().toIso8601String(),
//       };

//       _channel?.sink.add(jsonEncode(heartbeat));
//       print('💓 Heartbeat sent');
//     } catch (e) {
//       print('❌ Failed to send heartbeat: $e');
//       _isConnected = false;
//     }
//   }

//   void _attemptReconnect() {
//     if (_reconnectTimer != null && _reconnectTimer!.isActive) {
//       return;
//     }

//     print('🔄 Attempting to reconnect in 5 seconds...');

//     _reconnectTimer = Timer(const Duration(seconds: 5), () async {
//       if (!_isConnected && _currentUserId != null && _currentUserRole != null) {
//         print('🔄 Reconnecting WebSocket...');

//         await connect(
//           userId: _currentUserId!,
//           userRole: _currentUserRole!,
//           hospitalId: _currentHospitalId,
//           department: _currentDepartment,
//           specialization: _currentSpecialization,
//         );
//       }
//     });
//   }

//   void sendMessage(WebSocketMessage message) {
//     print('📤 Attempting to send message: ${message.type}');

//     if (!_isConnected || _channel == null) {
//       print('⚠️ WebSocket not connected, cannot send message');
//       _logger.w('WebSocket not connected, cannot send message');
//       return;
//     }

//     try {
//       final jsonMessage = jsonEncode(message.toJson());
//       print('📤 Sending JSON message: $jsonMessage');

//       _channel!.sink.add(jsonMessage);
//       print('✅ Message sent successfully: ${message.type}');
//       _logger.d('Sent message: ${message.type}');
//     } catch (e) {
//       print('❌ Error sending WebSocket message: $e');
//       _logger.e('Error sending WebSocket message: $e');
//       _isConnected = false;
//     }
//   }

//   // Emergency Request Methods
//   void sendEmergencyRequest({
//     required String patientId,
//     required String patientName,
//     required String patientPhone,
//     required LocationData pickupLocation,
//     LocationData? destinationLocation,
//     required String severity,
//     required String description,
//     required List<String> hospitalIds,
//   }) {
//     print('🚨 Sending emergency request...');
//     print('   Target hospitals: $hospitalIds');

//     sendMessage(
//       WebSocketMessage(
//         type: WebSocketMessageType.emergency_request,
//         userId: _currentUserId,
//         data: {
//           'patientId': patientId,
//           'patientName': patientName,
//           'patientPhone': patientPhone,
//           'pickupLocation': pickupLocation.toJson(),
//           if (destinationLocation != null)
//             'destinationLocation': destinationLocation.toJson(),
//           'severity': severity,
//           'description': description,
//           'hospitalIds': hospitalIds,
//           'timestamp': DateTime.now().toIso8601String(),
//         },
//       ),
//     );
//   }

//   void acceptEmergency({
//     required String emergencyId,
//     required String hospitalId,
//     required String ambulanceId,
//   }) {
//     print('✅ Accepting emergency: $emergencyId');

//     sendMessage(
//       WebSocketMessage(
//         type: WebSocketMessageType.emergencyAcceptance,
//         emergencyId: emergencyId,
//         userId: _currentUserId,
//         hospitalId: hospitalId,
//         data: {'ambulanceId': ambulanceId},
//       ),
//     );
//   }

//   void updateAmbulanceLocation({
//     required String emergencyId,
//     required LocationData location,
//   }) {
//     sendMessage(
//       WebSocketMessage(
//         type: WebSocketMessageType.ambulanceLocationUpdate,
//         emergencyId: emergencyId,
//         userId: _currentUserId,
//         data: {'location': location.toJson()},
//       ),
//     );
//   }

//   void joinTrackingRoom({required String emergencyId}) {
//     print('🎯 Joining tracking room: $emergencyId');

//     sendMessage(
//       WebSocketMessage(
//         type: WebSocketMessageType.joinTrackingRoom,
//         emergencyId: emergencyId,
//         userId: _currentUserId,
//         hospitalId: _currentHospitalId,
//         data: {},
//       ),
//     );
//   }

//   void leaveTrackingRoom({required String emergencyId}) {
//     print('🚪 Leaving tracking room: $emergencyId');

//     sendMessage(
//       WebSocketMessage(
//         type: WebSocketMessageType.leaveTrackingRoom,
//         emergencyId: emergencyId,
//         userId: _currentUserId,
//         data: {},
//       ),
//     );
//   }

//   void getHospitalFleet() {
//     if (_currentHospitalId == null) {
//       print('⚠️ Cannot get hospital fleet without hospital ID');
//       _logger.w('Cannot get hospital fleet without hospital ID');
//       return;
//     }

//     print('🏥 Getting hospital fleet for: $_currentHospitalId');

//     sendMessage(
//       WebSocketMessage(
//         type: WebSocketMessageType.getHospitalFleet,
//         userId: _currentUserId,
//         hospitalId: _currentHospitalId,
//         data: {},
//       ),
//     );
//   }

//   void stopAmbulanceTracking({required String emergencyId}) {
//     print('🛑 Stopping ambulance tracking: $emergencyId');

//     sendMessage(
//       WebSocketMessage(
//         type: WebSocketMessageType.stopAmbulanceTracking,
//         emergencyId: emergencyId,
//         userId: _currentUserId,
//         data: {},
//       ),
//     );
//   }

//   Future<void> disconnect() async {
//     print('🔌 Disconnecting WebSocket...');

//     try {
//       _isConnected = false;
//       _heartbeatTimer?.cancel();
//       _reconnectTimer?.cancel();

//       await _channel?.sink.close();
//       _channel = null;

//       print('✅ WebSocket disconnected successfully');
//       _logger.i('WebSocket disconnected');
//     } catch (e) {
//       print('❌ Error disconnecting WebSocket: $e');
//       _logger.e('Error disconnecting WebSocket: $e');
//     }
//   }

//   void dispose() {
//     print('🗑️ Disposing WebSocket service...');

//     disconnect();
//     _messageController.close();
//     _heartbeatTimer?.cancel();
//     _reconnectTimer?.cancel();

//     print('✅ WebSocket service disposed');
//   }
// }

import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:logger/logger.dart';
import '../models/ambulance_models.dart';
import '../models/user_models.dart';

enum WebSocketMessageType {
  emergency_request,
  emergencyRequestReceived, // Add this for hospital receiving requests
  emergencyAcceptance,
  ambulanceLocationUpdate,
  joinTrackingRoom,
  leaveTrackingRoom,
  emergency_alert,
  getHospitalFleet,
  stopAmbulanceTracking,
  emergencyUpdate,
  locationUpdate,
  trackingRoomJoined,
  trackingRoomLeft,
  fleetStatusUpdate,
  hospitalFleetStatus,
  connect,
  heartbeat,
  heartbeatAck,
  error,
}

class WebSocketMessage {
  final WebSocketMessageType type;
  final Map<String, dynamic> data;
  final String? emergencyId;
  final String? userId;
  final String? hospitalId;

  WebSocketMessage({
    required this.type,
    required this.data,
    this.emergencyId,
    this.userId,
    this.hospitalId,
  });

  factory WebSocketMessage.fromJson(Map<String, dynamic> json) {
    return WebSocketMessage(
      type: _parseMessageType(json['type']),
      data: json['data'] ?? json,
      emergencyId: json['emergencyId'],
      userId: json['userId'],
      hospitalId: json['hospitalId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': _messageTypeToString(type),
      'data': data,
      if (emergencyId != null) 'emergencyId': emergencyId,
      if (userId != null) 'userId': userId,
      if (hospitalId != null) 'hospitalId': hospitalId,
    };
  }

  static WebSocketMessageType _parseMessageType(String? type) {
    switch (type) {
      case 'emergency_request':
        return WebSocketMessageType.emergency_request;
      case 'emergency_alert':
        // TODO: Handle this case.
        return WebSocketMessageType.emergency_alert;
      case 'emergencyRequestReceived': // Add this case
        return WebSocketMessageType.emergencyRequestReceived;
      case 'emergencyAcceptance':
        return WebSocketMessageType.emergencyAcceptance;
      case 'ambulanceLocationUpdate':
        return WebSocketMessageType.ambulanceLocationUpdate;
      case 'joinTrackingRoom':
        return WebSocketMessageType.joinTrackingRoom;
      case 'leaveTrackingRoom':
        return WebSocketMessageType.leaveTrackingRoom;
      case 'getHospitalFleet':
        return WebSocketMessageType.getHospitalFleet;
      case 'stopAmbulanceTracking':
        return WebSocketMessageType.stopAmbulanceTracking;
      case 'emergencyUpdate':
        return WebSocketMessageType.emergencyUpdate;
      case 'locationUpdate':
        return WebSocketMessageType.locationUpdate;
      case 'trackingRoomJoined':
        return WebSocketMessageType.trackingRoomJoined;
      case 'trackingRoomLeft':
        return WebSocketMessageType.trackingRoomLeft;
      case 'fleetStatusUpdate':
        return WebSocketMessageType.fleetStatusUpdate;
      case 'hospitalFleetStatus':
        return WebSocketMessageType.hospitalFleetStatus;
      case 'connect':
        return WebSocketMessageType.connect;
      case 'heartbeat':
        return WebSocketMessageType.heartbeat;
      case 'heartbeat_ack':
        return WebSocketMessageType.heartbeatAck;
      case 'error':
        return WebSocketMessageType.error;
      default:
        print(
          '⚠️ Unknown message type: $type, defaulting to error',
        ); // Add logging
        return WebSocketMessageType.error;
    }
  }

  static String _messageTypeToString(WebSocketMessageType type) {
    switch (type) {
      case WebSocketMessageType.emergency_request:
        return 'emergency_request';
      case WebSocketMessageType.emergencyRequestReceived:
        return 'emergencyRequestReceived';
      case WebSocketMessageType.emergencyAcceptance:
        return 'emergencyAcceptance';
      case WebSocketMessageType.ambulanceLocationUpdate:
        return 'ambulanceLocationUpdate';
      case WebSocketMessageType.joinTrackingRoom:
        return 'joinTrackingRoom';
      case WebSocketMessageType.leaveTrackingRoom:
        return 'leaveTrackingRoom';
      case WebSocketMessageType.getHospitalFleet:
        return 'getHospitalFleet';
      case WebSocketMessageType.stopAmbulanceTracking:
        return 'stopAmbulanceTracking';
      case WebSocketMessageType.emergencyUpdate:
        return 'emergencyUpdate';
      case WebSocketMessageType.locationUpdate:
        return 'locationUpdate';
      case WebSocketMessageType.trackingRoomJoined:
        return 'trackingRoomJoined';
      case WebSocketMessageType.trackingRoomLeft:
        return 'trackingRoomLeft';
      case WebSocketMessageType.fleetStatusUpdate:
        return 'fleetStatusUpdate';
      case WebSocketMessageType.hospitalFleetStatus:
        return 'hospitalFleetStatus';
      case WebSocketMessageType.connect:
        return 'connect';
      case WebSocketMessageType.heartbeat:
        return 'heartbeat';
      case WebSocketMessageType.heartbeatAck:
        return 'heartbeat_ack';
      case WebSocketMessageType.error:
        return 'error';
      case WebSocketMessageType.emergency_alert:
        // TODO: Handle this case.
        return 'emergency_alert';
    }
  }

  // Also update your WebSocketMessage.fromJson method to handle null values better
  static WebSocketMessage fromJsonSafe(Map<String, dynamic> json) {
    // Create a clean map without null values
    final cleanJson = <String, dynamic>{};
    json.forEach((key, value) {
      if (value != null) {
        cleanJson[key] = value;
      }
    });

    return WebSocketMessage(
      type: _parseMessageType(cleanJson['type']?.toString()),
      data:
          cleanJson['data'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(cleanJson['data'])
              : cleanJson,
      emergencyId: cleanJson['emergencyId']?.toString(),
      userId: cleanJson['userId']?.toString(),
      hospitalId: cleanJson['hospitalId']?.toString(),
    );
  }
}

class WebSocketService {
  static const String _defaultUrl = 'ws://127.0.0.1:5000';

  WebSocketChannel? _channel;
  final Logger _logger = Logger();
  final StreamController<WebSocketMessage> _messageController =
      StreamController<WebSocketMessage>.broadcast();

  bool _isConnected = false;
  String? _currentUserId;
  UserRole? _currentUserRole;
  String? _currentHospitalId;
  String? _currentDepartment;
  String? _currentSpecialization;
  Timer? _heartbeatTimer;
  Timer? _reconnectTimer;

  Stream<WebSocketMessage> get messageStream => _messageController.stream;
  bool get isConnected => _isConnected;

  Future<bool> connect({
    required String userId,
    required UserRole userRole,
    String? hospitalId,
    String? department,
    String? specialization,
    String? customUrl,
  }) async {
    print('🔄 Starting WebSocket connection...');
    print('   User ID: $userId');
    print('   User Role: $userRole');
    print('   Hospital ID: $hospitalId');
    print('   Department: $department');
    print('   Specialization: $specialization');

    try {
      await disconnect();

      final url = customUrl ?? _defaultUrl;
      _currentUserId = userId;
      _currentUserRole = userRole;
      _currentHospitalId = hospitalId;
      _currentDepartment = department ?? _getDefaultDepartment(userRole);
      _currentSpecialization =
          specialization ?? _getDefaultSpecialization(userRole);

      print('🌐 Connecting to WebSocket: $url');

      final queryParams = <String, String>{
        'userId': userId,
        'role': _getUserRoleString(userRole),
        'department': _currentDepartment!,
        'specialization': _currentSpecialization!,
      };

      if (hospitalId != null && hospitalId.isNotEmpty) {
        queryParams['hospitalId'] = hospitalId;
      }

      final uri = Uri.parse(url).replace(queryParameters: queryParams);
      print('📋 Connection URL with params: $uri');

      try {
        _channel = WebSocketChannel.connect(uri);
        print('✅ WebSocket channel created');

        _setupMessageListener();
        await Future.delayed(const Duration(milliseconds: 1000));
        _sendInitialConnection();

        _isConnected = true;
        print('🎉 WebSocket connected successfully!');

        _startHeartbeat();
        return true;
      } catch (e) {
        print('❌ WebSocket connection error: $e');
        print('   Error type: ${e.runtimeType}');
        _isConnected = false;
        return false;
      }
    } catch (e) {
      print('💥 Fatal connection error: $e');
      _logger.e('Failed to connect to WebSocket: $e');
      _isConnected = false;
      return false;
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
    print('🎧 Setting up message listener...');

    _channel?.stream.listen(
      (message) {
        print('📨 Raw message received: $message');

        try {
          final Map<String, dynamic> rawData = jsonDecode(message);
          print('📋 Parsed raw data: $rawData');

          // Handle nested message structure
          Map<String, dynamic> messageData;
          String messageType;

          // Check if the message has a nested structure
          if (rawData.containsKey('data') &&
              rawData['data'] is Map<String, dynamic>) {
            final nestedData = rawData['data'] as Map<String, dynamic>;

            // Use the nested type if available, otherwise use the outer type
            messageType = nestedData['type'] ?? rawData['type'] ?? 'error';

            // For nested messages, use the nested data structure
            messageData = {
              'type': messageType,
              'data': nestedData['data'] ?? nestedData,
            };

            // Only add non-null values to avoid logger issues
            if (nestedData['userId'] != null || rawData['userId'] != null) {
              messageData['userId'] = nestedData['userId'] ?? rawData['userId'];
            }
            if (nestedData['emergencyId'] != null ||
                rawData['emergencyId'] != null) {
              messageData['emergencyId'] =
                  nestedData['emergencyId'] ?? rawData['emergencyId'];
            }
            if (nestedData['hospitalId'] != null ||
                rawData['hospitalId'] != null) {
              messageData['hospitalId'] =
                  nestedData['hospitalId'] ?? rawData['hospitalId'];
            }
          } else {
            // Handle direct message structure
            messageType = rawData['type'] ?? 'error';
            messageData = <String, dynamic>{};

            // Copy non-null values only
            rawData.forEach((key, value) {
              if (value != null) {
                messageData[key] = value;
              }
            });
          }

          print('📋 Processed message data: $messageData');
          print('📋 Message type: $messageType');

          final wsMessage = WebSocketMessage.fromJson(messageData);
          print('✅ WebSocket message processed: ${wsMessage.type}');

          // Handle heartbeat acknowledgments quietly
          if (wsMessage.type == WebSocketMessageType.heartbeatAck) {
            print('💓 Heartbeat acknowledged by server');
            return;
          }

          // Log all non-heartbeat messages for debugging
          if (wsMessage.type != WebSocketMessageType.heartbeat) {
            print('🔔 Broadcasting message to UI: ${wsMessage.type}');
          }

          _messageController.add(wsMessage);

          // Safe logging - create a clean map for logging
          try {
            final logData = <String, dynamic>{
              'type': wsMessage.type.toString(),
              'hasData': wsMessage.data.isNotEmpty,
            };
            if (wsMessage.userId != null) logData['userId'] = wsMessage.userId;
            if (wsMessage.emergencyId != null)
              logData['emergencyId'] = wsMessage.emergencyId;
            if (wsMessage.hospitalId != null)
              logData['hospitalId'] = wsMessage.hospitalId;

            _logger.d('Received message: $logData');
          } catch (logError) {
            print('❌ Logger error: $logError');
            // Fallback to simple print logging
            print('📝 Received message type: ${wsMessage.type}');
          }
        } catch (e, stackTrace) {
          print('❌ Error parsing WebSocket message: $e');
          print('❌ Stack trace: $stackTrace');
          print('❌ Raw message: $message');

          // Use safer logging - avoid passing null values to logger
          try {
            _logger.e(
              'Error parsing WebSocket message',
              error: e,
              stackTrace: stackTrace,
            );
          } catch (logError) {
            print('❌ Logger error during error logging: $logError');
            // Fallback to simple print
            print('📝 WebSocket parse error: ${e.toString()}');
          }

          // Add error message to stream instead of crashing
          _messageController.add(
            WebSocketMessage(
              type: WebSocketMessageType.error,
              data: {
                'error': 'Failed to parse message',
                'rawMessage': message.toString(),
                'errorType': e.runtimeType.toString(),
              },
            ),
          );
        }
      },
      onError: (error) {
        print('🚨 WebSocket stream error: $error');
        try {
          _logger.e('WebSocket error', error: error);
        } catch (logError) {
          print('❌ Logger error during stream error: $logError');
          print('📝 WebSocket stream error: ${error.toString()}');
        }
        _isConnected = false;
        _messageController.addError(error);
        _attemptReconnect();
      },
      onDone: () {
        print('🔚 WebSocket connection closed');
        try {
          _logger.i('WebSocket connection closed');
        } catch (logError) {
          print('❌ Logger error during connection close: $logError');
          print('📝 WebSocket connection closed');
        }
        _isConnected = false;
        _attemptReconnect();
      },
    );
  }

  void _sendInitialConnection() {
    print('🤝 Sending initial connection message...');

    try {
      final connectionMessage = {
        'type': 'connect',
        'userId': _currentUserId,
        'role': _getUserRoleString(_currentUserRole!),
        'hospitalId': _currentHospitalId,
        'department': _currentDepartment,
        'specialization': _currentSpecialization,
        'timestamp': DateTime.now().toIso8601String(),
      };

      final jsonMessage = jsonEncode(connectionMessage);
      print('📤 Sending connection message: $jsonMessage');

      _channel?.sink.add(jsonMessage);
      print('✅ Connection message sent successfully');
    } catch (e) {
      print('❌ Failed to send connection message: $e');
    }
  }

  String _getUserRoleString(UserRole role) {
    switch (role) {
      case UserRole.hospital:
        return 'hospital';
      case UserRole.paramedic:
        return 'paramedic';
      case UserRole.patient:
        return 'patient';
      default:
        return 'unknown';
    }
  }

  void _startHeartbeat() {
    print('💓 Starting heartbeat timer...');

    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (_isConnected && _channel != null) {
        print('💓 Sending heartbeat...');
        _sendHeartbeat();
      } else {
        print('💔 Stopping heartbeat - connection lost');
        timer.cancel();
      }
    });
  }

  void _sendHeartbeat() {
    try {
      final heartbeat = {
        'type': 'heartbeat',
        'userId': _currentUserId,
        'role': _getUserRoleString(_currentUserRole!),
        'hospitalId': _currentHospitalId,
        'department': _currentDepartment,
        'specialization': _currentSpecialization,
        'timestamp': DateTime.now().toIso8601String(),
      };

      _channel?.sink.add(jsonEncode(heartbeat));
      print('💓 Heartbeat sent');
    } catch (e) {
      print('❌ Failed to send heartbeat: $e');
      _isConnected = false;
    }
  }

  void _attemptReconnect() {
    if (_reconnectTimer != null && _reconnectTimer!.isActive) {
      return;
    }

    print('🔄 Attempting to reconnect in 5 seconds...');

    _reconnectTimer = Timer(const Duration(seconds: 5), () async {
      if (!_isConnected && _currentUserId != null && _currentUserRole != null) {
        print('🔄 Reconnecting WebSocket...');

        await connect(
          userId: _currentUserId!,
          userRole: _currentUserRole!,
          hospitalId: _currentHospitalId,
          department: _currentDepartment,
          specialization: _currentSpecialization,
        );
      }
    });
  }

  void sendMessage(WebSocketMessage message) {
    print('📤 Attempting to send message: ${message.type}');

    if (!_isConnected || _channel == null) {
      print('⚠️ WebSocket not connected, cannot send message');
      _logger.w('WebSocket not connected, cannot send message');
      return;
    }

    try {
      final jsonMessage = jsonEncode(message.toJson());
      print('📤 Sending JSON message: $jsonMessage');

      _channel!.sink.add(jsonMessage);
      print('✅ Message sent successfully: ${message.type}');
      _logger.d('Sent message: ${message.type}');
    } catch (e) {
      print('❌ Error sending WebSocket message: $e');
      _logger.e('Error sending WebSocket message: $e');
      _isConnected = false;
    }
  }

  // Emergency Request Methods
  void sendEmergencyRequest({
    required String patientId,
    required String patientName,
    required String patientPhone,
    required LocationData pickupLocation,
    LocationData? destinationLocation,
    required String severity,
    required String description,
    required List<String> hospitalIds,
  }) {
    print('🚨 Sending emergency request...');
    print('   Target hospitals: $hospitalIds');

    sendMessage(
      WebSocketMessage(
        type: WebSocketMessageType.emergency_request,
        userId: _currentUserId,
        data: {
          'patientId': patientId,
          'patientName': patientName,
          'patientPhone': patientPhone,
          'pickupLocation': pickupLocation.toJson(),
          if (destinationLocation != null)
            'destinationLocation': destinationLocation.toJson(),
          'severity': severity,
          'description': description,
          'hospitalIds': hospitalIds,
          'timestamp': DateTime.now().toIso8601String(),
        },
      ),
    );
  }

  void acceptEmergency({
    required String emergencyId,
    required String hospitalId,
    required String ambulanceId,
  }) {
    print('✅ Accepting emergency: $emergencyId');

    sendMessage(
      WebSocketMessage(
        type: WebSocketMessageType.emergencyAcceptance,
        emergencyId: emergencyId,
        userId: _currentUserId,
        hospitalId: hospitalId,
        data: {'ambulanceId': ambulanceId},
      ),
    );
  }

  void updateAmbulanceLocation({
    required String emergencyId,
    required LocationData location,
  }) {
    sendMessage(
      WebSocketMessage(
        type: WebSocketMessageType.ambulanceLocationUpdate,
        emergencyId: emergencyId,
        userId: _currentUserId,
        data: {'location': location.toJson()},
      ),
    );
  }

  void joinTrackingRoom({required String emergencyId}) {
    print('🎯 Joining tracking room: $emergencyId');

    sendMessage(
      WebSocketMessage(
        type: WebSocketMessageType.joinTrackingRoom,
        emergencyId: emergencyId,
        userId: _currentUserId,
        hospitalId: _currentHospitalId,
        data: {},
      ),
    );
  }

  void leaveTrackingRoom({required String emergencyId}) {
    print('🚪 Leaving tracking room: $emergencyId');

    sendMessage(
      WebSocketMessage(
        type: WebSocketMessageType.leaveTrackingRoom,
        emergencyId: emergencyId,
        userId: _currentUserId,
        data: {},
      ),
    );
  }

  void getHospitalFleet() {
    if (_currentHospitalId == null) {
      print('⚠️ Cannot get hospital fleet without hospital ID');
      _logger.w('Cannot get hospital fleet without hospital ID');
      return;
    }

    print('🏥 Getting hospital fleet for: $_currentHospitalId');

    sendMessage(
      WebSocketMessage(
        type: WebSocketMessageType.getHospitalFleet,
        userId: _currentUserId,
        hospitalId: _currentHospitalId,
        data: {},
      ),
    );
  }

  void stopAmbulanceTracking({required String emergencyId}) {
    print('🛑 Stopping ambulance tracking: $emergencyId');

    sendMessage(
      WebSocketMessage(
        type: WebSocketMessageType.stopAmbulanceTracking,
        emergencyId: emergencyId,
        userId: _currentUserId,
        data: {},
      ),
    );
  }

  Future<void> disconnect() async {
    print('🔌 Disconnecting WebSocket...');

    try {
      _isConnected = false;
      _heartbeatTimer?.cancel();
      _reconnectTimer?.cancel();

      await _channel?.sink.close();
      _channel = null;

      print('✅ WebSocket disconnected successfully');
      _logger.i('WebSocket disconnected');
    } catch (e) {
      print('❌ Error disconnecting WebSocket: $e');
      _logger.e('Error disconnecting WebSocket: $e');
    }
  }

  void dispose() {
    print('🗑️ Disposing WebSocket service...');

    disconnect();
    _messageController.close();
    _heartbeatTimer?.cancel();
    _reconnectTimer?.cancel();

    print('✅ WebSocket service disposed');
  }
}
