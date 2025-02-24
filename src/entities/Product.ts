import { time } from "console";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Branch } from "./Branch";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200, nullable: false })
  name: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ length: 200, nullable: false })
  description: string;

  @Column({ length: 200, nullable: true })
  url_cover: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => Branch, (branch) => branch.products)
  @JoinColumn({ name: "branch_id" })
  branch: Branch
}
