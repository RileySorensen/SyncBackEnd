import express from "express";
import supabase from "../supabaseClient.js";
const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the event
 *               date:
 *                 type: string
 *                 description: The date of the event (as a string)
 *             required:
 *               - name
 *               - date
 *     responses:
 *       201:
 *         description: Successfully created the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the newly created event
 *                 name:
 *                   type: string
 *                   description: The name of the event
 *                 date:
 *                   type: string
 *                   description: The date of the event (as a string)
 *       400:
 *         description: Missing event name or date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error creating event
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
 * /api/events/{eventId}/vote:
 *   get:
 *     summary: Get interests available for voting in a specific event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the event to get interests for voting
 *     responses:
 *       200:
 *         description: Successfully fetched the interests for voting
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the interest
 *                   name:
 *                     type: string
 *                     description: The name of the interest
 *                   inside:
 *                     type: boolean
 *                     description: Whether the interest is inside
 *                   outside:
 *                     type: boolean
 *                     description: Whether the interest is outside
 *       400:
 *         description: Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error fetching interests for voting
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
router.get("/events/:eventId/vote", async (req, res) => {
  const { eventId } = req.params;

  try {
    const interests = await db("interests")
      .join(
        "event_interests",
        "interests.id",
        "=",
        "event_interests.interest_id"
      )
      .where({ "event_interests.event_id": eventId });

    res.status(200).json(interests);
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
  const { votes } = req.body; // Assume votes is an array of { interestId, voteCount }

  if (!votes || !Array.isArray(votes)) {
    return res
      .status(400)
      .json({ message: "Votes are required and should be an array" });
  }

  try {
    const votePromises = votes.map((vote) => {
      return db("votes").insert({
        event_id: eventId,
        interest_id: vote.interestId,
        vote_count: vote.voteCount,
      });
    });

    await Promise.all(votePromises);
    res.status(201).json({ message: "Votes submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting votes", error });
  }
});

export default router;
