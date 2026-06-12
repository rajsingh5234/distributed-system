import { Config } from '@/config';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { UserRole } from '@/types/user';
import { HashingService } from '@/utils/hashing';

export const createAdminUser = async (userRepository: IUserRepository): Promise<void> => {
  const existingAdmin = await userRepository.findByEmail(Config.ADMIN_EMAIL!);
  if (existingAdmin) return;

  const hashedPassword = await HashingService.hash(Config.ADMIN_PASSWORD!);

  await userRepository.create({
    firstName: Config.ADMIN_FIRST_NAME!,
    lastName: Config.ADMIN_LAST_NAME!,
    email: Config.ADMIN_EMAIL!,
    password: hashedPassword,
    role: UserRole.ADMIN,
  });
};
