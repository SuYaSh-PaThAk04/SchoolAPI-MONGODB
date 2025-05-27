import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import School from './Model/Schools.models.js';
import { haversineDistance } from './Utils/Distfcn.js';

dotenv.config();
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// POSTSCHOOLS
app.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    await School.create({ name, address, latitude, longitude });
    res.status(201).json({ message: 'School added successfully' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

//GETSCHOOLS
app.get('/listSchools', async (req, res) => {
  const lat = parseFloat(req.query.latitude);
  const lng = parseFloat(req.query.longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    const schools = await School.find();
    const sorted = schools
      .map(school => ({
        ...school.toObject(),
        distance: haversineDistance(lat, lng, school.latitude, school.longitude),
      }))
      .sort((a, b) => a.distance - b.distance);

    res.json(sorted);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
