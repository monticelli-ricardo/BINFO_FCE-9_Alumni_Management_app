// server.js

const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');

const app = express();
const port = 8081;

// Redis client connection configuration
const redisClient = redis.createClient({
  host: 'redis',
  port: 6379,
});

app.use(bodyParser.json());

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

app.listen(port, () => {
  console.log(`[JS app] Server running at http://localhost:${port}`);
});
