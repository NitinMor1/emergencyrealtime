import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/ambulance_models.dart';
import '../providers/emergency_provider.dart';

class EmergencyRequestCard extends StatelessWidget {
  final EmergencyRequest request;
  final VoidCallback? onTap;
  final bool showActions;

  const EmergencyRequestCard({
    super.key,
    required this.request,
    this.onTap,
    this.showActions = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(8.0),
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 12),
              _buildPatientInfo(),
              const SizedBox(height: 12),
              _buildLocationInfo(),
              const SizedBox(height: 12),
              _buildStatusChip(),
              if (showActions) ...[
                const SizedBox(height: 16),
                _buildActionButtons(context),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: _getEmergencyTypeColor().withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            _getEmergencyTypeIcon(),
            color: _getEmergencyTypeColor(),
            size: 24,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Emergency #${request.emergencyId}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                request.emergencyType,
                style: TextStyle(
                  fontSize: 14,
                  color: _getEmergencyTypeColor(),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        _buildTimeInfo(),
      ],
    );
  }

  Widget _buildPatientInfo() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          const Icon(Icons.person, size: 20, color: Colors.blue),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  request.patientName ?? 'Unknown Patient',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (request.patientPhone?.isNotEmpty == true)
                  Text(
                    request.patientPhone!,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationInfo() {
    return Row(
      children: [
        Icon(Icons.location_on, size: 18, color: Colors.red[400]),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'From: ${request.pickupLocation.address}',
                style: const TextStyle(fontSize: 13),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (request.destination != null)
                Text(
                  'To: ${request.destination!.address}',
                  style: const TextStyle(fontSize: 13, color: Colors.grey),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusChip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _getStatusColor().withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _getStatusColor().withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: _getStatusColor(),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            request.status.toString().split('.').last.toUpperCase(),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: _getStatusColor(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeInfo() {
    final timeDiff = DateTime.now().difference(request.timestamp);
    final timeText =
        timeDiff.inMinutes < 60
            ? '${timeDiff.inMinutes}m ago'
            : '${timeDiff.inHours}h ago';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
        const SizedBox(height: 2),
        Text(timeText, style: TextStyle(fontSize: 11, color: Colors.grey[600])),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => _handleAssignDriver(context),
            icon: const Icon(Icons.person_add, size: 18),
            label: const Text('Assign'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.blue,
              side: const BorderSide(color: Colors.blue),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () => _handleTrackEmergency(context),
            icon: const Icon(Icons.my_location, size: 18),
            label: const Text('Track'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  void _handleAssignDriver(BuildContext context) {
    // Show driver assignment dialog
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Assign Driver & Paramedic'),
            content: const Text(
              'This feature will show available drivers and paramedics for assignment.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  // TODO: Implement driver assignment
                },
                child: const Text('Assign'),
              ),
            ],
          ),
    );
  }

  void _handleTrackEmergency(BuildContext context) {
    // Navigate to tracking screen
    // TODO: Implement navigation to tracking screen
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Opening tracking view...')));
  }

  Color _getEmergencyTypeColor() {
    switch (request.emergencyType.toLowerCase()) {
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

  IconData _getEmergencyTypeIcon() {
    switch (request.emergencyType.toLowerCase()) {
      case 'critical':
        return Icons.emergency;
      case 'accident':
        return Icons.car_crash;
      case 'medical':
        return Icons.medical_services;
      default:
        return Icons.local_hospital;
    }
  }

  Color _getStatusColor() {
    switch (request.status) {
      case EmergencyStatus.requested:
        return Colors.orange;
      case EmergencyStatus.assigned:
        return Colors.blue;
      case EmergencyStatus.dispatched:
        return Colors.purple;
      case EmergencyStatus.enRoute:
        return Colors.indigo;
      case EmergencyStatus.arrived:
        return Colors.green;
      case EmergencyStatus.completed:
        return Colors.grey;
      case EmergencyStatus.cancelled:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
