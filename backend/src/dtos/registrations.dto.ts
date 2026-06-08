export interface CreateRegistrationDto {
  eventId: string;
  userId: string;
}

export interface RegistrationResponseDto {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: Date;
}
