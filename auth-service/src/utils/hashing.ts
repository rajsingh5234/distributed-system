import bcrypt from 'bcryptjs';

export class HashingService {
  static hash(text: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(text, saltRounds);
  }

  static compare(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash);
  }
}
