import express from "express";
import supabase from "../supabaseClient.js";
const router = express.Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event and initialize votes for interests
 *     description: Creates a new event with the given name, group ID, and end date. Initializes votes for all interests in the specified group with a count of 0.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the event.
 *                 example: "Community BBQ"
 *               groupId:
 *                 type: integer
 *                 description: The ID of the group associated with the event.
 *                 example: 1
 *               enddate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date of the event in ISO 8601 format.
 *                 example: "2024-08-31T23:59:59Z"
 *     responses:
 *       '201':
 *         description: Event created successfully and votes initialized.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Created new event!"
 *       '400':
 *         description: Missing required fields in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event name, groupId, and enddate are required"
 *       '500':
 *         description: Error occurred while creating the event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating event"
 *                 error:
 *                   type: object
 *                   additionalProperties: true
 */
router.post("/events", async (req, res) => {
  const { name, groupId, enddate } = req.body;

  if (!name || !groupId || !enddate) {
    return res.status(400).json({
      message: "Event name, groupId, and enddate are required",
    });
  }

  try {
    const { data, error } = await supabase
      .from("Events")
      .insert({ name: name, groupid: groupId, enddate: enddate })
      .select("id");
    console.log(data);

    const eventId = data[0].id;

    const interestsList = await getAllInterestsInGroup(groupId);
    console.log(interestsList);
    const voteObjects = interestsList.map((interest) => ({
      eventid: eventId,
      interestid: interest.id,
      votescount: 0,
    }));

    const { data: votesData, error: votesError } = await supabase
      .from("Votes")
      .insert(voteObjects);

    return res.status(201).json("Created new event!");
  } catch (error) {
    return res.status(500).json({ message: "Error creating event", error });
  }
});

async function getAllInterestsInGroup(groupId) {
  try {
    const { data: groupMembers, error: groupMemberError } = await supabase
      .from("GroupMembers")
      .select("userid")
      .eq("groupid", groupId);

    const userIds = groupMembers.map((member) => member.userid);

    const { data: userInterests, error: userInterestError } = await supabase
      .from("UserInterests")
      .select("interestid")
      .in("userid", userIds);

    const interestIds = userInterests.map((interest) => interest.interestid);

    const { data: uniqueInterests, error: uniqueInterestError } = await supabase
      .from("Interests")
      .select()
      .in("id", [...new Set(interestIds)]);

    return uniqueInterests;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * @swagger
 * /events/{groupId}/interests:
 *   get:
 *     summary: Get all unique interests for a group
 *     description: Retrieves a list of all unique interests associated with the specified group ID. This includes interests of all users within the group.
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the group for which to fetch interests.
 *         example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of interests.
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
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the interest.
 *                     example: "Gardening"
 *       '500':
 *         description: Error occurred while fetching the interests.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching interests for voting"
 *                 error:
 *                   type: object
 *                   additionalProperties: true
 */
router.get("/events/:groupId/interests", async (req, res) => {
  const { groupId } = req.params;

  try {
    const interestsList = await getAllInterestsInGroup(groupId);
    res.status(200).json(interestsList);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching interests for voting", error });
  }
});

/**
 * @swagger
 * /api/events/{eventId}/vote:
 *   post:
 *     summary: Submit votes for interests in a specific event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the event to submit votes for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               votes:
 *                 type: array
 *                 description: An array of votes, each containing an interestId and voteCount
 *                 items:
 *                   type: object
 *                   properties:
 *                     interestId:
 *                       type: integer
 *                       description: The ID of the interest being voted on
 *                     voteCount:
 *                       type: integer
 *                       description: The number of votes for the interest
 *             required:
 *               - votes
 *     responses:
 *       201:
 *         description: Votes submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Invalid request body, votes are required and should be an array
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error submitting votes
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
router.post("/events/:eventId/vote", async (req, res) => {
  const { eventId } = req.params;
  const { votes } = req.body; // Assume votes is an array of interest ids

  if (!votes || !Array.isArray(votes)) {
    return res
      .status(400)
      .json({ message: "Votes are required and should be an array" });
  }

  try {
    for (const interestId of votes) {
      // Fetch the current votescount for the specific event and interest ID
      const { data: voteRecord, error: fetchError } = await supabase
        .from("Votes")
        .select("votescount")
        .eq("eventid", eventId)
        .eq("interestid", interestId)
        .single();

      if (fetchError) {
        console.error(
          `Error fetching vote for interest ID ${interestId}:`,
          fetchError
        );
        continue;
      }

      // Increment the votescount by 1
      const newVotesCount = voteRecord.votescount + 1;

      // Update the votescount in the database
      const { error: updateError } = await supabase
        .from("Votes")
        .update({ votescount: newVotesCount })
        .eq("eventid", eventId)
        .eq("interestid", interestId);

      if (updateError) {
        console.error(
          `Error updating vote for interest ID ${interestId}:`,
          updateError
        );
      } else {
        console.log(`Vote incremented for interest ID ${interestId}`);
      }
    }

    return res.status(201).json({ message: "Votes submitted successfully" });
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
});

export default router;
