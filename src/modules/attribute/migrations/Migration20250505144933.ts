import { Migration } from '@mikro-orm/migrations';

export class Migration20250505144933 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "attribute_set" drop constraint if exists "attribute_set_handle_unique";`);
    this.addSql(`create table if not exists "attribute_set" ("id" text not null, "name" text not null, "description" text null, "handle" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "attribute_set_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ATTRIBUTE_SET_NAME" ON "attribute_set" (name) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_attribute_set_handle_unique" ON "attribute_set" (handle) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_attribute_set_deleted_at" ON "attribute_set" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "attribute_set_attributes" ("attribute_set_id" text not null, "attribute_id" text not null, constraint "attribute_set_attributes_pkey" primary key ("attribute_set_id", "attribute_id"));`);

    this.addSql(`alter table if exists "attribute_set_attributes" add constraint "attribute_set_attributes_attribute_set_id_foreign" foreign key ("attribute_set_id") references "attribute_set" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table if exists "attribute_set_attributes" add constraint "attribute_set_attributes_attribute_id_foreign" foreign key ("attribute_id") references "attribute" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "attribute_set_attributes" drop constraint if exists "attribute_set_attributes_attribute_set_id_foreign";`);

    this.addSql(`drop table if exists "attribute_set" cascade;`);

    this.addSql(`drop table if exists "attribute_set_attributes" cascade;`);
  }

}
