import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import eventsRouter from "./routes/events.js";
import groupsRouter from "./routes/groups.js";
import interestsRouter from "./routes/interests.js";
import usersRouter from "./routes/users.js";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();
const port = 9999;

app.use(bodyParser.json());
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use("/api", eventsRouter);
app.use("/api", groupsRouter);
app.use("/api", interestsRouter);
app.use("/api", usersRouter);

//Create new User (name, username, pass) => userid                 -- DONE
//Login (username, pass) => user id                                -- DONE
//Create new Group (name) => 200                                   -- DONE
//Search Users (username) => list of Users                         -- DONE
//Create new GroupMembers (userid, groupid) => 200                 -- DONE
//Add Interest to User (userid, interestid) => 200                 -- DONE
//Create new custom Interest (name, inside, outside, free) => 200  -- DONE
//Create new Event (name, date) => 200                             -- DONE
//Go to Vote page () => List of Interests                          -- DONE
//Submit Vote (list of interestids) => 200                         -- DONE
//Leave group (groupid, userid) => 200                             -- DONE
//Go to profile page (userid) => name, username, list of Interests -- DONE
//Go to groups/home page (userid) => list of Groups                -- DONE
//Go to Group Members page (groupid) => list of Users              -- DONE
//Remove Interest (userid, interestid) => 200                      -- DONE
//Get all Events in Group (groupid) => list of Events              -- DONE
//Opt out of Event (eventId, userId) => 200                        -- DONE
//Implement timer
//Implement vote status -- not-voted, voted, opt-out               -- DONE

app.listen(port, () => {
  console.log("Express demo now listening on localhost: " + port);
});
