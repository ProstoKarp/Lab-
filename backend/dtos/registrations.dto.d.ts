export type RegistrationStatus = 'registered' | 'attended' | 'cancelled';
export type RegistrationRow = {
    id: number;
    user_id: number;
    event_id: number;
    status: RegistrationStatus;
    createdAt: string;
};
export type CreateRegistrationDto = {
    user_id: number;
    event_id: number;
    status?: RegistrationStatus;
};
export type UpdateRegistrationDto = {
    status?: RegistrationStatus;
};
//# sourceMappingURL=registrations.dto.d.ts.map