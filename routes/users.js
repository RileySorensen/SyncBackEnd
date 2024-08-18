import express from "express";
import supabase from "../supabaseClient.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("Users").select();
  console.log(data);
  res.send(data);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: "Create a new user"
 *     tags: [Users]
 *     description: "Creates a new user with the provided name, username, and password. Returns user details if the creation is successful."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "The full name of the user."
 *               username:
 *                 type: string
 *                 description: "The username for the user, which must be unique."
 *               password:
 *                 type: string
 *                 description: "The password for the user."
 *             required:
 *               - name
 *               - username
 *               - password
 *     responses:
 *       '201':
 *         description: "User created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: "The ID of the newly created user."
 *               example:
 *                 id: 1
 *       '400':
 *         description: "Missing required fields"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Missing required fields"
 *       '409':
 *         description: "Username is taken"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Username is taken!"
 *       '500':
 *         description: "Error creating user"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *               example:
 *                 message: "Error creating user"
 *                 error: "Detailed error message"
 */
router.post("/users", async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const matchingUsersInDB = await checkForUniqueUsername(username);
    console.log(matchingUsersInDB);
    if (matchingUsersInDB.length > 0) {
      return res.status(409).json("Username is taken!");
    }

    const { data, error } = await supabase
      .from("Users")
      .insert({ name: name, username: username, password: password })
      .select("id");
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
});

async function checkForUniqueUsername(username) {
  const { data, error } = await supabase
    .from("Users")
    .select()
    .eq("username", username);
  return data;
}

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user
 *               password:
 *                 type: string
 *                 description: Password of the user
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   description: The ID of the logged-in user
 *       400:
 *         description: Missing username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error logging in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 error:
 *                   type: object
 *                   description: Error details
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Fetch user
  try {
    const {user, error} = await supabase.from("Users").select("id").eq('username', username).eq('password', password);
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({ userId: user.id });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
});

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search for users by username
 *     tags: [Users]
 *     parameters:
 *       - name: username
 *         in: query
 *         description: Partial or full username to search for
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the user
 *                   username:
 *                     type: string
 *                     description: The username of the user
 *                   name:
 *                     type: string
 *                     description: The name of the user
 *       400:
 *         description: Invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error searching users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 error:
 *                   type: object
 *                   description: Error details
 */
router.get("/users/search", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    //Return empty list? Or everyone?
  }

  try {
    const users = await db("users").where("username", "like", `%${username}%`);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error searching users", error });
  }
});

/**
 * @swagger
 * /api/user-interests:
 *   post:
 *     summary: Add an interest to a user
 *     tags: [User Interests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to whom the interest is being added
 *               interestId:
 *                 type: integer
 *                 description: ID of the interest being added
 *             required:
 *               - userId
 *               - interestId
 *     responses:
 *       201:
 *         description: Successfully added interest to user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the newly created user-interest relationship
 *                 user_id:
 *                   type: integer
 *                   description: The ID of the user
 *                 interest_id:
 *                   type: integer
 *                   description: The ID of the interest
 *       400:
 *         description: Missing user ID or interest ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error adding interest to user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 error:
 *                   type: object
 *                   description: Error details
 */
router.post("/user-interests", async (req, res) => {
  const { userId, interestId } = req.body;

  if (!userId || !interestId) {
    return res
      .status(400)
      .json({ message: "User ID and Interest ID are required" });
  }

  try {
    const newUserInterest = await db("user_interests")
      .insert({ user_id: userId, interest_id: interestId })
      .returning("*");
    res.status(201).json(newUserInterest[0]);
  } catch (error) {
    res.status(500).json({ message: "Error adding interest to user", error });
  }
});

/**
 * @swagger
 * /api/profile/{userId}:
 *   get:
 *     summary: Get profile information for a specific user
 *     tags: [Users, Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user to retrieve profile information for
 *     responses:
 *       200:
 *         description: Successfully fetched the user's profile information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the user
 *                 username:
 *                   type: string
 *                   description: The username of the user
 *                 interests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       inside:
 *                         type: boolean
 *                       outside:
 *                         type: boolean
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error fetching user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await db("users")
      .where({ id: userId })
      .first()
      .select("name", "username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const interests = await db("user_interests")
      .join("interests", "user_interests.interest_id", "=", "interests.id")
      .where({ user_id: userId })
      .select(
        "interests.id",
        "interests.name",
        "interests.inside",
        "interests.outside"
      );

    res.status(200).json({ ...user, interests });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's profile", error });
  }
});

export default router;
