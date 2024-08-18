import express from "express";
import supabase from "../supabaseClient.js";
const router = express.Router();

/**
 * @swagger
 * /interests:
 *   post:
 *     summary: Create a new interest
 *     description: Adds a new interest to the Interests table.
 *     tags: [Interests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the interest.
 *                 example: "Hiking"
 *             required:
 *               - name
 *     responses:
 *       '201':
 *         description: Interest created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Added new interest!"
 *       '400':
 *         description: Bad request, missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Name is required"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating interest"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.post("/interests", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const { data: existingInterest, error: checkError } = await supabase
    .from("Interests")
    .select()
    .ilike("name", name.toLowerCase())
    .single();

  if (existingInterest) {
    return res.status(409).json("Interest already exists!");
  }

  try {
    const { data, error } = await supabase
      .from("Interests")
      .insert({
        name: name.toLowerCase(),
      })
      .select("id");
    return res.status(201).json("Added new interest!");
  } catch (error) {
    return res.status(500).json({ message: "Error creating interest", error });
  }
});

/**
 * @swagger
 * /interests:
 *   delete:
 *     summary: Remove an interest from a user
 *     description: Removes a specific interest from a user in the UserInterests table.
 *     tags: [Interests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The ID of the user from whom the interest should be removed.
 *                 example: 1
 *               interestId:
 *                 type: integer
 *                 description: The ID of the interest to be removed.
 *                 example: 5
 *             required:
 *               - userId
 *               - interestId
 *     responses:
 *       '200':
 *         description: Successfully removed the interest from the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Removed Interest successfully"
 *       '400':
 *         description: Bad request, missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User ID and Interest ID are required"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error removing interest"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.delete("/interests", async (req, res) => {
  const { userId, interestId } = req.body;

  if (!userId || !interestId) {
    return res
      .status(400)
      .json({ message: "User ID and Interest ID are required" });
  }

  try {
    const { data, error } = await supabase
      .from("UserInterests")
      .delete()
      .eq("userid", userId)
      .eq("interestid", interestId);
    return res.status(200).json({ message: "Removed Interest successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error removing interest", error });
  }
});

/**
 * @swagger
 * /interests/{userId}:
 *   get:
 *     summary: Get a list of interests not yet selected by the user.
 *     description: Retrieves a list of interests from the database, excluding those that have already been selected by the user.
 *     tags: [Interests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user.
 *     responses:
 *       200:
 *         description: A list of interests that the user has not yet selected.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the interest.
 *                   name:
 *                     type: string
 *                     description: The name of the interest.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                 error:
 *                   type: object
 *                   description: Error details.
 */
router.get("/interests/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Get the list of all interests
    const { data: allInterests, error: allInterestsError } = await supabase
      .from("Interests")
      .select("id, name");

    if (allInterestsError) throw allInterestsError;

    // Get the list of interests the user has already selected
    const { data: userInterests, error: userInterestsError } = await supabase
      .from("UserInterests")
      .select("interestid")
      .eq("userid", userId);

    if (userInterestsError) throw userInterestsError;

    // Get the IDs of the interests the user has already selected
    const userInterestIds = userInterests.map(
      (interest) => interest.interestid
    );

    // Filter out the interests the user has already selected
    const availableInterests = allInterests.filter(
      (interest) => !userInterestIds.includes(interest.id)
    );

    // Return the available interests
    return res.status(200).json(availableInterests);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching interests", error });
  }
});

export default router;
