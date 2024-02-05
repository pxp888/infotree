const say = (...msgs) => console.log(...msgs);

const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const username = $('.username').html();

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

