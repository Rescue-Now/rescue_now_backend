import { Hono } from "hono";
import { Patient } from "./model.ts";
import { monotonicUlid } from "jsr:@std/ulid";

const app = new Hono();
const db = await Deno.openKv();

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
  console.log("datele din request:");
  console.log(body);
  console.log(typeof body);
  //give resultit an id
  body.id = monotonicUlid();
  const result = await db.set(["patients", body.id], body);
  console.log(`creating patient`);
  console.log(result);
  return c.json({ id: body.id });
});

/**
 * update patient data (id required)
 */

app.put("/patient", async (c) => {
  console.log("updating patient");
  const body: Patient = await c.req.json() as Patient;
  console.log("datele din request:");
  console.log(body);

  //give it an id just in case
  if (
    !body.id || body.id === "" || body.id === "gol lol" || body.id === "Error"
  ) {
    console.log("failed: no id");
    return c.body("id required", 400);
  }
  const getPatient = await db.get(["patients", body.id]);
  if (getPatient.value === null) {
    console.log("failed: patient not found");
    return c.body("patient not found", 404);
  }
  // tot da eroare da chiar merge
  body.lastKnownLocation = getPatient.value.lastKnownLocation;
  const result = await db.set(["patients", body.id], body);
  console.log("updated patient");
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

// clear entire db
app.delete("/patients", async (c) => {
  console.log("deleting all patients");
  const iter = await db.list({ prefix: ["patients"] });
  for await (const res of iter) {
    await db.delete(res.key);
  }
  return c.body(null, 204);
});

// TODO sa dai convert sa mearga cu validators in loc sa fie inauntri aici toate if elseurile https://hono.dev/docs/guides/validation

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
  console.log(`creating patient for location ${patientId}`);
  console.log(result);
  return c.json({ id: patientId }, 201);
});

Deno.serve(app.fetch);
