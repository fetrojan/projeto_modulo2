import {Entity, PrimaryGeneratedColumn, Column, OneToOne, UpdateDateColumn, CreateDateColumn} from "typeorm"
import { Branch } from "./Branch"
import { Driver } from "./Driver"

export enum UserProfile {
  ADMIN = "ADMIN",
  DRIVER = "DRIVER",
  BRANCH = "BRANCH"
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 200})
  name: string

  @Column({type: "enum", enum: UserProfile, nullable: false})
  profile: UserProfile

  @Column({length: 150, unique: true})
  email: string

  @Column({length: 150, nullable: false})
  password: string

  @Column({default: true})
  status: boolean

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;
    
  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @OneToOne(() => Branch, branch => branch.user)
  branch: Branch

  @OneToOne(() => Driver, driver => driver.user)
  driver: Driver

}