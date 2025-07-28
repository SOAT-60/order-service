import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSnapshotNameToOrderItems1753745922831
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE order_items ADD COLUMN snapshot_name VARCHAR(255) NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE order_items DROP COLUMN snapshot_name`
    );
  }
}
