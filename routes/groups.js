import express from "express";
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
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Group name is required" });
  }

  try {
    const newGroup = await db("groups").insert({ name }).returning("*");
    res.status(201).json(newGroup[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error });
  }
});

/**
 * @swagger
 * /api/group-members:
 *   post:
 *     summary: Add a user to a group
 *     tags: [Group Members]
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
    const newGroupMember = await db("group_members")
      .insert({ user_id: userId, group_id: groupId })
      .returning("*");
    res.status(201).json(newGroupMember[0]);
  } catch (error) {
    res.status(500).json({ message: "Error adding member to group", error });
  }
});

/**
 * @swagger
 * /api/group-members:
 *   delete:
 *     summary: Remove a user from a group
 *     tags: [Group Members]
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
    await db("group_members")
      .where({ user_id: userId, group_id: groupId })
      .del();
    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error leaving group", error });
  }
});

/**
 * @swagger
 * /api/groups/{userId}:
 *   get:
 *     summary: Get the user's groups and events
 *     tags: [Groups, Events]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user to retrieve groups and events for
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: integer
 *         required: false
 *         description: The ID of the group to retrieve events for
 *     responses:
 *       200:
 *         description: Successfully fetched user's groups and events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid user ID or group ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error fetching user's groups or events
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
router.get('/groups/:userId', async (req, res) => {
  const { userId } = req.params;
  const { groupId } = req.query;

  try {
    const groups = await db('groups')
      .join('group_members', 'groups.id', '=', 'group_members.group_id')
      .where({ user_id: userId })
      .select('groups.id', 'groups.name');

    let events = [];
    if (groupId) {
      events = await db('events')
        .where({ group_id: groupId })
        .select('id', 'name', 'date');
    }

    res.status(200).json({ groups, events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user\'s groups or events', error });
  }
});

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   get:
 *     summary: Get members of a specific group
 *     tags: [Groups, Users]
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
router.get('/groups/:groupId/members', async (req, res) => {
  const { groupId } = req.params;

  try {
    const members = await db('users')
      .join('group_members', 'users.id', '=', 'group_members.user_id')
      .where({ group_id: groupId })
      .select('users.id', 'users.name', 'users.username');

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group members', error });
  }
});

export default router;
