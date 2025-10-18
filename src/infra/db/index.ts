import { env } from "@/env.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { schemas } from "./schemas/index.js";



export const pg = postgres(env.DATABASE_URL);
export const db = drizzle(pg, { schema: schemas });

