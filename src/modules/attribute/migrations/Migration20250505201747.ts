import { Migration } from '@mikro-orm/migrations';

export class Migration20250505201747 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "attribute_possible_value" ("id" text not null, "value" text not null, "rank" integer not null, "metadata" jsonb null, "attribute_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "attribute_possible_value_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_attribute_possible_value_attribute_id" ON "attribute_possible_value" (attribute_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_attribute_possible_value_deleted_at" ON "attribute_possible_value" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_attribute_id_value" ON "attribute_possible_value" (attribute_id, value) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "attribute_possible_value" drop constraint if exists "attribute_possible_value_attribute_id_foreign";`);
    this.addSql(`alter table if exists "attribute_possible_value" add constraint "attribute_possible_value_attribute_id_foreign" foreign key ("attribute_id") references "attribute" ("id") on update cascade;`);

    this.addSql(`drop index if exists "UQ_attribute_id_value";`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "attribute_possible_value" cascade;`);

    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_attribute_id_value" ON "attribute_value" (attribute_id, value) WHERE deleted_at IS NULL;`);
  }

}
