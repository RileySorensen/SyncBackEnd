import express from "express";
import supabase from "../supabaseClient.js";
const router = express.Router();

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Group name is required
 *       500:
 *         description: Error creating group
 */
router.post("/groups", async (req, res) => {
  const { name, userId } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Group name is required" });
  }

  try {
    const { data, error } = await supabase
      .from("Groups")
      .insert({ name: name })
      .select("id");
    console.log(data);

    const { data: addUserData, error: addUserError } = await supabase
      .from("GroupMembers")
      .insert({ groupid: data[0].id, userid: userId });

    return res.status(201).json("Created new group, id: " + data[0].id);
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error });
  }
});

/**
 * @swagger
 * /api/group-members:
 *   post:
 *     summary: Add a user to a group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to be added to the group
 *               groupId:
 *                 type: integer
 *                 description: ID of the group to which the user is being added
 *             required:
 *               - userId
 *               - groupId
 *     responses:
 *       201:
 *         description: Successfully added the user to the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the newly created group-member relationship
 *                 user_id:
 *                   type: integer
 *                   description: The ID of the user
 *                 group_id:
 *                   type: integer
 *                   description: The ID of the group
 *       400:
 *         description: Missing user ID or group ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error adding member to group
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
router.post("/group-members", async (req, res) => {
  const { userId, groupId } = req.body;

  if (!userId || !groupId) {
    return res
      .status(400)
      .json({ message: "User ID and Group ID are required" });
  }

  try {
    const { data, error } = await supabase
      .from("GroupMembers")
      .insert({ userid: userId, groupid: groupId });
    console.log(data);
    console.log(error);
    return res.status(200).json("Added to the group!");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding member to group", error });
  }
});

/**
 * @swagger
 * /api/group-members:
 *   delete:
 *     summary: Remove a user from a group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to be removed from the group
 *               groupId:
 *                 type: integer
 *                 description: ID of the group from which the user is being removed
 *             required:
 *               - userId
 *               - groupId
 *     responses:
 *       200:
 *         description: Successfully removed the user from the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Missing user ID or group ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error removing member from group
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
router.delete("/group-members", async (req, res) => {
  const { userId, groupId } = req.body;

  if (!userId || !groupId) {
    return res
      .status(400)
      .json({ message: "User ID and Group ID are required" });
  }

  try {
    const { data, error } = await supabase
      .from("GroupMembers")
      .delete()
      .eq("userid", userId)
      .eq("groupid", groupId);
    console.log(error);
    return res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error leaving group", error });
  }
});

/**
 * @swagger
 * /groups/{userId}:
 *   get:
 *     summary: Retrieve groups for a specific user
 *     description: Fetches all groups associated with a specified user ID from the Users table.
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose groups are to be retrieved.
 *         example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of groups for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the group.
 *                     example: 2
 *                   name:
 *                     type: string
 *                     description: The name of the group.
 *                     example: "Study Group"
 *       '404':
 *         description: User or groups not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Groups not found!"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching user's groups"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.get("/groups/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(userId);

  try {
    const { data, error } = await supabase
      .from("Users")
      .select("name, Groups (id, name)")
      .eq("id", userId);

    console.log(data);
    console.log(error);

    if (!data) {
      return res.status(404).json("Groups not found!");
    }

    return res.status(200).json(data[0].Groups);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching user's groups", error });
  }
});

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   get:
 *     summary: Get members of a specific group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the group to retrieve members for
 *     responses:
 *       200:
 *         description: Successfully fetched group members
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
 *                   name:
 *                     type: string
 *                     description: The name of the user
 *                   username:
 *                     type: string
 *                     description: The username of the user
 *       400:
 *         description: Invalid group ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error fetching group members
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
router.get("/groups/:groupId/members", async (req, res) => {
  const { groupId } = req.params;

  try {
    const { data, error } = await supabase
      .from("Groups")
      .select("Users (id, name, username)")
      .eq("id", groupId);

    return res.status(200).json(data[0].Users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching group members", error });
  }
});

/**
 * @swagger
 * /groups/{groupId}/events:
 *   get:
 *     summary: Retrieve all events for a specific group
 *     description: Fetches a list of all events associated with the specified group ID.
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the group to retrieve events for.
 *     responses:
 *       200:
 *         description: A list of events for the specified group.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The event ID.
 *                   name:
 *                     type: string
 *                     description: The name of the event.
 *                   groupid:
 *                     type: integer
 *                     description: The ID of the group that the event is associated with.
 *                   enddate:
 *                     type: string
 *                     format: date
 *                     description: The end date of the event.
 *       500:
 *         description: Error fetching events.
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
router.get("/groups/:groupId/events", async (req, res) => {
  const { groupId } = req.params;

  try {
    const { data, error } = await supabase
      .from("Events")
      .select()
      .eq("groupid", groupId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching events", error });
  }
});

export default router;
