import 'package:json_annotation/json_annotation.dart';

part 'user_models.g.dart';

enum UserRole {
  @JsonValue('admin')
  hospital,
  @JsonValue('driver')
  paramedic,
  @JsonValue('patient')
  patient,
}

@JsonSerializable()
class ContactDetails {
  final String name;
  final String email;
  final String phoneNumber;
  final String address;
  final String dateOfBirth;
  final String gender;
  final String employeeId;
  final String? username;
  final ProfilePicture? profilePicture;

  ContactDetails({
    required this.name,
    required this.email,
    required this.phoneNumber,
    required this.address,
    required this.dateOfBirth,
    required this.gender,
    required this.employeeId,
    this.username,
    this.profilePicture,
  });

  factory ContactDetails.fromJson(Map<String, dynamic> json) =>
      _$ContactDetailsFromJson(json);
  Map<String, dynamic> toJson() => _$ContactDetailsToJson(this);
}

@JsonSerializable()
class ProfilePicture {
  final String id;
  final String url;

  ProfilePicture({required this.id, required this.url});

  factory ProfilePicture.fromJson(Map<String, dynamic> json) =>
      _$ProfilePictureFromJson(json);
  Map<String, dynamic> toJson() => _$ProfilePictureToJson(this);
}

@JsonSerializable()
class Patient {
  final String? id;
  final String hospitalId;
  final String officeId;
  final String patientId;
  final String? username;
  final String email;
  final String name;
  final int age;
  final String gender;
  final String? password;
  final String bloodGroup;
  final String address;
  final String pincode;
  final String phoneNumber;
  final String secondaryPhoneNumber;
  final String? dob;
  final String group;
  final String flag;
  final String familyHistory;
  final String allergies;
  final String additionalNotes;
  final int preTermDays;
  final String referredBy;
  final String school;
  final List<String> listOfHospitals;
  final List<String> listOfDoctors;
  final String profileUrl;
  final String? registrationDate;

  Patient({
    this.id,
    required this.hospitalId,
    required this.officeId,
    required this.patientId,
    this.username,
    required this.email,
    required this.name,
    required this.age,
    required this.gender,
    this.password,
    required this.bloodGroup,
    required this.address,
    required this.pincode,
    required this.phoneNumber,
    required this.secondaryPhoneNumber,
    this.dob,
    required this.group,
    required this.flag,
    required this.familyHistory,
    required this.allergies,
    required this.additionalNotes,
    required this.preTermDays,
    required this.referredBy,
    required this.school,
    required this.listOfHospitals,
    required this.listOfDoctors,
    required this.profileUrl,
    this.registrationDate,
  });

  factory Patient.fromJson(Map<String, dynamic> json) =>
      _$PatientFromJson(json);
  Map<String, dynamic> toJson() => _$PatientToJson(this);
}

@JsonSerializable()
class Employee {
  final String hospitalId;
  final ContactDetails contactDetails;
  final HR hr;

  Employee({
    required this.hospitalId,
    required this.contactDetails,
    required this.hr,
  });

  factory Employee.fromJson(Map<String, dynamic> json) =>
      _$EmployeeFromJson(json);
  Map<String, dynamic> toJson() => _$EmployeeToJson(this);
}

@JsonSerializable()
class HR {
  final String joiningDate;
  final double totalPayableSalary;
  final double totalPaidSalary;
  final String? leavingDate;
  final double salary;
  final RoleInfo role;
  final String? department;
  final List<String>? supervisor;
  final List<String> subordinates;
  final int? noOfLeave;
  final int? noOfAbsent;
  final int actualWorkingHours;
  final double extraWorkingHours;

  HR({
    required this.joiningDate,
    required this.totalPayableSalary,
    required this.totalPaidSalary,
    this.leavingDate,
    required this.salary,
    required this.role,
    this.department,
    this.supervisor,
    required this.subordinates,
    this.noOfLeave,
    this.noOfAbsent,
    required this.actualWorkingHours,
    required this.extraWorkingHours,
  });

  factory HR.fromJson(Map<String, dynamic> json) => _$HRFromJson(json);
  Map<String, dynamic> toJson() => _$HRToJson(this);
}

@JsonSerializable()
class RoleInfo {
  final AdminRole role;
  final String? customName;

  RoleInfo({required this.role, this.customName});

  factory RoleInfo.fromJson(Map<String, dynamic> json) =>
      _$RoleInfoFromJson(json);
  Map<String, dynamic> toJson() => _$RoleInfoToJson(this);
}

enum AdminRole {
  @JsonValue('admin')
  admin,
  @JsonValue('doctor')
  doctor,
  @JsonValue('hr')
  hr,
  @JsonValue('finance')
  finance,
  @JsonValue('nurse')
  nurse,
  @JsonValue('compounder')
  compounder,
  @JsonValue('paramedics')
  paramedic,
  @JsonValue('pharma')
  pharma,
  @JsonValue('driver')
  driver,
  @JsonValue('Receptionist')
  receptionist,
  @JsonValue('lab_technician')
  labTechnician,
  @JsonValue('lab_assistant')
  labAssistant,
}

@JsonSerializable()
class AppUser {
  final String id;
  final String name;
  final String email;
  final String? phoneNumber;
  final UserRole role;
  final String? hospitalId;
  final String? profileUrl;

  AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.phoneNumber,
    required this.role,
    this.hospitalId,
    this.profileUrl,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) =>
      _$AppUserFromJson(json);
  Map<String, dynamic> toJson() => _$AppUserToJson(this);

  factory AppUser.fromEmployee(Employee employee) {
    return AppUser(
      id:
          employee.contactDetails.username ??
          employee.contactDetails.employeeId,
      name: employee.contactDetails.name,
      email: employee.contactDetails.email,
      phoneNumber: employee.contactDetails.phoneNumber,
      role:
          employee.hr.role.role == AdminRole.driver
              ? UserRole.paramedic
              : UserRole.hospital,
      hospitalId: employee.hospitalId,
      profileUrl: employee.contactDetails.profilePicture?.url,
    );
  }

  factory AppUser.fromPatient(Patient patient) {
    return AppUser(
      id: patient.username ?? patient.patientId,
      name: patient.name,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      role: UserRole.patient,
      hospitalId: patient.hospitalId,
      profileUrl: patient.profileUrl.isNotEmpty ? patient.profileUrl : null,
    );
  }

  factory AppUser.hospitalAdmin(String hospitalId) {
    return AppUser(
      id: 'admin',
      name: 'Hospital Admin',
      email: 'admin@hospital.com',
      role: UserRole.hospital,
      hospitalId: hospitalId,
    );
  }
}
