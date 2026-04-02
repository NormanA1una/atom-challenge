import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/user.entity';

export class UserFactory {
  static create(email: string): User {
    return {
      id: uuidv4(),
      email,
      createdAt: new Date(),
    };
  }
}
