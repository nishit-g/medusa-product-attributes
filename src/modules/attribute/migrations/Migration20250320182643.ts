import { Migration } from '@mikro-orm/migrations';

export class Migration20250320182643 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_attribute_id_value" ON "attribute_value" (attribute_id, value) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_attribute_id_rank" ON "attribute_value" (attribute_id, rank) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "UQ_attribute_id_value";`);
    this.addSql(`drop index if exists "UQ_attribute_id_rank";`);
  }

}
