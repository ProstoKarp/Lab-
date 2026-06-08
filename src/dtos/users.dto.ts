export type UserRow = { id: number; name: string; createdAt: string };
export type CreateUserDto = { name: string };
export type UpdateUserDto = Partial<CreateUserDto>;
