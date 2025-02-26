import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany} from "typeorm"
import { User } from "./User"
import { Movement } from "./Movement"

@Entity("drivers")
export class Driver {
    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 255, nullable: true})
    full_address: string

    @Column({nullable: false, length: 14, unique: true})
    document: string

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;
      
    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @OneToOne(() => User, user => user.driver)
    @JoinColumn({name: "user_id"})
    user: User

    @OneToMany(() => Movement, movement => movement.driver)
    movements: Movement[]
}