import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/ambulance_models.dart';
import '../models/user_models.dart';
import '../providers/auth_provider.dart';
import '../providers/emergency_provider.dart';
import '../widgets/emergency_request_card.dart';
import '../widgets/fleet_status_card.dart';
import '../widgets/real_time_map.dart';

class HospitalDashboard extends StatefulWidget {
  const HospitalDashboard({super.key});

  @override
  State<HospitalDashboard> createState() => _HospitalDashboardState();
}

class _HospitalDashboardState extends State<HospitalDashboard>
    with TickerProviderStateMixin {
  late TabController _tabController;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Hospital Dashboard',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF4299E1),
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
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.emergency), text: 'Emergencies'),
            Tab(icon: Icon(Icons.local_shipping), text: 'Fleet'),
            Tab(icon: Icon(Icons.map), text: 'Live Map'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [_buildEmergenciesTab(), _buildFleetTab(), _buildMapTab()],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _refreshData,
        backgroundColor: const Color(0xFF38B2AC),
        icon: const Icon(Icons.refresh, color: Colors.white),
        label: const Text('Refresh', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _buildEmergenciesTab() {
    return Consumer<EmergencyProvider>(
      builder: (context, emergencyProvider, child) {
        if (emergencyProvider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (emergencyProvider.error != null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                const SizedBox(height: 16),
                Text(
                  'Error: ${emergencyProvider.error}',
                  style: const TextStyle(fontSize: 16),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => emergencyProvider.clearError(),
                  child: const Text('Dismiss'),
                ),
              ],
            ),
          );
        }

        final emergencyRequests = emergencyProvider.emergencyRequests;

        if (emergencyRequests.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.local_hospital, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'No emergency requests',
                  style: TextStyle(fontSize: 18, color: Colors.grey),
                ),
                SizedBox(height: 8),
                Text(
                  'Emergency requests will appear here',
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: _refreshData,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: emergencyRequests.length,
            itemBuilder: (context, index) {
              final request = emergencyRequests[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: EmergencyRequestCard(request: request),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildFleetTab() {
    return Consumer<EmergencyProvider>(
      builder: (context, emergencyProvider, child) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Fleet Status',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              if (emergencyProvider.hospitalFleet?.ambulances.isNotEmpty ==
                  true)
                FleetStatusCard(
                  ambulance: emergencyProvider.hospitalFleet!.ambulances.first,
                )
              else
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(
                            Icons.local_shipping,
                            size: 48,
                            color: Colors.grey,
                          ),
                          SizedBox(height: 16),
                          Text(
                            'No fleet data available',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              const SizedBox(height: 24),
              const Text(
                'Active Ambulances',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _buildActiveAmbulancesList(emergencyProvider.hospitalFleet),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMapTab() {
    return Consumer<EmergencyProvider>(
      builder: (context, emergencyProvider, child) {
        return const RealTimeMap();
      },
    );
  }

  Widget _buildActiveAmbulancesList(HospitalFleet? fleet) {
    if (fleet == null || fleet.ambulances.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Center(
            child: Column(
              children: [
                Icon(Icons.local_shipping, size: 48, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'No ambulances available',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Column(
      children:
          fleet.ambulances.map((ambulance) {
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: _getStatusColor(ambulance.status),
                  child: Icon(
                    Icons.local_shipping,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                title: Text(
                  ambulance.vehicleNumber,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(
                  '${ambulance.driverName} • ${ambulance.status.toString().split('.').last}',
                ),
                trailing:
                    ambulance.currentEmergencyId != null
                        ? Chip(
                          label: const Text(
                            'Active',
                            style: TextStyle(color: Colors.white),
                          ),
                          backgroundColor: Colors.green,
                        )
                        : Chip(
                          label: Text(_getStatusText(ambulance.status)),
                          backgroundColor: _getStatusColor(ambulance.status),
                        ),
                onTap: () => _viewAmbulanceDetails(ambulance),
              ),
            );
          }).toList(),
    );
  }

  Color _getStatusColor(AmbulanceStatus status) {
    switch (status) {
      case AmbulanceStatus.available:
        return Colors.green;
      case AmbulanceStatus.dispatched:
      case AmbulanceStatus.enRoute:
        return Colors.orange;
      case AmbulanceStatus.atPickup:
      case AmbulanceStatus.transporting:
        return Colors.blue;
      case AmbulanceStatus.atHospital:
        return Colors.purple;
      case AmbulanceStatus.offline:
        return Colors.grey;
    }
  }

  String _getStatusText(AmbulanceStatus status) {
    switch (status) {
      case AmbulanceStatus.available:
        return 'Available';
      case AmbulanceStatus.dispatched:
        return 'Dispatched';
      case AmbulanceStatus.enRoute:
        return 'En Route';
      case AmbulanceStatus.atPickup:
        return 'At Pickup';
      case AmbulanceStatus.transporting:
        return 'Transporting';
      case AmbulanceStatus.atHospital:
        return 'At Hospital';
      case AmbulanceStatus.offline:
        return 'Offline';
    }
  }

  void _acceptEmergency(EmergencyRequest request, String ambulanceId) {
    final emergencyProvider = Provider.of<EmergencyProvider>(
      context,
      listen: false,
    );
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    emergencyProvider.acceptEmergency(
      emergencyId: request.emergencyId,
      hospitalId: authProvider.currentUser!.hospitalId!,
      ambulanceId: ambulanceId,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Emergency ${request.emergencyId} accepted'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _viewEmergencyDetails(EmergencyRequest request) {
    Navigator.of(context).pushNamed('/emergency-details', arguments: request);
  }

  void _viewAmbulanceDetails(AmbulanceInfo ambulance) {
    Navigator.of(context).pushNamed('/ambulance-details', arguments: ambulance);
  }

  Future<void> _refreshData() async {
    final emergencyProvider = Provider.of<EmergencyProvider>(
      context,
      listen: false,
    );
    emergencyProvider.refreshHospitalFleet();
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
