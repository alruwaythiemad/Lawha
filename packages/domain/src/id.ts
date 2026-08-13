import { v7 as uuidv7 } from 'uuid';

// PostgreSQL 17 (this project's version) has no native uuidv7() — that
// arrives in PG18. Per the consistency-conventions table, UUIDv7 primary
// keys are generated here, application-side, and passed into every INSERT;
// never a column DEFAULT.
export function generateId(): string {
  return uuidv7();
}
