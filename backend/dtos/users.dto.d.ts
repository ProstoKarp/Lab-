export type UserRow = {
    id: number;
    name: string;
    email: string;
    createdAt: string;
};
export type CreateUserDto = {
    name: string;
    email: string;
};
export type UpdateUserDto = Partial<CreateUserDto>;
//# sourceMappingURL=users.dto.d.ts.map