import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable("projects")
    .addColumn("command", "text", ($) => $.notNull())
    .addColumn("verified", "boolean", ($) => $.defaultTo(false).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("projects").execute();
}
