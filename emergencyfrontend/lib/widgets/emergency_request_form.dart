// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import '../models/ambulance_models.dart';
// import '../providers/emergency_provider.dart';
// import '../services/location_service.dart';

// class EmergencyRequestForm extends StatefulWidget {
//   const EmergencyRequestForm({super.key});

//   @override
//   State<EmergencyRequestForm> createState() => _EmergencyRequestFormState();
// }

// class _EmergencyRequestFormState extends State<EmergencyRequestForm> {
//   final _formKey = GlobalKey<FormState>();
//   final _locationService = LocationService();

//   // Form controllers
//   final _patientNameController = TextEditingController();
//   final _patientPhoneController = TextEditingController();
//   final _emergencyDescriptionController = TextEditingController();
//   final _pickupAddressController = TextEditingController();
//   final _destinationAddressController = TextEditingController();

//   // Form state
//   String _selectedEmergencyType = 'Medical';
//   LocationData? _pickupLocation;
//   LocationData? _destinationLocation;
//   bool _isLocatingPickup = false;
//   bool _isLocatingDestination = false;
//   bool _isSubmitting = false;

//   final List<String> _emergencyTypes = [
//     'Medical',
//     'Accident',
//     'Critical',
//     'Cardiac',
//     'Respiratory',
//     'Trauma',
//     'Other',
//   ];

//   @override
//   void dispose() {
//     _patientNameController.dispose();
//     _patientPhoneController.dispose();
//     _emergencyDescriptionController.dispose();
//     _pickupAddressController.dispose();
//     _destinationAddressController.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Card(
//       margin: const EdgeInsets.all(16.0),
//       elevation: 4,
//       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
//       child: Container(
//         padding: const EdgeInsets.all(20.0),
//         child: Form(
//           key: _formKey,
//           child: SingleChildScrollView(
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 _buildHeader(),
//                 const SizedBox(height: 24),
//                 _buildPatientSection(),
//                 const SizedBox(height: 24),
//                 _buildEmergencySection(),
//                 const SizedBox(height: 24),
//                 _buildLocationSection(),
//                 const SizedBox(height: 32),
//                 _buildSubmitButton(),
//               ],
//             ),
//           ),
//         ),
//       ),
//     );
//   }

//   Widget _buildHeader() {
//     return Row(
//       children: [
//         Container(
//           padding: const EdgeInsets.all(12),
//           decoration: BoxDecoration(
//             color: Colors.red[100],
//             borderRadius: BorderRadius.circular(12),
//           ),
//           child: const Icon(Icons.emergency, color: Colors.red, size: 24),
//         ),
//         const SizedBox(width: 12),
//         const Expanded(
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               Text(
//                 'Request Emergency Ambulance',
//                 style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
//               ),
//               Text(
//                 'Fill in the details for immediate assistance',
//                 style: TextStyle(fontSize: 14, color: Colors.grey),
//               ),
//             ],
//           ),
//         ),
//       ],
//     );
//   }

//   Widget _buildPatientSection() {
//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         const Text(
//           'Patient Information',
//           style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
//         ),
//         const SizedBox(height: 12),
//         TextFormField(
//           controller: _patientNameController,
//           decoration: const InputDecoration(
//             labelText: 'Patient Name',
//             hintText: 'Enter patient full name',
//             prefixIcon: Icon(Icons.person),
//             border: OutlineInputBorder(),
//           ),
//           validator: (value) {
//             if (value == null || value.isEmpty) {
//               return 'Please enter patient name';
//             }
//             return null;
//           },
//         ),
//         const SizedBox(height: 16),
//         TextFormField(
//           controller: _patientPhoneController,
//           decoration: const InputDecoration(
//             labelText: 'Contact Number',
//             hintText: 'Enter contact phone number',
//             prefixIcon: Icon(Icons.phone),
//             border: OutlineInputBorder(),
//           ),
//           keyboardType: TextInputType.phone,
//           validator: (value) {
//             if (value == null || value.isEmpty) {
//               return 'Please enter contact number';
//             }
//             if (value.length < 10) {
//               return 'Please enter a valid phone number';
//             }
//             return null;
//           },
//         ),
//       ],
//     );
//   }

//   Widget _buildEmergencySection() {
//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         const Text(
//           'Emergency Details',
//           style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
//         ),
//         const SizedBox(height: 12),
//         DropdownButtonFormField<String>(
//           value: _selectedEmergencyType,
//           decoration: const InputDecoration(
//             labelText: 'Emergency Type',
//             prefixIcon: Icon(Icons.medical_services),
//             border: OutlineInputBorder(),
//           ),
//           items:
//               _emergencyTypes.map((type) {
//                 return DropdownMenuItem(value: type, child: Text(type));
//               }).toList(),
//           onChanged: (value) {
//             setState(() {
//               _selectedEmergencyType = value!;
//             });
//           },
//         ),
//         const SizedBox(height: 16),
//         TextFormField(
//           controller: _emergencyDescriptionController,
//           decoration: const InputDecoration(
//             labelText: 'Description',
//             hintText: 'Brief description of the emergency',
//             prefixIcon: Icon(Icons.description),
//             border: OutlineInputBorder(),
//           ),
//           maxLines: 3,
//           validator: (value) {
//             if (value == null || value.isEmpty) {
//               return 'Please provide emergency description';
//             }
//             return null;
//           },
//         ),
//       ],
//     );
//   }

//   Widget _buildLocationSection() {
//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         const Text(
//           'Location Information',
//           style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
//         ),
//         const SizedBox(height: 12),
//         _buildLocationField(
//           controller: _pickupAddressController,
//           label: 'Pickup Location',
//           hint: 'Enter pickup address',
//           icon: Icons.location_on,
//           isLoading: _isLocatingPickup,
//           onLocationTap: () => _getCurrentLocation(isPickup: true),
//           location: _pickupLocation,
//         ),
//         const SizedBox(height: 16),
//         _buildLocationField(
//           controller: _destinationAddressController,
//           label: 'Destination (Hospital)',
//           hint: 'Enter destination address',
//           icon: Icons.local_hospital,
//           isLoading: _isLocatingDestination,
//           onLocationTap: () => _getCurrentLocation(isPickup: false),
//           location: _destinationLocation,
//           isRequired: false,
//         ),
//       ],
//     );
//   }

//   Widget _buildLocationField({
//     required TextEditingController controller,
//     required String label,
//     required String hint,
//     required IconData icon,
//     required bool isLoading,
//     required VoidCallback onLocationTap,
//     required LocationData? location,
//     bool isRequired = true,
//   }) {
//     return Column(
//       children: [
//         TextFormField(
//           controller: controller,
//           decoration: InputDecoration(
//             labelText: label,
//             hintText: hint,
//             prefixIcon: Icon(icon),
//             border: const OutlineInputBorder(),
//             suffixIcon: Row(
//               mainAxisSize: MainAxisSize.min,
//               children: [
//                 if (isLoading)
//                   const Padding(
//                     padding: EdgeInsets.all(12),
//                     child: SizedBox(
//                       width: 20,
//                       height: 20,
//                       child: CircularProgressIndicator(strokeWidth: 2),
//                     ),
//                   )
//                 else
//                   IconButton(
//                     onPressed: onLocationTap,
//                     icon: const Icon(Icons.my_location),
//                     tooltip: 'Use current location',
//                   ),
//               ],
//             ),
//           ),
//           validator:
//               isRequired
//                   ? (value) {
//                     if (value == null || value.isEmpty) {
//                       return 'Please enter $label';
//                     }
//                     return null;
//                   }
//                   : null,
//         ),
//         if (location != null) ...[
//           const SizedBox(height: 8),
//           Container(
//             padding: const EdgeInsets.all(8),
//             decoration: BoxDecoration(
//               color: Colors.green[50],
//               borderRadius: BorderRadius.circular(8),
//               border: Border.all(color: Colors.green[200]!),
//             ),
//             child: Row(
//               children: [
//                 Icon(Icons.check_circle, color: Colors.green[600], size: 16),
//                 const SizedBox(width: 8),
//                 Expanded(
//                   child: Text(
//                     'Location captured: ${location.latitude.toStringAsFixed(4)}, ${location.longitude.toStringAsFixed(4)}',
//                     style: TextStyle(fontSize: 12, color: Colors.green[700]),
//                   ),
//                 ),
//               ],
//             ),
//           ),
//         ],
//       ],
//     );
//   }

//   Widget _buildSubmitButton() {
//     return SizedBox(
//       width: double.infinity,
//       height: 50,
//       child: ElevatedButton(
//         onPressed: _isSubmitting ? null : _submitEmergencyRequest,
//         style: ElevatedButton.styleFrom(
//           backgroundColor: Colors.red,
//           foregroundColor: Colors.white,
//           shape: RoundedRectangleBorder(
//             borderRadius: BorderRadius.circular(12),
//           ),
//         ),
//         child:
//             _isSubmitting
//                 ? const Row(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     SizedBox(
//                       width: 20,
//                       height: 20,
//                       child: CircularProgressIndicator(
//                         strokeWidth: 2,
//                         valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
//                       ),
//                     ),
//                     SizedBox(width: 12),
//                     Text('Submitting Request...'),
//                   ],
//                 )
//                 : const Row(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     Icon(Icons.emergency, size: 20),
//                     SizedBox(width: 8),
//                     Text(
//                       'REQUEST EMERGENCY AMBULANCE',
//                       style: TextStyle(
//                         fontSize: 16,
//                         fontWeight: FontWeight.bold,
//                       ),
//                     ),
//                   ],
//                 ),
//       ),
//     );
//   }

//   Future<void> _getCurrentLocation({required bool isPickup}) async {
//     setState(() {
//       if (isPickup) {
//         _isLocatingPickup = true;
//       } else {
//         _isLocatingDestination = true;
//       }
//     });

//     try {
//       final position = await _locationService.getCurrentPosition();
//       if (position == null) {
//         throw Exception('Unable to get current location');
//       }

//       final address = await _locationService.getAddressFromCoordinates(
//         position.latitude,
//         position.longitude,
//       );

//       final addressText =
//           address ??
//           'Location: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';

//       final locationData = LocationData(
//         latitude: position.latitude,
//         longitude: position.longitude,
//         address: address,
//       );

//       setState(() {
//         if (isPickup) {
//           _pickupLocation = locationData;
//           _pickupAddressController.text = addressText;
//         } else {
//           _destinationLocation = locationData;
//           _destinationAddressController.text = addressText;
//         }
//       });

//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(
//           content: Text('Location captured: $addressText'),
//           backgroundColor: Colors.green,
//         ),
//       );
//     } catch (e) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(
//           content: Text('Error getting location: $e'),
//           backgroundColor: Colors.red,
//         ),
//       );
//     } finally {
//       setState(() {
//         if (isPickup) {
//           _isLocatingPickup = false;
//         } else {
//           _isLocatingDestination = false;
//         }
//       });
//     }
//   }

//   Future<void> _submitEmergencyRequest() async {
//     if (!_formKey.currentState!.validate()) {
//       return;
//     }

//     if (_pickupLocation == null) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(
//           content: Text('Please capture pickup location'),
//           backgroundColor: Colors.red,
//         ),
//       );
//       return;
//     }

//     setState(() {
//       _isSubmitting = true;
//     });
//     try {
//       final emergencyProvider = context.read<EmergencyProvider>();
//       final request = EmergencyRequest(
//         emergencyId: 'emer_${DateTime.now().millisecondsSinceEpoch}',
//         patientId: 'patient_${DateTime.now().millisecondsSinceEpoch}',
//         patientName: _patientNameController.text.trim(),
//         patientPhone: _patientPhoneController.text.trim(),
//         emergencyType: _selectedEmergencyType,
//         severity:
//             _selectedEmergencyType == 'Critical' ||
//                     _selectedEmergencyType == 'Cardiac'
//                 ? 'High'
//                 : 'Medium',
//         description: _emergencyDescriptionController.text.trim(),
//         pickupLocation: _pickupLocation!,
//         destinationLocation: _destinationLocation,
//         hospitalIds: ["hos"],
//         requestTime: DateTime.now(),
//         timestamp: DateTime.now(),
//         status: EmergencyStatus.requested,
//       );

//       await emergencyProvider.submitEmergencyRequest(request);

//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(
//           const SnackBar(
//             content: Text('Emergency request submitted successfully!'),
//             backgroundColor: Colors.green,
//           ),
//         );

//         // Clear form
//         _clearForm();
//       }
//     } catch (e) {
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(
//           SnackBar(
//             content: Text('Error submitting request: $e'),
//             backgroundColor: Colors.red,
//           ),
//         );
//       }
//     } finally {
//       if (mounted) {
//         setState(() {
//           _isSubmitting = false;
//         });
//       }
//     }
//   }

//   void _clearForm() {
//     _patientNameController.clear();
//     _patientPhoneController.clear();
//     _emergencyDescriptionController.clear();
//     _pickupAddressController.clear();
//     _destinationAddressController.clear();
//     setState(() {
//       _selectedEmergencyType = 'Medical';
//       _pickupLocation = null;
//       _destinationLocation = null;
//     });
//   }
// }

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/ambulance_models.dart';
import '../providers/emergency_provider.dart';
import '../services/location_service.dart';

class EmergencyRequestForm extends StatefulWidget {
  const EmergencyRequestForm({super.key});

  @override
  State<EmergencyRequestForm> createState() => _EmergencyRequestFormState();
}

class _EmergencyRequestFormState extends State<EmergencyRequestForm> {
  final _formKey = GlobalKey<FormState>();
  final _locationService = LocationService();

  // Form controllers
  final _patientNameController = TextEditingController();
  final _patientPhoneController = TextEditingController();
  final _emergencyDescriptionController = TextEditingController();
  final _pickupAddressController = TextEditingController();
  final _destinationAddressController = TextEditingController();

  // Form state
  String _selectedEmergencyType = 'Medical';
  LocationData? _pickupLocation;
  LocationData? _destinationLocation;
  bool _isLocatingPickup = false;
  bool _isLocatingDestination = false;
  bool _isSubmitting = false;

  // Hospital selection
  List<String> _selectedHospitalIds = [];
  final List<Map<String, String>> _availableHospitals = [
    {'id': 'hos_001', 'name': 'City General Hospital'},
    {'id': 'hos_002', 'name': 'Emergency Medical Center'},
    {'id': 'hos_003', 'name': 'Regional Healthcare'},
    {'id': 'hos_004', 'name': 'Metro Hospital'},
    {'id': 'hos_005', 'name': 'Community Medical Center'},
  ];

  final List<String> _emergencyTypes = [
    'Medical',
    'Accident',
    'Critical',
    'Cardiac',
    'Respiratory',
    'Trauma',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    // Pre-select all hospitals by default for better availability
    _selectedHospitalIds = _availableHospitals.map((h) => h['id']!).toList();
  }

  @override
  void dispose() {
    _patientNameController.dispose();
    _patientPhoneController.dispose();
    _emergencyDescriptionController.dispose();
    _pickupAddressController.dispose();
    _destinationAddressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16.0),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 24),
                _buildPatientSection(),
                const SizedBox(height: 24),
                _buildEmergencySection(),
                const SizedBox(height: 24),
                _buildHospitalSection(),
                const SizedBox(height: 24),
                _buildLocationSection(),
                const SizedBox(height: 32),
                _buildSubmitButton(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.red[100],
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.emergency, color: Colors.red, size: 24),
        ),
        const SizedBox(width: 12),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Request Emergency Ambulance',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              Text(
                'Fill in the details for immediate assistance',
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPatientSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Patient Information',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _patientNameController,
          decoration: const InputDecoration(
            labelText: 'Patient Name',
            hintText: 'Enter patient full name',
            prefixIcon: Icon(Icons.person),
            border: OutlineInputBorder(),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter patient name';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _patientPhoneController,
          decoration: const InputDecoration(
            labelText: 'Contact Number',
            hintText: 'Enter contact phone number',
            prefixIcon: Icon(Icons.phone),
            border: OutlineInputBorder(),
          ),
          keyboardType: TextInputType.phone,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter contact number';
            }
            if (value.length < 10) {
              return 'Please enter a valid phone number';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildEmergencySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Emergency Details',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _selectedEmergencyType,
          decoration: const InputDecoration(
            labelText: 'Emergency Type',
            prefixIcon: Icon(Icons.medical_services),
            border: OutlineInputBorder(),
          ),
          items:
              _emergencyTypes.map((type) {
                return DropdownMenuItem(value: type, child: Text(type));
              }).toList(),
          onChanged: (value) {
            setState(() {
              _selectedEmergencyType = value!;
            });
          },
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _emergencyDescriptionController,
          decoration: const InputDecoration(
            labelText: 'Description',
            hintText: 'Brief description of the emergency',
            prefixIcon: Icon(Icons.description),
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please provide emergency description';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildHospitalSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'Hospital Selection',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const Spacer(),
            Text(
              '${_selectedHospitalIds.length} selected',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Select hospitals to send emergency request',
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            children: [
              // Select All / Deselect All buttons
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(8),
                    topRight: Radius.circular(8),
                  ),
                ),
                child: Row(
                  children: [
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _selectedHospitalIds =
                              _availableHospitals.map((h) => h['id']!).toList();
                        });
                      },
                      child: const Text('Select All'),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _selectedHospitalIds.clear();
                        });
                      },
                      child: const Text('Deselect All'),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Hospital list
              ...(_availableHospitals.map((hospital) {
                final isSelected = _selectedHospitalIds.contains(
                  hospital['id'],
                );
                return CheckboxListTile(
                  title: Text(hospital['name']!),
                  subtitle: Text('ID: ${hospital['id']}'),
                  value: isSelected,
                  onChanged: (bool? value) {
                    setState(() {
                      if (value == true) {
                        _selectedHospitalIds.add(hospital['id']!);
                      } else {
                        _selectedHospitalIds.remove(hospital['id']!);
                      }
                    });
                  },
                  dense: true,
                );
              })),
            ],
          ),
        ),
        if (_selectedHospitalIds.isEmpty)
          Container(
            margin: const EdgeInsets.only(top: 8),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.orange[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.orange[200]!),
            ),
            child: Row(
              children: [
                Icon(Icons.warning, color: Colors.orange[600], size: 16),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Please select at least one hospital',
                    style: TextStyle(fontSize: 12, color: Colors.orange),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildLocationSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Location Information',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        _buildLocationField(
          controller: _pickupAddressController,
          label: 'Pickup Location',
          hint: 'Enter pickup address',
          icon: Icons.location_on,
          isLoading: _isLocatingPickup,
          onLocationTap: () => _getCurrentLocation(isPickup: true),
          location: _pickupLocation,
        ),
        const SizedBox(height: 16),
        _buildLocationField(
          controller: _destinationAddressController,
          label: 'Destination (Hospital)',
          hint: 'Enter destination address',
          icon: Icons.local_hospital,
          isLoading: _isLocatingDestination,
          onLocationTap: () => _getCurrentLocation(isPickup: false),
          location: _destinationLocation,
          isRequired: false,
        ),
      ],
    );
  }

  Widget _buildLocationField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required bool isLoading,
    required VoidCallback onLocationTap,
    required LocationData? location,
    bool isRequired = true,
  }) {
    return Column(
      children: [
        TextFormField(
          controller: controller,
          decoration: InputDecoration(
            labelText: label,
            hintText: hint,
            prefixIcon: Icon(icon),
            border: const OutlineInputBorder(),
            suffixIcon: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isLoading)
                  const Padding(
                    padding: EdgeInsets.all(12),
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                else
                  IconButton(
                    onPressed: onLocationTap,
                    icon: const Icon(Icons.my_location),
                    tooltip: 'Use current location',
                  ),
              ],
            ),
          ),
          validator:
              isRequired
                  ? (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter $label';
                    }
                    return null;
                  }
                  : null,
        ),
        if (location != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.green[200]!),
            ),
            child: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green[600], size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Location captured: ${location.latitude.toStringAsFixed(4)}, ${location.longitude.toStringAsFixed(4)}',
                    style: TextStyle(fontSize: 12, color: Colors.green[700]),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _submitEmergencyRequest,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.red,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child:
            _isSubmitting
                ? const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ),
                    SizedBox(width: 12),
                    Text('Submitting Request...'),
                  ],
                )
                : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.emergency, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'REQUEST EMERGENCY AMBULANCE',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
      ),
    );
  }

  Future<void> _getCurrentLocation({required bool isPickup}) async {
    setState(() {
      if (isPickup) {
        _isLocatingPickup = true;
      } else {
        _isLocatingDestination = true;
      }
    });

    try {
      final position = await _locationService.getCurrentPosition();
      if (position == null) {
        throw Exception('Unable to get current location');
      }

      final address = await _locationService.getAddressFromCoordinates(
        position.latitude,
        position.longitude,
      );

      final addressText =
          address ??
          'Location: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';

      final locationData = LocationData(
        latitude: position.latitude,
        longitude: position.longitude,
        address: address,
      );

      setState(() {
        if (isPickup) {
          _pickupLocation = locationData;
          _pickupAddressController.text = addressText;
        } else {
          _destinationLocation = locationData;
          _destinationAddressController.text = addressText;
        }
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Location captured: $addressText'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error getting location: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        if (isPickup) {
          _isLocatingPickup = false;
        } else {
          _isLocatingDestination = false;
        }
      });
    }
  }

  Future<void> _submitEmergencyRequest() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_pickupLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please capture pickup location'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_selectedHospitalIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one hospital'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      print(
        'Creating emergency request with hospital IDs: $_selectedHospitalIds',
      );

      final emergencyProvider = context.read<EmergencyProvider>();
      final request = EmergencyRequest(
        emergencyId: 'emer_${DateTime.now().millisecondsSinceEpoch}',
        patientId: 'patient_${DateTime.now().millisecondsSinceEpoch}',
        patientName: _patientNameController.text.trim(),
        patientPhone: _patientPhoneController.text.trim(),
        emergencyType: _selectedEmergencyType,
        severity:
            _selectedEmergencyType == 'Critical' ||
                    _selectedEmergencyType == 'Cardiac'
                ? 'High'
                : 'Medium',
        description: _emergencyDescriptionController.text.trim(),
        pickupLocation: _pickupLocation!,
        destinationLocation: _destinationLocation,
        hospitalIds: List<String>.from(
          _selectedHospitalIds,
        ), // Ensure it's a proper list
        requestTime: DateTime.now(),
        timestamp: DateTime.now(),
        status: EmergencyStatus.requested,
      );

      print('Emergency request created: ${request.toJson()}');

      await emergencyProvider.submitEmergencyRequest(request);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Emergency request submitted to ${_selectedHospitalIds.length} hospitals!',
            ),
            backgroundColor: Colors.green,
          ),
        );

        // Clear form
        _clearForm();
      }
    } catch (e) {
      print('Error submitting emergency request: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error submitting request: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  void _clearForm() {
    _patientNameController.clear();
    _patientPhoneController.clear();
    _emergencyDescriptionController.clear();
    _pickupAddressController.clear();
    _destinationAddressController.clear();
    setState(() {
      _selectedEmergencyType = 'Medical';
      _pickupLocation = null;
      _destinationLocation = null;
      _selectedHospitalIds = _availableHospitals.map((h) => h['id']!).toList();
    });
  }
}

//emergencyrequestform
