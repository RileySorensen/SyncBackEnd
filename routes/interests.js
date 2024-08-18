import express from "express";
const router = express.Router();

/**
 * @swagger
 * /api/interests:
 *   post:
 *     summary: Create a new interest
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
 *                 description: The name of the interest
 *               inside:
 *                 type: boolean
 *                 description: Whether the interest is an indoor activity
 *               outside:
 *                 type: boolean
 *                 description: Whether the interest is an outdoor activity
 *             required:
 *               - name
 *               - inside
 *               - outside
 *     responses:
 *       201:
 *         description: Successfully created a new interest
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the newly created interest
 *                 name:
 *                   type: string
 *                   description: The name of the interest
 *                 inside:
 *                   type: boolean
 *                   description: Indicates if the interest is an indoor activity
 *                 outside:
 *                   type: boolean
 *                   description: Indicates if the interest is an outdoor activity
 *       400:
 *         description: Missing name, inside, or outside fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error creating interest
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
router.post("/interests", async (req, res) => {
  const { name, inside, outside } = req.body;

  if (!name || inside === undefined || outside === undefined) {
    return res
      .status(400)
      .json({ message: "Name, inside, and outside are required" });
  }

  try {
    const newInterest = await db("interests")
      .insert({ name, inside, outside })
      .returning("*");
    res.status(201).json(newInterest[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating interest", error });
  }
});

export default router;
