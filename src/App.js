import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Importér CSS-filen

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQdZ9noxYd13q_rTcNw7Zal8bhyR8o30vDoLehvCjvfgnJFoE5bECImLSUdBuHnGT8SWkV95sgmVeo_/pub?gid=0&single=true&output=csv';

function App() {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Hent data fra publiceret CSV ved hjælp af axios
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get(SHEET_CSV_URL)
      .then(response => {
        const csvData = response.data;
        const parsedData = parseCSV(csvData);
        setProducts(parsedData);
      })
      .catch(err => {
        console.error('Fejl ved hentning af data fra CSV', err);
        setError('Fejl ved hentning af data fra Google Sheets');
      });
  };

  const parseCSV = (data) => {
    // Split CSV-data på linjeskift

    const rows = data.split('\n');
    console.log(rows)
    return rows.map(row => {
      const columns = row.split(',');
      console.log(columns[2])
      return {
        barcode: columns[0],    // Stregkoden er i kolonne A
        name: columns[4],       // Produktnavnet i kolonne D
        price: `${columns[1].trim()} + "," + ${columns[2] ? columns[2].trim() : ''}`      // Prisen i kolonne B
       
      };
    
    });
  };

  // Håndter tekstinput fra stregkodescanneren
  const handleInputChange = (event) => {
    const inputBarcode = event.target.value;
    const trimmedBarcode = inputBarcode.trim();
    setBarcode(trimmedBarcode);

    if (trimmedBarcode) {
      const foundProduct = products.find(p => p.barcode === trimmedBarcode);
      if (foundProduct) {
        setProduct(foundProduct);
        setError('');
        // Nulstil tekstinput efter vellykket scanning
        setTimeout(() => {
          setBarcode('');  // Nulstil tekstinput
        }, 500);  // Giver lidt tid før nulstilling (kan justeres)
      } else {
        setProduct(null);
        setError('Produkt ikke fundet!');
        setTimeout(() => {
          setBarcode('');  // Nulstil tekstinput
        }, 100);  // Giver lidt tid før nulstilling (kan justeres) 
      }
    }
  };
  const formatPrice = (price) => {
    if (!price) return '';
    let cleanedPrice = price.replace(/[^0-9,]/g, '').trim(); 
    cleanedPrice = cleanedPrice.replace(',', '.');
    return cleanedPrice ? `${cleanedPrice} DKK` : '';
  };
  

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Produkt Søgning</h1>
        <input
          type="text"
          className="barcode-input"
          value={barcode}
          onChange={handleInputChange}
          placeholder="Scan eller indtast stregkode"
          autoFocus
        />
      </header>

      <main className="product-info">
        {barcode && <p className="scanned-barcode">Scannet Stregkode: {barcode}</p>}
        {product ? (
          <div className="product-card">
            <h2>{product.name}</h2>
            <p>Pris: <strong>{formatPrice(product.price)}</strong></p>
          </div>
        ) : (
          error && <h1 className="error-message">{error}</h1>
        )}
      </main>
    </div>
  );
}

export default App;
