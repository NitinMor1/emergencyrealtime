import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:logger/logger.dart';
import '../models/ambulance_models.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  final Logger _logger = Logger();
  StreamSubscription<Position>? _positionStream;
  Position? _currentPosition;

  final StreamController<LocationData> _locationController =
      StreamController<LocationData>.broadcast();

  Stream<LocationData> get locationStream => _locationController.stream;
  LocationData? get currentLocation =>
      _currentPosition != null
          ? LocationData(
            latitude: _currentPosition!.latitude,
            longitude: _currentPosition!.longitude,
            timestamp: DateTime.now(),
          )
          : null;

  Future<bool> initialize() async {
    try {
      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _logger.w('Location services are disabled');
        return false;
      }

      // Check location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _logger.w('Location permissions are denied');
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _logger.e('Location permissions are permanently denied');
        return false;
      }

      // Get current position
      await getCurrentPosition();

      _logger.i('Location service initialized successfully');
      return true;
    } catch (e) {
      _logger.e('Failed to initialize location service: $e');
      return false;
    }
  }

  Future<LocationData?> getCurrentPosition() async {
    try {
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      if (_currentPosition != null) {
        final locationData = LocationData(
          latitude: _currentPosition!.latitude,
          longitude: _currentPosition!.longitude,
          timestamp: DateTime.now(),
        );

        _locationController.add(locationData);
        return locationData;
      }
    } catch (e) {
      _logger.e('Failed to get current position: $e');
    }
    return null;
  }

  void startLocationTracking({
    int distanceFilter = 10, // meters
    int timeInterval = 5000, // milliseconds
  }) {
    try {
      const LocationSettings locationSettings = LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      );

      _positionStream = Geolocator.getPositionStream(
        locationSettings: locationSettings,
      ).listen(
        (Position position) {
          _currentPosition = position;
          final locationData = LocationData(
            latitude: position.latitude,
            longitude: position.longitude,
            timestamp: DateTime.now(),
          );

          _locationController.add(locationData);
          _logger.d(
            'Location updated: ${position.latitude}, ${position.longitude}',
          );
        },
        onError: (error) {
          _logger.e('Location tracking error: $error');
        },
      );

      _logger.i('Location tracking started');
    } catch (e) {
      _logger.e('Failed to start location tracking: $e');
    }
  }

  void stopLocationTracking() {
    _positionStream?.cancel();
    _positionStream = null;
    _logger.i('Location tracking stopped');
  }

  Future<double> getDistanceBetween(
    LocationData location1,
    LocationData location2,
  ) async {
    return Geolocator.distanceBetween(
      location1.latitude,
      location1.longitude,
      location2.latitude,
      location2.longitude,
    );
  }

  Future<String?> getAddressFromCoordinates(
    double latitude,
    double longitude,
  ) async {
    try {
      // Note: You might want to use a geocoding service here
      // For now, returning coordinates as string
      return '$latitude, $longitude';
    } catch (e) {
      _logger.e('Failed to get address from coordinates: $e');
      return null;
    }
  }

  void dispose() {
    stopLocationTracking();
    _locationController.close();
  }
}
