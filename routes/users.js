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
    const { data, error } = await supabase
      .from("Users")
      .select("id")
      .eq("username", username)
      .eq("password", password);
    console.log(data);
    if (!data) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({ userId: data[0].id });
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

  // if (!username) { //Commenting out for now, can implement later if needed
  //Counts empty username because it's falsy :wink:
  try {
    const { data, error } = await supabase.from("Users").select();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error searching users", error });
  }
  // }

  // try {
  //   const { data, error } = await supabase
  //     .from("Users")
  //     .select()
  //     .like("username", username);
  //   return res.status(200).json(data);
  // } catch (error) {
  //   return res.status(500).json({ message: "Error searching users", error });
  // }
});

/**
 * @swagger
 * /user-interests:
 *   post:
 *     summary: Add interests to users
 *     description: Adds an array of user-interest combinations to the UserInterests table, excluding existing combinations.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               interestsArray:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userid:
 *                       type: integer
 *                       description: The ID of the user.
 *                       example: 1
 *                     interestid:
 *                       type: integer
 *                       description: The ID of the interest.
 *                       example: 101
 *             required:
 *               - interestsArray
 *     responses:
 *       '200':
 *         description: Interests added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Added interests!"
 *       '400':
 *         description: Bad request, missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error adding interests"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.post("/user-interests", async (req, res) => {
  const interestsArray = req.body.interestsArray;
  console.log(req.body.interestsArray);

  // Fetch existing records with matching foreign key combinations
  const { data: existingRecords, error: fetchError } = await supabase
    .from("UserInterests")
    .select("userid, interestid")
    .in(
      "userid",
      interestsArray.map((record) => record.userid)
    )
    .in(
      "interestid",
      interestsArray.map((record) => record.interestid)
    );

  if (fetchError) {
    console.error("Error fetching existing records:", fetchError);
    return;
  }

  // Create a set of existing foreign key combinations for quick lookup
  const existingCombinations = new Set(
    existingRecords.map((record) =>
      JSON.stringify([record.userid, record.interestid])
    )
  );

  // Filter out records that have existing foreign key combinations
  const uniqueRecords = interestsArray.filter((record) => {
    const combination = JSON.stringify([record.userid, record.interestid]);
    return !existingCombinations.has(combination);
  });

  // Insert new records that do not exist already
  try {
    await supabase
      .from("UserInterests")
      .insert(uniqueRecords);
    return res.status(200).json("Added interests!");
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error adding interests", error: err });
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
    const { data, error } = await supabase.from("Users").select("name, username, Interests (id, name, inside, outside, free)").eq("id", userId);

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user's profile", error });
  }
});

export default router;
