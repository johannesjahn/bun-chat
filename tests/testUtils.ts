import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "../db/schema";
import { unlink } from "node:fs/promises";
import { $ } from "bun";
import { randomUUID } from "node:crypto";
import { test } from "bun:test";
import { UserService } from "../services/userService";

export async function setupTestDb() {
  // Generate a unique database name for this test run
  const testDbFile = `test-${randomUUID()}.db`;

  // Create the test database file by running drizzle-kit push
  // We use the separate config file directing to the unique test db
  // We strictly wait for the command to finish
  await $`TEST_DB_NAME=${testDbFile} bun drizzle-kit push --config=drizzle.test.config.ts`.quiet();

  // Connect to the test db
  const sqlite = new Database(testDbFile);
  const db = drizzle(sqlite, { schema });

  return { db, sqlite, testDbFile };
}

export async function teardownTestDb(sqlite: Database, testDbFile: string) {
  // Close the connection and delete the test file
  sqlite.close();
  await unlink(testDbFile).catch(() => {});
}

// Helper to handle setup/teardown for concurrent tests
// Standard beforeEach/afterEach with shared variables doesn't work for concurrent tests
// because tests would overwrite each other's database instances.
export const testWithService = (
  name: string,
  fn: (args: { userService: UserService }) => Promise<void>
) => {
  test(name, async () => {
    const { db, sqlite, testDbFile } = await setupTestDb();
    const userService = new UserService(db as any);
    try {
      await fn({ userService });
    } finally {
      await teardownTestDb(sqlite, testDbFile);
    }
  });
};
