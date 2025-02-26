export class MovementResponseDTO {
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
    driver: {
        id: number;
        name: string
    } | null

    constructor(id: number, quantity: number, status: string, created_at: Date, updated_at: Date, product: { id: number; name: string; description: string; } | null, destination_branch_id: number | null, driver: { id: number; name: string } | null) {
        this.id = id;
        this.quantity = quantity;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.product = product;
        this.destination_branch_id = destination_branch_id;
        this.driver = driver;
    }

}

