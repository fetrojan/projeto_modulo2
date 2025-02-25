import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Branch } from "./Branch";
import { Product } from "./Product";

export enum MovementStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED'
}

@Entity('movements')
export class Movement {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    quantity: number

    @Column({type: "enum", enum: MovementStatus, default: 'PENDING'})
    status: MovementStatus

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @ManyToOne(() => Branch, branch => branch.movements)
    @JoinColumn({name: 'destination_branch_id'})
    destination_branch: Branch

    @ManyToOne(() => Product, product => product.movements)
    @JoinColumn({name: 'product_id' })
    product: Product
}