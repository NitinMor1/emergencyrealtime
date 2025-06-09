# Flutter WebSocket Integration Guide

**Complete Guide for Integrating Flutter with HPlus Backend WebSocket System**

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [WebSocket Connection Setup](#websocket-connection-setup)
4. [Authentication & User Roles](#authentication--user-roles)
5. [Chat System Implementation](#chat-system-implementation)
6. [Emergency System Implementation](#emergency-system-implementation)
7. [Real-time Location Sharing](#real-time-location-sharing)
8. [Message Types & Data Structures](#message-types--data-structures)
9. [Flutter Implementation Examples](#flutter-implementation-examples)
10. [Error Handling & Best Practices](#error-handling--best-practices)
11. [Testing & Debugging](#testing--debugging)

---

## Overview

The HPlus backend provides a comprehensive WebSocket system for real-time communication between hospitals, paramedics, and patients. This system supports:

- **Role-based isolation** (hospitals, doctors, nurses, paramedics, patients)
- **Real-time chat** between authorized users
- **Emergency dispatch** and tracking
- **Location sharing** for emergency services
- **Call management** for consultations
- **Live notifications** and status updates

### Key Features
- ✅ **Secure role-based access control**
- ✅ **Multi-hospital support**
- ✅ **Real-time messaging with delivery status**
- ✅ **Emergency request and response system**
- ✅ **GPS location tracking**
- ✅ **Call management (initiate, accept, reject)**
- ✅ **Automatic reconnection handling**

---

## Prerequisites

### Flutter Dependencies
Add these dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  web_socket_channel: ^2.4.0
  dio: ^5.3.2
  geolocator: ^9.0.2
  permission_handler: ^11.0.1
  shared_preferences: ^2.2.2
  provider: ^6.1.1
  uuid: ^4.1.0
```

### Backend Server Information
- **WebSocket URL**: `ws://your-server-url:port` or `wss://your-server-url:port` (for production)
- **Default Port**: 5000 (check your backend configuration)
- **Protocol**: WebSocket with JSON message format

---

## WebSocket Connection Setup

### 1. Basic Connection Parameters

When connecting to the WebSocket server, you must provide these query parameters:

```
ws://server-url:port?userId={userId}&role={role}&hospitalId={hospitalId}&department={department}&specialization={specialization}
```

#### Required Parameters:
- **userId**: Unique identifier for the user
- **role**: User role (see User Roles section)

#### Optional Parameters:
- **hospitalId**: Required for hospital staff and paramedics
- **department**: User's department (e.g., 'emergency', 'cardiology')
- **specialization**: User's specialization (e.g., 'cardiologist', 'surgeon')

### 2. Flutter WebSocket Service

Create a WebSocket service class:

```dart
import 'dart:convert';
import 'dart:io';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

class WebSocketService {
  static const String baseUrl = 'ws://your-server-url:5000';
  
  WebSocketChannel? _channel;
  bool _isConnected = false;
  
  // Connection parameters
  String? _userId;
  String? _role;
  String? _hospitalId;
  String? _department;
  String? _specialization;
  
  // Callbacks
  Function(Map<String, dynamic>)? onMessage;
  Function()? onConnected;
  Function()? onDisconnected;
  Function(dynamic)? onError;
  
  bool get isConnected => _isConnected;
  
  Future<bool> connect({
    required String userId,
    required String role,
    String? hospitalId,
    String? department,
    String? specialization,
  }) async {
    try {
      _userId = userId;
      _role = role;
      _hospitalId = hospitalId;
      _department = department;
      _specialization = specialization;
      
      final uri = _buildConnectionUri();
      print('Connecting to WebSocket: $uri');
      
      _channel = WebSocketChannel.connect(Uri.parse(uri));
      
      // Listen for messages
      _channel!.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDisconnection,
      );
      
      _isConnected = true;
      onConnected?.call();
      
      return true;
    } catch (e) {
      print('WebSocket connection error: $e');
      onError?.call(e);
      return false;
    }
  }
  
  String _buildConnectionUri() {
    final params = <String, String>{
      'userId': _userId!,
      'role': _role!,
    };
    
    if (_hospitalId != null) params['hospitalId'] = _hospitalId!;
    if (_department != null) params['department'] = _department!;
    if (_specialization != null) params['specialization'] = _specialization!;
    
    final queryString = params.entries
        .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
        .join('&');
    
    return '$baseUrl?$queryString';
  }
  
  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message);
      print('Received WebSocket message: $data');
      onMessage?.call(data);
    } catch (e) {
      print('Error parsing WebSocket message: $e');
    }
  }
  
  void _handleError(dynamic error) {
    print('WebSocket error: $error');
    _isConnected = false;
    onError?.call(error);
  }
  
  void _handleDisconnection() {
    print('WebSocket disconnected');
    _isConnected = false;
    onDisconnected?.call();
  }
  
  void sendMessage(Map<String, dynamic> message) {
    if (_channel != null && _isConnected) {
      final jsonMessage = jsonEncode(message);
      _channel!.sink.add(jsonMessage);
      print('Sent WebSocket message: $jsonMessage');
    } else {
      print('WebSocket not connected. Cannot send message.');
    }
  }
  
  void disconnect() {
    _channel?.sink.close(status.normalClosure);
    _isConnected = false;
  }
}
```

---

## Authentication & User Roles

### User Roles

The system supports these user roles:

| Role | Description | Required Parameters |
|------|-------------|-------------------|
| `patient` | Patient users | userId |
| `doctor` | Medical doctors | userId, hospitalId, department?, specialization? |
| `nurse` | Nursing staff | userId, hospitalId, department? |
| `paramedic` | Emergency paramedics | userId, hospitalId |
| `admin` | Hospital administrators | userId, hospitalId |
| `receptionist` | Reception staff | userId, hospitalId |
| `technician` | Technical staff | userId, hospitalId, department? |
| `pharmacist` | Pharmacy staff | userId, hospitalId |

### Connection Examples

```dart
// Patient connection
await webSocketService.connect(
  userId: 'patient_123',
  role: 'patient',
);

// Doctor connection
await webSocketService.connect(
  userId: 'doctor_456',
  role: 'doctor',
  hospitalId: 'hospital_001',
  department: 'cardiology',
  specialization: 'cardiologist',
);

// Paramedic connection
await webSocketService.connect(
  userId: 'paramedic_789',
  role: 'paramedic',
  hospitalId: 'hospital_001',
);
```

---

## Chat System Implementation

### 1. Joining a Chat Room

Before sending messages, users must join a chat room:

```dart
void joinChatRoom(String receiverId, String hospitalId) {
  webSocketService.sendMessage({
    'type': 'joinChatRoom',
    'receiverId': receiverId,
    'hospitalId': hospitalId,
    'timestamp': DateTime.now().toIso8601String(),
  });
}
```

### 2. Sending Messages

```dart
void sendChatMessage({
  required String receiverId,
  required String hospitalId,
  required String message,
  String messageType = 'text',
  String? replyTo,
  List<Map<String, dynamic>>? attachments,
}) {
  final messageData = {
    'type': 'sendMessage',
    'receiverId': receiverId,
    'hospitalId': hospitalId,
    'message': message,
    'messageType': messageType,
    'timestamp': DateTime.now().toIso8601String(),
  };
  
  if (replyTo != null) messageData['replyTo'] = replyTo;
  if (attachments != null) messageData['attachments'] = attachments;
  
  webSocketService.sendMessage(messageData);
}
```

### 3. Message Types

Support for different message types:

```dart
// Text message
sendChatMessage(
  receiverId: 'doctor_123',
  hospitalId: 'hospital_001',
  message: 'Hello doctor, I need help',
  messageType: 'text',
);

// Image message
sendChatMessage(
  receiverId: 'doctor_123',
  hospitalId: 'hospital_001',
  message: 'Medical report image',
  messageType: 'image',
  attachments: [
    {
      'type': 'image',
      'url': 'https://example.com/image.jpg',
      'name': 'medical_report.jpg',
      'size': 1024000,
    }
  ],
);

// Location message
sendChatMessage(
  receiverId: 'paramedic_456',
  hospitalId: 'hospital_001',
  message: 'My current location',
  messageType: 'location',
);
```

### 4. Message Status Updates

Mark messages as read:

```dart
void markMessageAsRead(String messageId, String chatRoomId) {
  webSocketService.sendMessage({
    'type': 'markAsRead',
    'messageId': messageId,
    'chatRoomId': chatRoomId,
    'timestamp': DateTime.now().toIso8601String(),
  });
}
```

Typing indicators:

```dart
void sendTypingIndicator(String receiverId, String hospitalId, bool isTyping) {
  webSocketService.sendMessage({
    'type': 'typing',
    'receiverId': receiverId,
    'hospitalId': hospitalId,
    'isTyping': isTyping,
    'timestamp': DateTime.now().toIso8601String(),
  });
}
```

### 5. Flutter Chat UI Implementation

```dart
class ChatScreen extends StatefulWidget {
  final String receiverId;
  final String hospitalId;
  
  const ChatScreen({
    Key? key,
    required this.receiverId,
    required this.hospitalId,
  }) : super(key: key);

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<ChatMessage> _messages = [];
  final WebSocketService _webSocketService = WebSocketService();
  
  @override
  void initState() {
    super.initState();
    _setupWebSocket();
    _joinChatRoom();
  }
  
  void _setupWebSocket() {
    _webSocketService.onMessage = _handleWebSocketMessage;
  }
  
  void _joinChatRoom() {
    _webSocketService.sendMessage({
      'type': 'joinChatRoom',
      'receiverId': widget.receiverId,
      'hospitalId': widget.hospitalId,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }
  
  void _handleWebSocketMessage(Map<String, dynamic> data) {
    switch (data['type']) {
      case 'newMessage':
        _handleNewMessage(data['data']);
        break;
      case 'messageDelivered':
        _handleMessageDelivered(data['messageId']);
        break;
      case 'messageRead':
        _handleMessageRead(data['messageId']);
        break;
      case 'typing':
        _handleTypingIndicator(data);
        break;
    }
  }
  
  void _handleNewMessage(Map<String, dynamic> messageData) {
    final message = ChatMessage.fromJson(messageData);
    setState(() {
      _messages.add(message);
    });
    
    // Mark as read if chat is active
    _markAsRead(message.messageId);
  }
  
  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;
    
    final messageText = _messageController.text.trim();
    _messageController.clear();
    
    _webSocketService.sendMessage({
      'type': 'sendMessage',
      'receiverId': widget.receiverId,
      'hospitalId': widget.hospitalId,
      'message': messageText,
      'messageType': 'text',
      'timestamp': DateTime.now().toIso8601String(),
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Chat')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                return ChatMessageWidget(message: _messages[index]);
              },
            ),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }
  
  Widget _buildMessageInput() {
    return Container(
      padding: EdgeInsets.all(8.0),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: InputDecoration(
                hintText: 'Type a message...',
                border: OutlineInputBorder(),
              ),
              onChanged: (text) {
                // Send typing indicator
                _webSocketService.sendMessage({
                  'type': 'typing',
                  'receiverId': widget.receiverId,
                  'hospitalId': widget.hospitalId,
                  'isTyping': text.isNotEmpty,
                  'timestamp': DateTime.now().toIso8601String(),
                });
              },
            ),
          ),
          IconButton(
            icon: Icon(Icons.send),
            onPressed: _sendMessage,
          ),
        ],
      ),
    );
  }
}
```

---

## Emergency System Implementation

### 1. Creating Emergency Requests

```dart
void createEmergencyRequest({
  required String patientId,
  required String patientName,
  required String patientPhone,
  required String hospitalId,
  required double latitude,
  required double longitude,
  required String condition,
  required String priority, // 'low', 'medium', 'high', 'critical'
  String? description,
  String? address,
  Map<String, dynamic>? vitals,
}) {
  final emergencyData = {
    'type': 'emergencyRequest',
    'data': {
      'patientId': patientId,
      'patientName': patientName,
      'patientPhone': patientPhone,
      'hospitalId': hospitalId,
      'location': {
        'lat': latitude,
        'lng': longitude,
        'address': address,
      },
      'condition': condition,
      'description': description,
      'priority': priority,
      'timestamp': DateTime.now().toIso8601String(),
      'vitals': vitals,
    },
  };
  
  webSocketService.sendMessage(emergencyData);
}
```

### 2. Responding to Emergency Requests

For hospital staff and paramedics:

```dart
void respondToEmergency({
  required String emergencyId,
  required String action, // 'accept' or 'reject'
  String? estimatedArrival,
  String? responseNotes,
  String? rejectionReason,
}) {
  final responseData = {
    'type': 'emergencyResponse',
    'data': {
      'emergencyId': emergencyId,
      'action': action,
      'estimatedArrival': estimatedArrival,
      'responseNotes': responseNotes,
      'rejectionReason': rejectionReason,
      'timestamp': DateTime.now().toIso8601String(),
    },
  };
  
  webSocketService.sendMessage(responseData);
}
```

### 3. Emergency Status Updates

```dart
void updateEmergencyStatus({
  required String emergencyId,
  required String status, // 'in_progress', 'completed', 'cancelled'
  String? notes,
  Map<String, dynamic>? vitals,
  Map<String, dynamic>? completionDetails,
}) {
  final updateData = {
    'type': 'emergencyStatusUpdate',
    'data': {
      'emergencyId': emergencyId,
      'status': status,
      'notes': notes,
      'vitals': vitals,
      'completionDetails': completionDetails,
      'timestamp': DateTime.now().toIso8601String(),
    },
  };
  
  webSocketService.sendMessage(updateData);
}
```

### 4. Flutter Emergency UI Implementation

```dart
class EmergencyScreen extends StatefulWidget {
  @override
  _EmergencyScreenState createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  final WebSocketService _webSocketService = WebSocketService();
  final List<EmergencyRequest> _emergencyRequests = [];
  
  @override
  void initState() {
    super.initState();
    _setupWebSocket();
  }
  
  void _setupWebSocket() {
    _webSocketService.onMessage = _handleWebSocketMessage;
  }
  
  void _handleWebSocketMessage(Map<String, dynamic> data) {
    switch (data['type']) {
      case 'emergencyAlert':
        _handleEmergencyAlert(data['data']);
        break;
      case 'emergencyResponse':
        _handleEmergencyResponse(data['data']);
        break;
      case 'emergencyStatusUpdate':
        _handleEmergencyStatusUpdate(data['data']);
        break;
    }
  }
  
  void _handleEmergencyAlert(Map<String, dynamic> emergencyData) {
    final emergency = EmergencyRequest.fromJson(emergencyData);
    setState(() {
      _emergencyRequests.add(emergency);
    });
    
    // Show notification
    _showEmergencyNotification(emergency);
  }
  
  void _showEmergencyNotification(EmergencyRequest emergency) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Emergency Alert'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Patient: ${emergency.patientName}'),
            Text('Condition: ${emergency.condition}'),
            Text('Priority: ${emergency.priority}'),
            Text('Location: ${emergency.location.address ?? 'Unknown'}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _respondToEmergency(emergency.emergencyId, 'reject');
            },
            child: Text('Reject'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _respondToEmergency(emergency.emergencyId, 'accept');
            },
            child: Text('Accept'),
          ),
        ],
      ),
    );
  }
  
  void _respondToEmergency(String emergencyId, String action) {
    _webSocketService.sendMessage({
      'type': 'emergencyResponse',
      'data': {
        'emergencyId': emergencyId,
        'action': action,
        'estimatedArrival': action == 'accept' ? '15 minutes' : null,
        'timestamp': DateTime.now().toIso8601String(),
      },
    });
  }
  
  void _createEmergencyRequest() async {
    // Get current location
    final position = await Geolocator.getCurrentPosition();
    
    _webSocketService.sendMessage({
      'type': 'emergencyRequest',
      'data': {
        'patientId': 'current_user_id',
        'patientName': 'Current User Name',
        'patientPhone': '+1234567890',
        'hospitalId': 'hospital_001',
        'location': {
          'lat': position.latitude,
          'lng': position.longitude,
        },
        'condition': 'Chest pain',
        'priority': 'high',
        'description': 'Experiencing severe chest pain',
        'timestamp': DateTime.now().toIso8601String(),
      },
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Emergency')),
      body: Column(
        children: [
          ElevatedButton(
            onPressed: _createEmergencyRequest,
            child: Text('Emergency Request'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              padding: EdgeInsets.all(16),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _emergencyRequests.length,
              itemBuilder: (context, index) {
                return EmergencyRequestWidget(
                  emergency: _emergencyRequests[index],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## Real-time Location Sharing

### 1. Sending Location Updates

```dart
import 'package:geolocator/geolocator.dart';

class LocationService {
  final WebSocketService webSocketService;
  
  LocationService(this.webSocketService);
  
  Future<void> sendLocationUpdate({
    String? emergencyId,
    bool isEmergency = false,
  }) async {
    try {
      // Check location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      
      if (permission == LocationPermission.deniedForever ||
          permission == LocationPermission.denied) {
        throw 'Location permission denied';
      }
      
      // Get current position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      final locationData = {
        'type': 'locationUpdate',
        'data': {
          'location': {
            'lat': position.latitude,
            'lng': position.longitude,
            'accuracy': position.accuracy,
            'speed': position.speed,
            'heading': position.heading,
            'timestamp': DateTime.now().toIso8601String(),
          },
          'isEmergency': isEmergency,
          'emergencyId': emergencyId,
          'status': 'active',
          'timestamp': DateTime.now().toIso8601String(),
        },
      };
      
      webSocketService.sendMessage(locationData);
    } catch (e) {
      print('Error sending location update: $e');
    }
  }
  
  void startLocationTracking({
    Duration interval = const Duration(seconds: 30),
    String? emergencyId,
    bool isEmergency = false,
  }) {
    Timer.periodic(interval, (timer) {
      sendLocationUpdate(
        emergencyId: emergencyId,
        isEmergency: isEmergency,
      );
    });
  }
}
```

### 2. Requesting Location from Others

```dart
void requestUserLocation(String targetUserId) {
  webSocketService.sendMessage({
    'type': 'locationRequest',
    'targetUserId': targetUserId,
    'timestamp': DateTime.now().toIso8601String(),
  });
}
```

### 3. Handling Location Updates

```dart
void _handleLocationUpdate(Map<String, dynamic> data) {
  final locationData = data['data'];
  final userId = data['userId'];
  final location = locationData['location'];
  
  print('Received location from $userId: ${location['lat']}, ${location['lng']}');
  
  // Update user location on map
  _updateUserLocationOnMap(
    userId,
    location['lat'],
    location['lng'],
    isEmergency: locationData['isEmergency'] ?? false,
  );
}
```

---

## Message Types & Data Structures

### Complete Message Type Reference

```dart
// Message types you can send to the server
enum WebSocketMessageType {
  // Authentication & Connection
  login,
  logout,
  
  // Hospital Operations
  joinHospital,
  
  // Location Services
  locationUpdate,
  locationRequest,
  
  // Chat System
  sendMessage,
  joinChatRoom,
  markAsRead,
  deleteMessage,
  typing,
  
  // User Status
  userOnline,
  userOffline,
  
  // Emergency System
  emergencyRequest,
  emergencyResponse,
  emergencyStatusUpdate,
  
  // Call Management
  callInitiate,
  callAccept,
  callReject,
  callEnd,
  callAddParticipant,
  
  // Notifications
  notification,
  heartbeat,
}
```

### Data Models

```dart
class ChatMessage {
  final String messageId;
  final String senderId;
  final String receiverId;
  final String hospitalId;
  final String message;
  final String messageType;
  final String timestamp;
  final bool isRead;
  final bool isDelivered;
  final String? replyTo;
  final List<MessageAttachment>? attachments;
  
  ChatMessage({
    required this.messageId,
    required this.senderId,
    required this.receiverId,
    required this.hospitalId,
    required this.message,
    required this.messageType,
    required this.timestamp,
    required this.isRead,
    required this.isDelivered,
    this.replyTo,
    this.attachments,
  });
  
  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      messageId: json['messageId'],
      senderId: json['senderId'],
      receiverId: json['receiverId'],
      hospitalId: json['hospitalId'],
      message: json['message'],
      messageType: json['messageType'],
      timestamp: json['timestamp'],
      isRead: json['isRead'] ?? false,
      isDelivered: json['isDelivered'] ?? false,
      replyTo: json['replyTo'],
      attachments: json['attachments']?.map<MessageAttachment>(
        (attachment) => MessageAttachment.fromJson(attachment),
      ).toList(),
    );
  }
}

class EmergencyRequest {
  final String emergencyId;
  final String patientId;
  final String? patientName;
  final String? patientPhone;
  final String hospitalId;
  final EmergencyLocation location;
  final String condition;
  final String? description;
  final String priority;
  final String status;
  final String timestamp;
  final String requestedBy;
  final String requestedByRole;
  final String? assignedTo;
  final String? assignedRole;
  final String? estimatedArrival;
  final Map<String, dynamic>? vitals;
  
  EmergencyRequest({
    required this.emergencyId,
    required this.patientId,
    this.patientName,
    this.patientPhone,
    required this.hospitalId,
    required this.location,
    required this.condition,
    this.description,
    required this.priority,
    required this.status,
    required this.timestamp,
    required this.requestedBy,
    required this.requestedByRole,
    this.assignedTo,
    this.assignedRole,
    this.estimatedArrival,
    this.vitals,
  });
  
  factory EmergencyRequest.fromJson(Map<String, dynamic> json) {
    return EmergencyRequest(
      emergencyId: json['emergencyId'],
      patientId: json['patientId'],
      patientName: json['patientName'],
      patientPhone: json['patientPhone'],
      hospitalId: json['hospitalId'],
      location: EmergencyLocation.fromJson(json['location']),
      condition: json['condition'],
      description: json['description'],
      priority: json['priority'],
      status: json['status'],
      timestamp: json['timestamp'],
      requestedBy: json['requestedBy'],
      requestedByRole: json['requestedByRole'],
      assignedTo: json['assignedTo'],
      assignedRole: json['assignedRole'],
      estimatedArrival: json['estimatedArrival'],
      vitals: json['vitals'],
    );
  }
}

class EmergencyLocation {
  final double lat;
  final double lng;
  final String? address;
  
  EmergencyLocation({
    required this.lat,
    required this.lng,
    this.address,
  });
  
  factory EmergencyLocation.fromJson(Map<String, dynamic> json) {
    return EmergencyLocation(
      lat: json['lat'].toDouble(),
      lng: json['lng'].toDouble(),
      address: json['address'],
    );
  }
}
```

---

## Error Handling & Best Practices

### 1. Connection Management

```dart
class WebSocketManager {
  static const int maxReconnectAttempts = 5;
  static const Duration reconnectDelay = Duration(seconds: 5);
  
  final WebSocketService _webSocketService = WebSocketService();
  int _reconnectAttempts = 0;
  Timer? _reconnectTimer;
  
  Future<void> ensureConnection() async {
    if (!_webSocketService.isConnected) {
      await _attemptReconnection();
    }
  }
  
  Future<void> _attemptReconnection() async {
    if (_reconnectAttempts >= maxReconnectAttempts) {
      print('Max reconnection attempts reached');
      return;
    }
    
    _reconnectAttempts++;
    print('Attempting reconnection... (${_reconnectAttempts}/$maxReconnectAttempts)');
    
    try {
      final connected = await _webSocketService.connect(
        userId: 'your_user_id',
        role: 'your_role',
        hospitalId: 'your_hospital_id',
      );
      
      if (connected) {
        _reconnectAttempts = 0;
        print('Reconnection successful');
      } else {
        _scheduleReconnection();
      }
    } catch (e) {
      print('Reconnection failed: $e');
      _scheduleReconnection();
    }
  }
  
  void _scheduleReconnection() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(reconnectDelay, _attemptReconnection);
  }
  
  void dispose() {
    _reconnectTimer?.cancel();
    _webSocketService.disconnect();
  }
}
```

### 2. Message Queuing

```dart
class MessageQueue {
  final List<Map<String, dynamic>> _pendingMessages = [];
  final WebSocketService webSocketService;
  
  MessageQueue(this.webSocketService);
  
  void sendMessage(Map<String, dynamic> message) {
    if (webSocketService.isConnected) {
      webSocketService.sendMessage(message);
    } else {
      _pendingMessages.add(message);
    }
  }
  
  void processPendingMessages() {
    if (webSocketService.isConnected && _pendingMessages.isNotEmpty) {
      for (final message in _pendingMessages) {
        webSocketService.sendMessage(message);
      }
      _pendingMessages.clear();
    }
  }
}
```

### 3. Error Types & Handling

```dart
void _handleWebSocketMessage(Map<String, dynamic> data) {
  if (data['type'] == 'error') {
    _handleError(data);
    return;
  }
  
  // Process normal messages
  switch (data['type']) {
    case 'connection_established':
      _handleConnectionEstablished(data);
      break;
    case 'newMessage':
      _handleNewMessage(data);
      break;
    case 'emergencyAlert':
      _handleEmergencyAlert(data);
      break;
    // ... other cases
  }
}

void _handleError(Map<String, dynamic> errorData) {
  final errorMessage = errorData['message'] ?? 'Unknown error';
  final errorCode = errorData['code'];
  
  print('WebSocket Error: $errorMessage (Code: $errorCode)');
  
  switch (errorCode) {
    case 'INVALID_ROLE':
      _showErrorDialog('Invalid user role provided');
      break;
    case 'MISSING_HOSPITAL_ID':
      _showErrorDialog('Hospital ID is required for this role');
      break;
    case 'AUTHENTICATION_FAILED':
      _redirectToLogin();
      break;
    default:
      _showErrorDialog('Connection error: $errorMessage');
  }
}
```

---

## Testing & Debugging

### 1. WebSocket Testing Tool

Create a debug screen for testing WebSocket functionality:

```dart
class WebSocketDebugScreen extends StatefulWidget {
  @override
  _WebSocketDebugScreenState createState() => _WebSocketDebugScreenState();
}

class _WebSocketDebugScreenState extends State<WebSocketDebugScreen> {
  final WebSocketService _webSocketService = WebSocketService();
  final TextEditingController _messageController = TextEditingController();
  final List<String> _logs = [];
  
  @override
  void initState() {
    super.initState();
    _setupWebSocket();
  }
  
  void _setupWebSocket() {
    _webSocketService.onMessage = (data) {
      _addLog('Received: ${jsonEncode(data)}');
    };
    
    _webSocketService.onConnected = () {
      _addLog('Connected to WebSocket');
    };
    
    _webSocketService.onDisconnected = () {
      _addLog('Disconnected from WebSocket');
    };
    
    _webSocketService.onError = (error) {
      _addLog('Error: $error');
    };
  }
  
  void _addLog(String log) {
    setState(() {
      _logs.add('${DateTime.now().toString().substring(11, 19)}: $log');
    });
  }
  
  void _sendTestMessage() {
    try {
      final message = jsonDecode(_messageController.text);
      _webSocketService.sendMessage(message);
      _addLog('Sent: ${_messageController.text}');
      _messageController.clear();
    } catch (e) {
      _addLog('Invalid JSON: $e');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('WebSocket Debug')),
      body: Column(
        children: [
          // Connection controls
          Row(
            children: [
              ElevatedButton(
                onPressed: () => _webSocketService.connect(
                  userId: 'test_user',
                  role: 'patient',
                ),
                child: Text('Connect'),
              ),
              ElevatedButton(
                onPressed: _webSocketService.disconnect,
                child: Text('Disconnect'),
              ),
            ],
          ),
          
          // Message input
          Padding(
            padding: EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Enter JSON message',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send),
                  onPressed: _sendTestMessage,
                ),
              ],
            ),
          ),
          
          // Logs
          Expanded(
            child: ListView.builder(
              itemCount: _logs.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Text(
                    _logs[index],
                    style: TextStyle(fontFamily: 'monospace', fontSize: 12),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

### 2. Common Test Messages

```dart
// Test connection
{
  "type": "heartbeat",
  "timestamp": "2024-01-01T12:00:00.000Z"
}

// Test chat message
{
  "type": "sendMessage",
  "receiverId": "doctor_123",
  "hospitalId": "hospital_001",
  "message": "Test message",
  "messageType": "text",
  "timestamp": "2024-01-01T12:00:00.000Z"
}

// Test emergency request
{
  "type": "emergencyRequest",
  "data": {
    "patientId": "patient_123",
    "patientName": "Test Patient",
    "hospitalId": "hospital_001",
    "location": {
      "lat": 37.7749,
      "lng": -122.4194
    },
    "condition": "Test emergency",
    "priority": "high",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Logging & Monitoring

```dart
class WebSocketLogger {
  static void logConnection(String userId, String role) {
    print('🔗 WebSocket Connection: User $userId with role $role');
  }
  
  static void logMessage(String type, Map<String, dynamic> data) {
    print('📨 WebSocket Message: $type - ${jsonEncode(data)}');
  }
  
  static void logError(String error, StackTrace? stackTrace) {
    print('❌ WebSocket Error: $error');
    if (stackTrace != null) {
      print(stackTrace);
    }
  }
  
  static void logEmergency(String emergencyId, String action) {
    print('🚨 Emergency $action: $emergencyId');
  }
}
```

---

## Production Considerations

### 1. Security

- Always use WSS (WebSocket Secure) in production
- Implement proper authentication tokens
- Validate all incoming data
- Use rate limiting to prevent abuse

### 2. Performance

- Implement connection pooling
- Use message batching for high-frequency updates
- Implement proper cleanup for disconnected clients
- Monitor memory usage for large chat histories

### 3. Reliability

- Implement proper error handling and recovery
- Use persistent storage for critical messages
- Implement message acknowledgments
- Plan for server failover scenarios

---

## Support & Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check server URL and port
   - Verify network connectivity
   - Check user role and required parameters

2. **Messages Not Received**
   - Verify WebSocket connection status
   - Check user permissions and chat room membership
   - Ensure proper message format

3. **Emergency Alerts Not Working**
   - Verify user role permissions
   - Check hospital ID mapping
   - Ensure location permissions are granted

4. **Location Sharing Issues**
   - Check location permissions
   - Verify GPS availability
   - Check network connectivity

### Getting Help

For additional support:
- Check server logs for error messages
- Use the debug screen to test message formats
- Verify user roles and hospital assignments
- Contact the backend development team with specific error messages

---

This documentation provides a complete guide for integrating Flutter applications with the HPlus WebSocket backend system. Follow the examples and best practices outlined here for a robust real-time communication implementation.
