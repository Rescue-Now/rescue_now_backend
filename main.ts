import { Hono } from "hono";
import { Location, Patient } from "./model.ts";

const app = new Hono();
const db = await Deno.openKv("./db/db");

app.get("/", (c) => {
  console.log("home da dam redirect");
  return c.redirect("/patients");
});

/**
 * accepts patients data and stores it in the database
 */
app.on(["POST", "PUT"], "/patient", async (c) => {
  console.log("storing/updating a patient");
  const body: Patient = await c.req.json();
  const result = await db.set(["patients", body.id], body);
  console.log(result);
  return c.json(result);
});

/**
 * get a list of all the patients in the db
 */
app.get("/patients", async (c) => {
  console.log("getting patients");
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

app.on(["POST", "PUT"], "/location", async (c) => {
  const location: Location = await c.req.json();
  const patientkv = await db.get(["locations", location.patientID]);
  const patient = patientkv.value as Patient;
  patient.lastKnownLocation = [location.lat, location.long];
  const result = await db.set(["patients", location.patientID], patient);
  console.log(`updating location for patient ${location.patientID}`);
  console.log(result);
  return c.json(patient);
});

Deno.serve(app.fetch);
