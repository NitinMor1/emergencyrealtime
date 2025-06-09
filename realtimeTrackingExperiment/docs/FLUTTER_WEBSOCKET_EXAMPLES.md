# Flutter WebSocket Examples

This file contains ready-to-use Flutter code examples for integrating with the HPlus WebSocket backend.

## Complete WebSocket Service Implementation

```dart
// websocket_service.dart
import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

class WebSocketService {
  static const String baseUrl = 'ws://your-server-url:5000';
  static const Duration heartbeatInterval = Duration(seconds: 30);
  static const Duration reconnectDelay = Duration(seconds: 5);
  static const int maxReconnectAttempts = 5;
  
  WebSocketChannel? _channel;
  bool _isConnected = false;
  bool _isReconnecting = false;
  int _reconnectAttempts = 0;
  Timer? _heartbeatTimer;
  Timer? _reconnectTimer;
  
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
  Function(int)? onReconnecting;
  
  // Getters
  bool get isConnected => _isConnected;
  bool get isReconnecting => _isReconnecting;
  String? get userId => _userId;
  String? get role => _role;
  String? get hospitalId => _hospitalId;
  
  Future<bool> connect({
    required String userId,
    required String role,
    String? hospitalId,
    String? department,
    String? specialization,
  }) async {
    try {
      // Store connection parameters
      _userId = userId;
      _role = role;
      _hospitalId = hospitalId;
      _department = department;
      _specialization = specialization;
      
      final uri = _buildConnectionUri();
      print('🔗 Connecting to WebSocket: $uri');
      
      _channel = WebSocketChannel.connect(Uri.parse(uri));
      
      // Listen for messages
      _channel!.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDisconnection,
      );
      
      _isConnected = true;
      _reconnectAttempts = 0;
      _isReconnecting = false;
      
      // Start heartbeat
      _startHeartbeat();
      
      onConnected?.call();
      print('✅ WebSocket connected successfully');
      
      return true;
    } catch (e) {
      print('❌ WebSocket connection error: $e');
      onError?.call(e);
      _scheduleReconnection();
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
      print('📨 Received: ${data['type']}');
      
      // Handle system messages
      if (data['type'] == 'connection_established') {
        print('🎉 Connection established successfully');
        return;
      }
      
      if (data['type'] == 'heartbeat_response') {
        print('💓 Heartbeat acknowledged');
        return;
      }
      
      onMessage?.call(data);
    } catch (e) {
      print('❌ Error parsing WebSocket message: $e');
    }
  }
  
  void _handleError(dynamic error) {
    print('❌ WebSocket error: $error');
    _isConnected = false;
    _stopHeartbeat();
    onError?.call(error);
    _scheduleReconnection();
  }
  
  void _handleDisconnection() {
    print('🔌 WebSocket disconnected');
    _isConnected = false;
    _stopHeartbeat();
    onDisconnected?.call();
    
    if (!_isReconnecting) {
      _scheduleReconnection();
    }
  }
  
  void _scheduleReconnection() {
    if (_reconnectAttempts >= maxReconnectAttempts) {
      print('❌ Max reconnection attempts reached');
      _isReconnecting = false;
      return;
    }
    
    if (_isReconnecting) return;
    
    _isReconnecting = true;
    _reconnectAttempts++;
    
    print('🔄 Scheduling reconnection attempt $_reconnectAttempts/$maxReconnectAttempts');
    onReconnecting?.call(_reconnectAttempts);
    
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(reconnectDelay, () {
      connect(
        userId: _userId!,
        role: _role!,
        hospitalId: _hospitalId,
        department: _department,
        specialization: _specialization,
      );
    });
  }
  
  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(heartbeatInterval, (timer) {
      if (_isConnected) {
        sendMessage({
          'type': 'heartbeat',
          'timestamp': DateTime.now().toIso8601String(),
        });
      }
    });
  }
  
  void _stopHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;
  }
  
  void sendMessage(Map<String, dynamic> message) {
    if (_channel != null && _isConnected) {
      final jsonMessage = jsonEncode(message);
      _channel!.sink.add(jsonMessage);
      print('📤 Sent: ${message['type']}');
    } else {
      print('❌ WebSocket not connected. Cannot send message: ${message['type']}');
    }
  }
  
  void disconnect() {
    _reconnectTimer?.cancel();
    _stopHeartbeat();
    _channel?.sink.close(status.normalClosure);
    _isConnected = false;
    _isReconnecting = false;
  }
  
  void dispose() {
    disconnect();
  }
}
```

## Chat Manager Implementation

```dart
// chat_manager.dart
import 'dart:convert';
import 'websocket_service.dart';

class ChatMessage {
  final String messageId;
  final String senderId;
  final String receiverId;
  final String hospitalId;
  final String message;
  final String messageType;
  final DateTime timestamp;
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
    this.isRead = false,
    this.isDelivered = false,
    this.replyTo,
    this.attachments,
  });
  
  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      messageId: json['messageId'] ?? '',
      senderId: json['senderId'] ?? '',
      receiverId: json['receiverId'] ?? '',
      hospitalId: json['hospitalId'] ?? '',
      message: json['message'] ?? '',
      messageType: json['messageType'] ?? 'text',
      timestamp: DateTime.parse(json['timestamp']),
      isRead: json['isRead'] ?? false,
      isDelivered: json['isDelivered'] ?? false,
      replyTo: json['replyTo'],
      attachments: json['attachments']?.map<MessageAttachment>(
        (attachment) => MessageAttachment.fromJson(attachment),
      ).toList(),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'messageId': messageId,
      'senderId': senderId,
      'receiverId': receiverId,
      'hospitalId': hospitalId,
      'message': message,
      'messageType': messageType,
      'timestamp': timestamp.toIso8601String(),
      'isRead': isRead,
      'isDelivered': isDelivered,
      'replyTo': replyTo,
      'attachments': attachments?.map((a) => a.toJson()).toList(),
    };
  }
}

class MessageAttachment {
  final String type;
  final String url;
  final String name;
  final int? size;
  
  MessageAttachment({
    required this.type,
    required this.url,
    required this.name,
    this.size,
  });
  
  factory MessageAttachment.fromJson(Map<String, dynamic> json) {
    return MessageAttachment(
      type: json['type'],
      url: json['url'],
      name: json['name'],
      size: json['size'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'url': url,
      'name': name,
      'size': size,
    };
  }
}

class ChatManager {
  final WebSocketService _webSocketService;
  final Map<String, List<ChatMessage>> _chatHistory = {};
  final Map<String, bool> _typingStatus = {};
  
  // Callbacks
  Function(ChatMessage)? onNewMessage;
  Function(String messageId)? onMessageDelivered;
  Function(String messageId)? onMessageRead;
  Function(String userId, bool isTyping)? onTypingStatusChanged;
  Function(String chatRoomId)? onChatRoomJoined;
  
  ChatManager(this._webSocketService) {
    _webSocketService.onMessage = _handleWebSocketMessage;
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
      case 'chatRoomJoined':
        _handleChatRoomJoined(data['chatRoomId']);
        break;
    }
  }
  
  void _handleNewMessage(Map<String, dynamic> messageData) {
    final message = ChatMessage.fromJson(messageData);
    final chatRoomId = _getChatRoomId(message.senderId, message.receiverId, message.hospitalId);
    
    if (!_chatHistory.containsKey(chatRoomId)) {
      _chatHistory[chatRoomId] = [];
    }
    
    _chatHistory[chatRoomId]!.add(message);
    onNewMessage?.call(message);
    
    // Auto-mark as read if it's from the current conversation
    // You might want to add conditions here based on your app state
    markAsRead(message.messageId, chatRoomId);
  }
  
  void _handleMessageDelivered(String messageId) {
    onMessageDelivered?.call(messageId);
  }
  
  void _handleMessageRead(String messageId) {
    onMessageRead?.call(messageId);
  }
  
  void _handleTypingIndicator(Map<String, dynamic> data) {
    final userId = data['senderId'];
    final isTyping = data['isTyping'] ?? false;
    
    _typingStatus[userId] = isTyping;
    onTypingStatusChanged?.call(userId, isTyping);
  }
  
  void _handleChatRoomJoined(String chatRoomId) {
    onChatRoomJoined?.call(chatRoomId);
  }
  
  String _getChatRoomId(String senderId, String receiverId, String hospitalId) {
    final participants = [senderId, receiverId]..sort();
    return 'chat_${hospitalId}_${participants.join('_')}';
  }
  
  void joinChatRoom(String receiverId, String hospitalId) {
    _webSocketService.sendMessage({
      'type': 'joinChatRoom',
      'receiverId': receiverId,
      'hospitalId': hospitalId,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }
  
  void sendMessage({
    required String receiverId,
    required String hospitalId,
    required String message,
    String messageType = 'text',
    String? replyTo,
    List<MessageAttachment>? attachments,
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
    if (attachments != null) {
      messageData['attachments'] = attachments.map((a) => a.toJson()).toList();
    }
    
    _webSocketService.sendMessage(messageData);
  }
  
  void markAsRead(String messageId, String chatRoomId) {
    _webSocketService.sendMessage({
      'type': 'markAsRead',
      'messageId': messageId,
      'chatRoomId': chatRoomId,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }
  
  void sendTypingIndicator(String receiverId, String hospitalId, bool isTyping) {
    _webSocketService.sendMessage({
      'type': 'typing',
      'receiverId': receiverId,
      'hospitalId': hospitalId,
      'isTyping': isTyping,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }
  
  void deleteMessage(String messageId) {
    _webSocketService.sendMessage({
      'type': 'deleteMessage',
      'messageId': messageId,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }
  
  List<ChatMessage> getChatHistory(String chatRoomId) {
    return _chatHistory[chatRoomId] ?? [];
  }
  
  bool isUserTyping(String userId) {
    return _typingStatus[userId] ?? false;
  }
  
  void clearChatHistory(String chatRoomId) {
    _chatHistory.remove(chatRoomId);
  }
}
```

## Emergency Manager Implementation

```dart
// emergency_manager.dart
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'websocket_service.dart';

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
  
  Map<String, dynamic> toJson() {
    return {
      'lat': lat,
      'lng': lng,
      'address': address,
    };
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
  final DateTime timestamp;
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
      timestamp: DateTime.parse(json['timestamp']),
      requestedBy: json['requestedBy'],
      requestedByRole: json['requestedByRole'],
      assignedTo: json['assignedTo'],
      assignedRole: json['assignedRole'],
      estimatedArrival: json['estimatedArrival'],
      vitals: json['vitals'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'emergencyId': emergencyId,
      'patientId': patientId,
      'patientName': patientName,
      'patientPhone': patientPhone,
      'hospitalId': hospitalId,
      'location': location.toJson(),
      'condition': condition,
      'description': description,
      'priority': priority,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
      'requestedBy': requestedBy,
      'requestedByRole': requestedByRole,
      'assignedTo': assignedTo,
      'assignedRole': assignedRole,
      'estimatedArrival': estimatedArrival,
      'vitals': vitals,
    };
  }
}

class EmergencyManager {
  final WebSocketService _webSocketService;
  final Map<String, EmergencyRequest> _activeEmergencies = {};
  
  // Callbacks
  Function(EmergencyRequest)? onEmergencyAlert;
  Function(EmergencyRequest)? onEmergencyResponse;
  Function(EmergencyRequest)? onEmergencyStatusUpdate;
  Function(String emergencyId, String status)? onEmergencyCompleted;
  
  EmergencyManager(this._webSocketService) {
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
    _activeEmergencies[emergency.emergencyId] = emergency;
    onEmergencyAlert?.call(emergency);
  }
  
  void _handleEmergencyResponse(Map<String, dynamic> responseData) {
    final emergencyId = responseData['emergencyId'];
    if (_activeEmergencies.containsKey(emergencyId)) {
      // Update the emergency with response data
      final updatedEmergency = EmergencyRequest.fromJson({
        ..._activeEmergencies[emergencyId]!.toJson(),
        ...responseData,
      });
      
      _activeEmergencies[emergencyId] = updatedEmergency;
      onEmergencyResponse?.call(updatedEmergency);
    }
  }
  
  void _handleEmergencyStatusUpdate(Map<String, dynamic> updateData) {
    final emergencyId = updateData['emergencyId'];
    if (_activeEmergencies.containsKey(emergencyId)) {
      final updatedEmergency = EmergencyRequest.fromJson({
        ..._activeEmergencies[emergencyId]!.toJson(),
        ...updateData,
      });
      
      _activeEmergencies[emergencyId] = updatedEmergency;
      onEmergencyStatusUpdate?.call(updatedEmergency);
      
      if (updateData['status'] == 'completed' || updateData['status'] == 'cancelled') {
        onEmergencyCompleted?.call(emergencyId, updateData['status']);
        _activeEmergencies.remove(emergencyId);
      }
    }
  }
  
  Future<void> createEmergencyRequest({
    required String patientId,
    required String patientName,
    required String patientPhone,
    required String hospitalId,
    required String condition,
    required String priority,
    String? description,
    Map<String, dynamic>? vitals,
  }) async {
    try {
      // Get current location
      final position = await _getCurrentLocation();
      
      final emergencyData = {
        'type': 'emergencyRequest',
        'data': {
          'patientId': patientId,
          'patientName': patientName,
          'patientPhone': patientPhone,
          'hospitalId': hospitalId,
          'location': {
            'lat': position.latitude,
            'lng': position.longitude,
          },
          'condition': condition,
          'description': description,
          'priority': priority,
          'timestamp': DateTime.now().toIso8601String(),
          'vitals': vitals,
        },
      };
      
      _webSocketService.sendMessage(emergencyData);
    } catch (e) {
      print('Error creating emergency request: $e');
      rethrow;
    }
  }
  
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
    
    _webSocketService.sendMessage(responseData);
  }
  
  void updateEmergencyStatus({
    required String emergencyId,
    required String status,
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
    
    _webSocketService.sendMessage(updateData);
  }
  
  Future<Position> _getCurrentLocation() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw 'Location permissions are denied';
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      throw 'Location permissions are permanently denied';
    }
    
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }
  
  List<EmergencyRequest> getActiveEmergencies() {
    return _activeEmergencies.values.toList();
  }
  
  EmergencyRequest? getEmergency(String emergencyId) {
    return _activeEmergencies[emergencyId];
  }
  
  void clearCompletedEmergencies() {
    _activeEmergencies.removeWhere((key, value) => 
        value.status == 'completed' || value.status == 'cancelled');
  }
}
```

## Location Manager Implementation

```dart
// location_manager.dart
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'websocket_service.dart';

class LocationUpdate {
  final String userId;
  final String userRole;
  final String? hospitalId;
  final LocationData location;
  final bool isEmergency;
  final String? emergencyId;
  final String status;
  final DateTime timestamp;
  
  LocationUpdate({
    required this.userId,
    required this.userRole,
    this.hospitalId,
    required this.location,
    this.isEmergency = false,
    this.emergencyId,
    required this.status,
    required this.timestamp,
  });
  
  factory LocationUpdate.fromJson(Map<String, dynamic> json) {
    return LocationUpdate(
      userId: json['userId'],
      userRole: json['userRole'],
      hospitalId: json['hospitalId'],
      location: LocationData.fromJson(json['location']),
      isEmergency: json['isEmergency'] ?? false,
      emergencyId: json['emergencyId'],
      status: json['status'],
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'userRole': userRole,
      'hospitalId': hospitalId,
      'location': location.toJson(),
      'isEmergency': isEmergency,
      'emergencyId': emergencyId,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class LocationData {
  final double lat;
  final double lng;
  final double? accuracy;
  final double? speed;
  final double? heading;
  final DateTime timestamp;
  
  LocationData({
    required this.lat,
    required this.lng,
    this.accuracy,
    this.speed,
    this.heading,
    required this.timestamp,
  });
  
  factory LocationData.fromJson(Map<String, dynamic> json) {
    return LocationData(
      lat: json['lat'].toDouble(),
      lng: json['lng'].toDouble(),
      accuracy: json['accuracy']?.toDouble(),
      speed: json['speed']?.toDouble(),
      heading: json['heading']?.toDouble(),
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'lat': lat,
      'lng': lng,
      'accuracy': accuracy,
      'speed': speed,
      'heading': heading,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class LocationManager {
  final WebSocketService _webSocketService;
  final Map<String, LocationUpdate> _userLocations = {};
  
  Timer? _locationTimer;
  StreamSubscription<Position>? _positionStream;
  
  // Callbacks
  Function(LocationUpdate)? onLocationUpdate;
  Function(String userId)? onLocationRequested;
  
  LocationManager(this._webSocketService) {
    _webSocketService.onMessage = _handleWebSocketMessage;
  }
  
  void _handleWebSocketMessage(Map<String, dynamic> data) {
    switch (data['type']) {
      case 'locationUpdate':
        _handleLocationUpdate(data);
        break;
      case 'locationRequest':
        _handleLocationRequest(data);
        break;
    }
  }
  
  void _handleLocationUpdate(Map<String, dynamic> data) {
    final locationUpdate = LocationUpdate.fromJson(data);
    _userLocations[locationUpdate.userId] = locationUpdate;
    onLocationUpdate?.call(locationUpdate);
  }
  
  void _handleLocationRequest(Map<String, dynamic> data) {
    final requesterId = data['requesterId'];
    onLocationRequested?.call(requesterId);
    
    // Automatically send current location if available
    sendCurrentLocation();
  }
  
  Future<void> sendLocationUpdate({
    String? emergencyId,
    bool isEmergency = false,
    String status = 'active',
  }) async {
    try {
      final position = await _getCurrentLocation();
      
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
          'status': status,
          'timestamp': DateTime.now().toIso8601String(),
        },
      };
      
      _webSocketService.sendMessage(locationData);
    } catch (e) {
      print('Error sending location update: $e');
    }
  }
  
  Future<void> sendCurrentLocation() async {
    await sendLocationUpdate();
  }
  
  void requestUserLocation(String targetUserId) {
    _webSocketService.sendMessage({
      'type': 'locationRequest',
      'targetUserId': targetUserId,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }
  
  void startLocationTracking({
    Duration interval = const Duration(seconds: 30),
    String? emergencyId,
    bool isEmergency = false,
  }) async {
    // Stop any existing tracking
    stopLocationTracking();
    
    try {
      // Check permissions
      await _checkLocationPermissions();
      
      // Start periodic location updates
      _locationTimer = Timer.periodic(interval, (timer) {
        sendLocationUpdate(
          emergencyId: emergencyId,
          isEmergency: isEmergency,
        );
      });
      
      print('📍 Location tracking started (interval: ${interval.inSeconds}s)');
    } catch (e) {
      print('❌ Failed to start location tracking: $e');
      rethrow;
    }
  }
  
  void startRealtimeLocationTracking({
    String? emergencyId,
    bool isEmergency = false,
  }) async {
    try {
      await _checkLocationPermissions();
      
      const LocationSettings locationSettings = LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Update every 10 meters
      );
      
      _positionStream = Geolocator.getPositionStream(
        locationSettings: locationSettings,
      ).listen((Position position) {
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
        
        _webSocketService.sendMessage(locationData);
      });
      
      print('📍 Real-time location tracking started');
    } catch (e) {
      print('❌ Failed to start real-time location tracking: $e');
      rethrow;
    }
  }
  
  void stopLocationTracking() {
    _locationTimer?.cancel();
    _locationTimer = null;
    
    _positionStream?.cancel();
    _positionStream = null;
    
    print('📍 Location tracking stopped');
  }
  
  Future<Position> _getCurrentLocation() async {
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }
  
  Future<void> _checkLocationPermissions() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw 'Location permissions are denied';
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      throw 'Location permissions are permanently denied';
    }
  }
  
  LocationUpdate? getUserLocation(String userId) {
    return _userLocations[userId];
  }
  
  List<LocationUpdate> getAllUserLocations() {
    return _userLocations.values.toList();
  }
  
  List<LocationUpdate> getEmergencyLocations() {
    return _userLocations.values
        .where((location) => location.isEmergency)
        .toList();
  }
  
  void clearUserLocation(String userId) {
    _userLocations.remove(userId);
  }
  
  void clearAllLocations() {
    _userLocations.clear();
  }
  
  void dispose() {
    stopLocationTracking();
  }
}
```

## Complete Integration Example

```dart
// main_websocket_integration.dart
import 'package:flutter/material.dart';
import 'websocket_service.dart';
import 'chat_manager.dart';
import 'emergency_manager.dart';
import 'location_manager.dart';

class WebSocketIntegration {
  static WebSocketIntegration? _instance;
  static WebSocketIntegration get instance {
    _instance ??= WebSocketIntegration._internal();
    return _instance!;
  }
  
  WebSocketIntegration._internal();
  
  late final WebSocketService webSocketService;
  late final ChatManager chatManager;
  late final EmergencyManager emergencyManager;
  late final LocationManager locationManager;
  
  bool _isInitialized = false;
  
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    webSocketService = WebSocketService();
    chatManager = ChatManager(webSocketService);
    emergencyManager = EmergencyManager(webSocketService);
    locationManager = LocationManager(webSocketService);
    
    _setupCallbacks();
    _isInitialized = true;
  }
  
  void _setupCallbacks() {
    // WebSocket callbacks
    webSocketService.onConnected = () {
      print('🎉 WebSocket connected successfully');
    };
    
    webSocketService.onDisconnected = () {
      print('🔌 WebSocket disconnected');
    };
    
    webSocketService.onError = (error) {
      print('❌ WebSocket error: $error');
    };
    
    webSocketService.onReconnecting = (attempt) {
      print('🔄 Reconnecting... attempt $attempt');
    };
    
    // Chat callbacks
    chatManager.onNewMessage = (message) {
      print('💬 New message from ${message.senderId}: ${message.message}');
      // Handle new message in UI
    };
    
    chatManager.onTypingStatusChanged = (userId, isTyping) {
      print('✍️ $userId is ${isTyping ? 'typing' : 'not typing'}');
      // Update typing indicator in UI
    };
    
    // Emergency callbacks
    emergencyManager.onEmergencyAlert = (emergency) {
      print('🚨 Emergency alert: ${emergency.condition}');
      // Show emergency notification
    };
    
    emergencyManager.onEmergencyResponse = (emergency) {
      print('🏥 Emergency response: ${emergency.status}');
      // Update emergency status in UI
    };
    
    // Location callbacks
    locationManager.onLocationUpdate = (locationUpdate) {
      print('📍 Location update from ${locationUpdate.userId}');
      // Update user location on map
    };
  }
  
  Future<bool> connect({
    required String userId,
    required String role,
    String? hospitalId,
    String? department,
    String? specialization,
  }) async {
    await initialize();
    
    return await webSocketService.connect(
      userId: userId,
      role: role,
      hospitalId: hospitalId,
      department: department,
      specialization: specialization,
    );
  }
  
  void disconnect() {
    locationManager.dispose();
    webSocketService.disconnect();
  }
}

// Usage example in a Flutter app
class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final WebSocketIntegration _wsIntegration = WebSocketIntegration.instance;
  
  @override
  void initState() {
    super.initState();
    _connectWebSocket();
  }
  
  Future<void> _connectWebSocket() async {
    try {
      final connected = await _wsIntegration.connect(
        userId: 'user_123',
        role: 'patient', // or 'doctor', 'nurse', etc.
        hospitalId: 'hospital_001', // required for hospital staff
      );
      
      if (connected) {
        print('✅ Connected to WebSocket successfully');
        
        // Start location tracking for emergency situations
        _wsIntegration.locationManager.startLocationTracking();
      } else {
        print('❌ Failed to connect to WebSocket');
      }
    } catch (e) {
      print('❌ Connection error: $e');
    }
  }
  
  @override
  void dispose() {
    _wsIntegration.disconnect();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HPlus Medical App',
      home: HomeScreen(),
    );
  }
}
```

This comprehensive example shows how to integrate all WebSocket functionality into a Flutter application with proper error handling, reconnection logic, and clean architecture.
