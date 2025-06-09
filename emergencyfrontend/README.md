# Emergency Tracking Flutter Application

A comprehensive Flutter frontend application for real-time ambulance tracking with role-based authentication and WebSocket integration.

## 🚀 Features

### **Role-Based Authentication**
- **Hospital Admin**: Fleet management, emergency request oversight, and real-time monitoring
- **Paramedic**: Duty status management, emergency response, and navigation
- **Patient**: Emergency request submission and real-time tracking

### **Real-Time Communication**
- WebSocket integration for live updates
- Real-time ambulance location tracking
- Instant emergency status notifications
- Live fleet monitoring

### **Location Services**
- GPS tracking for ambulances and patients
- Interactive Google Maps integration
- Background location updates
- Distance calculation and navigation

### **Modern UI/UX**
- Material Design 3 implementation
- Responsive design for different screen sizes
- Dark/Light theme support
- Animated transitions and smooth interactions

## 📱 Screenshots

### Login Screen
Role-based authentication with intuitive user selection.

### Hospital Dashboard
- Emergency requests overview
- Fleet status monitoring
- Real-time map with ambulance tracking
- Performance analytics

### Patient Dashboard
- Emergency request form with location capture
- Real-time ambulance tracking
- Status updates and notifications

### Paramedic Dashboard
- Duty status controls
- Emergency assignment details
- GPS navigation integration
- Real-time communication

## 🛠️ Technical Stack

### **Frontend Framework**
- **Flutter**: Cross-platform mobile development
- **Dart**: Programming language

### **State Management**
- **Provider**: State management solution
- **BLoC**: Business logic components

### **Real-Time Communication**
- **WebSocket**: Real-time data streaming
- **JSON Serialization**: Type-safe data handling

### **Location Services**
- **Geolocator**: GPS positioning
- **Google Maps**: Interactive mapping
- **Location Permissions**: Android/iOS integration

### **Navigation & Routing**
- **GoRouter**: Declarative routing
- **Deep linking**: URL-based navigation

## 📦 Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  flutter_bloc: ^8.1.3
  
  # Navigation
  go_router: ^12.1.3
  
  # Networking & WebSocket
  web_socket_channel: ^2.4.0
  http: ^1.1.0
  dio: ^5.3.2
  
  # Location Services
  geolocator: ^10.1.0
  location: ^5.0.3
  google_maps_flutter: ^2.5.0
  
  # JSON Serialization
  json_annotation: ^4.8.1
  
  # UI Components
  cupertino_icons: ^1.0.2
  flutter_animate: ^4.2.0+1
  shimmer: ^3.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
```

## 🚀 Getting Started

### **Prerequisites**
- Flutter SDK (>=3.0.0)
- Dart SDK (>=3.0.0)
- Android Studio / VS Code
- Google Maps API Key

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd emergencyfrontend
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Generate JSON serialization code**
   ```bash
   dart run build_runner build
   ```

4. **Configure Google Maps API**
   
   **Android**: Add your API key to `android/app/src/main/AndroidManifest.xml`
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_API_KEY_HERE" />
   ```
   
   **iOS**: Add your API key to `ios/Runner/AppDelegate.swift`
   ```swift
   GMSServices.provideAPIKey("YOUR_API_KEY_HERE")
   ```

5. **Run the application**
   ```bash
   # Web (Chrome)
   flutter run -d chrome --web-port 3000
   
   # Android
   flutter run -d android
   
   # iOS
   flutter run -d ios
   ```

## 🏗️ Project Structure

```
lib/
├── main.dart                 # Application entry point
├── models/                   # Data models
│   ├── user_models.dart      # User-related models
│   ├── ambulance_models.dart # Emergency & ambulance models
│   ├── user_models.g.dart    # Generated JSON serialization
│   └── ambulance_models.g.dart
├── providers/                # State management
│   ├── auth_provider.dart    # Authentication state
│   └── emergency_provider.dart # Emergency data state
├── services/                 # External services
│   ├── websocket_service.dart # WebSocket communication
│   └── location_service.dart  # GPS & location services
├── screens/                  # Main screens
│   ├── login_screen.dart     # Authentication screen
│   ├── dashboard_screen.dart # Main dashboard router
│   ├── hospital_dashboard.dart # Hospital admin interface
│   ├── patient_dashboard.dart  # Patient interface
│   └── paramedic_dashboard.dart # Paramedic interface
└── widgets/                  # Reusable components
    ├── emergency_request_card.dart # Emergency display
    ├── fleet_status_card.dart     # Ambulance status
    ├── real_time_map.dart         # Google Maps integration
    └── emergency_request_form.dart # Emergency form
```

## 🔧 Configuration

### **Backend Integration**
Update WebSocket endpoints in `lib/services/websocket_service.dart`:
```dart
static const String _baseUrl = 'ws://your-backend-url:8080';
```

### **User Role Mapping**
The application supports three user roles with specific ID mapping:
- **Paramedic**: Uses `ContactDetails.username`
- **Patient**: Uses `username`
- **Hospital**: Uses `"admin"`

### **Location Services**
Configure location update intervals in `lib/services/location_service.dart`:
```dart
static const LocationSettings locationSettings = LocationSettings(
  accuracy: LocationAccuracy.high,
  distanceFilter: 10, // meters
);
```

## 🧪 Testing

### **Run Unit Tests**
```bash
flutter test
```

### **Run Integration Tests**
```bash
flutter drive --target=test_driver/app.dart
```

### **Build for Production**
```bash
# Android APK
flutter build apk --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

## 📱 Platform Support

- ✅ **Android** (API 21+)
- ✅ **iOS** (iOS 11.0+)
- ✅ **Web** (Chrome, Firefox, Safari)
- ⏳ **Windows** (Coming soon)
- ⏳ **macOS** (Coming soon)
- ⏳ **Linux** (Coming soon)

## 🔒 Permissions

### **Android Permissions** (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### **iOS Permissions** (`ios/Runner/Info.plist`)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to track ambulances and emergencies in real-time.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to track ambulances and emergencies in real-time, including in the background.</string>
```

## 🎯 Key Features Implementation

### **WebSocket Communication**
Real-time bidirectional communication with the backend for:
- Emergency status updates
- Ambulance location streaming
- Fleet status notifications
- Chat/messaging functionality

### **Location Tracking**
Comprehensive GPS integration with:
- High-accuracy positioning
- Background location updates
- Distance calculation
- Geofencing capabilities

### **State Management**
Robust state management using Provider pattern:
- Authentication state
- Emergency data management
- Real-time updates
- Offline capability

### **UI Components**
Modern, reusable widgets:
- Material Design 3 compliance
- Accessibility support
- Responsive layouts
- Animation integration

## 🐛 Troubleshooting

### **Common Issues**

1. **Location permissions not working**
   - Ensure all permissions are added to platform manifests
   - Check device location settings
   - Test on physical device (not simulator)

2. **WebSocket connection failures**
   - Verify backend server is running
   - Check network connectivity
   - Validate WebSocket URL format

3. **Build failures**
   - Run `flutter clean && flutter pub get`
   - Update Flutter SDK to latest stable
   - Check dependency compatibility

4. **Google Maps not displaying**
   - Verify API key is correctly configured
   - Enable required Google Cloud services
   - Check billing account status

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Emergency Tracking App** - Saving lives through technology 🚑💙
