// // GENERATED CODE - DO NOT MODIFY BY HAND

// part of 'ambulance_models.dart';

// // **************************************************************************
// // JsonSerializableGenerator
// // **************************************************************************

// EmergencyRequest _$EmergencyRequestFromJson(Map<String, dynamic> json) =>
//     EmergencyRequest(
//       emergencyId: json['emergencyId'] as String,
//       patientId: json['patientId'] as String,
//       patientName: json['patientName'] as String,
//       patientPhone: json['patientPhone'] as String,
//       emergencyType: json['emergencyType'] as String,
//       pickupLocation: LocationData.fromJson(
//         json['pickupLocation'] as Map<String, dynamic>,
//       ),
//       destinationLocation:
//           json['destinationLocation'] == null
//               ? null
//               : LocationData.fromJson(
//                 json['destinationLocation'] as Map<String, dynamic>,
//               ),
//       severity: json['severity'] as String,
//       description: json['description'] as String,
//       hospitalIds:
//           (json['hospitalIds'] as List<dynamic>)
//               .map((e) => e as String)
//               .toList(),
//       requestTime: DateTime.parse(json['requestTime'] as String),
//       status: $enumDecode(_$EmergencyStatusEnumMap, json['status']),
//       acceptedHospitalId: json['acceptedHospitalId'] as String?,
//       assignedAmbulanceId: json['assignedAmbulanceId'] as String?,
//       timestamp: DateTime.parse(json['timestamp'] as String),
//     );

// Map<String, dynamic> _$EmergencyRequestToJson(EmergencyRequest instance) =>
//     <String, dynamic>{
//       'emergencyId': instance.emergencyId,
//       'patientId': instance.patientId,
//       'patientName': instance.patientName,
//       'patientPhone': instance.patientPhone,
//       'emergencyType': instance.emergencyType,
//       'pickupLocation': instance.pickupLocation,
//       'destinationLocation': instance.destinationLocation,
//       'severity': instance.severity,
//       'description': instance.description,
//       'hospitalIds': instance.hospitalIds,
//       'requestTime': instance.requestTime.toIso8601String(),
//       'assignedAmbulanceId': instance.assignedAmbulanceId,
//       'timestamp': instance.timestamp.toIso8601String(),
//       'assignedAmbulanceId': instance.assignedAmbulanceId,
//     };

// const _$EmergencyStatusEnumMap = {
//   EmergencyStatus.pending: 'pending',
//   EmergencyStatus.accepted: 'accepted',
//   EmergencyStatus.rejected: 'rejected',
//   EmergencyStatus.inProgress: 'in_progress',
//   EmergencyStatus.completed: 'completed',
//   EmergencyStatus.cancelled: 'cancelled',
// };

// LocationData _$LocationDataFromJson(Map<String, dynamic> json) => LocationData(
//   latitude: (json['latitude'] as num).toDouble(),
//   longitude: (json['longitude'] as num).toDouble(),
//   address: json['address'] as String?,
//   timestamp:
//       json['timestamp'] == null
//           ? null
//           : DateTime.parse(json['timestamp'] as String),
// );

// Map<String, dynamic> _$LocationDataToJson(LocationData instance) =>
//     <String, dynamic>{
//       'latitude': instance.latitude,
//       'longitude': instance.longitude,
//       'address': instance.address,
//       'timestamp': instance.timestamp?.toIso8601String(),
//     };

// AmbulanceInfo _$AmbulanceInfoFromJson(Map<String, dynamic> json) =>
//     AmbulanceInfo(
//       ambulanceId: json['ambulanceId'] as String,
//       driverName: json['driverName'] as String,
//       driverPhone: json['driverPhone'] as String,
//       vehicleNumber: json['vehicleNumber'] as String,
//       hospitalId: json['hospitalId'] as String,
//       currentLocation:
//           json['currentLocation'] == null
//               ? null
//               : LocationData.fromJson(
//                 json['currentLocation'] as Map<String, dynamic>,
//               ),
//       status: $enumDecode(_$AmbulanceStatusEnumMap, json['status']),
//       currentEmergencyId: json['currentEmergencyId'] as String?,
//       estimatedArrivalTime: (json['estimatedArrivalTime'] as num?)?.toInt(),
//     );

// Map<String, dynamic> _$AmbulanceInfoToJson(AmbulanceInfo instance) =>
//     <String, dynamic>{
//       'ambulanceId': instance.ambulanceId,
//       'driverName': instance.driverName,
//       'driverPhone': instance.driverPhone,
//       'vehicleNumber': instance.vehicleNumber,
//       'hospitalId': instance.hospitalId,
//       'currentLocation': instance.currentLocation,
//       'status': _$AmbulanceStatusEnumMap[instance.status]!,
//       'currentEmergencyId': instance.currentEmergencyId,
//       'estimatedArrivalTime': instance.estimatedArrivalTime,
//     };

// const _$AmbulanceStatusEnumMap = {
//   AmbulanceStatus.available: 'available',
//   AmbulanceStatus.dispatched: 'dispatched',
//   AmbulanceStatus.enRoute: 'en_route',
//   AmbulanceStatus.atPickup: 'at_pickup',
//   AmbulanceStatus.transporting: 'transporting',
//   AmbulanceStatus.atHospital: 'at_hospital',
//   AmbulanceStatus.offline: 'offline',
// };

// TrackingRoom _$TrackingRoomFromJson(Map<String, dynamic> json) => TrackingRoom(
//   emergencyId: json['emergencyId'] as String,
//   participants:
//       (json['participants'] as List<dynamic>).map((e) => e as String).toList(),
//   isActive: json['isActive'] as bool,
//   createdAt: DateTime.parse(json['createdAt'] as String),
// );

// Map<String, dynamic> _$TrackingRoomToJson(TrackingRoom instance) =>
//     <String, dynamic>{
//       'emergencyId': instance.emergencyId,
//       'participants': instance.participants,
//       'isActive': instance.isActive,
//       'createdAt': instance.createdAt.toIso8601String(),
//     };

// HospitalFleet _$HospitalFleetFromJson(Map<String, dynamic> json) =>
//     HospitalFleet(
//       hospitalId: json['hospitalId'] as String,
//       totalAmbulances: (json['totalAmbulances'] as num).toInt(),
//       availableAmbulances: (json['availableAmbulances'] as num).toInt(),
//       activeAmbulances: (json['activeAmbulances'] as num).toInt(),
//       ambulances:
//           (json['ambulances'] as List<dynamic>)
//               .map((e) => AmbulanceInfo.fromJson(e as Map<String, dynamic>))
//               .toList(),
//       lastUpdated: DateTime.parse(json['lastUpdated'] as String),
//     );

// Map<String, dynamic> _$HospitalFleetToJson(HospitalFleet instance) =>
//     <String, dynamic>{
//       'hospitalId': instance.hospitalId,
//       'totalAmbulances': instance.totalAmbulances,
//       'availableAmbulances': instance.availableAmbulances,
//       'activeAmbulances': instance.activeAmbulances,
//       'ambulances': instance.ambulances,
//       'lastUpdated': instance.lastUpdated.toIso8601String(),
//     };

// EmergencyUpdate _$EmergencyUpdateFromJson(Map<String, dynamic> json) =>
//     EmergencyUpdate(
//       emergencyId: json['emergencyId'] as String,
//       status: $enumDecode(_$EmergencyStatusEnumMap, json['status']),
//       ambulanceLocation:
//           json['ambulanceLocation'] == null
//               ? null
//               : LocationData.fromJson(
//                 json['ambulanceLocation'] as Map<String, dynamic>,
//               ),
//       estimatedArrivalTime: (json['estimatedArrivalTime'] as num?)?.toInt(),
//       message: json['message'] as String?,
//       timestamp: DateTime.parse(json['timestamp'] as String),
//     );

// Map<String, dynamic> _$EmergencyUpdateToJson(EmergencyUpdate instance) =>
//     <String, dynamic>{
//       'emergencyId': instance.emergencyId,
//       'status': _$EmergencyStatusEnumMap[instance.status]!,
//       'ambulanceLocation': instance.ambulanceLocation,
//       'estimatedArrivalTime': instance.estimatedArrivalTime,
//       'message': instance.message,
//       'timestamp': instance.timestamp.toIso8601String(),
//     };

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ambulance_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EmergencyRequest _$EmergencyRequestFromJson(Map<String, dynamic> json) =>
    EmergencyRequest(
      emergencyId: json['emergencyId'] as String,
      patientId: json['patientId'] as String,
      patientName: json['patientName'] as String,
      patientPhone: json['patientPhone'] as String,
      emergencyType: json['emergencyType'] as String,
      pickupLocation: LocationData.fromJson(
        json['pickupLocation'] as Map<String, dynamic>,
      ),
      destinationLocation:
          json['destinationLocation'] == null
              ? null
              : LocationData.fromJson(
                json['destinationLocation'] as Map<String, dynamic>,
              ),
      severity: json['severity'] as String,
      description: json['description'] as String,
      hospitalIds:
          (json['hospitalIds'] as List<dynamic>)
              .map((e) => e as String)
              .toList(),
      requestTime: DateTime.parse(json['requestTime'] as String),
      status: $enumDecode(_$EmergencyStatusEnumMap, json['status']),
      acceptedHospitalId: json['acceptedHospitalId'] as String?,
      assignedAmbulanceId: json['assignedAmbulanceId'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );

Map<String, dynamic> _$EmergencyRequestToJson(EmergencyRequest instance) =>
    <String, dynamic>{
      'emergencyId': instance.emergencyId,
      'patientId': instance.patientId,
      'patientName': instance.patientName,
      'patientPhone': instance.patientPhone,
      'emergencyType': instance.emergencyType,
      'pickupLocation': instance.pickupLocation,
      'destinationLocation': instance.destinationLocation,
      'severity': instance.severity,
      'description': instance.description,
      'hospitalIds': instance.hospitalIds,
      'requestTime': instance.requestTime.toIso8601String(),
      'assignedAmbulanceId': instance.assignedAmbulanceId,
      'timestamp': instance.timestamp.toIso8601String(),
      'assignedAmbulanceId': instance.assignedAmbulanceId,
    };

const _$EmergencyStatusEnumMap = {
  EmergencyStatus.pending: 'pending',
  EmergencyStatus.accepted: 'accepted',
  EmergencyStatus.rejected: 'rejected',
  EmergencyStatus.inProgress: 'in_progress',
  EmergencyStatus.completed: 'completed',
  EmergencyStatus.cancelled: 'cancelled',
};

LocationData _$LocationDataFromJson(Map<String, dynamic> json) => LocationData(
  latitude: (json['latitude'] as num).toDouble(),
  longitude: (json['longitude'] as num).toDouble(),
  address: json['address'] as String?,
  timestamp:
      json['timestamp'] == null
          ? null
          : DateTime.parse(json['timestamp'] as String),
);

Map<String, dynamic> _$LocationDataToJson(LocationData instance) =>
    <String, dynamic>{
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'address': instance.address,
      'timestamp': instance.timestamp?.toIso8601String(),
    };

AmbulanceInfo _$AmbulanceInfoFromJson(Map<String, dynamic> json) =>
    AmbulanceInfo(
      ambulanceId:
          json['ambulanceId'] as String? ?? '', // Provide default empty string
      driverName: json['driverName'] as String? ?? 'Unknown', // Provide default
      driverPhone: json['driverPhone'] as String? ?? '', // Provide default
      vehicleNumber:
          json['vehicleNumber'] as String? ?? 'UNKNOWN', // Provide default
      hospitalId: json['hospitalId'] as String? ?? '', // Provide default
      currentLocation:
          json['currentLocation'] == null
              ? null
              : LocationData.fromJson(
                json['currentLocation'] as Map<String, dynamic>,
              ),
      status:
          $enumDecodeNullable(_$AmbulanceStatusEnumMap, json['status']) ??
          AmbulanceStatus.offline, // Provide default
      currentEmergencyId: json['currentEmergencyId'] as String?,
      estimatedArrivalTime: (json['estimatedArrivalTime'] as num?)?.toInt(),
    );

Map<String, dynamic> _$AmbulanceInfoToJson(AmbulanceInfo instance) =>
    <String, dynamic>{
      'ambulanceId': instance.ambulanceId,
      'driverName': instance.driverName,
      'driverPhone': instance.driverPhone,
      'vehicleNumber': instance.vehicleNumber,
      'hospitalId': instance.hospitalId,
      'currentLocation': instance.currentLocation,
      'status': _$AmbulanceStatusEnumMap[instance.status]!,
      'currentEmergencyId': instance.currentEmergencyId,
      'estimatedArrivalTime': instance.estimatedArrivalTime,
    };

const _$AmbulanceStatusEnumMap = {
  AmbulanceStatus.available: 'available',
  AmbulanceStatus.dispatched: 'dispatched',
  AmbulanceStatus.enRoute: 'en_route',
  AmbulanceStatus.atPickup: 'at_pickup',
  AmbulanceStatus.transporting: 'transporting',
  AmbulanceStatus.atHospital: 'at_hospital',
  AmbulanceStatus.offline: 'offline',
};

TrackingRoom _$TrackingRoomFromJson(Map<String, dynamic> json) => TrackingRoom(
  emergencyId: json['emergencyId'] as String,
  participants:
      (json['participants'] as List<dynamic>).map((e) => e as String).toList(),
  isActive: json['isActive'] as bool,
  createdAt: DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$TrackingRoomToJson(TrackingRoom instance) =>
    <String, dynamic>{
      'emergencyId': instance.emergencyId,
      'participants': instance.participants,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt.toIso8601String(),
    };

HospitalFleet _$HospitalFleetFromJson(Map<String, dynamic> json) =>
    HospitalFleet(
      hospitalId: json['hospitalId'] as String,
      totalAmbulances: (json['totalAmbulances'] as num).toInt(),
      availableAmbulances: (json['availableAmbulances'] as num).toInt(),
      activeAmbulances: (json['activeAmbulances'] as num).toInt(),
      ambulances:
          (json['ambulances'] as List<dynamic>)
              .map((e) => AmbulanceInfo.fromJson(e as Map<String, dynamic>))
              .toList(),
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
    );

Map<String, dynamic> _$HospitalFleetToJson(HospitalFleet instance) =>
    <String, dynamic>{
      'hospitalId': instance.hospitalId,
      'totalAmbulances': instance.totalAmbulances,
      'availableAmbulances': instance.availableAmbulances,
      'activeAmbulances': instance.activeAmbulances,
      'ambulances': instance.ambulances,
      'lastUpdated': instance.lastUpdated.toIso8601String(),
    };

EmergencyUpdate _$EmergencyUpdateFromJson(Map<String, dynamic> json) =>
    EmergencyUpdate(
      emergencyId: json['emergencyId'] as String,
      status: $enumDecode(_$EmergencyStatusEnumMap, json['status']),
      ambulanceLocation:
          json['ambulanceLocation'] == null
              ? null
              : LocationData.fromJson(
                json['ambulanceLocation'] as Map<String, dynamic>,
              ),
      estimatedArrivalTime: (json['estimatedArrivalTime'] as num?)?.toInt(),
      message: json['message'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );

Map<String, dynamic> _$EmergencyUpdateToJson(EmergencyUpdate instance) =>
    <String, dynamic>{
      'emergencyId': instance.emergencyId,
      'status': _$EmergencyStatusEnumMap[instance.status]!,
      'ambulanceLocation': instance.ambulanceLocation,
      'estimatedArrivalTime': instance.estimatedArrivalTime,
      'message': instance.message,
      'timestamp': instance.timestamp.toIso8601String(),
    };
