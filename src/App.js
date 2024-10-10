import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQdZ9noxYd13q_rTcNw7Zal8bhyR8o30vDoLehvCjvfgnJFoE5bECImLSUdBuHnGT8SWkV95sgmVeo_/pub?gid=0&single=true&output=csv';
const SERVER_ADDRESS = 'https://1d6e1e6c9b65.ngrok.app'; 

function App() {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
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
    const rows = data.split('\n');
    return rows.map(row => {
      const columns = row.split(',');
      return {
        barcode: columns[0].trim(),
        price: `${columns[1].trim()}${columns[2] ? ',' + columns[2].trim() : ''}`, 
        company: columns[3].trim(),
        name: columns[4].trim(),
        weight: columns[5] ? columns[5].trim(): "",
      };
    });
  };

  const handleInputChange = (event) => {
    const inputBarcode = event.target.value;
    const trimmedBarcode = inputBarcode.trim();
    setBarcode(trimmedBarcode);

    if (trimmedBarcode) {
      const foundProduct = products.find(p => p.barcode === trimmedBarcode);
      if (foundProduct) {
        setProduct(foundProduct);
        setError('');
        setTimeout(() => {
          setBarcode('');
        }, 500);
      } else {
        setProduct(null);
        setError('Produkt ikke fundet!');
        setTimeout(() => {
          setBarcode('');
        }, 100);
      }
    }
  };

  const formatPrice = (price) => {
    if (!price) return '';
    let cleanedPrice = price.replace(/[^0-9,]/g, '').trim(); 
    cleanedPrice = cleanedPrice.replace(',', '.');
    return cleanedPrice ? `${cleanedPrice} DKK` : '';
  };

  const sendData = (product) => {
    if (!product) return;
    const priceForPrint = formatPrice(product.price).replace(' DKK', '');

   
  axios.get(SERVER_ADDRESS, {
    params: {
      command: "print",
      company: product.company,
      productName: `${product.name} ${product.weight}`,
      price: priceForPrint,
    },
    
  })
  .then(response => {
    alert("Data sendt til server for print!");
  })
  .catch(error => {
    console.log(error);
    alert("Der opstod en fejl ved afsendelse: " + (error.response ? error.response.data.message : error.message));
  });
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
            <h2>{product.name} {product.weight}</h2>
            <p>Pris: <strong>{formatPrice(product.price)}</strong></p>
            <button className="print-button" onClick={() => sendData(product)}>Print Prisen</button>
          </div>
        ) : (
          error && <p className="error-message">{error}</p>
        )}
      </main>
    </div>
  );
}

export default App;
