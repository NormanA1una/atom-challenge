import { CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { getFirestoreClient } from './firestore.client';

export class UserFirestoreRepository implements UserRepository {
  private readonly collection: CollectionReference;

  constructor() {
    this.collection = getFirestoreClient().collection('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      email: data['email'] as string,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    };
  }

  async save(user: User): Promise<User> {
    await this.collection.doc(user.id).set({
      email: user.email,
      createdAt: Timestamp.fromDate(user.createdAt),
    });
    return user;
  }
}
