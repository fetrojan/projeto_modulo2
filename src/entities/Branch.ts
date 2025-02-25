import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany} from "typeorm"
import { User } from "./User"
import { Product } from "./Product"
import { Movement } from "./Movement"

@Entity("branches")
export class Branch {
    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 255, nullable: true})
    full_address: string

    @Column({nullable: false, length: 18, unique: true})
    document: string

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;
  
    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @OneToOne(() => User, user => user.branch)
    @JoinColumn({name: "user_id"})
    user: User

    @OneToMany(() => Product, product => product.branch)
    products: Product[]

    @OneToMany(() => Movement, movement => movement.product)
    movements: Movement[]
}