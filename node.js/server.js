// server.js
import express from 'express';
import bodyParser from 'body-parser';
import {AggregateSteps, AggregateGroupByReducers, createClient, SchemaFieldTypes} from 'redis';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 from uuid library


// Server-side app using Express framework
const app = express();
const port = 8081;

// Redis client connection configuration
const redisClient = createClient({
  url: 'redis://redis:6379',
  // host: 'redis',
  // port: 6379,
  password: 'YourStrongPassword',
  maxRetriesPerRequest: 5, // Number of times a request (e.g., command) should be retried
  enableReadyCheck: true, // Enable the ready check. Defaults to `false`.
  enableAutoPipelining: true, // Enable auto-pipelining for multiple commands (non-blocking).
  connectionName: 'mymaster', // Specify the name for the connection.
  // ... other options
});

// Check Redis client connection
redisClient.on('connect', (err)=>{
  if(err) throw err;
  else console.log('[JS app] Redis Client Connected!');
});
// Connect to Redis DB
await redisClient.connect();

app.use(bodyParser.json());

// Serve client-side static assets from the "public" directory
app.use(express.static(new URL('public', import.meta.url).pathname));

// Student class
class Student {
  constructor(id, name, description, employers, start_date, end_date) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.employers = employers;
    this.start_date = start_date;
    this.end_date = end_date;
    // more properties if needed
  }
}

// API to CREATE a new student based on user input
app.post('/students', async (req, res) => {

  const { name, description, employers, start_date, end_date} = req.body;

  // Validate required fields
  if (!name || !start_date || !end_date || !description) {
    return res.status(400).json({ success: false, message: 'Incomplete data. Please provide all required fields.' });
  }
  console.log('[JS app] CREATE student request received'); // Debugging line
  // Generate a unique ID using uuid
  const id = uuidv4();

  // Generating a new student object
  const student = new Student(id, name, description, employers, start_date, end_date);
  const studentData = JSON.stringify(student);
  console.log('[JS app] New student object to add: ', studentData); // Debugging line

  try {
    // Setting the new student into the Database under the Index
    if(await redisClient.set(id, studentData)){
      // Notify the user about successfull operation.
      res.json({ success: true, message: 'Student created successfully.' });
      console.log('[JS app] Student created successfully.'); // Debugging line
    } else{
      res.json({ success: false, message: 'Create student operation failed.' });
      console.log('[JS app] CREATE student operation failed.'); // Debugging line
    }

  } catch (error) { // Error handling
    console.log('[JS app] Error creating student: ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API to UPDATE a student by ID parameter
app.put('/students/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, employers, start_date, end_date } = req.body;
    console.log('[JS app] Update operation started. Newly input information: ', req.body); // Debugging line

    // Fetch existing student
    console.log('[JS app] Looking student by ID: ', id); // Debugging line
    const studentData = await redisClient.get(id);
    // Validation step
    if (!studentData) {
      console.log('[JS app] Student updated failed. Student not found.'); // Debugging line
      return res.status(404).json({ success: false, message: 'Student not found' });
    } 
    const existingStudent = JSON.parse(studentData);
    console.log('[JS app] Student to update found: ', existingStudent); // Debugging line
    
    // Create an UPDATEd student object
    const tempStudent = new Student(
      id,
      // The ternary operator (`? :`) checks whether each property of the req.body is null or undefined and assigns the appropriate value accordingly
      name !== null ? name : existingStudent.name,
      description !== null ? description : existingStudent.description,
      employers !== null ? employers : existingStudent.employers,
      start_date !== null ? start_date : existingStudent.start_date,
      end_date !== null ? end_date : existingStudent.end_dated
      // more properties if needed
    );
    const updatedStudent = JSON.stringify(tempStudent);
    console.log('[JS app] Updated Student to set: ', updatedStudent); // Debugging line

    //Update Operation, overwritte values for the same Key(ID)  
    if(await redisClient.set(id, updatedStudent)){

      // Notify the user about successful operation
      res.json({ success: true, message: 'Student updated successfully', tempStudent});
      console.log('[JS app] Response back to client: ', tempStudent); // Debugging line
      console.log('[JS app] Student updated successfully.'); // Debugging line
      
    } else {
      // Notify the user about UNsuccessful operation
      console.log('[JS app] Update operation failed.'); // Debugging line
      return res.status(500).json({ success: false, message: 'Internal server error. Update operation failed.' });
    }
    

  } catch (error) { // Error handling
    console.error('Error updating student:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API to DELETE a student by ID paramenter
app.delete('/students/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[JS app] Delete operation started.'); // Debugging line

    // Fetch existing student
    console.log('[JS app] Looking student by ID: ', id); // Debugging line
    const studentData = await redisClient.get(id);
    // Validation step
    if (!studentData) {
      console.log('[JS app] Student updated failed. Student not found.'); // Debugging line
      return res.status(404).json({ success: false, message: 'Student not found' });
    } 
    const existingStudent = JSON.parse(studentData);
    console.log('[JS app] Student found: ', existingStudent); // Debugging line

    // Delete Operation, delete student from Redis database
    if(await redisClient.del(existingStudent.id)){
      //Notify the user about the successful operation
      res.json({ success: true, message: 'Student deleted successfully.', existingStudent });
      console.log('[JS app] Student deleted successfully.'); // Debugging line
    } else { // Notify the user about the UNsuccessful operation
      res.json({ success: false, message: 'Delete operation failed.'});
      console.log('[JS app] Delete operation failed.'); // Debugging line
    }


  } catch (error) {
    console.error('Error deleting student:', error.message);
    console.log('[JS app] Delete operation failed.' , error); // Debugging line
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API to GET a student by ID parameter
app.get('/students/getId/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[JS app] GET operation started.'); // Debugging line
    // Fetch existing student
    console.log('[JS app] Looking student by ID: ', id); // Debugging line
    const studentData = await redisClient.get(id);
    // Validation step
    if (!studentData) {
      console.log('[JS app] Student updated failed. Student not found.'); // Debugging line
      return res.status(404).json({ success: false, message: 'Student not found' });
    } 
    const existingStudent = JSON.parse(studentData);
    console.log('[JS app] Student found: ', existingStudent); // Debugging line
    res.json(existingStudent);

  } catch (error) {
    console.error('Error getting student:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API to GET students by name parameter
app.get('/students/getNames/:name', async (req, res) => {
  const { name } = req.params;
  const matchingStudents = []; // Response initialized
  console.log(`[JS app] Look up by [ ${name} ] request received.`); // Debugging line 
  
  try {
    // Get all Keys from Redis, not the most efficient operation
    const keys = await redisClient.keys('*');

    // Validation step
    if(keys === null || keys === undefined || keys.length < 1){ 
      console.log('[JS app] Search Operation failed. The system DB might be empty.'); // Debugging line
       return res.status(500).json({ success: false, message: 'Search Operation failed. The system DB might be empty.' });
    } else {
      // iterate over the keys to pass only the candidates
      for (const key of keys) {
        // Pick a student from the Redis DB
        const data = await redisClient.get(key);
        const student = JSON.parse(data);
  
        // Check if the student's name matches the regex pattern
        const searchPattern = new RegExp(name, 'i'); // 'i' makes the regex case-insensitive
        if (searchPattern.test(student.name)) {
            console.log('[JS app] Potential students found.'); // Debugging line
            matchingStudents.push(student);
        }
      }
    }
    
    // Return matching students to the client
    res.json(matchingStudents);
    console.log('[JS app] Response back to client: ', matchingStudents); // Debugging line
 
  } catch (error) {
    console.error('Error retrieving students by name from Redis:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API to GET All registed students by name parameter
app.get('/students/getAllStudents/', async (req, res) => {

  const allStudents = []; // Response initialized
  console.log(`[JS app] Look up all students request received.`); // Debugging line 
  
  try {
    // Get all Keys from Redis, not the most efficient operation
    const keys = await redisClient.keys('*');

    // Validation step
    if(keys === null || keys === undefined || keys.length < 1){ 
      console.log('[JS app] Search Operation failed. The system DB might be empty.'); // Debugging line
       return res.status(500).json({ success: false, message: 'Search Operation failed. The system DB might be empty.' });
    } else {
      // iterate over the keys to pass only the candidates
      for (const key of keys) {
        // Pick a student from the Redis DB
        const data = await redisClient.get(key);
        const student = JSON.parse(data);
        allStudents.push(student);
      }
    }
    
    // Return matching students to the client
    res.json(allStudents);
    console.log('[JS app] Response back to client: "allStudents" array'); // Debugging line
 
  } catch (error) {
    console.error('Error retrieving students by name from Redis:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API to get the total number of registered students
app.get('/students/total', async (req, res) => {
  try {
    console.log('[JS app] Getting the total number of registered students.'); // Debugging line
    // Use a Redis command to get the total number of keys (students)
    const totalStudents = await redisClient.dbSize();
    if(!totalStudents || totalStudents === 0){ // Notify the user in case of UNsuccessful operation
      console.log('[JS app]  Error getting total students, the DB might be empty.');
      return res.status(500).json({ success: false, message: 'Internal server error , the DB might be empty.' });
    }
    // Notify the user in case of successful operation
    console.log('[JS app] Total numbered of registered students: ' , totalStudents); // Debugging line
    return res.json({ success: true, totalStudents });

  } catch (error) {
    console.error('Error getting total students:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Handle unhandled requests
app.use((req, res) => {
  res.status(500).json({ success: false, message: 'Request not handled.' });
});


// Start the server
app.listen(port, () => {
  console.log(`[JS app] Server running at http://localhost:${port}`);
});
