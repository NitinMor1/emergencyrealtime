import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import '../models/ambulance_models.dart';
import '../providers/emergency_provider.dart';
import '../services/location_service.dart';

class RealTimeMap extends StatefulWidget {
  final bool showAllAmbulances;
  final EmergencyRequest? focusedEmergency;
  final double? height;

  const RealTimeMap({
    super.key,
    this.showAllAmbulances = true,
    this.focusedEmergency,
    this.height,
  });

  @override
  State<RealTimeMap> createState() => _RealTimeMapState();
}

class _RealTimeMapState extends State<RealTimeMap> {
  GoogleMapController? _mapController;
  final LocationService _locationService = LocationService();
  Set<Marker> _markers = {};
  Set<Polyline> _polylines = {};
  LatLng? _userLocation;

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    try {
      final position = await _locationService.getCurrentPosition();
      if (mounted && position != null) {
        setState(() {
          _userLocation = LatLng(position.latitude, position.longitude);
        });
      }
    } catch (e) {
      print('Error getting location: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: widget.height ?? 400,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Consumer<EmergencyProvider>(
          builder: (context, emergencyProvider, child) {
            _updateMarkers(emergencyProvider);
            return GoogleMap(
              onMapCreated: _onMapCreated,
              initialCameraPosition: CameraPosition(
                target:
                    _userLocation ??
                    const LatLng(37.7749, -122.4194), // Default to SF
                zoom: 12.0,
              ),
              markers: _markers,
              polylines: _polylines,
              mapType: MapType.normal,
              zoomControlsEnabled: false,
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              compassEnabled: true,
              trafficEnabled: true,
              buildingsEnabled: true,
              onTap: _onMapTap,
            );
          },
        ),
      ),
    );
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;

    // Focus on specific emergency if provided
    if (widget.focusedEmergency != null) {
      _focusOnEmergency(widget.focusedEmergency!);
    }
  }

  void _updateMarkers(EmergencyProvider emergencyProvider) {
    final newMarkers = <Marker>{};

    // Add ambulance markers
    if (widget.showAllAmbulances) {
      for (final ambulance in emergencyProvider.ambulances) {
        if (ambulance.currentLocation != null) {
          newMarkers.add(_createAmbulanceMarker(ambulance));
        }
      }
    }

    // Add emergency request markers
    for (final request in emergencyProvider.emergencyRequests) {
      // Pickup location marker
      newMarkers.add(_createEmergencyMarker(request, isPickup: true));

      // Destination marker if available
      if (request.destination != null) {
        newMarkers.add(_createEmergencyMarker(request, isPickup: false));
      }
    }

    // Add hospital markers
    newMarkers.addAll(_createHospitalMarkers());

    setState(() {
      _markers = newMarkers;
    });

    // Update polylines for active emergencies
    _updatePolylines(emergencyProvider);
  }

  Marker _createAmbulanceMarker(AmbulanceInfo ambulance) {
    final location = ambulance.currentLocation!;
    return Marker(
      markerId: MarkerId('ambulance_${ambulance.ambulanceId}'),
      position: LatLng(location.latitude, location.longitude),
      icon: BitmapDescriptor.defaultMarkerWithHue(
        ambulance.isAvailable
            ? BitmapDescriptor.hueGreen
            : BitmapDescriptor.hueRed,
      ),
      infoWindow: InfoWindow(
        title: 'Ambulance ${ambulance.vehicleNumber}',
        snippet: ambulance.isAvailable ? 'Available' : 'On Emergency',
      ),
      onTap: () => _showAmbulanceDetails(ambulance),
    );
  }

  Marker _createEmergencyMarker(
    EmergencyRequest request, {
    required bool isPickup,
  }) {
    final location = isPickup ? request.pickupLocation : request.destination!;
    return Marker(
      markerId: MarkerId(
        'emergency_${request.emergencyId}_${isPickup ? 'pickup' : 'destination'}',
      ),
      position: LatLng(location.latitude, location.longitude),
      icon: BitmapDescriptor.defaultMarkerWithHue(
        isPickup ? BitmapDescriptor.hueOrange : BitmapDescriptor.hueBlue,
      ),
      infoWindow: InfoWindow(
        title: isPickup ? 'Pickup Location' : 'Destination',
        snippet: 'Emergency #${request.emergencyId}',
      ),
      onTap: () => _showEmergencyDetails(request),
    );
  }

  Set<Marker> _createHospitalMarkers() {
    // TODO: Add hospital locations from provider
    // For now, return empty set
    return {};
  }

  void _updatePolylines(EmergencyProvider emergencyProvider) {
    final newPolylines = <Polyline>{};

    for (final request in emergencyProvider.emergencyRequests) {
      if (request.status == EmergencyStatus.enRoute &&
          request.destination != null) {
        // Create route polyline
        newPolylines.add(
          Polyline(
            polylineId: PolylineId('route_${request.emergencyId}'),
            points: [
              LatLng(
                request.pickupLocation.latitude,
                request.pickupLocation.longitude,
              ),
              LatLng(
                request.destination!.latitude,
                request.destination!.longitude,
              ),
            ],
            color: Colors.blue,
            width: 3,
            patterns: [PatternItem.dash(20), PatternItem.gap(10)],
          ),
        );
      }
    }

    setState(() {
      _polylines = newPolylines;
    });
  }

  void _focusOnEmergency(EmergencyRequest emergency) {
    if (_mapController != null) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(
            emergency.pickupLocation.latitude,
            emergency.pickupLocation.longitude,
          ),
          15.0,
        ),
      );
    }
  }

  void _onMapTap(LatLng position) {
    // Handle map tap if needed
  }

  void _showAmbulanceDetails(AmbulanceInfo ambulance) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder:
          (context) => Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.airport_shuttle,
                      color: ambulance.isAvailable ? Colors.green : Colors.red,
                      size: 30,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ambulance.vehicleNumber,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            ambulance.isAvailable
                                ? 'Available'
                                : 'On Emergency',
                            style: TextStyle(
                              color:
                                  ambulance.isAvailable
                                      ? Colors.green
                                      : Colors.red,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (ambulance.driver != null) ...[
                  Text(
                    'Driver: ${ambulance.driver!.name}',
                    style: const TextStyle(fontSize: 16),
                  ),
                  Text(
                    'Phone: ${ambulance.driver!.phone}',
                    style: const TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                  const SizedBox(height: 16),
                ],
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          // TODO: Implement track ambulance
                        },
                        icon: const Icon(Icons.gps_fixed),
                        label: const Text('Track'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          // TODO: Implement contact driver
                        },
                        icon: const Icon(Icons.phone),
                        label: const Text('Contact'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
    );
  }

  void _showEmergencyDetails(EmergencyRequest request) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder:
          (context) => Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.emergency,
                      color: _getEmergencyColor(request.emergencyType),
                      size: 30,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Emergency #${request.emergencyId}',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            request.emergencyType,
                            style: TextStyle(
                              color: _getEmergencyColor(request.emergencyType),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (request.patientName != null) ...[
                  Text(
                    'Patient: ${request.patientName}',
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                ],
                Text(
                  'Status: ${request.status.toString().split('.').last.toUpperCase()}',
                  style: const TextStyle(fontSize: 14),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _focusOnEmergency(request);
                        },
                        icon: const Icon(Icons.center_focus_strong),
                        label: const Text('Focus'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          // TODO: Implement emergency details
                        },
                        icon: const Icon(Icons.info),
                        label: const Text('Details'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
    );
  }

  Color _getEmergencyColor(String emergencyType) {
    switch (emergencyType.toLowerCase()) {
      case 'critical':
        return Colors.red;
      case 'high':
        return Colors.orange;
      case 'medium':
        return Colors.yellow[700]!;
      case 'low':
        return Colors.green;
      default:
        return Colors.blue;
    }
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
