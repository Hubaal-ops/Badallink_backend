import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './src/config/db.js'
import authRoutes from './src/routes/authRoutes.js'
import postRoutes from './src/routes/postRoutes.js'


dotenv.config()


const app = express()

const PORT = process.env.PORT || 8000


app.use(cors())
app.use(express.json())

app.use('/api/users', authRoutes)
app.use('/api/posts', postRoutes)



app.listen(PORT, () => {
    console.log(`The app is running on port ${PORT}`,
        connectDB()
    )
})