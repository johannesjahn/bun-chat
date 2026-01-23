import { userService } from "./services/userService";

async function main() {
  console.log("Creating a new user...");
  try {
    const newUser = await userService.createUser({
      name: "Alice",
      email: `alice_${Date.now()}@example.com`,
    });
    console.log("User created:", newUser);

    console.log("Fetching all users...");
    const allUsers = await userService.getAllUsers();
    console.log("All users:", allUsers);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
