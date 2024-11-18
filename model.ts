interface Patient {
    id: number;
    name: string;
    age: number;
    bloodType: string; // A+, B+, AB+, O+, A-, B-, AB-, O-
    knownAlergies: string[];
    affections: string[];
    medicalHistory: string[];
    lastKnownLocation: number[]; // [lat, long]
}

interface Location {
    lat: number;
    long: number;
    patientID: number;
}

export type { Location, Patient };
