import { Pool, neonConfig } from "@neondatabase/serverless";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "kysely-codegen";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});
