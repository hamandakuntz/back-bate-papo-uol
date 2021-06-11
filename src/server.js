import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import { stripHtml } from "string-strip-html";
import joi from 'joi'

const app = express(); 

app.use(cors());
app.use(express.json());

let participants = [];
let messages = [];

app.post("/participants", (req, res) => {
    const { name } = req.body;
    if(name === "") {
        res.sendStatus(400); 
        return            
    } if (participants.find((user) => user.name === name)){       
        res.sendStatus(422);
    } else {
        participants.push({ name, lastStatus: Date.now()});
        messages.push({
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        });
        res.sendStatus(200);
    }   
});

app.get("/participants", (req, res) => {
    res.send(participants);
});

app.get("/messages", (req, res) =>{
    const { limit } = req.query;
    const loggedUser  = req.headers.user; 
    
    const filteredMessages = messages.filter(m => m.to === "Todos" || m.type === "message" || m.type === "status" || m.to === loggedUser || m.from === loggedUser);
    
    if (limit) {        
        res.send(filteredMessages.slice(-limit));
    } else {
        res.send(filteredMessages); 
    }    
});

app.post("/messages", (req, res) => {
    const { to, text, type } = req.body;
    const from  = req.headers.user;  
   
    if ((to && text) === "") {
        res.sendStatus(400);       
        return
    } else if (type !== "message" && type !== "private_message") {
        res.sendStatus(400);        
        return
    } else if (!participants.find(user => user.name === from)) {            
        res.sendStatus(400);        
        return
    } else {
        messages.push({ from, to, text, type, time: dayjs().format('HH:mm:ss')});
        res.sendStatus(200);        
    }    
    
});

app.post("/status", (req, res) => {
    const from = req.headers.user;

    const loggedParticipant = participants.find(user => user.name === from);
    
    loggedParticipant
    ? ((loggedParticipant.lastStatus = Date.now()) && res.sendStatus(200))
    : res.sendStatus(400)      
});

setInterval(() => {
    participants = participants.filter(p => {
        if((Date.now() - p.lastStatus) < 10000){
            return true
        } else {
            messages.push({from: p.name, to: 'Todos', text: 'sai da sala...', type: 'status', time: dayjs().format('HH:mm:ss')})
            return false
        }
    })
}, 15000);

app.listen(4000);