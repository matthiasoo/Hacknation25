export interface User {
    id: string;
    email: string;
    firstName: string;
    totalPoints: number;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
}
