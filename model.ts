interface Patient {
    id: string;
    name: string;
    age: number;
    bloodType: string; // A+, B+, AB+, O+, A-, B-, AB-, O-
    knownAlergies: string[];
    affections: string[];
    medicalHistory: string[];
    lastKnownLocation: { lat: number; long: number };
}

interface Location {
    lat: number;
    long: number;
    patientID: string; // UUID of the patient the location conrresponds to
}

export type { Location, Patient };
