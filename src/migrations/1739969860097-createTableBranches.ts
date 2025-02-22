import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTableBranches1739969860097 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'branches',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'full_address',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'document',
                    type: 'varchar',
                    length: '18',
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'user_id',
                    type: 'int',
                    isNullable: false,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'now()'
                }
            ]
        }))

        await queryRunner.createForeignKey('branches',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('branches');
    }

}
