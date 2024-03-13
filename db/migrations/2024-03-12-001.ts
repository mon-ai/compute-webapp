import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable("projects")
    .addColumn("id", "uuid", ($) =>
      $.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("creator", "text", ($) => $.unique().notNull())
    .addColumn("name", "text", ($) => $.notNull())
    .addColumn("description", "text", ($) => $.notNull())
    .addColumn("created_at", "timestamp", ($) =>
      $.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updated_at", "timestamp", ($) =>
      $.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("projects").execute();
}
