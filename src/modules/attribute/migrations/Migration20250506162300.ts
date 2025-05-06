import { Migration } from '@mikro-orm/migrations';

export class Migration20250506162300 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "attribute_value" drop column if exists "rank";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "attribute_value" add column if not exists "rank" integer not null;`);
  }

}
