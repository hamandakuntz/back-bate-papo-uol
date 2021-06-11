import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';

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
        res.send(filteredMessages.slice(0, limit));
    } else {
        res.send(filteredMessages); 
    }    
});

app.post("/messages", (req, res) => {
    const { to, text, type } = req.body;
    const from  = req.headers.user;  
   
    if ((to && text) === "") {
        res.sendStatus(400);
        console.log("primeiro caso")
        return
    } else if (type !== "message" && type !== "private_message") {
        res.sendStatus(400);
        console.log("segundo caso")
        return
    } else if (!participants.find(user => user.name === from)) {
        console.log(participants)       
        res.sendStatus(400);
        console.log("terceiro caso")
        return
    } else {
        messages.push({ from, to, text, type, time: dayjs().format('HH:mm:ss')});
        res.sendStatus(200); 
        console.log("enviado com sucesso")
    }    
    
});

app.post("/status", (req, res) => {
    const from = req.headers.user;
    if(participants.find(user => user.name !== from)){
        res.sendStatus(400);
        console.log("nao ta na lista de participantes")
        return
    } else {
        participants.push({ from, lastStatus: Date.now()});
        res.sendStatus(200);
    }
});

app.listen(4000, () => console.log("server rodando na 4000") );