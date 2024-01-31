# Alumni_Management_App
 Docker-based Application NGINX (Proxy) - Node.js (Server) - Redis (Database)

## Description
This Docker based web-application that provides a solution to an Alumni Management System.
It let's the user create / edit or update / delete / show BINFO-CEP alumni contact information. A "BINFO-CEP alumni" object has (at least) a unique ID, a person name, the information about the current and possibly past employers, study start and end dates and a short description. All these objects are stored within a Redis DB.  

### How?
### A landing page with several operations: 

* __Register student__, this feature allows the user to add an student into the system using a registration form and a submit button.

* __Check student__, this feature allows to search students by names. With the result the user could update or delete the selected student from the table output displayed in the screen.

* __Total number of students registered__, this feature checks how many students are registered in the system and display the output in the screen.

* __List all registered students__, this feature offers the possibility to users to list all available studented registered in the system.


### Systems messages raised based on specific events:

* Succesful operation.

* Failed operation.

* No students are registered, or the database is empty.

* Student not found based on the provided student ID.

* The form is incomplete during the student creation, update, or removal. 


### Create a new student in the system:

      1.- The user selects the `Register Student` operation.

      2.- The system displays registration form where all the fields (student parameters) are required except for: {"employer" parameter (optional), "studentID" parameter}.

      3.- The user adds the student information to the form and submits it to the system via function `createStudent()`, a POST API call. 

      4.- The system receives the request and its parameters, it validates it has all necessary information from the user.

      5.- The system generates the student ID using the UUID library function `uuidv4()`, this value will be also used as Redis DB Key for the same student object.

      6.- The system sets the information into the Redis DB, with a Redis set operation `redisClient.set(id, studentData)` where the `id` is the Key and `studentData` is the value.

      7.- The system replies with the result of the DB operation


### Remove a student from the system,

      1.- The user looks for the student using the operation `Check Student`.

      2.- The user provides a name and submit its with the function _'checkStudent()'_ via API GET method.

      3.- The system searches in the DB for all the students with `student.name` similar to the user provided value and returns them in a table displayed in screen.

      4.- The user navigates the table for the concerned the student and clicks on the delete button that will trigger the function: `deleteStudent(id)` via API DELETE method.

      5.- The system receives the student ID and performs a Redis delete operation: `redisClient.del(id)`.

      6.- The system notifies the use with the result of the DB operation.

      7.- The system resets the form.


### Update a student in the system:

      1.- The user looks for the student using the operation `Check Student`.

      2.- The user provides a name and submit its with the function _'checkStudent()'_ via API GET method.

      3.- The system searches in the DB for all the students with `student.name` similar to the user provided value and returns them in a table displayed in screen.

      4.- The user navigates the table for the concerned the student and clicks on the update button that will trigger the function: `updateStudent(id)` via API PUT method.

      5.- The system receives the student ID, validates the student exists and performs a Redis set operation: `redisClient.set(id, JSON.stringify(updatedStudent))` where the `id` is the key and the `JSON.stringify(updatedStudent)` is the value.

      6.- The system notifies the use with the result of the DB operation.


## Instalation steps

    1.- Unzip the packege file

    2.- Install all the Node.js dependecies ( npm install ) in the subdirectory "./node.js".

    3.- Build the Docker-Compose stack ( docker-compose up --build -d ) .

    4.- Test the application going to "http://localhost:8080/" .


## Potential Application Upgrades

Improve the search operation, an optional solution is to use RedisSearch Module instead of getting all Redis keys ( _redisClient.keys('*')_ ).

- [ ]  Update Redis Dockerfile, to install RedisSearch Module and add it to the server start.
- [ ]  Code a JS function ( _createRedisSearchIndex()_ and _redisClient.ft.create('indexName', 'indexSchema', 'dataTypeIndexing', 'indexPrefixes')_ ), to create a Redis Index and call it.
- [ ]  Update the API to GET students by name parameter, replacing _redisClient.keys(*)_ by _redisClient.ft.search('IndexName', '@name:${name}*')_ .
- [ ]  Update the API to POST students, ensuring the _'indexName',_ is used as parameter when the student is going to be added.
- [ ]  Update the API to PUT students, ensuring the _'indexName',_ is used as parameter when the student is updated.

Improve the Student parameters
- [ ] For example adding specific parameters like: {School Department, Age, Sex, last_update, etc.}

Improve the search operation

- [ ] Another potential solution is to group students (Redis keys) into sets, lists, or sorted sets based on certain student parameter.