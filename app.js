const express = require('express')
const path = require('path')
const port = 9999;
const app = express()

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))


/*endpoints to make
    create,get,update,delete person
    create,get,update,delete interests
    create,get,deLete event
    create,get,update,delete group
*/

app.get("/", (req, res) => {
    res.send("Heyooo")
});
//person
app.post("/person",(req,res) =>{
    res.send('create person')
})
app.get("/person/:id",(req,res)=>{
    res.send("get person, id" + req.param('id'))
})
app.put("/person/:id", (req,res) =>{
    res.send("update person, id:" + req.param("id"))

})
app.delete("/person/:id", (req,res)=>{
    res.send("delete person, id:" + req.param("id"))
})

//interests
app.post("/interest", (req,res) =>{
    res.send("create interests")
})
app.get("/interest",(req,res)=>{
    res.send('get all intersests')
})
app.get("/interest/:name",(req,res)=>{
    res.send('get interest, name:' + req.param('name'))
})
app.put('/interest/:name',(req,res)=>{
    res.send('update interest, name:' + req.param('name'))
})
app.delete('/interest/:name',(req,res)=>{
    res.send("delete interest, name:" + req.param('name'))
})

//event
app.post('/event',(req,res)=>{
    res.send('create event')
})
app.get('/event/:id',(req,res)=>{
    res.send('get event, id:' + req.param('id'))
})
app.delete('/event/:id',(req,res)=>{
    res.send('delete event, id:'+ req.param('id'))
})


//group
app.post('/group',(req,res)=>{
    res.send('create group')
})
app.get('/group/:id',(req,res)=>{
    res.send('get group, id:' + req.param('id'))
})
app.put('/group/:id',(req,res)=>{
    res.send('update group, id:' + req.param('id'))
})
app.delete('/group/:id', (req,res)=>{
    res.send('delete group, id:' + req.param('id'))
})



app.listen(port, () => {
    console.log("Express demo now listening on localhost: " + port)
});