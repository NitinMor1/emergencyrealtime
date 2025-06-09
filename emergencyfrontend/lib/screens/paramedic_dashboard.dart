import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/ambulance_models.dart';
import '../providers/auth_provider.dart';
import '../providers/emergency_provider.dart';
import '../widgets/real_time_map.dart';

class ParamedicDashboard extends StatefulWidget {
  const ParamedicDashboard({super.key});

  @override
  State<ParamedicDashboard> createState() => _ParamedicDashboardState();
}

class _ParamedicDashboardState extends State<ParamedicDashboard> {
  int _selectedIndex = 0;
  bool _isOnDuty = false;

  @override
  void initState() {
    super.initState();
    _startLocationTracking();
  }

  void _startLocationTracking() {
    final emergencyProvider = Provider.of<EmergencyProvider>(
      context,
      listen: false,
    );
    emergencyProvider.startLocationTracking();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Paramedic Dashboard',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF38B2AC),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          Consumer<EmergencyProvider>(
            builder: (context, emergencyProvider, child) {
              return Stack(
                children: [
                  IconButton(
                    icon: Icon(
                      emergencyProvider.isConnected
                          ? Icons.wifi
                          : Icons.wifi_off,
                    ),
                    onPressed: () {
                      if (!emergencyProvider.isConnected) {
                        _showConnectionDialog();
                      }
                    },
                  ),
                  if (!emergencyProvider.isConnected)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
          Switch(
            value: _isOnDuty,
            onChanged: _toggleDutyStatus,
            activeColor: Colors.white,
            activeTrackColor: Colors.green,
            inactiveThumbColor: Colors.grey,
            inactiveTrackColor: Colors.grey[300],
          ),
          PopupMenuButton<String>(
            onSelected: _handleMenuSelection,
            itemBuilder:
                (context) => [
                  const PopupMenuItem(
                    value: 'profile',
                    child: Row(
                      children: [
                        Icon(Icons.person),
                        SizedBox(width: 8),
                        Text('Profile'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'settings',
                    child: Row(
                      children: [
                        Icon(Icons.settings),
                        SizedBox(width: 8),
                        Text('Settings'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'logout',
                    child: Row(
                      children: [
                        Icon(Icons.logout, color: Colors.red),
                        SizedBox(width: 8),
                        Text('Logout', style: TextStyle(color: Colors.red)),
                      ],
                    ),
                  ),
                ],
          ),
        ],
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: [_buildHomeTab(), _buildEmergencyTab(), _buildMapTab()],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        selectedItemColor: const Color(0xFF38B2AC),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(
            icon: Icon(Icons.emergency),
            label: 'Emergency',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Navigation'),
        ],
      ),
    );
  }

  Widget _buildHomeTab() {
    return Consumer<EmergencyProvider>(
      builder: (context, emergencyProvider, child) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildStatusCard(),
              const SizedBox(height: 20),
              _buildCurrentEmergencyCard(emergencyProvider.currentEmergency),
              const SizedBox(height: 20),
              _buildQuickActionsCard(),
              const SizedBox(height: 20),
              _buildLocationCard(emergencyProvider.currentLocation),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmergencyTab() {
    return Consumer<EmergencyProvider>(
      builder: (context, emergencyProvider, child) {
        if (emergencyProvider.currentEmergency == null) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.local_shipping, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'No active emergency',
                  style: TextStyle(fontSize: 18, color: Colors.grey),
                ),
                SizedBox(height: 8),
                Text(
                  'Wait for emergency dispatch or go on duty',
                  style: TextStyle(color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return _buildEmergencyDetails(emergencyProvider.currentEmergency!);
      },
    );
  }

  Widget _buildMapTab() {
    return const RealTimeMap();
  }

  Widget _buildStatusCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors:
                _isOnDuty
                    ? [const Color(0xFF38B2AC), const Color(0xFF319795)]
                    : [Colors.grey[400]!, Colors.grey[500]!],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              _isOnDuty ? Icons.work : Icons.work_off,
              color: Colors.white,
              size: 40,
            ),
            const SizedBox(height: 12),
            Text(
              _isOnDuty ? 'On Duty' : 'Off Duty',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _isOnDuty
                  ? 'Ready to respond to emergencies'
                  : 'Tap the switch to go on duty',
              style: const TextStyle(color: Colors.white70, fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentEmergencyCard(EmergencyRequest? emergency) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Current Emergency',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (emergency == null)
              const Center(
                child: Column(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 48),
                    SizedBox(height: 12),
                    Text(
                      'No active emergency',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ],
                ),
              )
            else
              Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.emergency, color: Colors.red),
                    title: Text('Emergency ID: ${emergency.emergencyId}'),
                    subtitle: Text('Patient: ${emergency.patientName}'),
                  ),
                  ListTile(
                    leading: const Icon(Icons.phone, color: Colors.blue),
                    title: Text('Phone: ${emergency.patientPhone}'),
                    subtitle: Text('Severity: ${emergency.severity}'),
                  ),
                  ListTile(
                    leading: const Icon(Icons.location_on, color: Colors.green),
                    title: const Text('Pickup Location'),
                    subtitle: Text(
                      '${emergency.pickupLocation.latitude.toStringAsFixed(6)}, ${emergency.pickupLocation.longitude.toStringAsFixed(6)}',
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _updateEmergencyStatus('picked_up'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('At Pickup'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed:
                              () => _updateEmergencyStatus('transporting'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Transporting'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _updateEmergencyStatus('completed'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Complete Emergency'),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionsCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Quick Actions',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.emergency,
                    label: 'Emergency\nCall',
                    color: Colors.red,
                    onTap: _callEmergency,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.location_on,
                    label: 'Share\nLocation',
                    color: Colors.blue,
                    onTap: _shareLocation,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.map,
                    label: 'Navigation',
                    color: Colors.green,
                    onTap: () => setState(() => _selectedIndex = 2),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationCard(LocationData? location) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Current Location',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (location == null)
              const Center(
                child: Column(
                  children: [
                    Icon(Icons.location_off, color: Colors.grey, size: 48),
                    SizedBox(height: 12),
                    Text(
                      'Location not available',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ],
                ),
              )
            else
              Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.location_on, color: Colors.green),
                    title: const Text('Coordinates'),
                    subtitle: Text(
                      '${location.latitude.toStringAsFixed(6)}, ${location.longitude.toStringAsFixed(6)}',
                    ),
                  ),
                  ListTile(
                    leading: const Icon(Icons.access_time, color: Colors.blue),
                    title: const Text('Last Updated'),
                    subtitle: Text(
                      location.timestamp?.toLocal().toString().split('.')[0] ??
                          'Unknown',
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmergencyDetails(EmergencyRequest emergency) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text(
                        'Emergency Details',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      Chip(
                        label: Text(
                          emergency.status.toString().split('.').last,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                          ),
                        ),
                        backgroundColor: _getStatusColor(emergency.status),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildDetailRow('Emergency ID', emergency.emergencyId),
                  _buildDetailRow('Patient Name', emergency.patientName),
                  _buildDetailRow('Patient Phone', emergency.patientPhone),
                  _buildDetailRow('Severity', emergency.severity),
                  _buildDetailRow('Description', emergency.description),
                  const SizedBox(height: 16),
                  const Text(
                    'Pickup Location',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${emergency.pickupLocation.latitude.toStringAsFixed(6)}, ${emergency.pickupLocation.longitude.toStringAsFixed(6)}',
                    style: const TextStyle(fontSize: 14),
                  ),
                  if (emergency.destinationLocation != null) ...[
                    const SizedBox(height: 16),
                    const Text(
                      'Destination',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${emergency.destinationLocation!.latitude.toStringAsFixed(6)}, ${emergency.destinationLocation!.longitude.toStringAsFixed(6)}',
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Color _getStatusColor(EmergencyStatus status) {
    switch (status) {
      case EmergencyStatus.requested:
        return Colors.amber;
      case EmergencyStatus.pending:
        return Colors.orange;
      case EmergencyStatus.dispatched:
        return Colors.indigo;
      case EmergencyStatus.assigned:
        return Colors.lightBlue;
      case EmergencyStatus.accepted:
        return Colors.blue;
      case EmergencyStatus.enRoute:
        return Colors.teal;
      case EmergencyStatus.arrived:
        return Colors.deepOrange;
      case EmergencyStatus.inProgress:
        return Colors.green;
      case EmergencyStatus.completed:
        return Colors.purple;
      case EmergencyStatus.cancelled:
      case EmergencyStatus.rejected:
        return Colors.red;
      case EmergencyStatus.idle:
        return Colors.grey;
    }
  }

  void _toggleDutyStatus(bool value) {
    setState(() {
      _isOnDuty = value;
    });

    final emergencyProvider = Provider.of<EmergencyProvider>(
      context,
      listen: false,
    );

    if (_isOnDuty) {
      emergencyProvider.startLocationTracking();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('You are now on duty'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      emergencyProvider.stopLocationTracking();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('You are now off duty'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  void _updateEmergencyStatus(String status) {
    // This would normally update the emergency status via WebSocket
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Emergency status updated to: $status'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _shareLocation() {
    final emergencyProvider = Provider.of<EmergencyProvider>(
      context,
      listen: false,
    );
    if (emergencyProvider.currentLocation != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location shared successfully'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to get current location'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _callEmergency() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Emergency Call'),
            content: const Text(
              'This would normally initiate an emergency call or contact dispatch.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                child: const Text(
                  'Call',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
    );
  }

  void _showConnectionDialog() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Connection Status'),
            content: const Text(
              'WebSocket connection is not available. Please check your internet connection and try again.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('OK'),
              ),
            ],
          ),
    );
  }

  void _handleMenuSelection(String value) {
    switch (value) {
      case 'profile':
        // Navigate to profile screen
        break;
      case 'settings':
        // Navigate to settings screen
        break;
      case 'logout':
        _logout();
        break;
    }
  }

  void _logout() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    authProvider.logout();
    Navigator.of(context).pushReplacementNamed('/login');
  }
}
