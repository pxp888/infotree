const say = (...msgs) => console.log(...msgs);

const composeForm = document.getElementById('composeForm');


composeForm.addEventListener('submit', function(event) {
    if (event.target.tagName === 'INPUT') {
        event.preventDefault();
    }
});

