import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { CreateUserUseCase } from './create-user.use-case';

const mockUserRepo: jest.Mocked<UserRepository> = {
  findByEmail: jest.fn(),
  save: jest.fn(),
};

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateUserUseCase(mockUserRepo);
  });

  it('saves and returns a new user', async () => {
    const saved: User = { id: 'abc', email: 'x@x.com', createdAt: new Date() };
    mockUserRepo.save.mockResolvedValue(saved);

    const result = await useCase.execute('x@x.com');

    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
    expect(result.email).toBe('x@x.com');
  });
});
