// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Tillad CORS fra specifikt domæne
app.use(cors({
  origin: 'https://massirq.github.io/Scan'  // Din frontend URL
}));

app.get('/', (req, res) => {
  // Her skal du implementere print-kommandoen
  const { command, company, productName, price } = req.query;
  if (command === "print") {
    // Logik til print
    console.log(`Printer data for ${productName}: ${price} fra ${company}`);
    res.json({ message: 'Print-kommando modtaget' });
  } else {
    res.status(400).json({ message: 'Ugyldig kommando' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
