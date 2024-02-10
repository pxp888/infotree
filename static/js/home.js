const say = (...msgs) => console.log(...msgs);

const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const username = $('.username').first().text();


// helper functions
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


function find_object(node_id, type) {
    let objects = $(type);
    let oid;
    for (let i = 0; i < objects.length; i++) {
        oid = objects.eq(i).find('.node_id').html();
        if (oid === node_id.toString()) {
            return objects.eq(i);
        }
    }
    return null;
}


function find_folder(node_id) { return find_object(node_id, '.folder'); }


function find_node(node_id) { return find_object(node_id, '.node'); }


function select_folder(node_id) {
    $('.folder').removeClass('selected');
    let folder = find_folder(node_id);
    if (folder) {
        folder.addClass('selected');
        $('#group_editor').removeClass('hidden');
        $('#add_member_line').focus();
    }

    $('.node').not('.sample').remove();
    get_nodes(node_id);
}


function folder_clicked(event) {
    let folder = $(event.target).closest('.folder');
    let node_id = folder.find('.node_id').html();
    select_folder(node_id);
}


function order_folders() {
    let folders = $('.folder').not('.sample');
    for (let i = 0; i < folders.length; i++) {
        let folder = folders.eq(i);
        let base_id = folder.find('.base_id').html();
        if (base_id === '-1') { continue; }
        let base = find_folder(base_id);
        if (base===null) { continue; }
        base.after(folder);

        let level = folder.find('.path').html().split('/').length;
        folder.css('margin-left', (level-1)*10+'px');
        folder.addClass('subfolder');
    }
}


// ajax functions

function mark_read(node_id) {
    ajaxPost({
        action: 'mark_read',
        node_id: node_id,
    }, function(response) {
        
    });
}


function draw_folder(data) {
    let folder;
    let new_folder=true;
    let old = find_folder(data.node_id);
    if (old) { 
        folder = old;
        new_folder = false;
    }
    else {
        folder = $('.folder.sample').clone();
        folder.removeClass('sample');
    }

    let name = data.path.split('/').pop();

    folder.find('.name').html(name);
    folder.find('.node_id').html(data.node_id);
    folder.find('.base_id').html(data.base_id);
    folder.find('.path').html(data.path);
    folder.find('.members').html(data.members.join(', '));

    
    if (new_folder) {
        folder.click(folder_clicked);
        $('#folderlist').append(folder);
    }
    order_folders();
    mark_read(data.node_id);
}


function draw_node(data) {
    let node;
    let new_node=true;
    let old = find_node(data.node_id);
    if (old) {
        node = old;
        new_node = false;
    }
    else {
        node = $('.node.sample').clone();
        node.removeClass('sample');
    }
    
    members = data.members.filter(m => m !== data.author);
    members = data.author + ': ' + members.join(', ');

    node.find('.node_id').html(data.node_id);
    node.find('.base_id').html(data.base_id);
    node.find('.content').html(data.content);
    node.find('.author').html(data.author);
    node.find('.created_on').html(data.created_on);
    node.find('.members').html(members);

    let read = true;
    let index = data.members.indexOf(username);
    read = data.read[index];
    if (!read) { node.addClass('unread'); }

    if (data.author === username) {
        node.addClass('sent_message');
    }

    if (new_node) {
        let nodelist = $('#nodelist');
        let nodes = nodelist.children().not('.sample');
        if (nodes.length === 0) {
            nodelist.append(node);
        }
        else {
            let last_node = nodes.last();
            let last_node_id = last_node.find('.node_id').html();
            if (data.node_id > last_node_id) {
                nodelist.append(node);
            }
            else {
                nodes.each(function() {
                    let node_id = $(this).find('.node_id').html();
                    if (data.node_id < node_id) {
                        $(this).before(node);
                        return false;
                    }
                });
            }
        }
    }
    
    $('#nodelist').scrollTop($('#nodelist')[0].scrollHeight);
    mark_read(data.node_id);
}


function get_folder(node_id) {
    ajaxPost({
        action: 'get_folder',
        node_id: node_id,
    }, function(response) {
        draw_folder(response);
    });
}


function get_node(node_id) {
    ajaxPost({
        action: 'get_node',
        node_id: node_id,
    }, function(response) {
        draw_node(response);
    });
}


function get_folders() {
    ajaxPost({
        action: 'get_folders',
    }, function(response) {
        let folders = response.folders;
        for (let i = 0; i < folders.length; i++) {
            get_folder(folders[i]);
        }
    });
}


function get_nodes(base_id) {
    ajaxPost({
        action: 'get_nodes',
        base_id: base_id,
    }, function(response) {
        let nodes = response.nodes;
        for (let i = 0; i < nodes.length; i++) {
            get_node(nodes[i]);
        }
    });
}


function add_root_folder() {
    const folder_name = $('#new_folder_line').val();
    if (folder_name === '') { return; }

    data = {
        'action': 'add_root_folder',
        'path': folder_name,
    }
    ajaxPost(data, function(response) { 
        draw_folder(response); 
        $('#new_folder_line').val('');
        select_folder(response.node_id);
    });
}


function delete_folder() {
    let node_id = $('.selected').find('.node_id').html();
    if (node_id === '') { return; }
    let ok = confirm('Are you sure you want to delete this group?');
    if (!ok) { return; }

    ajaxPost({
        action: 'delete_folder',
        node_id: node_id,
    }, function(response) {
        let folder = find_folder(node_id);
        folder.remove();
        $('#group_editor').addClass('hidden');
    });
}


function add_member() {
    let node_id = $('.selected').find('.node_id').html();
    let member = $('#add_member_line').val();
    if (member === '') { return; }

    ajaxPost({
        action: 'add_member',
        node_id: node_id,
        member: member,
    }, function(response) {
        get_folder(node_id);
        $('#add_member_line').val('');
        select_folder(node_id);
    });

}


function add_subfolder() {
    let base_id = $('.selected').find('.node_id').html();
    let folder_name = $('#sub_folder_line').val();
    if (folder_name === '') { return; }

    let path = find_folder(base_id).find('.path').html() + '/' + folder_name;

    ajaxPost({
        action: 'add_subfolder',
        base_id: base_id,
        path: path,
    }, function(response) {
        get_folders();
    });
}


function send_message() {
    let message = $('#new_message_line').val();
    if (message === '') { 
        alert('Please enter a message to send');
        return; }
    base_id = $('.selected').find('.node_id').html();
    if (base_id === undefined) { 
        alert('Please select a group to send the message to.');
        return; }

    ajaxPost({
        action: 'send_message',
        base_id: base_id,
        content: message,
    }, function(response) {
        draw_node(response);
        $('#new_message_line').val('');
    });
}


function update() {
    let node_id = $('.selected').find('.node_id').html();
    ajaxPost({
        action: 'update',
        node_id: node_id,
    }, function(response) {
        let nodes = response.nodes;
        let folders = response.folders;
        let selected = $('.selected.folder').find('.node_id').html();
        $('.folder').not('.sample').removeClass('unread');
        for (let i = 0; i < nodes.length; i++) {
            if (parseInt(folders[i])===parseInt(selected)) {
                get_node(nodes[i]);
            }
            let f = find_folder(folders[i])
            if (f) { f.addClass('unread'); }
            else { get_folder(folders[i]); }
        }
    }
)};




// prevent default form submission
$('.genericLineForm').submit(function(event) {
    event.preventDefault();
});


document.getElementById('new_folder_line').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        add_root_folder();
    }
});

document.getElementById('add_member_line').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        add_member();
    }
});

document.getElementById('sub_folder_line').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        add_subfolder();
    }
});


$('#delete_folder_button').click(delete_folder);
$('#send_message_button').click(send_message);


get_folders();

setInterval(update, 3000);

