$(document).ready(function() {
    // Function to fetch users and populate the table
    function fetchUsers() {
        axios.get('http://localhost:3000/users')
            .then(response => {
                const users = response.data;
                const userTable = $('#userTable tbody');
                userTable.empty();
                users.forEach(user => {
                    userTable.append(`
                        <tr data-username="${user.username}" data-email="${user.email}">
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                        </tr>
                    `);
                });
            })
            .catch(error => console.error('Error fetching users:', error));
    }

    // Display user details in modal on table row click
    $(document).on('click', '#userTable tbody tr', function () {
        const username = $(this).data('username');
        const email = $(this).data('email');
        $('#modalUsername').text(`Username: ${username}`);
        $('#modalEmail').text(`Email: ${email}`);
        $('#userModal').modal('show');
    });

    // Handle login form submission
    $('#loginForm').submit(function (event) {
        event.preventDefault();
        const formData = {
            email: $('#loginEmail').val(),
            password: $('#loginPassword').val()
        };

        axios.post('http://localhost:3000/login', formData)
            .then(response => {
                alert('Login successful!');
                $('#loginModal').modal('hide');
                fetchUsers(); // Update user list after successful login
            })
            .catch(error => {
                alert('Login failed. Please check your credentials.');
                console.error('Login Error:', error);
            });
    });

    // Handle reset password form submission
    $('#resetPasswordForm').submit(function (event) {
        event.preventDefault();
        const formData = {
            email: $('#resetEmail').val(),
            newPassword: $('#resetNewPassword').val()
        };

        axios.post('http://localhost:3000/reset-password', formData)
            .then(response => {
                alert('Password reset successfully!');
                $('#resetPasswordModal').modal('hide');
                fetchUsers(); // Update user list after successful password reset
            })
            .catch(error => {
                alert('Password reset failed. Please try again.');
                console.error('Reset Password Error:', error);
            });
    });

    // Initial fetch of users when the page loads
    fetchUsers();
});
