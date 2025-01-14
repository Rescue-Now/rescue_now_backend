import { Hono } from "hono";
import { Location, Patient } from "./model.ts";
import { monotonicUlid } from "jsr:@std/ulid";
import { validator } from "hono/validator";
import { patientPutValidator } from "./validators.ts";

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
  const body = await c.req.json(); // vezi sa fie Content-Type: application/json
  console.log(body);
  console.log(typeof body);
  //give resultit an id
  body.id = monotonicUlid();
  const result = await db.set(["patients", body.id], body);
  console.log(result);
  return c.json({ id: body.id });
});

/**
 * update patient data (id required)
 */

app.put("/patient", async (c) => {
  console.log("updating patient");
  const body: Patient = await c.req.json() as Patient;
  //give it an id just in case
  if (!body.id) {
    console.log("failed: no id");
    return c.body("id required", 400);
  }
  const getPatient = await db.get(["patients", body.id]);
  console.log(body);
  if (getPatient.value === null) {
    return c.body("patient not found", 404);
  }
  // tot da eroare da chiar merge
  body.lastKnownLocation = getPatient.value.lastKnownLocation;
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
// TODO sa dai convert sa mearga cu validators in loc sa fie inauntri aici toate if elseurile https://hono.dev/docs/guides/validation

//TODO fa-l daca nu are id in request s-i creeze unu nou, si sa dea return la id sa-i zica la frontend ca ba vezi ca TRBUIE sa-l salvezi in preferences
// adica in flutter mereu cand dai request dai si un idul salvat in prefferences
//toate actiunile astea, put /location, put/patient trebuie sa incerce sa trimita cu location si daca nu are location aaa asa da post sau put deci in flutter daca nu ai id in preferences da post si daca il ai da put aici in backend la post, o sa dea return cu idul pe care o sa-l salveze flutterul in preferences
app.put("/location", async (c) => {
  console.log("updating location");
  // get the patient mentioned in the location from the db
  // const location: Location = await c.req.json();
  const { lat, long, patientID } = await c.req.queries();

  // because each query param is an array
  const latitude = lat[0];
  const longitude = long[0];
  const patiendId = patientID[0];

  console.log(latitude, longitude, patiendId);

  if (!latitude || !longitude) {
    return c.body("lat and long required", 400);
  }

  const patientkv = await db.get(["patients", patiendId]);

  // change their location
  const patient: Patient = patientkv.value as Patient;

  if (patient === null) {
    return c.body("patient not found", 404);
  }
  patient.lastKnownLocation = {
    lat: parseFloat(latitude),
    long: parseFloat(longitude),
  };

  //store it back in the db
  const result = await db.set(["patients", patiendId], patient);
  console.log(result);

  return c.body(null, 204);
});

app.post("/location", async (c) => {
  console.log("storing a new patient's location");
  const { lat, long, _patientID } = await c.req.queries();
  const latitude = lat[0];
  const longitude = long[0];
  const patientId = monotonicUlid();

  const patient: Patient = {
    id: patientId,
    name: "",
    age: 0,
    bloodType: "",
    knownAlergies: [],
    affections: [],
    medicalHistory: [],
    lastKnownLocation: {
      lat: parseFloat(latitude),
      long: parseFloat(longitude),
    },
  };

  //store it in the db
  const result = await db.set(["patients", patientId], patient);
  console.log(`creating patient ${patientId}`);
  console.log(result);
  return c.json({ id: patientId });
});

Deno.serve(app.fetch);
