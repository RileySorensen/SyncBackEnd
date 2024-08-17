const express = require('express')
const path = require('path')
const port = 9999;
const app = express()

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))


app.get("/", (req, res) => {
    res.send("Heyooo")
});


app.listen(port, () => {
    console.log("Express demo now listening on localhost: " + port)
});