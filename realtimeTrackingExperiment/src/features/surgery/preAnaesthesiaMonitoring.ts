export interface preAnaesthesiaMonitoring{
    hospitalId: string;
    patientObj: patientObj;
    date_time: string;
    PAM : PAM;
}
export interface PAM{
    Drug: {
        name: string;
        dosage_timeAdmistered: {
            dosage: number;
            timeAdministered: string;
        }[];
        totalDosage: number;
    }[];
    
    };



export interface patientObj{
    patientName: string;
    age: string;
    patientId: string;
    ipdId: string;
    bedNo: string;
    roomNo:string;
}


export interface Drug {
    name: string;
    dosage: number;
    timeAdministered: string; // 0 - 15 min intervals
}

export interface VitalSign {
    timestamp: Date;
    value: number;
}

export interface AnesthesiaRecord {
    patientObj: patientObj;
    
    // Drugs administered (numbered 1-6 in the chart)
    drugs: Drug[];
    
    // Timestamps for procedure milestones
    startAnesthesia: Date;
    startSurgery: Date;
    endSurgery: Date;
    endAnesthesia: Date;
    
    // Vital signs tracked over time
    etTubeCma: VitalSign[];
    spo2: VitalSign[];
    temperature: VitalSign[];
    heartRate: VitalSign[];
    bloodPressure: VitalSign[];
    
    // Fluid management
    ivFluid: VitalSign[];
    bloodProducts: VitalSign[];
    urineOutput: VitalSign[];
    
    // Airway management
    postOpExtubated: boolean;
    intubatedAirway: boolean;
    
    // Ventilation status
    ventilation: {
      type: 'Spontaneous' | 'Assisted' | 'Mechanical';
      readings: VitalSign[];
    };
    
    // Recovery details
    recoveryFromRelaxant: boolean;
    postOpDestination: 'ICU' | 'Recovery' | 'Ward';
    
    // Medical staff details
    anesthesiologist: {
      name: string;
      signature: string;
    };
    
    // Additional monitoring
    o2Saturation: VitalSign[];
    etCo2: VitalSign[];
  }
  
  // MongoDB Schema
  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;
  
  const DrugSchema = new Schema({
    name: String,
    dosage: Number,
    timeAdministered: Date
  });
  
  const VitalSignSchema = new Schema({
    timestamp: Date,
    value: Number
  });
  
  const AnesthesiaRecordSchema = new Schema({
    patientId: {
      type: String,
      required: true,
      index: true
    },
    recordDate: {
      type: Date,
      required: true
    },
    drugs: [DrugSchema],
    
    startAnesthesia: Date,
    startSurgery: Date,
    endSurgery: Date,
    endAnesthesia: Date,
    
    etTubeCma: [VitalSignSchema],
    spo2: [VitalSignSchema],
    temperature: [VitalSignSchema],
    heartRate: [VitalSignSchema],
    bloodPressure: [VitalSignSchema],
    
    ivFluid: [VitalSignSchema],
    bloodProducts: [VitalSignSchema],
    urineOutput: [VitalSignSchema],
    
    postOpExtubated: Boolean,
    intubatedAirway: Boolean,
    
    ventilation: {
      type: {
        type: String,
        enum: ['Spontaneous', 'Assisted', 'Mechanical']
      },
      readings: [VitalSignSchema]
    },
    
    recoveryFromRelaxant: Boolean,
    postOpDestination: {
      type: String,
      enum: ['ICU', 'Recovery', 'Ward']
    },
    
    anesthesiologist: {
      name: String,
      signature: String
    },
    
    o2Saturation: [VitalSignSchema],
    etCo2: [VitalSignSchema]
  }, {
    timestamps: true
  });
  
  // Create indexes for common queries
  AnesthesiaRecordSchema.index({ recordDate: -1 });
  AnesthesiaRecordSchema.index({ 'anesthesiologist.name': 1 });
  
  // Export the model
  const AnesthesiaRecord = mongoose.model('AnesthesiaRecord', AnesthesiaRecordSchema);