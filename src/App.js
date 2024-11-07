import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './App.css'; 
import debounce from 'lodash.debounce'


const SERVER_ADDRESS = 'https://e6629e807d13.ngrok.app'; 


function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productWeight, setProductWeight] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [error, setError] = useState('');
  const [successMessage,setSuccessMessage] = useState('');

  const switchTab = (tab) => {
    setActiveTab(tab);
    setBarcode('');
    setProductName('');
    setProductBrand('');
    setProductWeight('');
    setRetailPrice('');
    setProduct(null);
    setError('');
  };
  const fetchProduct = useCallback(
    debounce((barcode) => {
      if (!barcode) {
        setProduct(null);
        setError('Indtast venligst en stregkode.');
        return;
      }
  
      axios.get(`https://scan.interpos.dk/api/product/${barcode}`)
        .then(response => {
          console.log('Serverrespons:', response.data);
          const foundProduct = response.data[0];
          setBarcode('');
  
          if (response.status === 200 && foundProduct) {
            setProduct(foundProduct);
            setError('');
            
          } else if (response.status === 404) {
            setProduct(null);
            setError('Produkt ikke fundet!');
          } else {
            setProduct(null);
            setBarcode('');
            setError('Ukendt fejl opstod.');
          }
        })
        .catch(err => {
          console.error('Fejl ved hentning af produktdata', err);

          if (err.response) {
            setError(`Server fejl: ${err.response.status} - ${err.response.data}`);
          } else {
            setError('Der opstod en fejl ved hentning af produktet. Kontroller din internetforbindelse.');
          }
          setProduct(null);
          setBarcode('');
        });
    }, 150), 
    []
  );
  
  const handleInputChange = (event) => {
    const inputBarcode = event.target.value.trim();
    setBarcode(inputBarcode);
    if (inputBarcode) {
      fetchProduct(inputBarcode);
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
    const priceForPrint = formatPrice(product.retailPrice).replace(' DKK', '');

    axios.get(SERVER_ADDRESS, {
      params: {
        command: "print",
        company: product.brandName,
        productName: `${product.productName} ${product.productWeight}`,
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

  const addProduct = () => {
    axios.post(`https://scan.interpos.dk/api/products`, {
      barcode,
      productBrand,
      productName,
      productWeight,
      retailPrice
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      setSuccessMessage('Produkt tilføjet succesfuldt med ID: ' + response.data.productId);
      setError('');
      setBarcode('');
      setProductBrand('');
      setProductName('');
      setProductWeight('');
      setRetailPrice('');
    })
    .catch(err => {
      console.error('Fejl ved tilføjelse af produkt:', err);
      if (err.response) {
        setError(`Fejl ved tilføjelse af produkt: ${err.response.status} - ${err.response.data}`);
      } else if (err.request) {
        setError('Ingen respons fra serveren. Kontroller din serverforbindelse.');
      } else {
        setError(`Anmodningsfejl: ${err.message}`);
      }
      setSuccessMessage('');
      
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Produkt Søgning og Tilføjelse</h1>
  
        <div className="tabs">
          <button onClick={() => switchTab('search')} className={activeTab === 'search' ? 'active' : ''}>Søg Produkt</button>
          <button onClick={() => switchTab('add')} className={activeTab === 'add' ? 'active' : ''}>Registrer Produkt</button>
        </div>
      </header>

      <main className="product-info">
      {successMessage && <p className="success-message">{successMessage}</p>}
        {activeTab === 'search' ? (
          <div>
            <input
              type="text"
              className="barcode-input"
              value={barcode}
              onChange={handleInputChange}
              placeholder="Scan eller indtast stregkode"
              autoFocus
            />
            {barcode && <p className="scanned-barcode">Scannet Stregkode: {barcode}</p>}
            {product ? (
              <div className="product-card">
                <h2>{product.productName} {product.productWeight}</h2>
                <p>Pris: <strong>{formatPrice(product.retailPrice)}</strong></p>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.productName} className="product-image" width={150} height={150} />
                )}
                <button className="print-button" onClick={() => sendData(product)}>Print Prisen</button>
              </div>
            ) : (
              error && <p className="error-message">{error}</p>
            )}
          </div>
        ) : (
          <div className="add-product-form">
            
            <h2>Tilføj Nyt Produkt</h2>
            <input
              type="text"
              placeholder="Stregkode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
            <input
              type="text"
              placeholder="Produkt brand"
              value={productBrand}
              onChange={(e) => setProductBrand(e.target.value)}
            />
            <input
              type="text"
              placeholder="Produktnavn"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Produkt weight"
              value={productWeight}
              onChange={(e) => setProductWeight(e.target.value)}
            />
            <input
              type="text"
              placeholder="Pris"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
            />
                  {error && <p className="error-message">{error}</p>}

            <button className="add-product-button" onClick={addProduct}>Tilføj Produkt</button>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
