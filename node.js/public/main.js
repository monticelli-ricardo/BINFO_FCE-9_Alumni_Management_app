// main.js

new Vue({
    el: '#app',
    data: {
        Message: '',
        createStudentFormVisible: false,
        checkStudentSectionVisible: false,
        newStudent: {
            name: '',
            description: '',
            employers: '',
            start_date: '',
            end_date: ''
            // Add other properties here
        },
        checkStudentName: '',
        studentDataList: [],  // Array to store the list of students for dropdown
        selectedStudentId: '',  // Property to store the selected student ID
        selectedStudent: {},  // Property to store the selected student details
    },
    methods: {

      // Function to provide the "Create Student" form
      showCreateStudentForm() {
          this.createStudentFormVisible = true;
          this.checkStudentSectionVisible = false;
          this.resetForm();
      },

      // Function to provide the "Check Student" form, so later the student can be updated or deleted
      showCheckStudentSection() {
          this.createStudentFormVisible = false;
          this.checkStudentSectionVisible = true;
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
          this.checkStudentName = '';
          this.studentData = {};
          this.studentDataList = [];
          this.selectedStudentId = '';
          this.selectedStudent = {}; 
      },

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
            const response = await fetch(`/students/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.selectedStudent),
            });

            const result = await response.json();

            if (result.success) {
                console.log('Student updated successfully.');
                alert(
                  'Student updated successfully.'
                );
                // Update client data 
                this.checkStudent(result.updatedStudent.name);
            } else {
                console.error('Failed to update student:', result.message);
                alert(
                  'Failed to update student:', result.message
                );
            }
        } catch (error) {
            console.error('Error updating student:', error.message);
            alert(
              'Error updating student:', error.message
            );
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

            const temp = this.getStudentDetails(id);
            const result = await response.json();
            
            if (result.success) {
                console.log('Student deleted successfully.');
                alert(
                  'Student deleted successfully.'
                );
                // Update local data or trigger a fetch if needed
                this.getTotalStudents();
                this.checkStudentName(temp.name);
            } else {
                console.error('Failed to delete student:', result.message);
                alert(
                  'Failed to delete student:', result.message
                );
            }
        } catch (error) {
            console.error('Error deleting student:', error.message);
            alert(
              'Error deleting student:', error.message
            );
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
      async checkStudent(studentName) {
        // Construct API query URL with specific fields
        const apiUrl = `/students/getNames/${encodeURIComponent(
          studentName,
        )}`;
        console.log('/students/getNames/', studentName);
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            // Assuming the array contains student objects
            this.studentDataList = data;
            console.log(`API checkStudent(${studentName}) Response:`, response.status, response.statusText);
          } else {
            console.error('Invalid or empty response:', data);
            alert('An error occurred: Invalid or empty response');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred: ' + error.message);
        }
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
