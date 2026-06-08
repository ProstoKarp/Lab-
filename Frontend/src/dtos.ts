export type EventCategory = "announcement" | "meeting" | "workshop" | "conference";
export type RegistrationStatus = "registered" | "attended" | "cancelled";

export interface ApiResponse<T> { data: T; meta?: { count?: number; [key: string]: unknown } }
export interface ApiErrorDto { status: number; message: string; details?: string | null; errors?: Record<string, string[]> | null }

export interface UserDto { id: number; name: string; createdAt: string }
export interface CreateUserDto { name: string }
export type UpdateUserDto = Partial<CreateUserDto>;

export interface EventDto { id: number; title: string; description: string; category: EventCategory; author_id: number; createdAt: string; updatedAt: string }
export interface EventWithAuthorDto extends EventDto { author_name: string; author_email?: string }
export interface CreateEventDto { title: string; description: string; category: EventCategory; author_id: number }
export type UpdateEventDto = Partial<Omit<CreateEventDto, "author_id">>;

export interface RegistrationDto { id: number; user_id: number; event_id: number; status: RegistrationStatus; createdAt: string }
export interface RegistrationWithDetailsDto extends RegistrationDto { user_name: string; user_email?: string; event_title: string; event_category: EventCategory }
export interface CreateRegistrationDto { user_id: number; event_id: number; status?: RegistrationStatus }
export interface UpdateRegistrationDto { status?: RegistrationStatus }

export interface RegistrationStatsDto {
  event_id: number;
  event_title: string;
  category: EventCategory;
  total_registrations: number;
  registered: number;
  attended: number;
  cancelled: number;
}
