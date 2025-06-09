// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ContactDetails _$ContactDetailsFromJson(Map<String, dynamic> json) =>
    ContactDetails(
      name: json['name'] as String,
      email: json['email'] as String,
      phoneNumber: json['phoneNumber'] as String,
      address: json['address'] as String,
      dateOfBirth: json['dateOfBirth'] as String,
      gender: json['gender'] as String,
      employeeId: json['employeeId'] as String,
      username: json['username'] as String?,
      profilePicture:
          json['profilePicture'] == null
              ? null
              : ProfilePicture.fromJson(
                json['profilePicture'] as Map<String, dynamic>,
              ),
    );

Map<String, dynamic> _$ContactDetailsToJson(ContactDetails instance) =>
    <String, dynamic>{
      'name': instance.name,
      'email': instance.email,
      'phoneNumber': instance.phoneNumber,
      'address': instance.address,
      'dateOfBirth': instance.dateOfBirth,
      'gender': instance.gender,
      'employeeId': instance.employeeId,
      'username': instance.username,
      'profilePicture': instance.profilePicture,
    };

ProfilePicture _$ProfilePictureFromJson(Map<String, dynamic> json) =>
    ProfilePicture(id: json['id'] as String, url: json['url'] as String);

Map<String, dynamic> _$ProfilePictureToJson(ProfilePicture instance) =>
    <String, dynamic>{'id': instance.id, 'url': instance.url};

Patient _$PatientFromJson(Map<String, dynamic> json) => Patient(
  id: json['id'] as String?,
  hospitalId: json['hospitalId'] as String,
  officeId: json['officeId'] as String,
  patientId: json['patientId'] as String,
  username: json['username'] as String?,
  email: json['email'] as String,
  name: json['name'] as String,
  age: (json['age'] as num).toInt(),
  gender: json['gender'] as String,
  password: json['password'] as String?,
  bloodGroup: json['bloodGroup'] as String,
  address: json['address'] as String,
  pincode: json['pincode'] as String,
  phoneNumber: json['phoneNumber'] as String,
  secondaryPhoneNumber: json['secondaryPhoneNumber'] as String,
  dob: json['dob'] as String?,
  group: json['group'] as String,
  flag: json['flag'] as String,
  familyHistory: json['familyHistory'] as String,
  allergies: json['allergies'] as String,
  additionalNotes: json['additionalNotes'] as String,
  preTermDays: (json['preTermDays'] as num).toInt(),
  referredBy: json['referredBy'] as String,
  school: json['school'] as String,
  listOfHospitals:
      (json['listOfHospitals'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
  listOfDoctors:
      (json['listOfDoctors'] as List<dynamic>).map((e) => e as String).toList(),
  profileUrl: json['profileUrl'] as String,
  registrationDate: json['registrationDate'] as String?,
);

Map<String, dynamic> _$PatientToJson(Patient instance) => <String, dynamic>{
  'id': instance.id,
  'hospitalId': instance.hospitalId,
  'officeId': instance.officeId,
  'patientId': instance.patientId,
  'username': instance.username,
  'email': instance.email,
  'name': instance.name,
  'age': instance.age,
  'gender': instance.gender,
  'password': instance.password,
  'bloodGroup': instance.bloodGroup,
  'address': instance.address,
  'pincode': instance.pincode,
  'phoneNumber': instance.phoneNumber,
  'secondaryPhoneNumber': instance.secondaryPhoneNumber,
  'dob': instance.dob,
  'group': instance.group,
  'flag': instance.flag,
  'familyHistory': instance.familyHistory,
  'allergies': instance.allergies,
  'additionalNotes': instance.additionalNotes,
  'preTermDays': instance.preTermDays,
  'referredBy': instance.referredBy,
  'school': instance.school,
  'listOfHospitals': instance.listOfHospitals,
  'listOfDoctors': instance.listOfDoctors,
  'profileUrl': instance.profileUrl,
  'registrationDate': instance.registrationDate,
};

Employee _$EmployeeFromJson(Map<String, dynamic> json) => Employee(
  hospitalId: json['hospitalId'] as String,
  contactDetails: ContactDetails.fromJson(
    json['contactDetails'] as Map<String, dynamic>,
  ),
  hr: HR.fromJson(json['hr'] as Map<String, dynamic>),
);

Map<String, dynamic> _$EmployeeToJson(Employee instance) => <String, dynamic>{
  'hospitalId': instance.hospitalId,
  'contactDetails': instance.contactDetails,
  'hr': instance.hr,
};

HR _$HRFromJson(Map<String, dynamic> json) => HR(
  joiningDate: json['joiningDate'] as String,
  totalPayableSalary: (json['totalPayableSalary'] as num).toDouble(),
  totalPaidSalary: (json['totalPaidSalary'] as num).toDouble(),
  leavingDate: json['leavingDate'] as String?,
  salary: (json['salary'] as num).toDouble(),
  role: RoleInfo.fromJson(json['role'] as Map<String, dynamic>),
  department: json['department'] as String?,
  supervisor:
      (json['supervisor'] as List<dynamic>?)?.map((e) => e as String).toList(),
  subordinates:
      (json['subordinates'] as List<dynamic>).map((e) => e as String).toList(),
  noOfLeave: (json['noOfLeave'] as num?)?.toInt(),
  noOfAbsent: (json['noOfAbsent'] as num?)?.toInt(),
  actualWorkingHours: (json['actualWorkingHours'] as num).toInt(),
  extraWorkingHours: (json['extraWorkingHours'] as num).toDouble(),
);

Map<String, dynamic> _$HRToJson(HR instance) => <String, dynamic>{
  'joiningDate': instance.joiningDate,
  'totalPayableSalary': instance.totalPayableSalary,
  'totalPaidSalary': instance.totalPaidSalary,
  'leavingDate': instance.leavingDate,
  'salary': instance.salary,
  'role': instance.role,
  'department': instance.department,
  'supervisor': instance.supervisor,
  'subordinates': instance.subordinates,
  'noOfLeave': instance.noOfLeave,
  'noOfAbsent': instance.noOfAbsent,
  'actualWorkingHours': instance.actualWorkingHours,
  'extraWorkingHours': instance.extraWorkingHours,
};

RoleInfo _$RoleInfoFromJson(Map<String, dynamic> json) => RoleInfo(
  role: $enumDecode(_$AdminRoleEnumMap, json['role']),
  customName: json['customName'] as String?,
);

Map<String, dynamic> _$RoleInfoToJson(RoleInfo instance) => <String, dynamic>{
  'role': _$AdminRoleEnumMap[instance.role]!,
  'customName': instance.customName,
};

const _$AdminRoleEnumMap = {
  AdminRole.admin: 'admin',
  AdminRole.doctor: 'doctor',
  AdminRole.hr: 'hr',
  AdminRole.finance: 'finance',
  AdminRole.nurse: 'nurse',
  AdminRole.compounder: 'compounder',
  AdminRole.paramedic: 'paramedics',
  AdminRole.pharma: 'pharma',
  AdminRole.driver: 'driver',
  AdminRole.receptionist: 'Receptionist',
  AdminRole.labTechnician: 'lab_technician',
  AdminRole.labAssistant: 'lab_assistant',
};

AppUser _$AppUserFromJson(Map<String, dynamic> json) => AppUser(
  id: json['id'] as String,
  name: json['name'] as String,
  email: json['email'] as String,
  phoneNumber: json['phoneNumber'] as String?,
  role: $enumDecode(_$UserRoleEnumMap, json['role']),
  hospitalId: json['hospitalId'] as String?,
  profileUrl: json['profileUrl'] as String?,
);

Map<String, dynamic> _$AppUserToJson(AppUser instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'email': instance.email,
  'phoneNumber': instance.phoneNumber,
  'role': _$UserRoleEnumMap[instance.role]!,
  'hospitalId': instance.hospitalId,
  'profileUrl': instance.profileUrl,
};

const _$UserRoleEnumMap = {
  UserRole.hospital: 'admin',
  UserRole.paramedic: 'driver',
  UserRole.patient: 'patient',
};
