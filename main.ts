import { Hono } from "hono";
import { Location, Patient } from "./model.ts";
import { monotonicUlid } from "jsr:@std/ulid";

const app = new Hono();
const db = await Deno.openKv("./db/db");

app.get("/", (c) => {
  console.log("home da dam redirect");
  return c.redirect("/patients");
});

/**
 * accepts patients data and stores it in the database
 */
app.post("/patient", async (c) => {
  console.log("storing a new patient");
  const body = await c.req.formData();
  console.log(body);
  console.log(typeof body);
  //give it an id
  if (!body.id) {
    body.id = monotonicUlid();
  }
  const result = await db.set(["patients", body.id], body);
  console.log(result);
  return c.json(result);
});

/**
 * update patient data (id required)
 */
app.put("/patient", async (c) => {
  console.log("updating a patient");
  const body: Patient = await c.req.json() as Patient;
  //give it an id just in case
  if (!body.id) {
    return c.body("id required", 400);
  }
  const getPatient = await db.get(["patients", body.id]);
  if (getPatient.value === null) {
    return c.body("patient not found", 404);
  }
  const result = await db.set(["patients", body.id], body);
  console.log(result);
  return c.json(result);
});

/**
 * get a list of all the patients in the db
 */
app.get("/patients", async (c) => {
  console.log("getting all patients");
  const iter = await db.list({ prefix: ["patients"] });
  const patients = [];
  for await (const res of iter) patients.push(res);

  return c.json(patients);
});

app.get("/patient/:id", async (c) => {
  const patientId = c.req.param("id");
  console.log(`getting patient ${patientId}`);
  const patient = await db.get(["patients", patientId]);
  return c.json(patient);
});

app.delete("/patient/:id", async (c) => {
  const patientId = c.req.param("id");
  console.log(`deleting patient ${patientId}`);
  await db.delete(["patients", patientId]);

  return c.body(null, 204);
});

//update location of patient, returns 204 if successful and patient already exists, and the id of the newly created patient if the patient did not exist
app.put("/location", async (c) => {
  console.log("updating location");
  // get the patient mentioned in the location from the db
  // const location: Location = await c.req.json();
  const { lat, long, patientID } = await c.req.queries();
  const latitude = lat[0];
  const longitude = long[0];
  let parsedpatientID;
  if (patientID !== undefined) {
    parsedpatientID = patientID[0];
  }

  console.log(latitude, longitude, parsedpatientID);

  if (!latitude || !longitude) {
    return c.body("lat and long required", 400);
  }

  console.log("user location: ", latitude, longitude);

  let patientkv;
  if (parsedpatientID) {
    patientkv = await db.get(["locations", parsedpatientID]);
  }

  const location: Location = {
    lat: parseFloat(latitude),
    long: parseFloat(longitude),
    patientID: "null lol",
  };
  let patient: Patient;

  // if the patientid is not mentioned or does not exist, create a new patient
  if (patientkv?.value === undefined || patientkv.value === null) {
    location.patientID = monotonicUlid();
    patient = {
      id: location.patientID,
      name: "",
      age: 0,
      bloodType: "",
      knownAlergies: [],
      affections: [],
      medicalHistory: [],
      lastKnownLocation: { lat: location.lat, long: location.long },
    };
    //store it in the db
    const result = await db.set(["patients", location.patientID], patient);
    console.log(`creating new patient ${location.patientID}`);
    console.log(result);
    return c.json(`Successfully created new patient ${location.patientID}`);
  }

  console.log("patient exists");

  // change their location
  patient = patientkv.value as Patient;
  patient.lastKnownLocation = { lat: location.lat, long: location.long };

  //store it back in the db
  const result = await db.set(["patients", location.patientID], patient);
  console.log(`updating location for patient ${location.patientID}`);
  console.log(result);

  return c.body(null, 204);
});

Deno.serve(app.fetch);
