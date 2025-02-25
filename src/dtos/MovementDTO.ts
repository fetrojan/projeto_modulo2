export class MovementDTO {
    id: number;
    quantity: number;
    status: string;
    created_at: Date;
    updated_at: Date;
    product: { 
        id: number; 
        name: string; 
        description: string;
    } | null;
    destination_branch_id: number | null
}