const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/reservationmanager', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const reservationSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  date: String,
  time: String,
  numberOfPeople: Number,
  status: { type: String, default: 'Pending' },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

app.use(bodyParser.json());
app.use(express.static('public'));

// CRUD operations
app.post('/reservations', async (req, res) => {
  try {
    const { name, phoneNumber, date, time, numberOfPeople } = req.body;
    const newReservation = new Reservation({ name, phoneNumber, date, time, numberOfPeople });
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find({}, { status: 0 }); // Excluding the 'status' field
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/reservations/:reservationId', async (req, res) => {
  try {
    const reservationId = req.params.reservationId;
    const { status } = req.body;

    console.log('Received data:', reservationId, status);

    const updatedReservation = await Reservation.findOneAndUpdate({ _id: reservationId }, { $set: { status } }, { new: true });

    if (!updatedReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});