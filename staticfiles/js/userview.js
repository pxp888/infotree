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


function draw_node(data) {
    let node = $('.node.sample').clone()
    node.removeClass('sample');

    members = data.members.filter(m => m !== data.author);
    members = data.author + ': ' + members.join(', ');

    node.find('.node_id').html(data.node_id);
    node.find('.base_id').html(data.base_id);
    node.find('.content').html(data.content);
    node.find('.author').html(data.author);
    node.find('.created_on').html(data.created_on);
    node.find('.members').html(members);

    messlist.append(node[0]);
}



function get_node(node_id) {
    ajaxPost({ 
        action: 'get_node', 
        node_id: node_id ,
    }, function(response) {
        draw_node(response);
    });
}


function name_clicked(event) {
    let user = $(event.target).closest('.user');
    let username = user.find('.username').text();
    ajaxPost({ 
        action: 'name_clicked',
        username: username, 
    }, function(response) {
        if (response.action ==='name_clicked') {
            $('.node').not('.sample').remove();
            let nodes = response.nodes;
            for (let i = 0; i < nodes.length; i++) { get_node(nodes[i]); }
        }
    });
}


$('.user').click(name_clicked);

