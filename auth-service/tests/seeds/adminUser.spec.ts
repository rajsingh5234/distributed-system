import { RepositoryFactory } from '@/factories/repository.factory';
import { TestDatabase } from '../helpers/test-database/test-database';
import { TestDatabaseFactory } from '../helpers/test-database/test-database.factory';
import { createAdminUser } from '@/seeds/adminUser';
import { HashingService } from '@/utils/hashing';
import { Config } from '@/config';

const userRepository = RepositoryFactory.createUserRepository();
const testDatabaseStrategy = TestDatabaseFactory.createStrategy();
const db = new TestDatabase(testDatabaseStrategy);

beforeAll(async () => await db.setup());
afterEach(async () => await db.cleanup());
afterAll(async () => await db.teardown());

describe('createAdminUser', () => {
  it('should create admin user if one does not exist', async () => {
    await createAdminUser(userRepository);

    const admin = await userRepository.findByEmail(Config.ADMIN_EMAIL!);
    expect(admin).not.toBeNull();
  });

  it('should not create duplicate admin if called multiple times', async () => {
    await createAdminUser(userRepository);
    await createAdminUser(userRepository);

    const users = await userRepository.findAll();
    const admins = users.filter((u) => u.email === Config.ADMIN_EMAIL);
    expect(admins).toHaveLength(1);
  });

  it('should create user with admin role', async () => {
    await createAdminUser(userRepository);

    const admin = await userRepository.findByEmail(Config.ADMIN_EMAIL!);
    expect(admin?.role).toBe('admin');
  });

  it('should store hashed password, not plain text', async () => {
    await createAdminUser(userRepository);

    const admin = await userRepository.findByEmail(Config.ADMIN_EMAIL!);
    expect(admin?.password).not.toBe(Config.ADMIN_PASSWORD);
    const isValid = await HashingService.compare(Config.ADMIN_PASSWORD!, admin!.password);
    expect(isValid).toBe(true);
  });
});
