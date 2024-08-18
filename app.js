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

/*endpoints to make
    create,get,update,delete person
    create,get,update,delete interests
    create,get,deLete event
    create,get,update,delete group
*/

//Create new User (name, username, pass) => userid
//Check unique username () => true/false
//Login (username, pass) => user id
//Create new Group (name) => 200
//Search Users (username) => list of Users
//Create new GroupMembers (userid, groupid) => 200
//Add Interest to User (userid, interestid) => 200
//Create new custom Interest (name, inside, outside, free) => 200
//Create new Event (name, date) => 200
//Go to Vote page () => List of Interests
//Submit Vote (list of interestids) => 200
//Leave group (groupid, userid) => 200
//Go to profile page (userid) => name, username, list of Interests
//Go to groups/home page (userid, groupid) => list of Groups, list of Events
//Go to Group Members page (groupid) => list of Users

// app.get("/", async (req, res) => {
//   const { data, error } = await supabase.from("Users").select();
//   console.log(data);
//   res.send(data);
// });
// //person
// app.post("/person", (req, res) => {
//   res.send("create person");
// });
// app.get("/person/:id", (req, res) => {
//   res.send("get person, id" + req.param("id"));
// });
// app.put("/person/:id", (req, res) => {
//   res.send("update person, id:" + req.param("id"));
// });
// app.delete("/person/:id", (req, res) => {
//   res.send("delete person, id:" + req.param("id"));
// });

// //interests
// app.post("/interest", (req, res) => {
//   res.send("create interests");
// });
// app.get("/interest", (req, res) => {
//   res.send("get all intersests");
// });
// app.get("/interest/:name", (req, res) => {
//   res.send("get interest, name:" + req.param("name"));
// });
// app.put("/interest/:name", (req, res) => {
//   res.send("update interest, name:" + req.param("name"));
// });
// app.delete("/interest/:name", (req, res) => {
//   res.send("delete interest, name:" + req.param("name"));
// });

// //event
// app.post("/event", (req, res) => {
//   res.send("create event");
// });
// app.get("/event/:id", (req, res) => {
//   res.send("get event, id:" + req.param("id"));
// });
// app.delete("/event/:id", (req, res) => {
//   res.send("delete event, id:" + req.param("id"));
// });

// //group
// app.post("/group", (req, res) => {
//   res.send("create group");
// });
// app.get("/group/:id", (req, res) => {
//   res.send("get group, id:" + req.param("id"));
// });
// app.put("/group/:id", (req, res) => {
//   res.send("update group, id:" + req.param("id"));
// });
// app.delete("/group/:id", (req, res) => {
//   res.send("delete group, id:" + req.param("id"));
// });

app.listen(port, () => {
  console.log("Express demo now listening on localhost: " + port);
});
