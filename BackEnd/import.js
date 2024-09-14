const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2');

// Create connection to MySQL
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'Ayvid@3184',
  database: 'Zomato',  // Ensure the database name matches your setup
});

// Connect to MySQL
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Load CSV data and insert into MySQL
fs.createReadStream('restaurants.csv')
  .pipe(csv({
    mapHeaders: ({ header }) => header.trim()  // Trim headers to match CSV column names
  }))
  .on('data', (row) => {
    const {
      'Restaurant ID': id,
      'Restaurant Name': name,
      'Country Code': country_code,
      'City': city,
      'Address': address,
      'Locality': locality,
      'Locality Verbose': locality_verbose,
      'Longitude': longitude,
      'Latitude': latitude,
      'Cuisines': cuisines,
      'Average Cost for two': avg_cost_for_two,
      'Currency': currency,
      'Has Table booking': has_table_booking,
      'Has Online delivery': has_online_delivery,
      'Is delivering now': is_delivering_now,
      'Switch to order menu': switch_to_order_menu,
      'Price range': price_range,
      'Aggregate rating': aggregate_rating,
      'Rating color': rating_color,
      'Rating text': rating_text,
      'Votes': votes
    } = row;

    const query = `INSERT INTO restaurants (
      id, name, country_code, city, address, locality, locality_verbose,
      longitude, latitude, cuisines, avg_cost_for_two, currency, 
      has_table_booking, has_online_delivery, is_delivering_now, 
      switch_to_order_menu, price_range, aggregate_rating, 
      rating_color, rating_text, votes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(query, [
      id, name, country_code, city, address, locality, locality_verbose,
      longitude, latitude, cuisines, avg_cost_for_two, currency, 
      has_table_booking, has_online_delivery, is_delivering_now, 
      switch_to_order_menu, price_range, aggregate_rating, 
      rating_color, rating_text, votes
    ], (err, res) => {
      if (err) {
        console.error(`Error inserting row with ID ${id}:`, err);
      }
    });
  })
  .on('end', () => {
    console.log('CSV data successfully loaded into MySQL');
    connection.end();
  });
