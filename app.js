const express = require('express');
const bodyParser= require('body-parser');

const app = express();

app.use(bodyParser.json())

//endpoint
app.get('/',(req,res,next)=>{
    res.send('Hello world');
})

app.listen(4000,()=>console.log("server is runnin on port of 4000"))