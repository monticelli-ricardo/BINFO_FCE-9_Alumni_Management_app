// main.js

new Vue({
    el: '#app',
    data: {
        warningMessage: '',
        createStudentFormVisible: false,
        checkStudentSectionVisible: false,
        newStudent: {
            name: '',
            employers: '',
            start_date: '',
            // Add other properties here
        },
        checkStudentName: '',
        studentData: {}
    },
    methods: {

        // Function to profice the "Create Student" form
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
                employers: '',
                start_date: '',
            };
            this.checkStudentName = '';
            this.studentData = {};
        },

        //Function to create a Student in the system
        createStudent() {
            fetch('/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.newStudent),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.warningMessage = 'Student created successfully';
                    this.resetForm();
                } else {
                    this.warningMessage = 'Error creating student';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.warningMessage = 'An error occurred';
            });
        },

        //Function to fecth all students with similar names, in case we dont know the ID
        checkStudent() {
            fetch(`/students/${this.checkStudentName}`)
            .then(response => response.json())
            .then(data => {
                this.studentData = data;
            })
            .catch(error => {
                console.error('Error:', error);
                this.warningMessage = 'An error occurred';
            });
          // Assuming you want to display the student details immediately after checking
            // You can choose to remove this if not needed
            this.getStudentDetails(this.checkStudentName);
        },

        // Function to fetch student details by ID and display them
        getStudentDetails(studentId) {
            fetch(`/students/${studentId}`)
            .then(response => response.json())
            .then(data => {
                this.studentData = data;
            })
            .catch(error => {
                console.error('Error:', error);
                this.warningMessage = 'An error occurred';
            });
        },

        // Function to fetch the total of Sudents Registered in the system
        getTotalStudents() {
            fetch('/students/total')
            .then(response => response.json())
            .then(data => {
                this.warningMessage = `Total Students Registered: ${data.totalStudents}`;
            })
            .catch(error => {
                console.error('Error:', error);
                this.warningMessage = 'An error occurred';
            });
        }
        // Additional methods for other features (Update Student, Remove Student)
    }
});
