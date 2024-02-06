const say = (...msgs) => console.log(...msgs);

const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const username = $('.username').html();
const pathline = $('#pathline');
const new_folder_line = $('#new_folder_line');


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


function draw_node(data) {
    // remove an existing div with node_id=data.node_id
    let existing = $('.nodelist').find('.node_id:contains(' + data.node_id + ')').closest('.node');
    if (existing.length > 0) {
        existing.remove();
    }

    // create a new div with the data
    let node = $('.node.sample').clone();
    node.removeClass('sample');

    node.find('.node_id').html(data.node_id);
    node.find('.content').html(data.content);
    node.find('.created_on').html(data.created_on);
    node.find('.author').html('auth:' + data.author);

    // define memlist as data.members without data.author
    let tolist = data.members.filter(member => member !== data.author).join(', ');
    let memlist = data.author + ' : ' + tolist;
    node.find('.members').html(memlist);

    if (data.author === username && data.folder === false) {
        node.addClass('sent');}
    if (data.folder === true) {
        node.addClass('nfolder');}
    if (data.read === false) {
        say(data.read);
        node.addClass('unread');}

    // insert node into nodelist in order of node_id
    let nodelist = $('.nodelist');
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


function get_node(node_id) {
    ajaxPost({
        action: 'get_node',
        node_id: node_id,
    }, function(response) {
        draw_node(response);
    });
}


function get_nodes(base_id) {
    $('.nodelist').children().not('.sample').remove();

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


function org_folders() {
    let node_ids = [];
    let basenode_ids = [];
    let folders = $('.folder');
    for (let i = 0; i < folders.length; i++) {
        node_ids.push(folders[i].querySelector('.node_id').innerHTML);
        basenode_ids.push(folders[i].querySelector('.base_id').innerHTML);
    }
    for (let i = 0; i < node_ids.length; i++) {
        for (let j=0; j < basenode_ids.length; j++) {
            if (node_ids[i] === basenode_ids[j]) {
                let kids = folders[i].querySelector('.kids');
                kids.append(folders[j]);
            }
        }
    }
}


function folder_clicked(event) {
    let folder = $(event.target).closest('.folder');
    $('.folder').removeClass('selected');
    folder.addClass('selected');
    let path = folder.find('.path').html();
    pathline.html(path);

    get_nodes(folder.find('.node_id').html());
}


function draw_folder(data){
    // remove an existing div with node_id=data.node_id
    let existing = $('.folderlist').find('.node_id:contains(' + data.node_id + ')').closest('.folder');
    if (existing.length > 0) {
        existing.remove();
    }

    let folder = $('.folder.sample').clone();
    folder.removeClass('sample');

    let name = data.path.split('/').slice(-2, -1);
    folder.find('.node_id').html(data.node_id);
    folder.find('.base_id').html(data.base_id);
    folder.find('.path').html(data.path);
    folder.find('.name').html(name);
    folder.find('.members').html(data.members.join(', '));

    folder.click(folder_clicked);

    $('.folderlist').append(folder);
    
    org_folders();
}


function get_folder(node_id) {
    ajaxPost({
        action: 'get_folder',
        node_id: node_id,
    }, function(response) {
        draw_folder(response);
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


function add_folder() {
    const folder_name = new_folder_line.val();
    if (folder_name.length === 0) {
        return;
    }
    let path = pathline.html() + folder_name + '/';
    new_folder_line.val('');

    ajaxPost({
        'action': 'add_node',
        'isfolder': true,
        'path': path,
    }, function(response) {
        draw_folder(response);
    });
}


function add_member() {
    const member = $('#add_member_line').val();
    const node_id = $('.selected .node_id').html();
    if (node_id === undefined) { 
        say('node_id is undefined');
        return; }
    if (member.length === 0) { return; }
    
    $('#add_member_line').val('');

    ajaxPost({
        'action': 'add_member',
        'member': member,
        'node_id': node_id,
    }, function(response) {
        draw_folder(response);
    });
}


function send_message() {
    const message = $('#new_message_line').val();
    const base_id = $('.selected .node_id').html();
    // if base_id is undefined, return

    if (base_id === undefined) { 
        say('base_id is undefined');
        return; }
    if (message.length === 0) { 
        say('message is empty');
        return; }

    $('#new_message_line').val('');

    data = {
        'action': 'send_message',
        'content': message,
        'base_id': base_id,
    }
    ajaxPost(data, function(response) {
        draw_node(response);
    });
}

function home_clicked() {
    $('.folder').removeClass('selected');
    pathline.html('/');
    get_nodes(0);
}


// prevent default form submission
$('.genericForm').submit(function(event) {
    event.preventDefault();
});


// Event Listeners
$('#new_folder_line').blur(add_folder);
$('#add_member_line').blur(add_member);
$('#send_message_button').click(send_message);
$('#homediv').click(home_clicked);


get_folders();