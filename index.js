import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';

const app = express();
const port = process.env.PORT || 8080;

config();
app.use(cors(
    {
        origin: ['http://localhost:5173'],
        credentials: true
    }
));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.daanzm4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri,{
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
})
const userCollections = client.db('kothaDB').collection('userCollections')
const categoryCollections = client.db('kothaDB').collection('categoryCollections')

app.get('/', (req, res) => {
    res.send('Kotha Server is running');
});

app.post('/add-category', async(req,res)=>{
    const category = req.body
    const result = await categoryCollections.insertOne(category)
    res.send(result)
})
app.post('/add-user', async (req,res)=>{
    const user = req.body;

    // const isUserExits = await userCollections.findOne({email: user.email})
    // if (isUserExits) {
    //     return res.status(400).send('User Already Exits')
    // }

    const result = await userCollections.insertOne(user)
    res.send(result)
})
app.put('/edit-user', async (req,res)=>{
    const user = req.body;

    const filter = {
        email: user.email,
    }
    const values = {
        $set: {
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastSignInTime: user.lastSignInTime,
        },
    }
    const option = {
        upsert: true
    }
    const result = await userCollections.updateOne(filter, values, option)
    res.send(result)
})

app.listen(port, () => {
    console.log(`Listing .... ${port}`);
});
