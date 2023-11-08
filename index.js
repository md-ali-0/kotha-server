import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

const app = express();
const port = process.env.PORT || 8080;

config();
app.use(
    cors({
        origin: ['http://localhost:5173'],
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.daanzm4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
const postCollections = client.db('kothaDB').collection('postCollections');
const commentsCollections = client
    .db('kothaDB')
    .collection('commentsCollections');
const userCollections = client.db('kothaDB').collection('userCollections');
const categoryCollections = client
    .db('kothaDB')
    .collection('categoryCollections');
const wishListCollections = client
    .db('kothaDB')
    .collection('wishListCollections');

app.get('/', (req, res) => {
    try {
        res.send('Kotha Server is running');
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while running server.',
        });
    }
});

app.get('/get-wish-list', async (req, res) => {
    const email = req.query.email;
    try {
        const query = {
            user: email,
        };
        const result = await wishListCollections.find(query).toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching all categories.',
        });
    }
});

app.get('/categories', async (req, res) => {
    try {
        const result = await categoryCollections.find().toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching all categories.',
        });
    }
});

app.get('/category/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id),
        };
        const result = await categoryCollections.findOne(filter);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching category details.',
        });
    }
});
app.get('/blog-by-category/:name', async (req, res) => {
    try {
        const category = req.params.name;
        const filter = {
            category: category,
        };

        const result = await postCollections.find(filter).toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching category details.',
        });
    }
});
app.get('/all-post', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);

        const result = await postCollections
            .find()
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(size)
            .toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching all posts.',
        });
    }
});
app.get('/all-blogs', async (req, res) => {
    const query = req.query;
    let filter = {};
    if (query.email) {
        filter.createdBy = query.email;
    }
    if (query.category) {
        filter.category = query.category;
    }
    if (query.search) {
        const search = { $text: { $search: query.search } };
        filter = { ...filter, ...search };
    }
    try {
        const result = await postCollections.find(filter).toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching all blogs by',
        });
    }
});
app.get('/featured-post', async (req, res) => {
    try {
        const result = await postCollections
            .aggregate([
                {
                    $addFields: {
                        longDescriptionLength: {
                            $strLenCP: '$longDescription',
                        },
                    },
                },
                {
                    $sort: {
                        longDescriptionLength: -1,
                    },
                },
            ])
            .toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching featured posts.',
        });
    }
});

app.get('/post/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id),
        };
        const result = await postCollections.findOne(filter);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching single blog posts.',
        });
    }
});

app.get('/comments', async (req, res) => {
    const postId = req.query.postId;

    try {
        const filter = {
            postId: postId,
        };
        const result = await commentsCollections.find(filter).toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching single blog posts.',
        });
    }
});
app.get('/comment/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const filter = {
            _id: new ObjectId(id),
        };
        const result = await commentsCollections.findOne(filter)
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching single blog posts.',
        });
    }
});

app.post('/add-comment', async (req, res) => {
    try {
        const comment = req.body;
        const result = await commentsCollections.insertOne(comment);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while fetching single blog comment.',
        });
    }
});

app.put('/edit-comment/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id),
        };
        const comment = req.body;
        const updateValue = {
            $set: {
                comment: comment.comment,
            },
        };
        const result = await commentsCollections.updateOne(filter, updateValue);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred updating categories.',
        });
    }
});
app.get('/dashboard-count', async (req, res) => {
    try {
        const postCount = await postCollections.estimatedDocumentCount();
        const categoryCount =
            await categoryCollections.estimatedDocumentCount();
        const userCount = await userCollections.estimatedDocumentCount();
        const commentCount = await commentsCollections.estimatedDocumentCount();
        res.send({ postCount, categoryCount, userCount, commentCount });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while loading dashboard counts.',
        });
    }
});

app.post('/add-category', async (req, res) => {
    try {
        const category = req.body;
        const result = await categoryCollections.insertOne(category);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred while adding categories.',
        });
    }
});

app.put('/edit-category/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id),
        };
        const category = req.body;
        const updateValue = {
            $set: {
                categoryName: category.categoryName,
                categoryDescription: category.categoryDescription,
                categoryKeywords: category.categoryKeywords,
            },
        };
        const result = await categoryCollections.updateOne(filter, updateValue);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'An error occurred updating categories.',
        });
    }
});

app.delete('/delete-category/:id', async (req, res) => {
    const id = req.params.id;
    const filter = {
        _id: new ObjectId(id),
    };
    const result = await categoryCollections.deleteOne(filter);
    res.send(result);
});
app.post('/add-post', async (req, res) => {
    const post = req.body;
    const result = await postCollections.insertOne(post);
    res.send(result);
});

app.put('/edit-post/:id', async (req, res) => {
    const id = req.params.id;
    const updatePost = req.body;
    const filter = {
        _id: new ObjectId(id),
    };
    const updateDoc = {
        $set: {
            title: updatePost.title,
            image: updatePost.image,
            category: updatePost.category,
            shortDescription: updatePost.shortDescription,
            longDescription: updatePost.longDescription,
            updatedAt: updatePost.updatedAt,
        },
    };
    const options = { upsert: true };

    const result = await postCollections.updateOne(filter, updateDoc, options);
    res.send(result);
});
app.delete('/delete-post/:id', async (req, res) => {
    const id = req.params.id;
    const filter = {
        _id: new ObjectId(id),
    };
    const result = await postCollections.deleteOne(filter);
    res.send(result);
});
app.post('/add-user', async (req, res) => {
    const user = req.body;

    const result = await userCollections.insertOne(user);
    res.send(result);
});
app.put('/edit-user', async (req, res) => {
    const user = req.body;

    const filter = {
        email: user.email,
    };
    const values = {
        $set: {
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastSignInTime: user.lastSignInTime,
        },
    };
    const option = {
        upsert: true,
    };
    const result = await userCollections.updateOne(filter, values, option);
    res.send(result);
});

app.post('/add-to-wishlist', async (req, res) => {
    const post = req.body;
    delete post._id
    const result = await wishListCollections.insertOne(post);
    res.send(result);
});

app.delete('/delete-to-wishlist/:id', async (req, res) => {
    const id = req.params.id;
    const filter = {
        _id: new ObjectId(id),
    };
    const result = await wishListCollections.deleteOne(filter);
    res.send(result);
});
app.listen(port, () => {
    console.log(`Listing .... ${port}`);
});
