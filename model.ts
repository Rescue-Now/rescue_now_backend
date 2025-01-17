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

export type { Patient };
