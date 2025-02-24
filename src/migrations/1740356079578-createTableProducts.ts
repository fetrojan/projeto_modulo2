import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTableProducts1740356079578 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "products",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar",
                    length: "200",
                    isNullable: false
                },
                {
                    name: "amount",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "description",
                    type: "varchar",
                    length: "200",
                    isNullable: false
                },
                {
                    name: "url_cover",
                    type: "varchar",
                    length: "200",
                    isNullable: true
                },
                {
                    name: "branch_id",
                    type: "int"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }))

        await queryRunner.createForeignKey("products",
            new TableForeignKey({
                columnNames: ["branch_id"],
                referencedTableName: "branches",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("products")
    }

}
