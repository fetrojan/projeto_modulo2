import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn} from "typeorm"
import { User } from "./User"

@Entity("branches")
export class Branch {
    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 255})
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
}