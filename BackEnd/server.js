const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// MySQL connection configuration
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',  // Replace with your MySQL username
  password: 'Ayvid@3184', // Replace with your MySQL password
  database: 'Zomato', // Replace with your database name
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// API Endpoints

// Get restaurant by ID
app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM restaurants WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

// Get list of restaurants with pagination and filtering by cuisine and city
app.get('/restaurants', (req, res) => {
  const { page = 1, limit = 10, cuisine, city } = req.query;
  const offset = (page - 1) * limit;

  // Base query
  let query = 'SELECT * FROM restaurants WHERE 1=1';

  // Add cuisine filter if provided
  if (cuisine) {
    query += ' AND cuisines LIKE ?';
  }

  // Add city filter if provided
  if (city) {
    query += ' AND city = ?';
  }

  // Add pagination
  query += ' LIMIT ?, ?';

  const queryParams = [];

  // Add cuisine parameter if provided
  if (cuisine) {
    queryParams.push(`%${cuisine}%`);
  }

  // Add city parameter if provided
  if (city) {
    queryParams.push(city);
  }

  // Add pagination parameters
  queryParams.push(parseInt(offset), parseInt(limit));

  connection.query(query, queryParams, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Get list of unique cities
app.get('/city-options', (req, res) => {
  connection.query('SELECT DISTINCT city FROM restaurants WHERE city IS NOT NULL AND city != ""', (err, results) => {
    if (err) return res.status(500).json(err);

    // Log the raw results for debugging
    console.log('Raw results:', results);

    // Extract city names and remove duplicates
    const cities = results.map(row => row.city);
    
    // Sort the cities array alphabetically
    const uniqueCities = [...new Set(cities)].sort();

    res.json({ cities: uniqueCities });
  });
});



// Search restaurants by location (latitude/longitude within a radius)
app.get('/restaurants/nearby', (req, res) => {
  const { lat, long, radius } = req.query;
  const query = `
    SELECT *, 
    ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance 
    FROM restaurants 
    HAVING distance < ? 
    ORDER BY distance 
    LIMIT 0, 20;
  `;
  connection.query(query, [lat, long, lat, radius], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/filter-options', (req, res) => {
  connection.query('SELECT DISTINCT cuisines FROM restaurants', (err, results) => {
    if (err) return res.status(500).json(err);

    // Log the raw results for debugging
    console.log('Raw results:', results);

    // Handle cases where cuisines could be a single item or a comma-separated list
    const cuisines = results.flatMap(row => {
      // Split the cuisines string by commas, if present, or use it as a single-item array
      return row.cuisines.split(',').map(cuisine => cuisine.trim());
    });

    // Log the intermediate cuisines array for debugging
    console.log('Cuisines array:', cuisines);

    // Remove duplicates and send response
    const uniqueCuisines = [...new Set(cuisines)];
    res.json({ cuisines: uniqueCuisines });
  });
});



// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
