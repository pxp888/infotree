const say = (...msgs) => console.log(...msgs);

const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const username = $('.username').first().text();
let future_selected_folder = null;
let unread_counts = {};

// This is a convenience function for AJAX calls.  
function ajaxPost(data, successfunc) {

    $.ajax({
        type: 'POST',
        url: '/',
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


// This is a convience function to find either folder class items or 
// node class items by their node_id attributes. 
function find_object(node_id, type) {
    if (node_id === undefined) { return null; }
    let objects = $(type);
    let oid;
    for (let i = 0; i < objects.length; i++) {
        oid = objects.eq(i).find('.node_id').html();
        if (oid === undefined) { continue; }
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
        // $('#add_member_line').focus();
    }
    else {
        future_selected_folder = node_id;
    }

    $('.node').not('.sample').remove();
    get_nodes(node_id);
}


function folder_clicked(event) {
    let folder = $(event.target).closest('.folder');
    let node_id = folder.find('.node_id').html();
    select_folder(node_id);
}


// this ensures that folders and subfolders are displayed in the correct order, 
// and that subfolders are visually apparent as subfolders. 
function order_folders() {
    let folders = $('.folder').not('.sample');
    let tops = {};
    for (let i = 0; i < folders.length; i++) {
        let folder = folders.eq(i);
        let node_id = folder.find('.node_id').html();
        let base_id = folder.find('.base_id').html();
        tops[node_id] = base_id;

        let level = folder.find('.path').html().split('/').length;
        folder.css('margin-left', (level-1)*18+'px');
        folder.addClass('subfolder');
    }
    for (key in tops) {
        if (tops[key] in tops) {
            let base = find_folder(tops[key]);
            let folder = find_folder(key);
            base.after(folder);
        }
    }
}




// 
function mark_read(node_id) {
    ajaxPost({
        action: 'mark_read',
        node_id: node_id,
    }, function(response) {

    });
}


// create or update an element to represent a folder
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

    if (data.node_id in unread_counts) {
        folder.find('.unread_count').html(unread_counts[data.node_id]);
        folder.addClass('unread');
    }
    else {
        folder.find('.unread_count').html('');
        folder.removeClass('unread');
    }

    if (new_folder) {
        folder.click(folder_clicked);
        let folders = $('.folder').not('.sample');
        if (folders.length ===0){
            $('#folderlist').append(folder);
        }
        else {
            let last_folder = folders.last();
            let last_folder_id = last_folder.find('.node_id').html();
            if (data.node_id > last_folder_id) {
                $('#folderlist').append(folder);
            }
            else {
                folders.each(function() {
                    let folder_id = $(this).find('.node_id').html();
                    if (data.node_id < folder_id) {
                        $(this).before(folder);
                        return false;
                    }
                });
            }
        }
    }
    order_folders();
    mark_read(data.node_id);
}


function subfolder_clicked(event) {
    let folder = $(event.target).closest('.subgroup');
    let node_id = folder.find('.node_id').html();
    select_folder(node_id);
}


// create or update an element to represent a node
function draw_node(data) {
    let parent_id = parseInt($('.folder.selected').find('.node_id').html());
    if (data.base_id !== parent_id) { 
        say(parent_id, data.base_id);
        return; }

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

    if(data.folder===true) {
        node.addClass('subgroup');
        node.click(subfolder_clicked);
        let name = data.path.split('/').pop();
        node.find('.content').html(name);
    }

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
                $('#nodelist').scrollTop($('#nodelist')[0].scrollHeight);
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

    mark_read(data.node_id);
}


// get data for a single folder from the server
function get_folder(node_id) {
    ajaxPost({
        action: 'get_folder',
        node_id: node_id,
    }, function(response) {
        draw_folder(response);
        if (future_selected_folder === node_id) {
            select_folder(node_id);
            future_selected_folder = null;
        }
    });
}


// get data for a single node from the server
function get_node(node_id) {
    ajaxPost({
        action: 'get_node',
        node_id: node_id,
    }, function(response) {
        draw_node(response);
    });
}


// get a list of folders belonging to the user from the server
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


// get a list of nodes for a given base node or folder
function get_nodes(base_id) {
    let node_count = $('.node').not('.sample').length;
    ajaxPost({
        action: 'get_nodes',
        base_id: base_id,
        node_count: node_count,
    }, function(response) {
        let nodes = response.nodes;
        for (let i = 0; i < nodes.length; i++) {
            get_node(nodes[i]);
        }
    });
}


// create a top-level folder
function add_root_folder() {
    const folder_name = $('#new_folder_line').val();
    if (folder_name === '') { return; }
    
    let folders = $('.folder').not('.sample').find('.name');
    for (let i = 0; i < folders.length; i++) {
        if (folders.eq(i).html() === folder_name) {
            select_folder(folders.eq(i).closest('.folder').find('.node_id').html());
            return;
        }
    }

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


// remove a folder from a users list of folders.  Note - the server 
// will not delete the folder until all users have deleted the folder.
function delete_folder() {
    let node_id = $('.selected').find('.node_id').html();
    if (node_id === undefined) { 
        alert('No group is selected to leave.');
        return; }
    
    let ok = confirm('Are you sure you want to leave this group?');
    if (!ok) { return; }

    ajaxPost({
        action: 'delete_folder',
        node_id: node_id,
    }, function(response) {
        let folder = find_folder(node_id);
        folder.remove();
        $('#group_editor').addClass('hidden');
    });

    location.reload();
}


// add a member to a folder or group.  
function add_member() {
    let node_id = $('.selected').find('.node_id').html();
    if (node_id === undefined) {
        alert('Please select a group to add a member to.');
        return; }
    let member = $('#add_member_line').val();
    if (member === '') { return; }

    ajaxPost({
        action: 'add_member',
        node_id: node_id,
        member: member,
    }, function(response) {
        if (response.action === 'add_member_error') {
            alert(response.reason);
            return;
        }

        if (response.action === 'send_node') {
            get_folder(node_id);
            $('#add_member_line').val('');
            select_folder(node_id);
        }
    });
}


// create a subfolder for the currently selected folder
function add_subfolder() {
    let base_id = $('.selected').find('.node_id').html();
    if (base_id === undefined) {
        alert('Please select a group to add a subgroup to.');
        return;
    }
    let folder_name = $('#sub_folder_line').val();
    if (folder_name === '') { return; }

    let path = find_folder(base_id).find('.path').html() + '/' + folder_name;

    ajaxPost({
        action: 'add_subfolder',
        base_id: base_id,
        path: path,
    }, function(response) {
        get_folders();
        $('#sub_folder_line').val('');
        select_folder(response.node_id);
    });
}


// create a node representing a message 
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


// check the server for unread messages
function update() {
    let node_id = $('.selected').find('.node_id').html();
    ajaxPost({
        action: 'update',
        node_id: node_id,
    }, function(response) {
        let nodes = response.nodes;
        let folders = response.folders;
        let selected = parseInt( $('.selected.folder').find('.node_id').html());
        unread_counts = {};
        for (let i=0; i < nodes.length; i++) {
            if (selected === parseInt(folders[i])) { get_nodes(nodes[i]); }
            if (folders[i] in unread_counts) {
                unread_counts[folders[i]]++;
            }
            else { unread_counts[folders[i]]=1; }
        }

        $('.folder').not('.sample').removeClass('unread');
        $('.folder').not('.sample').find('.unread_count').html('');
        for (let f in unread_counts) {
            let myfolder = find_folder(f);
            if (myfolder) {
                myfolder.find('.unread_count').html(unread_counts[f]);
                myfolder.addClass('unread');
            }
            else {
                get_folder(f);
            }
        }
    }
)};


// prevent default form submission
$('.genericLineForm').submit(function(event) {
    event.preventDefault();
});


// Event Listeners
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

$('#new_folder_button').click(add_root_folder);
$('#add_member_button').click(add_member);
$('#sub_folder_button').click(add_subfolder);

$('#delete_folder_button').click(delete_folder);
$('#send_message_button').click(send_message);


let nodelist = $('#nodelist')[0];
nodelist.addEventListener('scroll', function() {
    if (nodelist.scrollTop === 0) {
        let base_id = $('.selected').find('.node_id').html();
        get_nodes(base_id);
    }
});


// Initialize page
get_folders();

setInterval(update, 5000);

