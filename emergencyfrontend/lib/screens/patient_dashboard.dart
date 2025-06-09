import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/ambulance_models.dart';
import '../providers/auth_provider.dart';
import '../providers/emergency_provider.dart';
import '../widgets/emergency_request_form.dart';
import '../widgets/real_time_map.dart';

class PatientDashboard extends StatefulWidget {
  const PatientDashboard({super.key});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Patient Dashboard',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFFED8936),
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
                    value: 'history',
                    child: Row(
                      children: [
                        Icon(Icons.history),
                        SizedBox(width: 8),
                        Text('Emergency History'),
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
        children: [_buildHomeTab(), _buildTrackingTab(), _buildRequestTab()],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        selectedItemColor: const Color(0xFFED8936),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Tracking'),
          BottomNavigationBarItem(
            icon: Icon(Icons.emergency),
            label: 'Emergency',
          ),
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
              _buildWelcomeCard(),
              const SizedBox(height: 20),
              _buildQuickActionsCard(),
              const SizedBox(height: 20),
              _buildCurrentEmergencyCard(emergencyProvider.currentEmergency),
              const SizedBox(height: 20),
              _buildRecentUpdatesCard(emergencyProvider.emergencyUpdates),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTrackingTab() {
    return Consumer<EmergencyProvider>(
      builder: (context, emergencyProvider, child) {
        if (emergencyProvider.currentEmergency == null) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.location_off, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'No active emergency',
                  style: TextStyle(fontSize: 18, color: Colors.grey),
                ),
                SizedBox(height: 8),
                Text(
                  'Request emergency assistance to start tracking',
                  style: TextStyle(color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return const RealTimeMap();
      },
    );
  }

  Widget _buildRequestTab() {
    return const EmergencyRequestForm();
  }

  Widget _buildWelcomeCard() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return Card(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: const LinearGradient(
                colors: [Color(0xFFED8936), Color(0xFFDD6B20)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.person, color: Colors.white, size: 40),
                const SizedBox(height: 12),
                Text(
                  'Welcome, ${authProvider.currentUser?.name ?? "Patient"}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Emergency assistance is just a tap away',
                  style: TextStyle(color: Colors.white70, fontSize: 16),
                ),
              ],
            ),
          ),
        );
      },
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
                    label: 'Emergency',
                    color: Colors.red,
                    onTap: () => setState(() => _selectedIndex = 2),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.location_on,
                    label: 'Share Location',
                    color: Colors.blue,
                    onTap: _shareLocation,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.phone,
                    label: 'Call 911',
                    color: Colors.green,
                    onTap: _callEmergency,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.medical_services,
                    label: 'Medical Info',
                    color: Colors.purple,
                    onTap: _viewMedicalInfo,
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

  Widget _buildCurrentEmergencyCard(EmergencyRequest? emergency) {
    if (emergency == null) {
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
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.check_circle,
                      color: Colors.green[300],
                      size: 48,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'No active emergency',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'Current Emergency',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Chip(
                  label: Text(
                    emergency.status.toString().split('.').last,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                  backgroundColor: _getStatusColor(emergency.status),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.emergency, color: Colors.red),
              title: Text('Emergency ID: ${emergency.emergencyId}'),
              subtitle: Text('Severity: ${emergency.severity}'),
            ),
            if (emergency.assignedAmbulanceId != null)
              ListTile(
                leading: const Icon(Icons.local_shipping, color: Colors.blue),
                title: Text('Ambulance: ${emergency.assignedAmbulanceId}'),
                subtitle: const Text('Dispatched to your location'),
              ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => setState(() => _selectedIndex = 1),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFED8936),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Track Ambulance'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentUpdatesCard(List<EmergencyUpdate> updates) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Recent Updates',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (updates.isEmpty)
              const Center(
                child: Text(
                  'No recent updates',
                  style: TextStyle(color: Colors.grey),
                ),
              )
            else
              ...updates
                  .take(3)
                  .map(
                    (update) => ListTile(
                      leading: Icon(
                        Icons.update,
                        color: _getStatusColor(update.status),
                      ),
                      title: Text(update.message ?? 'Status updated'),
                      subtitle: Text(
                        '${update.timestamp.toLocal().toString().split('.')[0]}',
                      ),
                      trailing: Chip(
                        label: Text(
                          update.status.toString().split('.').last,
                          style: const TextStyle(fontSize: 10),
                        ),
                        backgroundColor: _getStatusColor(update.status),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(EmergencyStatus status) {
    switch (status) {
      case EmergencyStatus.requested:
        return Colors.amber;
      case EmergencyStatus.pending:
        return Colors.orange;
      case EmergencyStatus.assigned:
        return Colors.lightBlue;
      case EmergencyStatus.dispatched:
        return Colors.indigo;
      case EmergencyStatus.enRoute:
        return Colors.teal;
      case EmergencyStatus.arrived:
        return Colors.deepOrange;
      case EmergencyStatus.accepted:
        return Colors.blue;
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
            title: const Text('Call Emergency Services'),
            content: const Text(
              'This would normally dial 911 or your local emergency number.',
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

  void _viewMedicalInfo() {
    Navigator.of(context).pushNamed('/medical-info');
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
      case 'history':
        // Navigate to emergency history screen
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
