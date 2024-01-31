// main.js
// Frontend side using Vue.js framework
new Vue({
    el: '#app',
    data: {
        Message: '',
        createStudentFormVisible: false,
        checkStudentSectionVisible: false,
        showAllStudentsSectionVisible: false,
        newStudent: {
            name: '',
            description: '',
            employers: '',
            start_date: '',
            end_date: ''
            // Add other properties here
        },
        checkStudentNameForm: '',
        studentDataList: [],  // Array to store the list of students 
        selectedStudentId: '',  // Property to store the selected student ID
        selectedStudent: {},  // Property to store the selected student details
    },
    methods: {

      //Function to CREATE a Student in the system
      async createStudent() {
          await fetch('/students', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(this.newStudent),
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert(
                    'Student created successfully.'
                  );
                  this.resetForm();
                  this.getTotalStudents();
              } else {
                  alert(
                    'Error creating student.'
                  );
              }
          })
          .catch(error => {
              console.error('Error:', response);
              alert(
                'An error occurred: ' , error
              );
          });
      },

      // Function to UPDATE the selected student
      async updateStudent(id) {
        try {
          
          // Get values from editable cells using ref attributes
          const name = this.$refs[`name-${id}`][0].innerText.trim();
          const description = this.$refs[`description-${id}`][0].innerText.trim();
          const employers = this.$refs[`employers-${id}`][0].innerText.trim();
          const start_date = this.$refs[`start_date-${id}`][0].innerText.trim();
          const end_date = this.$refs[`end_date-${id}`][0].innerText.trim();
          
          // Build a updated student object
          const updatedStudent = {
            id: id,
            name: name,
            description: description,
            employers: employers,
            start_date: start_date,
            end_date: end_date
            // Add other properties here...
          };

          // the PUT request with updatedStudent as the body
          const response = await fetch(`/students/update/${id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedStudent),
          });

            const result = await response.json();

            if (result.success) {
                console.log('Student updated successfully.');
                alert( 'Student updated successfully.');
                // Update client data 
                console.log('Updating the table with: ', result.tempStudent.name);
                this.resetForm();
                this.checkStudentByName(result.tempStudent.name);
            } else {
                console.error('Failed to update student:', result.message);
                alert( 'Failed to update student:', result.message);
            }
        } catch (error) {
            console.error('Error updating student:', error.message);
            alert( 'Error updating student:', error.message);
        }
      },

      // Function to DELETE the selected student
      async deleteStudent(id) {
        try {
            const response = await fetch(`/students/delete/${id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
              },
            });

            //const temp = this.getStudentDetails(id);
            const result = await response.json();
            
            if (result.success) {
                console.log('Student deleted successfully.');
                alert( 'Student deleted successfully.');
                // Update local data or trigger a fetch if needed
                this.getTotalStudents();
                this.resetForm();
            } else {
                console.error('Failed to delete student:', result.message);
                alert( 'Failed to delete student:', result.message);
            }
        } catch (error) {
            console.error('Error deleting student:', error.message);
            alert('Error deleting student:', error.message);
        }
      },

      //-------------------------------------------------------------------------
      // Additional methods for other features
      //-------------------------------------------------------------------------

      // Function to fetch the total of Sudents Registered in the system
      async getTotalStudents() {
        await fetch('/students/total')
        .then(response => response.json())
        .then(data => {
            this.Message = `Total Students Registered: ${data.totalStudents}`;
        })
        .catch(error => {
            console.error('Error:', response);
            alert(
              'Error collecting information. ', error.message
            );
        });
      },

      // Function to fetch all students with similar names
      async checkStudentByName(inputElement) {

        let studentName = '';
        let apiUrl = '';
        console.log(`Search parameter is: ${inputElement}`);
        if (inputElement instanceof HTMLInputElement) {
          // If inputElement is an HTML input element, get the value from it
          studentName = inputElement.value;
          apiUrl = `/students/getNames/${encodeURIComponent(studentName)}`;
        } else if (inputElement instanceof Event) {
          // If arg is an Event (e.g., a SubmitEvent), get the input element from the event
          inputElement = inputElement.target.querySelector('#checkStudentNameForm');
          studentName = inputElement ? inputElement.value : '';
        } else {
          studentName = inputElement;
          apiUrl = `/students/getNames/${studentName}`;
        }

        console.log('Calling ', apiUrl);
        // Calling the Backend
        try {
          const response = await fetch(apiUrl);
          if(response.ok){ // Validation step
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
              // Assuming the array contains student objects
              this.studentDataList = data;
              console.log(`API checkStudentByName(${studentName}) Response:`, response.status, response.statusText);
            }
          } else {
            console.error('Invalid or empty response:', data.message);
            alert('An error occurred: Invalid or empty response');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred: ' + error.message);
        }
      },

      // Function to fetch all listed students with similar names
      async checkAllStudent() {

        // Construct API query URL with specific fields
        const apiUrl = `/students/getAllStudents/`;
        console.log('Calling ', apiUrl);
        // Calling the Backend
        try {
          const response = await fetch(apiUrl);
          if(response.ok){ // Validation step
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
              // Assuming the array contains student objects
              this.studentDataList = data;
              console.log(`API checkAllStudent(${studentName}) Response:`, response.status, response.statusText);
              this.getTotalStudents();
            }
          } else {
            console.error('Invalid or empty response:', data.message);
            alert('An error occurred: Invalid or empty response');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred: ' + error.message);
        }
      },
      // Function to provide the "Create Student" form
      showCreateStudentForm() {
        this.createStudentFormVisible = true;
        this.checkStudentSectionVisible = false;
        this.showAllStudentsSectionVisible = false;
        this.resetForm();
      },

      // Function to provide the "Check Student" form, so later specific group of student can be updated or deleted
      showCheckStudentSection() {
          this.createStudentFormVisible = false;
          this.checkStudentSectionVisible = true;
          this.showAllStudentsSectionVisible = false;
          this.resetForm();
      },

      // Function to provide the "All Students" form, so later all student can be listed
      showAllStudentsSection() {
        this.createStudentFormVisible = false;
        this.checkStudentSectionVisible = false;
        this.showAllStudentsSectionVisible = true;
        this.resetForm();
      },

      // Function to Reset the form in case of typos, etc.
      resetForm() {
          this.newStudent = {
              name: '',
              description: '',
              employers: '',
              start_date: '',
              end_date: ''
              // Add other properties here
          };
          this.checkStudentNameForm = '';
          this.studentData = {};
          this.studentDataList = [];
          this.selectedStudentId = '';
          this.selectedStudent = {}; 
      },
      
      // Method to validate value input from Web Table
      validateInput(field, value, student) {
        // Implement validation based on the field's data type
        switch (field) {
          case 'name':
            // Ensure it's a non-empty string
            if (typeof value !== 'text' && value.trim() === '') {
              alert('Student "name" must be a non-empty string.');
              // Reset the value to the last text value
              value = student.name;
            }
            break;
          case 'description':
            // Ensure it's a non-empty string
            if (typeof value !== 'text' && value.trim() === '') {
              alert('Student "description" must be a non-empty string.');
              // Reset the value to the last text value
              value = student.description;
            }
            break;
          case 'employer':
            // Ensure it's a non-empty string
            if (typeof value !== 'text' && value.trim() === '') {
              alert('Student "employer" must be a non-empty string.');
              // Reset the value to the last text value
              value = student.employer;
            }
            break;
          case 'date_end':
            // Ensure it's a formated date
            if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) {
              alert('Field must be a date format MM-DD-YYYY');
              // Reset the value to the last date value
              value = student.date_end;
            }
            break;
          case 'date_start':
            // Ensure it's a formated date
            if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) {
              alert('Field must be a date format MM-DD-YYYY');
              // Reset the value to the last date value
              value = student.date_start;
            }
            break;
          // Add cases for other fields
        }
      },

      checkStudent(studentName){
        this.showCheckStudentSection();
        this.checkStudentByName(studentName);
      },

      // Function to display selected student details when dropdown selection changes
      displaySelectedStudent() {
        const selectedStudentId = this.selectedStudentId;

        if (selectedStudentId) {
            // Fetch the details of the selected student
            this.getStudentDetails(selectedStudentId);
        } else {
            // Reset selected student details if no student is selected
            this.selectedStudent = {};
        }
      },

      // Function to fetch student details by ID and display them
      getStudentDetails(studentId) {
        fetch(`/students/getId/${studentId}`)
          .then(response => response.json())  // Parse the response as JSON
          .then(data => {
            console.log(`/students/getId/${studentId} Response:`, data);
            this.selectedStudent = data;  // Set the selected student
          })
          .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ', error);
          });
      },
    }
}).$mount('#app');
