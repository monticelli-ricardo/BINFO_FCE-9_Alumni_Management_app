// server.js
import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from 'redis';

// Server-side app using Express framework
const app = express();
const port = 8081;

// Redis client connection configuration
const redisClient = createClient({
  host: 'redis',
  port: 6379,
});

// Middleware to log incoming requests
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});
// Serve client-side static assets from the "public" directory
app.use(express.static(new URL('public', import.meta.url).pathname));

// Student object Flyweight
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
app.post('/students', (req, res) => {
  const { id, name, employers, start_date, end_date, description } = req.body;
  const student = new Student(id, name, employers, start_date, end_date, description);
  const studentData = JSON.stringify(student);

  redisClient.set(id, studentData, (err) => {
    if (err) throw err;
    res.json({ success: true, message: 'Student created successfully' });
  });
});

// API to update a student
app.put('/students/:id', (req, res) => {
  const { id } = req.params;
  const { name, employers, start_date, end_date, description } = req.body;
  const student = new Student(id, name, employers, start_date, end_date, description);
  const studentData = JSON.stringify(student);

  redisClient.set(id, studentData, (err) => {
    if (err) throw err;
    res.json({ success: true, message: 'Student updated successfully' });
  });
});

// API to delete a student
app.delete('/students/:id', (req, res) => {
  const { id } = req.params;

  redisClient.del(id, (err) => {
    if (err) throw err;
    res.json({ success: true, message: 'Student deleted successfully' });
  });
});

// API to get a student by ID
app.get('/students/:id', (req, res) => {
  const { id } = req.params;

  redisClient.get(id, (err, data) => {
    if (err) throw err;
    const student = JSON.parse(data);
    res.json(student);
  });
});

// API to get students by name
app.get('/students/name/:name', (req, res) => {
  const { name } = req.params;
  const matchingStudents = [];

  redisClient.keys('*', (err, keys) => {
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
});

app.listen(port, () => {
  console.log(`[JS app] Server running at http://localhost:${port}`);
});
