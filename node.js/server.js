// server.js
import express from 'express';
import bodyParser from 'body-parser';
import redis from 'redis';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 from uuid library

// Server-side app using Express framework
const app = express();
const port = 8081;

// Redis client connection configuration
const redisClient = redis.createClient({
  url: 'redis://redis:6379',
  password: 'YourStrongPassword'
});

// Check Redis client connection
redisClient.on('connect', (err)=>{
  if(err) throw err;
  else console.log('[JS app] Redis Client Connected!');
});


app.use(bodyParser.json());

// Serve client-side static assets from the "public" directory
app.use(express.static(new URL('public', import.meta.url).pathname));

// Student class
class Student {
  constructor(id, name, employers, start_date, end_date, description) {
    this.id = id;
    this.name = name;
    this.employers = employers;
    this.start_date = start_date;
    this.end_date = end_date;
    this.description = description;
  }
}


// API to create a new student
app.post('/students', async (req, res) => {
  // Collecting the student parameters from the Client-side request
  const { name, description, employers, start_date, end_date} = req.body;

  // In case the request is incomplete, reject the operation
  if (!name || !start_date || !end_date || !description) {
    return res.status(503).json({ success: false, message: 'Incomplete data. Please provide all required fields.' });
  }

  // Generate a unique ID using uuid
  const id = uuidv4();
  // Generating a new student object
  const student = new Student(id, name, employers, start_date, end_date, description);
  const studentData = JSON.stringify(student);
  console.log(`[JS app] New student object to add: `, studentData);
  
  // Connect to Redis DB to inject the data 
  await redisClient.connect();
  // Check if the Redis client is ready before setting the data
  if (redisClient.status === 'ready') {
    await redisClient.set(studentData, (err) => {
      if (err) { // Notify about the error
        console.error('Error storing student data in Redis:', JSON.stringify(err));
        return res.status(500).json({ success: false, message: 'Internal server error' });
      } // Notify about succesfull creation
      res.json({ success: true, message: 'Student created successfully' });
    });
  } else { // Notify about DB connection error
    res.status(500).json({ success: false, message: 'Unable to connect to the database' });
  }
  // Disconnect from the Redi DB
  await redisClient.disconnect();
});



// API to update a student
app.put('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { name, employers, start_date, end_date, description } = req.body;
  const student = new Student(id, name, employers, start_date, end_date, description);
  const studentData = JSON.stringify(student);

  // Connect to Redis DB to inject the data 
  await redisClient.connect();
  await redisClient.set(studentData, (err) => {
    if (err) throw err;
    res.json({ success: true, message: 'Student updated successfully' });
  });
  // Disconnect from the Redis DB
  await redisClient.disconnect();
});

// API to delete a student
app.delete('/students/:id', async (req, res) => {
  const { id } = req.params;

  // Connect to Redis DB to inject the data 
  await redisClient.connect();
  await redisClient.del(id, (err) => {
    if (err) throw err;
    res.json({ success: true, message: 'Student deleted successfully' });
  });
  // Disconnect from the Redis DB
  await redisClient.disconnect();
});

// API to get a student by ID
app.get('/students/:id', async (req, res) => {
  const { id } = req.params;

  // Connect to Redis DB to inject the data 
  await redisClient.connect();
  await redisClient.get(id, (err, data) => {
    if (err) throw err;
    const student = JSON.parse(data);
    res.json(student);
  });
  // Disconnect from the Redis DB
  await redisClient.disconnect();
});

// API to get students by name
app.get('/students/name/:name', async (req, res) => {
  const { name } = req.params;
  const matchingStudents = [];

  // Connect to Redis DB to inject the data 
  await redisClient.connect();
  await redisClient.keys('*', (err, keys) => {
    if (err) throw err;

    keys.forEach(key => {
      redisClient.get(key, (err, data) => {
        if (err) throw err;
        const student = JSON.parse(data);

        // Check if the student's name matches the provided name
        if (student.name === name) {
          matchingStudents.push(student);
        }

        // Send the response once all keys are processed
        if (keys.indexOf(key) === keys.length - 1) {
          res.json(matchingStudents);
        }
      });
    });
  });
  // Disconnect from the Redis DB
  await redisClient.disconnect();
});

// Handle unhandled requests
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Request not handled.' });
});

// Start the server
app.listen(port, () => {
  console.log(`[JS app] Server running at http://localhost:${port}`);
});
