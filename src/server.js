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

app.listen(4000, () => console.log("server rodando na 4000") );