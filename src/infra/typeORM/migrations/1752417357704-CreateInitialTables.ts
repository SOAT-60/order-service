import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateInitialTables1752417357704 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "orderDate",
            type: "datetime",
          },
          {
            name: "status",
            type: "varchar",
          },
          {
            name: "code",
            type: "varchar",
          },
          {
            name: "item_id",
            type: "int",
          },
          {
            name: "paymentStatus",
            type: "varchar",
            default: "'PENDING'",
          },
        ],
      }),
      true
    );

    // Cria tabela order_items
    await queryRunner.createTable(
      new Table({
        name: "order_items",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "quantity",
            type: "int",
          },
          {
            name: "snapshot_price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "item_id",
            type: "int",
          },
          {
            name: "order_id",
            type: "int",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "order_items",
      new TableForeignKey({
        columnNames: ["order_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "orders",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("order_items");
    const foreignKey = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes("order_id")
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("order_items", foreignKey);
    }
    await queryRunner.dropTable("order_items");
    await queryRunner.dropTable("orders");
  }
}
