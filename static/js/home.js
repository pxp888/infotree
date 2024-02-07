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


function find_folder(node_id) {
    let folders = $('.folder');
    let fid;
    for (let i = 0; i < folders.length; i++) {
        fid = folders.eq(i).find('.node_id').html();
        if (fid === node_id.toString()) {
            return folders.eq(i);
        }
    }
    return null;
}


function select_folder(node_id) {
    $('.folder').removeClass('selected');
    let folder = find_folder(node_id);
    if (folder) {
        folder.addClass('selected');
        $('#group_editor').removeClass('hidden');
        // folder.after($('#group_editor'));
        $('#add_member_line').focus();
    }
}


function folder_clicked(event) {
    let folder = $(event.target).closest('.folder');
    let node_id = folder.find('.node_id').html();
    select_folder(node_id);
}



// main functions
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

    ajaxPost({
        action: 'add_subfolder',
        base_id: base_id,
        path: folder_name,
    }, function(response) {
        say(response);
        get_folders();
    });
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


get_folders();