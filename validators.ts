import { ValidationFunction } from "hono/validator";
import { Patient } from "./model.ts";

const patientPutValidator = async (value, c) => {
    const body: Patient = await c.req.json() as Patient;
    //give it an id just in case
    if (!body.id) {
        return c.body("id required", 400);
    }
};

export { patientPutValidator };
