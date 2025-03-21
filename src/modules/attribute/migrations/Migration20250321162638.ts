import { Migration } from '@mikro-orm/migrations';

export class Migration20250321162638 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop index if exists "UQ_attribute_id_rank";`);
  }

  override async down(): Promise<void> {
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_attribute_id_rank" ON "attribute_value" (attribute_id, rank) WHERE deleted_at IS NULL;`);
  }

}
