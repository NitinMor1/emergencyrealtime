export enum notify{
  read = 'read',
  unread = 'unread'
}
export interface IPdf {
  hospitalId: string;
  title: string;
  filename: string;
  contentType: string;
  length: number;
  uploadDate: Date;
  metadata?: {
    [key: string]: any;
  };
}

export interface INotificationOfInvestigation{
  notificationId: string;
  hospitalId: string;
  patientUsername: string;
  patientName: string;
  date: string;
  time:string;
  doctorUsername: string;
  doctorName: string;
  invesigation: investigations[];
  notification: notify.unread;
}

export interface investigations{
  investigation: string[] | TestType[];
}

export enum TestType {
  CLINICAL_CHEMISTRY = 'Clinical Chemistry',
  MICROBIOLOGY = 'Microbiology',
  MOLECULAR_DIAGNOSTICS = 'Molecular Diagnostics',
  HISTOPATHOLOGY = 'Histopathology'
}