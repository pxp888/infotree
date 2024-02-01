const say = (...msgs) => console.log(...msgs);

$(document).ready(function() {
    const div = $('.bvnodelist');
    div.scrollTop(div.prop('scrollHeight'));
});


function check_branch() {
    const currentUrl = window.location.href;
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    const branchId = $('#branchId').val();

    $.ajax({
        url: currentUrl,
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: {
            'type': 'check_branch',
            'branchId': branchId,
        },
        success: function(response) {
            if (response.status === true) {
                location.reload();
            }
        },
        error: function(error) {
            console.error(error);
        }
    });
}




function update() {
    const currentUrl = window.location.href;
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    const branchId = $('#branchId').val();

    $.ajax({
        url: currentUrl,
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: {
            'type': 'update',
            'branchId': branchId,
        },
        success: function(response) {
            if (response.status === true) {
                location.reload();
            }
        },
        error: function(error) {
            console.error(error);
        }
    });
}

setInterval(update, 10000);


