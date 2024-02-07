const say = (...msgs) => console.log(...msgs);

const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const username = $('.username').first().text();


// helper function for ajax get requests
function ajaxPost(data, successfunc) {

    $.ajax({
        type: 'POST',
        url: '/',
        data: data,
        headers: { 'X-CSRFToken': csrfToken, },
        success: successfunc,
        error: function(response) {
            say('Error:', response);
        },
    });
}

function get_folders() {

}


function add_root_folder() {
    const folder_name = $('#new_folder_line').val();
    if (folder_name === '') { return; }

    data = {
        'action': 'add_root_folder',
        'path': folder_name,
    }
    ajaxPost(data, get_folders);
    $('#new_folder_line').val('');
}


// prevent default form submission
$('.genericLineForm').submit(function(event) {
    event.preventDefault();
});


document.getElementById('new_folder_line').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        add_root_folder();
    }
});

get_folders();