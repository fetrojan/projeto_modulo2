import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn} from "typeorm"
import { User } from "./User"

@Entity("drivers")
export class Driver {
    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 255})
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
}