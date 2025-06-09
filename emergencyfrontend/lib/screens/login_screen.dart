import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/user_models.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  UserRole? _selectedRole;
  final _usernameController = TextEditingController();
  final _hospitalIdController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _usernameController.dispose();
    _hospitalIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF667eea), Color(0xFF764ba2)],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 40),
                    _buildHeader(),
                    const SizedBox(height: 60),
                    _buildRoleSelection(),
                    const SizedBox(height: 30),
                    _buildUsernameField(),
                    const SizedBox(height: 20),
                    if (_selectedRole == UserRole.hospital ||
                        _selectedRole == UserRole.paramedic)
                      _buildHospitalIdField(),
                    const SizedBox(height: 40),
                    _buildLoginButton(),
                    const SizedBox(height: 20),
                    _buildInfoText(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.local_hospital,
            size: 60,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'Emergency Tracking',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Real-time ambulance tracking system',
          style: TextStyle(fontSize: 16, color: Colors.white.withOpacity(0.9)),
        ),
      ],
    );
  }

  Widget _buildRoleSelection() {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Your Role',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2D3748),
              ),
            ),
            const SizedBox(height: 16),
            _buildRoleOption(
              UserRole.hospital,
              'Hospital Admin',
              'Manage emergency requests and fleet',
              Icons.local_hospital,
              const Color(0xFF4299E1),
            ),
            const SizedBox(height: 12),
            _buildRoleOption(
              UserRole.paramedic,
              'Paramedic',
              'Respond to emergencies and track location',
              Icons.emergency,
              const Color(0xFF38B2AC),
            ),
            const SizedBox(height: 12),
            _buildRoleOption(
              UserRole.patient,
              'Patient',
              'Request emergency assistance',
              Icons.person,
              const Color(0xFFED8936),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleOption(
    UserRole role,
    String title,
    String subtitle,
    IconData icon,
    Color color,
  ) {
    final isSelected = _selectedRole == role;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedRole = role;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.1) : Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected ? color : Colors.grey[400],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? color : Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            if (isSelected) Icon(Icons.check_circle, color: color, size: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildUsernameField() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: TextFormField(
          controller: _usernameController,
          decoration: InputDecoration(
            labelText: _getLabelText(),
            hintText: _getHintText(),
            border: InputBorder.none,
            prefixIcon: Icon(_getPrefixIcon()),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter ${_getLabelText().toLowerCase()}';
            }
            return null;
          },
        ),
      ),
    );
  }

  Widget _buildHospitalIdField() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: TextFormField(
          controller: _hospitalIdController,
          decoration: const InputDecoration(
            labelText: 'Hospital ID',
            hintText: 'Enter hospital identifier',
            border: InputBorder.none,
            prefixIcon: Icon(Icons.business),
          ),
          validator: (value) {
            if (_selectedRole == UserRole.hospital ||
                _selectedRole == UserRole.paramedic) {
              if (value == null || value.isEmpty) {
                return 'Please enter hospital ID';
              }
            }
            return null;
          },
        ),
      ),
    );
  }

  Widget _buildLoginButton() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return ElevatedButton(
          onPressed:
              _selectedRole == null || authProvider.isLoading
                  ? null
                  : _handleLogin,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF4299E1),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 8,
          ),
          child:
              authProvider.isLoading
                  ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                  : const Text(
                    'Login',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
        );
      },
    );
  }

  Widget _buildInfoText() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.error != null) {
          return Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.red[100],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.red[300]!),
            ),
            child: Row(
              children: [
                Icon(Icons.error, color: Colors.red[600], size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    authProvider.error!,
                    style: TextStyle(color: Colors.red[600]),
                  ),
                ),
              ],
            ),
          );
        }

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.blue[200]!),
          ),
          child: Row(
            children: [
              Icon(Icons.info, color: Colors.blue[600], size: 20),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Select your role and provide the required information to access the emergency tracking system.',
                  style: TextStyle(fontSize: 12),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _getLabelText() {
    switch (_selectedRole) {
      case UserRole.paramedic:
        return 'Username';
      case UserRole.patient:
        return 'Username';
      case UserRole.hospital:
        return 'Admin Username';
      default:
        return 'Username';
    }
  }

  String _getHintText() {
    switch (_selectedRole) {
      case UserRole.paramedic:
        return 'Enter paramedic username';
      case UserRole.patient:
        return 'Enter patient username';
      case UserRole.hospital:
        return 'Enter admin username';
      default:
        return 'Enter username';
    }
  }

  IconData _getPrefixIcon() {
    switch (_selectedRole) {
      case UserRole.paramedic:
        return Icons.emergency;
      case UserRole.patient:
        return Icons.person;
      case UserRole.hospital:
        return Icons.admin_panel_settings;
      default:
        return Icons.person;
    }
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final success = await authProvider.login(
      role: _selectedRole!,
      username: _usernameController.text.trim(),
      hospitalId:
          _hospitalIdController.text.trim().isNotEmpty
              ? _hospitalIdController.text.trim()
              : null,
    );

    if (success && mounted) {
      Navigator.of(context).pushReplacementNamed('/dashboard');
    }
  }
}
