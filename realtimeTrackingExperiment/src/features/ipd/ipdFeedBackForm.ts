export interface IpdFeedBackForm {
    patientName: string;
    patientId: string;
    age: number;
    ipdId: string;
    hospitalId: string;
    roomNo: string;
    bedNo: string;
    DOA: string; // date of admission
    DOD: string; // date of discharge
    phoneNumber: string;
    questions: IpdFeedBackFormQuestions[];
    feedbackOnMultipleChoices: feedbackOnMultipleChoices[];
}
export interface IpdFeedBackFormQuestions {
    question: string;
    answer: string;
    rating: number;
}

export interface feedbackOnMultipleChoices {
    doctorBehaviour: number;
    nurseBehaviour: number;
    receptionistBehaviour: number;
    ward_room_service: number;
    cleanliness: number;
    pharmacy: number;
    lab_services: number;
    dietary_services: number;
    information_about_medication_by_Doctor_Nurse: number;
    action_taken_for_pain_reliving_during: number;
    treatment_provided_by_Doctor: number;
    discharge_information_by_Doctor_Nurse: number;
    environment_of_hospital: number;
}
