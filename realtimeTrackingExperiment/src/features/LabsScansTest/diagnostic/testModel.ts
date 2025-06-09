import { SampleCollection } from "features/LabsScansTest/diagnostic/sampleCollection/sampleCollectionModel";
export interface TestOrder {
    orderId: string;
    patientId: string;
    patientName :string;
    physicianId: string;
    hospitalId: string;
    requiredTests: TestType[] | string[];
    clinicalRationale: string; // unknown
    priority: EPriorityLevel;
    samplesRequired: number;
    orderStatus: EOrderStatus;
    billingReference?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    paymentStatus: boolean;
    testPackages: ITestPackage[];
}
export interface ITestPackage {
    name: string;
    description: string;
    tests: string[];
    totalPrice: number;
    icon: string;
    color: string;
}
    export enum TestType {
    CLINICAL_CHEMISTRY = 'Clinical Chemistry',
    MICROBIOLOGY = 'Microbiology',
    MOLECULAR_DIAGNOSTICS = 'Molecular Diagnostics',
    HISTOPATHOLOGY = 'Histopathology'
}

export enum EPriorityLevel {
    STAT = 'Stat',
    ROUTINE = 'Routine',
    URGENT = 'Urgent'
}

export enum EOrderStatus {
   PENDING = 'pending',
   COLLECTED = 'collected',
   PREPARED = 'prepared',
   TESTED = 'tested',
   REPORTED = 'reported',
   COMPLETED = 'completed',
    CANCELED = 'canceled',
    ARCHIVED = 'archived'
}



export interface SampleRegistration extends SampleCollection {
    registrationNumber: string;
    barcode: string;
    collectionDevice: string;
    preservativeUsed: string;
    storageRequirements: string;
    chainOfCustody: ChainOfCustodyEntry[];
}

export interface ChainOfCustodyEntry {
    timestamp: Date;
    location: string;
    custodian: string;
    actionPerformed: ESampleAction;
    signature: string;
}

export enum ESampleAction {
    TRANSFER = 'Transfer',
    ALIQUOTING = 'Aliquoting',
    STORAGE = 'Storage',
    DISPOSAL = 'Disposal'
}

export interface SamplePreparation {
    orderId: string;
    preparationId: string;
    sampleId: string;
    protocolId: string;
    technicianId: string;
    equipmentUsed: string[];
    reagents: ReagentUsage[];
    deviations: ProtocolDeviation[];
    startTime: Date;
    preprationStatus: EPreparationStatus;
    endTime: Date;
}

export interface ReagentUsage {
    lotNumber: string;
    expiration: Date;
    quantityUsed: number;
    unit: string;
}
export interface ProtocolDeviation {
    deviationCode: string;
    description: string;
    impactAssessment: string;
    correctiveAction: string;
}

export enum EPreparationStatus {
    INITIATED = 'initiated',
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    HOLD = 'hold'
}

export interface TaskAllocation {
    orderId: string;
    taskId: string;
    sampleId:string;
    assignedTo: string[];
    equipmentRequirements: string[];
    deadline: Date;
    taskStatus: ETaskStatus;
    priorityScore: number;
    dependencies: string[];
}

export enum ETaskStatus {
    UNASSIGNED = 'unassigned',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    VERIFIED = 'verified'
}
export interface SampleTesting {
    orderId: string;
    testId: string;
    sampleId: string;
    instrumentId: string;
    testParameters: TestParameter[];
    rawDataFiles: string[];
    results: AnalyticalResult[];
    technicianNotes: string;
}
export interface TestParameter {
    parameterName: string;
    methodReference: string;
    detectionLimit: number;
    quantitationLimit: number;
    units: string;
}
export interface AnalyticalResult {
    analyte: string;
    measuredValue: number;
    uncertainty: number;
    qualifiers: string[];
    flags: EResultFlag[];
}

export enum EResultFlag {
    NORMAL = 'normal',
    ABNORMAL = 'abnormal',
    CRITICAL = 'critical',
    INVALID = 'invalid'
}

export interface ResultValidation {
    validationId: string;
    orderId: string;
    testId: string;
    validatorId: string;
    validationType: EValidationType;
    validationCriteria: string;
    referenceMaterialsUsed: string[];
    statisticalMethods: EStatisticalMethod[];
    approvalStatus: EValidationStatus;
    comments: string;
    signature: string;
}

export enum EValidationType {
    PEER_REVIEW = 'Peer Review',
    STATISTICAL = 'Statistical',
    REPLICATE_ANALYSIS = 'Replicate Analysis'
}

export enum EValidationStatus {
APPROVED = 'approved',
REJECTED = 'rejected',
CONDITIONAL_APPROVAL = 'conditional_approval'
}

export enum EStatisticalMethod {
WESTGARD_RULES = 'Westgard Rules',
GRUBBS_TEST = 'Grubbs Test',
YOU_DEN_PLOT = 'Youden Plot'
}


/*
export interface LIMSCanonicalModel {
header: IntegrationHeader;
// payload: IntegrationPayload; // incomplete
// attachments: BinaryAttachment[]; // incomplete
}
export interface IntegrationHeader {
messageId: string;
timestamp: Date;
sourceSystem: string;
destinationSystems: string[];
// messageType: EMessageType; // incomplete
}

*/


export interface CalibrationEntry {
    calibrationId: string;
    instrumentId: string;
    calibrationType: ECalibrationType;
    calibrationDate: Date;
    performedBy: string;
    nextCalibrationDue: Date;
    results: {
        parameter: string;
        measured: number;
        expected: number;
        tolerance: number;
        status: boolean;
    }[];
}

export enum ECalibrationType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUAL = 'annual',
    AS_NEEDED = 'as_needed'
}



// unable to understand
// export class LIMSIntegrationBus {
// private messageQueue: IntegrationMessage[]; 
// private transformationEngine: DataTransformation;

// constructor() {
//     this.messageQueue = [];
//     this.transformationEngine = new XSLTTransformation();
// }

// async routeMessage(message: LIMSCanonicalModel): Promise<void> {
//     // Implementation of ESB routing logic
// }
// }








/*
    import { SampleCollection } from "features/sampleCollection/sampleCollectionModel";

export interface TestOrder {
    orderId: string;
    patientId: string;
    physicianId: string;
    hospitalId: string;
    requiredTests: TestType[];
    clinicalRationale: string;
    priority: EPriorityLevel;
    samplesRequired: number;
    orderStatus: EOrderStatus;
    billingReference?: string;
    appointmentId?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export enum TestType {
    CLINICAL_CHEMISTRY = 'Clinical Chemistry',
    MICROBIOLOGY = 'Microbiology',
    MOLECULAR_DIAGNOSTICS = 'Molecular Diagnostics',
    HISTOPATHOLOGY = 'Histopathology',
    HEMATOLOGY = 'Hematology',
    IMMUNOLOGY = 'Immunology',
    TOXICOLOGY = 'Toxicology',
    RADIOLOGY = 'Radiology'
}

export enum EPriorityLevel {
    STAT = 'Stat',
    ROUTINE = 'Routine',
    URGENT = 'Urgent'
}

export enum EOrderStatus {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    CANCELED = 'canceled'
}


export interface EnvironmentalData {
    temperature: number;
    humidity: number;
    pressure: number;
    lightExposure?: number;
    recordedAt: Date;
    recordedBy: string;
    roomId: string;
    withinSpecification: boolean;
}
export interface SampleRegistration extends SampleCollection {
    registrationNumber: string;
    barcode: string;
    collectionDevice: string;
    preservativeUsed: string;
    storageRequirements: string;
    chainOfCustody: ChainOfCustodyEntry[];
    sampleSource: string;
    collectionDate: Date;
    expirationDate: Date;
    // sampleStatus: ESampleStatus;
}

export enum ESampleStatus {
    COLLECTED = 'collected',
    IN_TRANSIT = 'in_transit',
    RECEIVED = 'received',
    PROCESSING = 'processing',
    ANALYZED = 'analyzed',
    STORED = 'stored',
    DISCARDED = 'discarded',
    CONTAMINATED = 'contaminated'
}

export interface ChainOfCustodyEntry {
    timestamp: Date;
    location: string;
    custodian: string;
    actionPerformed: ESampleAction;
    signature: string;
    notes?: string;
}

export enum ESampleAction {
    TRANSFER = 'Transfer',
    ALIQUOTING = 'Aliquoting',
    STORAGE = 'Storage',
    DISPOSAL = 'Disposal',
    PROCESSING = 'Processing',
    SAMPLING = 'Sampling'
}

export interface SamplePreparation {
    preparationId: string;
    sampleId: string;
    protocolId: string;
    technicianId: string;
    equipmentUsed: string[];
    reagents: ReagentUsage[];
    deviations: ProtocolDeviation[];
    startTime: Date;
    endTime: Date;
    preparationStatus: EPreparationStatus;
    qcChecks: QualityControlMetric[];
}

export interface QualityControlMetric {
    metricId: string;
    metricName: string;
    acceptableLimits: {
        lowerLimit: number;
        upperLimit: number;
    };
    measuredValue: number;
    status: EQCStatus;
    timestamp: Date;
    performedBy: string;
    comments?: string;
}

export enum EQCStatus {
    PASS = 'pass',
    FAIL = 'fail',
    WARNING = 'warning'
}

export interface ReagentUsage {
    lotNumber: string;
    expiration: Date;
    quantityUsed: number;
    unit: string;
    reagentName: string;
    manufacturer: string;
    storageConditions?: string;
}

export interface ProtocolDeviation {
    deviationCode: string;
    description: string;
    impactAssessment: string;
    correctiveAction: string;
    reportedBy: string;
    reportedDate: Date;
    severity: EDeviationSeverity;
}

export enum EDeviationSeverity {
    MINOR = 'minor',
    MAJOR = 'major',
    CRITICAL = 'critical'
}

export enum EPreparationStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    HOLD = 'hold',
    FAILED = 'failed'
}

export interface TaskAllocation {
    taskId: string;
    testOrderId: string;
    assignedTo: string[];
    requiredSkills: EAnalystSkill[];
    equipmentRequirements: string[];
    deadline: Date;
    taskStatus: ETaskStatus;
    priorityScore: number;
    dependencies: string[];
    estimatedDuration: number; // in minutes
    actualStartTime?: Date;
    actualEndTime?: Date;
    notes?: string;
}

export enum EAnalystSkill {
    PCR_ANALYSIS = 'PCR Analysis',
    MASS_SPEC_OPERATION = 'Mass Spectrometry Operation',
    FLOW_CYTOMETRY = 'Flow Cytometry',
    MICROSCOPY = 'Microscopy',
    RADIOGRAPHY = 'Radiography',
    ELISA = 'ELISA',
    CLINICAL_CHEMISTRY_ANALYSIS = 'Clinical Chemistry Analysis',
    MICROBIOLOGY_CULTURE = 'Microbiology Culture',
    HISTOLOGY_PROCESSING = 'Histology Processing'
}

export enum ETaskStatus {
    UNASSIGNED = 'unassigned',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    VERIFIED = 'verified',
    CANCELED = 'canceled',
    BLOCKED = 'blocked'
}

export interface SampleTesting {
    testId: string;
    sampleId: string;
    instrumentId: string;
    testParameters: TestParameter[];
    rawDataFiles: string[];
    results: AnalyticalResult[];
    technicianNotes: string;
    calibrationRecords: CalibrationEntry[];
    environmentalConditions: EnvironmentalData;
    startTime: Date;
    endTime: Date;
    testStatus: ETestStatus;
}

export enum ETestStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    INCONCLUSIVE = 'inconclusive'
}







export interface TestParameter {
    parameterName: string;
    methodReference: string;
    detectionLimit: number;
    quantitationLimit: number;
    units: string;
    referenceRange?: {
        lowerLimit: number;
        upperLimit: number;
        ageGroup?: string;
        gender?: string;
    };
    precision?: number;
    accuracy?: number;
}

export interface AnalyticalResult {
    analyte: string;
    measuredValue: number;
    uncertainty: number;
    qualifiers: string[];
    flags: EResultFlag[];
    referenceRangeStatus?: EReferenceStatus;
    interpretationNotes?: string;
}

export enum EReferenceStatus {
    WITHIN_RANGE = 'within_range',
    BELOW_RANGE = 'below_range',
    ABOVE_RANGE = 'above_range',
    NOT_APPLICABLE = 'not_applicable'
}

export enum EResultFlag {
    NORMAL = 'normal',
    ABNORMAL = 'abnormal',
    CRITICAL = 'critical',
    INVALID = 'invalid',
    PRELIMINARY = 'preliminary',
    REVISED = 'revised'
}

export interface ResultValidation {
    validationId: string;
    testId: string;
    validatorId: string;
    validationType: EValidationType;
    validationCriteria: string;
    referenceMaterialsUsed: string[];
    statisticalMethods: EStatisticalMethod[];
    approvalStatus: EValidationStatus;
    comments: string;
    signature: string;
    validationDate: Date;
    recommendedActions?: string[];
}

export enum EValidationType {
    PEER_REVIEW = 'Peer Review',
    STATISTICAL = 'Statistical',
    REPLICATE_ANALYSIS = 'Replicate Analysis',
    CROSS_VALIDATION = 'Cross Validation',
    SUPERVISORY_REVIEW = 'Supervisory Review'
}

export enum EValidationStatus {
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CONDITIONAL_APPROVAL = 'conditional_approval',
    PENDING = 'pending'
}

export enum EStatisticalMethod {
    WESTGARD_RULES = 'Westgard Rules',
    GRUBBS_TEST = 'Grubbs Test',
    YOUDEN_PLOT = 'Youden Plot',
    LEVY_JENNINGS = 'Levy-Jennings',
    CUSUM = 'CUSUM',
    T_TEST = 'T-Test'
}

export interface CertificateOfAnalysis {
    coaId: string;
    testIds: string[];
    issuedBy: string;
    issueDate: Date;
    validationSignatures: string[];
    reportSections: CoASection[];
    complianceStatements: string[];
    revisionHistory: CoARevision[];
    patientId: string;
    physicianId: string;
    labId: string;
    expirationDate?: Date;
    reportStatus: EReportStatus;
    deliveryMethod: EReportDelivery[];
    deliveryStatus: EDeliveryStatus;
    accessCode?: string;
}

export enum EReportStatus {
    DRAFT = 'draft',
    PRELIMINARY = 'preliminary',
    FINAL = 'final',
    AMENDED = 'amended',
    CANCELED = 'canceled'
}

export enum EReportDelivery {
    EMAIL = 'email',
    PORTAL = 'portal',
    FAX = 'fax',
    COURIER = 'courier',
    API = 'api'
}

export enum EDeliveryStatus {
    PENDING = 'pending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    FAILED = 'failed',
    VIEWED = 'viewed'
}

export interface CoASection {
    sectionType: ECoASection;
    content: string;
    dataReferences: string[];
    visualizations?: string[];
    sortOrder: number;
}

export enum ECoASection {
    ANALYTICAL_SUMMARY = 'Analytical Summary',
    METHODS = 'Methods',
    RESULTS = 'Results',
    INTERPRETATION = 'Interpretation',
    RECOMMENDATIONS = 'Recommendations',
    REFERENCES = 'References',
    QUALITY_CONTROL = 'Quality Control',
    APPENDIX = 'Appendix'
}

export interface CoARevision {
    revisionDate: Date;
    reviser: string;
    changes: string;
    approval: string;
    revisionNumber: number;
    reason: string;
}

export interface Billing {
    invoiceId: string;
    patientId: string;
    testOrderIds: string[];
    payerType: EPayerType;
    lineItems: BillingLineItem[];
    paymentStatus: EPaymentStatus;
    accountingSystemId?: string;
    taxRecords: TaxComponent[];
    insuranceDetails?: InsuranceInformation;
    billingAddress: Address;
    invoiceDate: Date;
    dueDate: Date;
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    grandTotal: number;
    payments: PaymentRecord[];
}

export interface InsuranceInformation {
    insuranceProvider: string;
    policyNumber: string;
    groupNumber?: string;
    subscriberId: string;
    subscriberRelationship: ESubscriberRelationship;
    preAuthorizationNumber?: string;
    coveragePercentage: number;
    deductible: number;
    deductibleMet: number;
    claimSubmissionDate?: Date;
    claimStatus?: EClaimStatus;
    claimNumber?: string;
}

export enum ESubscriberRelationship {
    SELF = 'self',
    SPOUSE = 'spouse',
    CHILD = 'child',
    OTHER = 'other'
}

export enum EClaimStatus {
    PENDING = 'pending',
    SUBMITTED = 'submitted',
    PROCESSING = 'processing',
    APPROVED = 'approved',
    DENIED = 'denied',
    APPEALED = 'appealed'
}

export interface Address {
    streetLine1: string;
    streetLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface PaymentRecord {
    paymentId: string;
    amount: number;
    method: EPaymentMethod;
    transactionId?: string;
    timestamp: Date;
    status: ETransactionStatus;
    processedBy: string;
    notes?: string;
}

export enum EPaymentMethod {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    CHECK = 'check',
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    INSURANCE = 'insurance',
    MOBILE_PAYMENT = 'mobile_payment'
}

export enum ETransactionStatus {
    PENDING = 'pending',
    AUTHORIZED = 'authorized',
    COMPLETED = 'completed',
    DECLINED = 'declined',
    REFUNDED = 'refunded',
    VOIDED = 'voided'
}

export interface BillingLineItem {
    testType: TestType;
    cptCode: string;
    costCenter: string;
    unitPrice: number;
    quantity: number;
    discount: number;
    itemDescription: string;
    taxable: boolean;
    taxRate: number;
    lineTotal: number;
}

export interface TaxComponent {
    taxType: ETaxType;
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
    jurisdiction: string;
    taxId?: string;
}

export enum ETaxType {
    VAT = 'vat',
    SALES_TAX = 'sales_tax',
    GST = 'gst',
    SERVICE_TAX = 'service_tax'
}

export enum EPayerType {
    SELF_PAY = 'Self Pay',
    INSURANCE = 'Insurance',
    INSTITUTIONAL = 'Institutional',
    GOVERNMENT = 'Government',
    CHARITY = 'Charity'
}

export enum EPaymentStatus {
    PENDING = 'pending',
    PARTIAL = 'partial',
    PAID = 'paid',
    DISPUTED = 'disputed',
    OVERDUE = 'overdue',
    WRITTEN_OFF = 'written_off'
}

export interface LIMSCanonicalModel {
    header: IntegrationHeader;
    payload: IntegrationPayload;
    attachments: BinaryAttachment[];
}

export interface IntegrationHeader {
    messageId: string;
    timestamp: Date;
    sourceSystem: string;
    destinationSystems: string[];
    messageType: EMessageType;
    priority: EPriorityLevel;
    version: string;
    correlationId?: string;
    securityContext?: SecurityContext;
}

export interface SecurityContext {
    authToken?: string;
    encryptionType?: string;
    certificateId?: string;
    permissions: string[];
}

export enum EMessageType {
    ORDER_CREATE = 'order_create',
    ORDER_UPDATE = 'order_update',
    RESULT_PUBLISH = 'result_publish',
    BILLING_EVENT = 'billing_event',
    SAMPLE_UPDATE = 'sample_update',
    INVENTORY_UPDATE = 'inventory_update',
    SYSTEM_ALERT = 'system_alert',
    AUDIT_EVENT = 'audit_event'
}

export interface IntegrationPayload {
    data: any;
    metadata: {
        schemaVersion: string;
        schemaUrl?: string;
        format: string;
        validationRules?: string[];
    };
    transformInstructions?: TransformationRule[];
}

export interface TransformationRule {
    sourceField: string;
    targetField: string;
    transformationType: ETransformationType;
    parameters?: Record<string, any>;
}

export enum ETransformationType {
    DIRECT = 'direct',
    FORMAT = 'format',
    CALCULATE = 'calculate',
    LOOKUP = 'lookup',
    MERGE = 'merge',
    SPLIT = 'split',
    CONDITIONAL = 'conditional'
}

export interface BinaryAttachment {
    attachmentId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    contentHash: string;
    content: string | Blob;
    encryptionInfo?: EncryptionInfo;
}

export interface EncryptionInfo {
    algorithm: string;
    keyId: string;
    initVector?: string;
}

export class DataTransformation {
    async transform(sourceData: any, transformRules: TransformationRule[]): Promise<any> {
        // Implementation of data transformation logic
        throw new Error("Method not implemented");
    }
    
    validate(data: any, schema: any): boolean {
        // Implementation of validation logic
        throw new Error("Method not implemented");
    }
}

export class XSLTTransformation extends DataTransformation {
    private xsltTemplates: Map<string, any>;
    
    constructor() {
        super();
        this.xsltTemplates = new Map();
    }
    
    async loadTemplate(templateId: string, templateContent: string): Promise<void> {
        // Implementation of XSLT template loading
        throw new Error("Method not implemented");
    }
    
    async transform(sourceData: any, transformRules: TransformationRule[]): Promise<any> {
        // Override with XSLT specific implementation
        throw new Error("Method not implemented");
    }
}

export interface IntegrationMessage {
    id: string;
    payload: LIMSCanonicalModel;
    status: EMessageStatus;
    retryCount: number;
    nextRetryTime?: Date;
}

export enum EMessageStatus {
    QUEUED = 'queued',
    PROCESSING = 'processing',
    MESSAGE_DELIVERED = 'delivered',
    FAILED = 'failed',
    CANCELED = 'canceled'
}

export class LIMSIntegrationBus {
    private messageQueue: IntegrationMessage[];
    private transformationEngine: DataTransformation;
    private endpoints: Map<string, IntegrationEndpoint>;
    
    constructor() {
        this.messageQueue = [];
        this.transformationEngine = new XSLTTransformation();
        this.endpoints = new Map();
    }
    
    async routeMessage(message: LIMSCanonicalModel): Promise<void> {
        // Implementation of ESB routing logic
        throw new Error("Method not implemented");
    }
    
    registerEndpoint(endpointId: string, endpoint: IntegrationEndpoint): void {
        this.endpoints.set(endpointId, endpoint);
    }
    
    async publishMessage(message: IntegrationMessage): Promise<void> {
        // Implementation of message publication logic
        throw new Error("Method not implemented");
    }
    
    async processQueue(): Promise<void> {
        // Implementation of queue processing logic
        throw new Error("Method not implemented");
    }
}

export interface IntegrationEndpoint {
    id: string;
    url: string;
    protocol: EProtocolType;
    authentication: AuthConfig;
    transformationRules: TransformationRule[];
    enabled: boolean;
    healthStatus: EEndpointStatus;
    lastConnected?: Date;
}

export enum EProtocolType {
    REST = 'rest',
    SOAP = 'soap',
    HL7 = 'hl7',
    FHIR = 'fhir',
    SFTP = 'sftp',
    JMS = 'jms'
}

export interface AuthConfig {
    type: EAuthType;
    credentials: Record<string, string>;
    tokenEndpoint?: string;
    scope?: string[];
}

export enum EAuthType {
    NONE = 'none',
    BASIC = 'basic',
    OAUTH2 = 'oauth2',
    API_KEY = 'api_key',
    JWT = 'jwt',
    CERTIFICATE = 'certificate'
}

export enum EEndpointStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    DEGRADED = 'degraded',
    UNKNOWN = 'unknown'
}

// Additional models for complete e-pathology system

export interface Patient {
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: EGender;
    contactInformation: ContactInfo;
    emergencyContact?: ContactInfo;
    medicalRecordNumber: string;
    insuranceInformation: InsuranceInformation[];
    medicalHistory?: MedicalHistory;
}

export enum EGender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    NOT_SPECIFIED = 'not_specified'
}

export interface ContactInfo {
    email: string;
    phone: string;
    alternatePhone?: string;
    address: Address;
    preferredContactMethod: EContactMethod;
}

export enum EContactMethod {
    EMAIL = 'email',
    PHONE = 'phone',
    SMS = 'sms',
    MAIL = 'mail'
}

export interface MedicalHistory {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: Medication[];
    previousProcedures: Procedure[];
    familyHistory: string[];
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
    prescribedBy: string;
}

export interface Procedure {
    name: string;
    date: Date;
    performedBy: string;
    notes: string;
}

export interface HealthcareProvider {
    providerId: string;
    firstName: string;
    lastName: string;
    title: string;
    specialization: string[];
    licenseNumber: string;
    contactInformation: ContactInfo;
    affiliatedInstitutions: string[];
    availability?: Availability[];
}

export interface Availability {
    dayOfWeek: EDayOfWeek;
    startTime: string;
    endTime: string;
    locationId: string;
    maxAppointments?: number;
}

export enum EDayOfWeek {
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
    SUNDAY = 'sunday'
}

export interface HealthcareInstitution {
    institutionId: string;
    name: string;
    type: EInstitutionType;
    address: Address;
    contactInformation: ContactInfo;
    departments: Department[];
    accreditations: string[];
}

export enum EInstitutionType {
    HOSPITAL = 'hospital',
    CLINIC = 'clinic',
    LABORATORY = 'laboratory',
    PHARMACY = 'pharmacy',
    IMAGING_CENTER = 'imaging_center'
}

export interface Department {
    departmentId: string;
    name: string;
    head: string;
    location: string;
    services: string[];
}

export interface Appointment {
    appointmentId: string;
    patientId: string;
    providerId?: string;
    institutionId: string;
    departmentId?: string;
    scheduledDateTime: Date;
    duration: number; // in minutes
    purpose: string;
    status: EAppointmentStatus;
    notes?: string;
    testOrderIds?: string[];
    checkInTime?: Date;
    checkOutTime?: Date;
    cancellationReason?: string;
}

export enum EAppointmentStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    CHECKED_IN = 'checked_in',
    COMPLETED = 'completed',
    CANCELED = 'canceled',
    NO_SHOW = 'no_show',
    RESCHEDULED = 'rescheduled'
}

export interface Inventory {
    itemId: string;
    name: string;
    category: EInventoryCategory;
    manufacturer: string;
    supplierInfo: SupplierInfo;
    currentStock: number;
    unitOfMeasure: string;
    reorderThreshold: number;
    optimalStock: number;
    expirationDate?: Date;
    storageRequirements?: string;
    lotNumber?: string;
    cost: number;
    location: string;
    status: EInventoryStatus;
}

export interface SupplierInfo {
    supplierId: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    website?: string;
    leadTime: number; // in days
    contractNumber?: string;
}

export enum EInventoryCategory {
    REAGENT = 'reagent',
    CONSUMABLE = 'consumable',
    EQUIPMENT = 'equipment',
    CONTROL_MATERIAL = 'control_material',
    PPE = 'ppe',
    LABORATORY_SUPPLY = 'laboratory_supply'
}

export enum EInventoryStatus {
    AVAILABLE = 'available',
    LOW_STOCK = 'low_stock',
    OUT_OF_STOCK = 'out_of_stock',
    EXPIRED = 'expired',
    QUARANTINED = 'quarantined',
    ON_ORDER = 'on_order'
}

export interface Equipment {
    equipmentId: string;
    name: string;
    manufacturer: string;
    modelNumber: string;
    serialNumber: string;
    acquisitionDate: Date;
    installationDate: Date;
    warrantyExpirationDate?: Date;
    serviceContract?: string;
    calibrationSchedule: CalibrationSchedule;
    operatingProcedures: string[];
    location: string;
    status: EEquipmentStatus;
    maintenanceRecords: MaintenanceRecord[];
}

export enum EEquipmentStatus {
    OPERATIONAL = 'operational',
    MAINTENANCE = 'maintenance',
    CALIBRATION = 'calibration',
    REPAIR = 'repair',
    OUT_OF_SERVICE = 'out_of_service',
    DECOMMISSIONED = 'decommissioned'
}

export interface CalibrationSchedule {
    frequency: ECalibrationFrequency;
    lastCalibrationDate: Date;
    nextCalibrationDate: Date;
    responsiblePersonnel: string[];
}

export enum ECalibrationFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    SEMI_ANNUALLY = 'semi_annually',
    ANNUALLY = 'annually'
}

export interface MaintenanceRecord {
    recordId: string;
    equipmentId: string;
    maintenanceType: EMaintenanceType;
    performedBy: string;
    performedDate: Date;
    description: string;
    findings: string;
    actions: string;
    parts: PartReplacement[];
    downtime: number; // in minutes
    nextScheduledMaintenance?: Date;
}

export interface PartReplacement {
    partName: string;
    partNumber: string;
    quantity: number;
    cost: number;
}

export enum EMaintenanceType {
    PREVENTIVE = 'preventive',
    CORRECTIVE = 'corrective',
    CALIBRATION = 'calibration',
    SOFTWARE_UPDATE = 'software_update',
    INSPECTION = 'inspection'
}

export interface TestProtocol {
    protocolId: string;
    name: string;
    version: string;
    testTypes: TestType[];
    description: string;
    steps: ProtocolStep[];
    requiredEquipment: string[];
    requiredConsumables: ProtocolConsumable[];
    qualityControls: QualityControl[];
    validationStatus: EValidationStatus;
    references: string[];
    attachments: string[];
}

export interface ProtocolStep {
    stepNumber: number;
    description: string;
    expectedDuration: number; // in minutes
    criticalStep: boolean;
    warningPoints: string[];
    images?: string[];
}

export interface ProtocolConsumable {
    name: string;
    quantity: number;
    unit: string;
    specifications: string;
}

export interface QualityControl {
    controlType: string;
    acceptanceCriteria: string;
    frequency: string;
    responsibleRole: string;
}

export interface AuditTrail {
    auditId: string;
    timestamp: Date;
    userId: string;
    action: EAuditAction;
    entityType: string;
    entityId: string;
    previousState?: string;
    newState?: string;
    ipAddress: string;
    applicationModule: string;
    success: boolean;
    failureReason?: string;
}

export enum EAuditAction {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
    EXPORT = 'export',
    IMPORT = 'import',
    APPROVE = 'approve',
    REJECT = 'reject',
    PRINT = 'print',
    SIGN = 'sign'
}

export interface User {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: EUserRole[];
    department: string;
    status: EUserStatus;
    lastLogin?: Date;
    preferredLanguage: string;
    mfaEnabled: boolean;
    contactInfo: ContactInfo;
}

export enum EUserRole {
    ADMINISTRATOR = 'administrator',
    LAB_TECHNICIAN = 'lab_technician',
    PATHOLOGIST = 'pathologist',
    PHYSICIAN = 'physician',
    PHLEBOTOMIST = 'phlebotomist',
    RECEPTIONIST = 'receptionist',
    BILLING_STAFF = 'billing_staff',
    QUALITY_CONTROL = 'quality_control',
    PATIENT = 'patient',
    IT_SUPPORT = 'it_support',
    MANAGER = 'manager'
}

export enum EUserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
    LOCKED = 'locked'
}

export interface Notification {
    notificationId: string;
    userId: string;
    title: string;
    message: string;
    type: ENotificationType;
    priority: ENotificationPriority;
    createdAt: Date;
    expiresAt?: Date;
    read: boolean;
    readAt?: Date;
    actionRequired: boolean;
    actionUrl?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
}

export enum ENotificationType {
    SYSTEM = 'system',
    RESULT_AVAILABLE = 'result_available',
    APPOINTMENT_REMINDER = 'appointment_reminder',
    CRITICAL_RESULT = 'critical_result',
    TASK_ASSIGNMENT = 'task_assignment',
    INVENTORY_ALERT = 'inventory_alert',
    MAINTENANCE_DUE = 'maintenance_due',
    BILLING_NOTIFICATION = 'billing_notification',
    SECURITY_ALERT = 'security_alert'
}

export enum ENotificationPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export interface Report {
    reportId: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: Date;
    reportType: EReportType;
    parameters: ReportParameter[];
    dataSource: string;
    format: EReportFormat;
    schedule?: ReportSchedule;
    recipients?: string[];
    lastRun?: Date;
    lastRunStatus?: EReportRunStatus;
    result?: string;
}

export interface ReportParameter {
    name: string;
    type: EParameterType;
    required: boolean;
    defaultValue?: any;
    options?: any[];
}

export enum EParameterType {
    STRING = 'string',
    NUMBER = 'number',
    DATE = 'date',
    BOOLEAN = 'boolean',
    ENUM = 'enum',
    ARRAY = 'array'
}

export enum EReportType {
    OPERATIONAL = 'operational',
    FINANCIAL = 'financial',
    QUALITY = 'quality',
    REGULATORY = 'regulatory',
    ANALYTICAL = 'analytical',
    ADMINISTRATIVE = 'administrative'
}

export enum EReportFormat {
    PDF = 'pdf',
    EXCEL = 'excel',
    CSV = 'csv',
    HTML = 'html',
    JSON = 'json',
    XML = 'xml'
}

export interface ReportSchedule {
    frequency: EScheduleFrequency;
    startDate: Date;
    endDate?: Date;
    time: string;
    dayOfWeek?: EDayOfWeek;
    dayOfMonth?: number;
    timezone: string;
}

export enum EScheduleFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUAL = 'annual',
    ONE_TIME = 'one_time'
}

export enum EReportRunStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
    IN_PROGRESS = 'in_progress',
    SCHEDULED = 'scheduled',
    CANCELED = 'canceled'
}

export interface WorkflowDefinition {
    workflowId: string;
    name: string;
    description: string;
    version: string;
    stages: WorkflowStage[];
    triggers: WorkflowTrigger[];
    transitions: WorkflowTransition[];
    sla?: SLA;
    active: boolean;
}

export interface WorkflowStage {
    stageId: string;
    name: string;
    description: string;
    estimatedDuration: number; // in minutes
    requiredRoles: EUserRole[];
    tasks: WorkflowTask[];
    parallelExecution: boolean;
}

export interface WorkflowTask {
    taskId: string;
    name: string;
    description: string;
    taskType: ETaskType;
    assignmentRule: string;
    priority: EPriorityLevel;
    estimatedDuration: number; // in minutes
    formDefinition?: any;
}

export enum ETaskType {
    MANUAL = 'manual',
    AUTOMATED = 'automated',
    APPROVAL = 'approval',
    NOTIFICATION = 'notification',
    INTEGRATION = 'integration',
    DECISION = 'decision'
}

export interface WorkflowTrigger {
    triggerId: string;
    triggerType: ETriggerType;
    condition: string;
    priority: number;
}

export enum ETriggerType {
    EVENT = 'event',
    SCHEDULE = 'schedule',
    API = 'api',
    MANUAL = 'manual',
    RULE = 'rule'
}

export interface WorkflowTransition {
    transitionId: string;
    fromStageId: string;
    toStageId: string;
    condition?: string;
    automaticTransition: boolean;
    requiredApprovals?: number;
}

export interface SLA {
    totalDuration: number; // in minutes
    stageDurations: { [stageId: string]: number };
    escalationRules: EscalationRule[];
}

export interface EscalationRule {
    ruleId: string;
    condition: string;
    actions: EscalationAction[];
    escalationLevel: number;
}

export interface EscalationAction {
    actionType: EEscalationActionType;
    parameters: Record<string, any>;
}

export enum EEscalationActionType {
    NOTIFY = 'notify',
    REASSIGN = 'reassign',
    ESCALATE = 'escalate',
    ABORT = 'abort',
    OVERRIDE = 'override'
}

export interface WorkflowInstance {
    instanceId: string;
    workflowId: string;
    currentStageId: string;
    status: EWorkflowStatus;
    initiatedBy: string;
    initiatedAt: Date;
    completedAt?: Date;
    relatedEntityType: string;
    relatedEntityId: string;
    context: Record<string, any>;
    history: WorkflowHistoryEntry[];
    activeTaskIds: string[];
}

export enum EWorkflowStatus {
    INITIATED = 'initiated',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    TERMINATED = 'terminated',
    SUSPENDED = 'suspended',
    FAILED = 'failed'
}

export interface WorkflowHistoryEntry {
    entryId: string;
    timestamp: Date;
    userId: string;
    action: EWorkflowAction;
    stageId?: string;
    taskId?: string;
    notes?: string;
    previousStatus?: EWorkflowStatus;
    newStatus?: EWorkflowStatus;
    metadata?: Record<string, any>;
}

export enum EWorkflowAction {
    INITIATE = 'initiate',
    COMPLETE_TASK = 'complete_task',
    TRANSITION = 'transition',
    SUSPEND = 'suspend',
    RESUME = 'resume',
    TERMINATE = 'terminate',
    REASSIGN = 'reassign',
    COMMENT = 'comment',
    OVERRIDE = 'override'
}

export interface TestResult {
    resultId: string;
    testOrderId: string;
    patientId: string;
    physicianId: string;
    testType: TestType;
    performedBy: string;
    reviewedBy?: string;
    testDate: Date;
    reportDate: Date;
    status: EResultStatus;
    resultSummary: string;
    detailedResults: AnalyticalResult[];
    interpretations: ResultInterpretation[];
    referenceRanges: ReferenceRange[];
    attachments: string[];
    flags: EResultFlag[];
    visualizations?: ResultVisualization[];
}

export interface ResultInterpretation {
    interpretationId: string;
    authorId: string;
    timestamp: Date;
    interpretation: string;
    confidence: number;
    references?: string[];
}

export interface ReferenceRange {
    analyte: string;
    lowerLimit?: number;
    upperLimit?: number;
    units: string;
    ageGroup?: string;
    gender?: string;
    ethnicity?: string;
    source: string;
}

export interface ResultVisualization {
    visualizationType: EVisualizationType;
    title: string;
    description?: string;
    data: any;
    configOptions: Record<string, any>;
}

export enum EVisualizationType {
    LINE_CHART = 'line_chart',
    BAR_CHART = 'bar_chart',
    PIE_CHART = 'pie_chart',
    HEATMAP = 'heatmap',
    SCATTER_PLOT = 'scatter_plot',
    TABLE = 'table',
    IMAGE = 'image'
}

export enum EResultStatus {
    PRELIMINARY = 'preliminary',
    FINAL = 'final',
    AMENDED = 'amended',
    CORRECTED = 'corrected',
    CANCELED = 'canceled',
    REJECTED = 'rejected'
}

export interface TestCatalog {
    testId: string;
    testName: string;
    testCode: string;
    testType: TestType;
    description: string;
    sampleRequirements: SampleRequirement[];
    processingTime: {
        standard: number; // in hours
        expedited?: number; // in hours
    };
    price: number;
    active: boolean;
    protocols: string[];
    requiredEquipment: string[];
    requiredSkills: EAnalystSkill[];
    cptCodes: string[];
    reportTemplate: string;
}

export interface SampleRequirement {
    sampleType: ESampleType;
    minimumVolume: number;
    unit: string;
    containerType: string;
    storageConditions: string;
    stabilityPeriod: number; // in hours
    specialHandling?: string;
}

export enum ESampleType {
    BLOOD = 'blood',
    SERUM = 'serum',
    PLASMA = 'plasma',
    URINE = 'urine',
    CSF = 'csf',
    TISSUE = 'tissue',
    SWAB = 'swab',
    STOOL = 'stool',
    SALIVA = 'saliva',
    BONE_MARROW = 'bone_marrow'
}

export interface Portal {
    portalId: string;
    portalType: EPortalType;
    features: EPortalFeature[];
    theme: PortalTheme;
    customization: PortalCustomization;
    settings: PortalSettings;
}

export enum EPortalType {
    PATIENT = 'patient',
    PROVIDER = 'provider',
    INSTITUTION = 'institution',
    PARTNER = 'partner'
}

export enum EPortalFeature {
    TEST_ORDERS = 'test_orders',
    RESULTS_VIEWING = 'results_viewing',
    APPOINTMENT_SCHEDULING = 'appointment_scheduling',
    BILLING = 'billing',
    DOCUMENT_MANAGEMENT = 'document_management',
    MESSAGING = 'messaging',
    REPORTS = 'reports',
    USER_MANAGEMENT = 'user_management',
    INVENTORY_MANAGEMENT = 'inventory_management',
    ANALYTICS = 'analytics'
}

export interface PortalTheme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo: string;
    fontFamily: string;
    darkMode: boolean;
}

export interface PortalCustomization {
    welcomeMessage: string;
    termsAndConditions: string;
    privacyPolicy: string;
    contactInformation: ContactInfo;
    faq: FAQ[];
    customPages: CustomPage[];
}

export interface FAQ {
    question: string;
    answer: string;
    category: string;
    order: number;
}

export interface CustomPage {
    title: string;
    content: string;
    slug: string;
    published: boolean;
}

export interface PortalSettings {
    sessionTimeout: number; // in minutes
    mfaRequired: boolean;
    passwordPolicy: PasswordPolicy;
    notificationSettings: NotificationSetting[];
    dataRetentionPolicy: string;
    apiAccess: boolean;
    downloadLimits: DownloadLimit[];
}

export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    preventPasswordReuse: number;
}

export interface NotificationSetting {
    eventType: EPortalNotificationType;
    email: boolean;
    sms: boolean;
    inApp: boolean;
    push: boolean;
}

export enum EPortalNotificationType {
    NEW_RESULT = 'new_result',
    APPOINTMENT_REMINDER = 'appointment_reminder',
    CRITICAL_RESULT = 'critical_result',
    BILLING_REMINDER = 'billing_reminder',
    SYSTEM_MAINTENANCE = 'system_maintenance',
    DOCUMENT_UPLOADED = 'document_uploaded',
    MESSAGE_RECEIVED = 'message_received'
}

export interface DownloadLimit {
    resourceType: string;
    maxDownloadsPerDay: number;
    maxSize: number;
}

export interface QualityManagement {
    qmsId: string;
    policies: QualityPolicy[];
    procedures: QualityProcedure[];
    audits: QualityAudit[];
    nonConformances: NonConformance[];
    correctiveActions: CorrectiveAction[];
    metrics: QualityMetric[];
}

export interface QualityPolicy {
    policyId: string;
    title: string;
    description: string;
    version: string;
    effectiveDate: Date;
    reviewDate: Date;
    approvedBy: string;
    documentUrl: string;
    relatedStandards: string[];
}

export interface QualityProcedure {
    procedureId: string;
    title: string;
    description: string;
    version: string;
    effectiveDate: Date;
    reviewDate: Date;
    approvedBy: string;
    documentUrl: string;
    relatedPolicies: string[];
    steps: ProcedureStep[];
}

export interface ProcedureStep {
    stepNumber: number;
    title: string;
    description: string;
    responsible: string;
    expectedOutcome: string;
    records: string[];
}

export interface QualityAudit {
    auditId: string;
    auditType: EAuditType;
    scope: string;
    auditDate: Date;
    auditTeam: string[];
    findings: AuditFinding[];
    conclusion: string;
    status: EAuditStatus;
    nextAuditDate?: Date;
}

export enum EAuditType {
    INTERNAL = 'internal',
    EXTERNAL = 'external',
    REGULATORY = 'regulatory',
    SUPPLIER = 'supplier',
    PROCESS = 'process'
}

export interface AuditFinding {
    findingId: string;
    description: string;
    severity: EFindingSeverity;
    evidence: string;
    requirement: string;
    responsibleParty: string;
    responseRequired: boolean;
    dueDate?: Date;
}

export enum EFindingSeverity {
    CRITICAL = 'critical',
    MAJOR = 'major',
    MINOR = 'minor',
    OBSERVATION = 'observation'
}

export enum EAuditStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FOLLOW_UP = 'follow_up',
    CLOSED = 'closed'
}

export interface NonConformance {
    ncId: string;
    description: string;
    detectedBy: string;
    detectedDate: Date;
    category: ENCCategory;
    severity: EFindingSeverity;
    impactAssessment: string;
    immediateActions: string;
    status: ENCStatus;
    closureDate?: Date;
    relatedProcesses: string[];
}

export enum ENCCategory {
    EQUIPMENT = 'equipment',
    PROCESS = 'process',
    SAMPLE = 'sample',
    REAGENT = 'reagent',
    PERSONNEL = 'personnel',
    DOCUMENTATION = 'documentation',
    FACILITY = 'facility'
}

export enum ENCStatus {
    OPEN = 'open',
    INVESTIGATION = 'investigation',
    CORRECTIVE_ACTION = 'corrective_action',
    VERIFICATION = 'verification',
    CLOSED = 'closed'
}

export interface CorrectiveAction {
    caId: string;
    relatedNcId?: string;
    description: string;
    rootCauseAnalysis: string;
    actions: string;
    responsibleParty: string;
    dueDate: Date;
    status: ECAStatus;
    completionDate?: Date;
    effectiveness: string;
    verifiedBy?: string;
    preventiveActions: string;
}

export enum ECAStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    VERIFIED = 'verified',
    INEFFECTIVE = 'ineffective'
}

export interface QualityMetric {
    metricId: string;
    name: string;
    description: string;
    category: EMetricCategory;
    calculation: string;
    unit: string;
    target: number;
    lowerThreshold?: number;
    upperThreshold?: number;
    frequency: EMetricFrequency;
    dataSource: string;
    responsible: string;
    measurements: QualityMeasurement[];
}

export enum EMetricCategory {
    TAT = 'turnaround_time',
    ACCURACY = 'accuracy',
    COMPLIANCE = 'compliance',
    CUSTOMER_SATISFACTION = 'customer_satisfaction',
    PRODUCTIVITY = 'productivity',
    UTILIZATION = 'utilization',
    SAFETY = 'safety'
}

export enum EMetricFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUALLY = 'annually'
}

export interface QualityMeasurement {
    measurementId: string;
    metricId: string;
    timestamp: Date;
    value: number;
    status: EMetricStatus;
    comments?: string;
    recordedBy: string;
}

export enum EMetricStatus {
    MEET_TARGET = 'meet_target',
    ABOVE_TARGET = 'above_target',
    BELOW_TARGET = 'below_target',
    WARNING = 'warning',
    CRITICAL = 'critical'
}

export interface Dashboard {
    dashboardId: string;
    name: string;
    description: string;
    owner: string;
    createdAt: Date;
    updatedAt: Date;
    shared: boolean;
    sharedWith: string[];
    widgets: DashboardWidget[];
    layout: WidgetLayout[];
}

export interface DashboardWidget {
    widgetId: string;
    title: string;
    type: EWidgetType;
    dataSource: string;
    refreshInterval?: number; // in seconds
    parameters: Record<string, any>;
    visualization: EVisualizationType;
    filters: WidgetFilter[];
}

export enum EWidgetType {
    CHART = 'chart',
    TABLE = 'table',
    METRIC = 'metric',
    LIST = 'list',
    MAP = 'map',
    TEXT = 'text',
    IFRAME = 'iframe'
}

export interface WidgetFilter {
    field: string;
    operator: EFilterOperator;
    value: any;
}

export enum EFilterOperator {
    EQUALS = 'equals',
    NOT_EQUALS = 'not_equals',
    GREATER_THAN = 'greater_than',
    LESS_THAN = 'less_than',
    CONTAINS = 'contains',
    BETWEEN = 'between',
    IN = 'in'
}

export interface WidgetLayout {
    widgetId: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface AnalyticsDimension {
    dimensionId: string;
    name: string;
    description: string;
    dataType: EDataType;
    source: string;
    category: string;
    mappings?: Record<string, string>;
}

export enum EDataType {
    STRING = 'string',
    NUMBER = 'number',
    DATE = 'date',
    BOOLEAN = 'boolean',
    ENUM = 'enum'
}

export interface AnalyticsMetric {
    metricId: string;
    name: string;
    description: string;
    formula: string;
    unit: string;
    aggregation: EAggregationType;
    precision: number;
    formatString?: string;
}

export enum EAggregationType {
    SUM = 'sum',
    AVERAGE = 'average',
    MIN = 'min',
    MAX = 'max',
    COUNT = 'count',
    COUNT_DISTINCT = 'count_distinct',
    MEDIAN = 'median',
    PERCENTILE = 'percentile'
}

export interface Document {
    documentId: string;
    title: string;
    description?: string;
    documentType: EDocumentType;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    status: EDocumentStatus;
    version: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    tags: string[];
    metadata: Record<string, any>;
    relatedEntityType?: string;
    relatedEntityId?: string;
    accessControl: DocumentAccess[];
}

export enum EDocumentType {
    REPORT = 'report',
    CONSENT = 'consent',
    REQUISITION = 'requisition',
    PROCEDURE = 'procedure',
    POLICY = 'policy',
    RESULT = 'result',
    INVOICE = 'invoice',
    CERTIFICATE = 'certificate',
    CORRESPONDENCE = 'correspondence'
}

export enum EDocumentStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
    PENDING_APPROVAL = 'pending_approval',
    REJECTED = 'rejected',
    SUPERSEDED = 'superseded'
}

export interface DocumentAccess {
    userId?: string;
    roleId?: string;
    accessLevel: EAccessLevel;
    expiration?: Date;
}

export enum EAccessLevel {
    VIEW = 'view',
    EDIT = 'edit',
    APPROVE = 'approve',
    DELETE = 'delete',
    FULL = 'full',
    NONE = 'none'
}

export interface Message {
    messageId: string;
    senderId: string;
    recipientIds: string[];
    subject: string;
    content: string;
    timestamp: Date;
    priority: EMessagePriority;
    status: EMessageStatus;
    attachments: MessageAttachment[];
    parentMessageId?: string;
    category?: EMessageCategory;
    readBy: MessageReadStatus[];
    tags: string[];
}

export enum EMessagePriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent'
}

export enum EMessageStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    REPLIED = 'replied',
    FORWARDED = 'forwarded'
}

export interface MessageAttachment {
    attachmentId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
}

export interface MessageReadStatus {
    userId: string;
    readAt: Date;
}

export enum EMessageCategory {
    CLINICAL = 'clinical',
    ADMINISTRATIVE = 'administrative',
    BILLING = 'billing',
    SUPPORT = 'support',
    SYSTEM = 'system'
}

// Mobile App specific models
export interface MobileSettings {
    userId: string;
    notificationPreferences: MobileNotificationPreference[];
    displayPreferences: MobileDisplayPreference;
    securitySettings: MobileSecuritySettings;
    deviceRegistrations: MobileDevice[];
}

export interface MobileNotificationPreference {
    eventType: EPortalNotificationType;
    enabled: boolean;
    quietHours?: {
        start: string;
        end: string;
        timezone: string;
    };
}

export interface MobileDisplayPreference {
    theme: string;
    fontSize: string;
    dashboardLayout: string;
    language: string;
}

export interface MobileSecuritySettings {
    biometricEnabled: boolean;
    pinRequired: boolean;
    pinLength: number;
    autoLockTimeout: number; // in minutes
    secureDataStorage: boolean;
}

export interface MobileDevice {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    osVersion: string;
    appVersion: string;
    registeredAt: Date;
    lastActive: Date;
    pushToken?: string;
    status: EDeviceStatus;
}

export enum EDeviceStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    REVOKED = 'revoked',
    PENDING = 'pending'
}

// Analytics models
export interface AnalyticsEvent {
    eventId: string;
    eventType: string;
    userId?: string;
    sessionId: string;
    timestamp: Date;
    properties: Record<string, any>;
    deviceInfo: DeviceInfo;
    locationInfo?: LocationInfo;
}

export interface DeviceInfo {
    deviceType: string;
    browser?: string;
    browserVersion?: string;
    os: string;
    osVersion: string;
    screenResolution?: string;
}

export interface LocationInfo {
    country: string;
    region?: string;
    city?: string;
    timezone: string;
    ipAddress: string;
}

export interface AnalyticsSegment {
    segmentId: string;
    name: string;
    description: string;
    criteria: SegmentCriterion[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export interface SegmentCriterion {
    field: string;
    operator: EFilterOperator;
    value: any;
    logicalOperator?: 'AND' | 'OR';
}
*/