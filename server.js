// server.js

const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://baba:baba123@cluster0.gaaho0t.mongodb.net/audios', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Define Mongoose schema for Audio
const audioSchema = new mongoose.Schema({
    filename: String,
    data: Buffer
}, { collection: 'audiolist' }); // Specify the collection name

// Define Mongoose model
const Audio = mongoose.model('Audio', audioSchema);


const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        await Audio.create({
            filename: req.file.originalname,
            data: req.file.buffer
        });

        res.json({ message: 'Audio uploaded successfully' });
    } catch (error) {
        console.error('Error saving audio to database:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Modify to return only filenames
app.get('/api/audio', async (req, res) => {
    try {
        const audioFiles = await Audio.find({}, 'filename'); // Select only filename
        res.json(audioFiles);
    } catch (error) {
        console.error('Error fetching audio filenames from database:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch song by ID when filename is clicked
app.get('/api/audio/:id', async (req, res) => {
    try {
        const audio = await Audio.findById(req.params.id);
        if (!audio) {
            return res.status(404).json({ message: 'Audio not found' });
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(audio.data);
    } catch (error) {
        console.error('Error fetching audio:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
