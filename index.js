import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Kotha Server is running');
});

app.listen(port, () => {
    console.log(`Listing .... ${port}`);
});
