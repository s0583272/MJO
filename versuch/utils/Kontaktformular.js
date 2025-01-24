function validateForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (name === '' || email === '' || message === '') {
        alert('Bitte fülle alle Felder aus.');
        return false;
    }
    alert('Vielen Dank für deine Nachricht!');
    return true;
}

function goBack() {
    window.history.back();
}