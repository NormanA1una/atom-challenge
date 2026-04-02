import { Router, Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { FindUserByEmailUseCase } from '../../application/use-cases/users/find-user-by-email.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { UserFirestoreRepository } from '../../infrastructure/firestore/user.firestore.repository';

const router = Router();

const userRepo = new UserFirestoreRepository();
const findUserByEmail = new FindUserByEmailUseCase(userRepo);
const createUser = new CreateUserUseCase(userRepo);

/** GET /api/users?email={email} */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') throw new ValidationError('"email" query param is required.');
    const user = await findUserByEmail.execute(email);
    if (!user) { res.status(404).json({ error: 'User not found.' }); return; }
    res.status(200).json(user);
  } catch (err) { next(err); }
});

/** POST /api/users — body: { email } */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) throw new ValidationError('"email" is required.');
    const user = await createUser.execute(email);
    res.status(201).json(user);
  } catch (err) { next(err); }
});

export default router;
