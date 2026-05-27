export interface User{
    id: number
    name: string
    email: string
    role: "User" | "admin"
    created_at: string
};

export interface Category{
    id: number
    name: string
    image_url?: string
};

export interface Product{
    id: number
    name: string
    description: string
    price: number;
    stock: number;
    image_url: string;
    category_id: number;
    category_name?: string;
};

export interface CartItem{
    product: Product;
    quantity: number;
};

export interface Order{
    id: number;
    user_id: number;
    total_amount: number;
    status: 'pending' | 'paid' | 'cancelled';
    stripe_payment_id: string;
    created_at: string;
};

export interface OrderItem{
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
};

export interface ApiResponse <T = null>{
    message: string;
    data?: T;
    error?: string;
}

export interface LoginData{
    email: string;
    password: string;
}

export interface RegisterData{
    name: string;
    email: string;
    password: string;
};