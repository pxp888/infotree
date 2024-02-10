const say = (...msgs) => console.log(...msgs);

const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const username = $('.username').first().text();

// helper functions
function ajaxPost(data, successfunc) {
    $.ajax({
        type: 'POST',
        url: '/userpage/',
        data: data,
        headers: { 'X-CSRFToken': csrfToken, },
        success: function(response) {
            successfunc(response);
            $('#errorbar').addClass('hidden');
        }
        ,
        error: function(response) {
            $('#errorbar').removeClass('hidden');
            $('#errorbar p').html('Error: Connection Failure');
        },
    });
}


function name_clicked(event) {
    let user = $(event.target).closest('.user');
    ajaxPost({ 
        action: 'name_clicked',
        username: user.text() 
    }, function(response) {
        say(response);
    });
}



$('.user').click(name_clicked);

