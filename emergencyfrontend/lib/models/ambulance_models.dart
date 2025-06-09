import 'package:json_annotation/json_annotation.dart';

part 'ambulance_models.g.dart';

@JsonSerializable()
class EmergencyRequest {
  final String emergencyId;
  final String patientId;
  final String patientName;
  final String patientPhone;
  final String emergencyType;
  final LocationData pickupLocation;
  final LocationData? destinationLocation;
  final String severity;
  final String description;
  final List<String> hospitalIds;
  final DateTime requestTime;
  final DateTime timestamp;
  final EmergencyStatus status;
  final String? acceptedHospitalId;
  final String? assignedAmbulanceId;

  EmergencyRequest({
    required this.emergencyId,
    required this.patientId,
    required this.patientName,
    required this.patientPhone,
    required this.emergencyType,
    required this.pickupLocation,
    this.destinationLocation,
    required this.severity,
    required this.description,
    required this.hospitalIds,
    required this.requestTime,
    required this.timestamp,
    required this.status,
    this.acceptedHospitalId,
    this.assignedAmbulanceId,
  });

  // Convenience getter for destination (alias for destinationLocation)
  LocationData? get destination => destinationLocation;

  factory EmergencyRequest.fromJson(Map<String, dynamic> json) =>
      _$EmergencyRequestFromJson(json);
  Map<String, dynamic> toJson() => _$EmergencyRequestToJson(this);
}

enum EmergencyStatus {
  @JsonValue('requested')
  requested,
  @JsonValue('pending')
  pending,
  @JsonValue('accepted')
  accepted,
  @JsonValue('assigned')
  assigned,
  @JsonValue('dispatched')
  dispatched,
  @JsonValue('enRoute')
  enRoute,
  @JsonValue('arrived')
  arrived,
  @JsonValue('rejected')
  rejected,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('idle') // Add this new status
  idle,
  @JsonValue('completed')
  completed,
  @JsonValue('cancelled')
  cancelled,
}

@JsonSerializable()
class LocationData {
  final double latitude;
  final double longitude;
  final String? address;
  final DateTime? timestamp;

  LocationData({
    required this.latitude,
    required this.longitude,
    this.address,
    this.timestamp,
  });

  factory LocationData.fromJson(Map<String, dynamic> json) =>
      _$LocationDataFromJson(json);
  Map<String, dynamic> toJson() => _$LocationDataToJson(this);
}

@JsonSerializable()
class AmbulanceInfo {
  final String ambulanceId;
  final String driverName;
  final String driverPhone;
  final String vehicleNumber;
  final String hospitalId;
  final LocationData? currentLocation;
  final AmbulanceStatus status;
  final String? currentEmergencyId;
  final int? estimatedArrivalTime;

  AmbulanceInfo({
    required this.ambulanceId,
    required this.driverName,
    required this.driverPhone,
    required this.vehicleNumber,
    required this.hospitalId,
    this.currentLocation,
    required this.status,
    this.currentEmergencyId,
    this.estimatedArrivalTime,
  });

  // Convenience getter for availability check
  bool get isAvailable => status == AmbulanceStatus.available;

  // Convenience getter for driver info
  DriverInfo? get driver => DriverInfo(name: driverName, phone: driverPhone);

  factory AmbulanceInfo.fromJson(Map<String, dynamic> json) =>
      _$AmbulanceInfoFromJson(json);
  Map<String, dynamic> toJson() => _$AmbulanceInfoToJson(this);
}

class DriverInfo {
  final String name;
  final String phone;
  final String? employeeId;

  DriverInfo({required this.name, required this.phone, this.employeeId});
}

enum AmbulanceStatus {
  @JsonValue('available')
  available,
  @JsonValue('dispatched')
  dispatched,
  @JsonValue('en_route')
  enRoute,
  @JsonValue('at_pickup')
  atPickup,
  @JsonValue('transporting')
  transporting,
  @JsonValue('at_hospital')
  atHospital,
  @JsonValue('offline')
  offline,
}

@JsonSerializable()
class TrackingRoom {
  final String emergencyId;
  final List<String> participants;
  final bool isActive;
  final DateTime createdAt;

  TrackingRoom({
    required this.emergencyId,
    required this.participants,
    required this.isActive,
    required this.createdAt,
  });

  factory TrackingRoom.fromJson(Map<String, dynamic> json) =>
      _$TrackingRoomFromJson(json);
  Map<String, dynamic> toJson() => _$TrackingRoomToJson(this);
}

@JsonSerializable()
class HospitalFleet {
  final String hospitalId;
  final int totalAmbulances;
  final int availableAmbulances;
  final int activeAmbulances;
  final List<AmbulanceInfo> ambulances;
  final DateTime lastUpdated;

  HospitalFleet({
    required this.hospitalId,
    required this.totalAmbulances,
    required this.availableAmbulances,
    required this.activeAmbulances,
    required this.ambulances,
    required this.lastUpdated,
  });

  factory HospitalFleet.fromJson(Map<String, dynamic> json) =>
      _$HospitalFleetFromJson(json);
  Map<String, dynamic> toJson() => _$HospitalFleetToJson(this);
}

@JsonSerializable()
class EmergencyUpdate {
  final String emergencyId;
  final EmergencyStatus status;
  final LocationData? ambulanceLocation;
  final int? estimatedArrivalTime;
  final String? message;
  final DateTime timestamp;

  EmergencyUpdate({
    required this.emergencyId,
    required this.status,
    this.ambulanceLocation,
    this.estimatedArrivalTime,
    this.message,
    required this.timestamp,
  });

  factory EmergencyUpdate.fromJson(Map<String, dynamic> json) =>
      _$EmergencyUpdateFromJson(json);
  Map<String, dynamic> toJson() => _$EmergencyUpdateToJson(this);
}
