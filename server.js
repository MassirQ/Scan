const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'https://massirq.github.io/Scan',
}));

function authentication(req, res, next) {
  const authheader = req.headers.authorization;

  if (!authheader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json({ message: 'You are not authenticated!' });
  }

  const auth = Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  if (user === 'QB' && pass === 'QB123456') {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json({ message: 'You are not authenticated!' });
  }
}


app.get('/', authentication, (req, res) => {
  const { command, company, productName, price } = req.query;

  if (command === "print") {
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
