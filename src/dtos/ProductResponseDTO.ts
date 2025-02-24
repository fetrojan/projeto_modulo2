export class ProductResponseDTO {
    id: number;
    name: string;
    amount: string;
    description: string;
    url_cover: string | null;
    created_at: Date;
    updated_at: Date;
    branch_id: number;

    constructor(product: any) {
        this.id = product.id;
        this.name = product.name;
        this.amount = product.amount;
        this.description = product.description;
        this.url_cover = product.url_cover;
        this.created_at = product.created_at;
        this.updated_at = product.updated_at;
        this.branch_id = product.branch.id;
    }
}