import { User } from '../../../domain/entities/user.entity';
import { UserFactory } from '../../../domain/factories/user.factory';
import { UserRepository } from '../../../domain/repositories/user.repository';

export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(email: string): Promise<User> {
    const user = UserFactory.create(email);
    return this.userRepo.save(user);
  }
}
