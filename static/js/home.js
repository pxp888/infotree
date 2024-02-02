const say = (...msgs) => console.log(...msgs);

const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const username = $('.username').html();


function treeClicked(event) {
    target = event.target;
    if (target.tagName === 'P') {
        target = target.parentElement;
    }
    let tree_id = target.querySelector('.tree_id').innerHTML;

    $('.tree').removeClass('selected');
    target.classList.toggle('selected');

    $('#tree_topic_input').val(target.querySelector('.tree_topic').innerHTML);

    $.ajax({
        url: '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: {
            'ptype': 'get_branches',
            'tree_id': tree_id,
        },
        success: function(response) {
            makeBranches(response);
        },
        error: function(error) {
            console.error(error);
        }
    });
}


function get_trees() {
    $.ajax({
        url: '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: {
            'ptype': 'get_trees',
        },
        success: function(response) {
            say(response);
            // makeTrees(response);
        },
        error: function(error) {
            console.error(error);
        }
    });
}


function makeBranches(response) {
    $('.branchlist').empty();
    $('.nodelist').empty();
    for (let i = 0; i < response.id_list.length; i++) {
        let branch = document.createElement('div');
        let branch_id = document.createElement('p');
        let branch_subject = document.createElement('p');
        let branch_members = document.createElement('p');
        branch.className = 'branch';
        branch.classList.add('listitem');
        branch_id.className = 'branch_id';
        branch_subject.className = 'branch_subject';
        branch_members.className = 'branch_members';
        branch_id.innerHTML = response.id_list[i];
        branch_subject.innerHTML = response.subject_list[i];
        branch_members.innerHTML = response.member_list[i];
        branch.appendChild(branch_id);
        branch.appendChild(branch_subject);
        branch.appendChild(branch_members);
        $('.branchlist').append(branch);
        branch.addEventListener('click', branchClicked);
    }
}


function branchClicked(event) {
    target = event.target;
    if (target.tagName === 'P') {
        target = target.parentElement;
    }
    let branch_id = target.querySelector('.branch_id').innerHTML;

    $('.branch').removeClass('selected');
    target.classList.toggle('selected');

    $('#branch_subject_input').val(target.querySelector('.branch_subject').innerHTML);
    $('#branch_members_input').val(target.querySelector('.branch_members').innerHTML);


    $.ajax({
        url: '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: {
            'ptype': 'get_nodes',
            'branch_id': branch_id,
        },
        success: function(response) {
            getNodes(response);
        },
        error: function(error) {
            console.error(error);
        }
    });
}


function getNodes(response) {
    $('.nodelist').empty();
    for (let i = 0; i < response.id_list.length; i++) {
        getNode(response.id_list[i]);
    }
}


function getNode(id) {
    $.ajax({
        url: '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: {
            'ptype': 'get_node',
            'node_id': id,
        },
        success: function(response) {
            makeNode(response);
        },
        error: function(error) {
            console.error(error);
        }
    });
}


function makeNode(response) {
    let node = document.createElement('div');
    let node_id = document.createElement('p');
    let node_sender = document.createElement('p');
    let node_created_on = document.createElement('p');
    let node_content = document.createElement('p');
    node.className = 'node';
    node.classList.add('listitem');
    node_id.className = 'node_id';
    node_sender.className = 'node_sender';
    node_created_on.className = 'node_created_on';
    node_content.className = 'node_content';
    node_id.innerHTML = response.node_id;
    node_sender.innerHTML = response.sender;
    node_created_on.innerHTML = response.created_on;
    node_content.innerHTML = response.content;
    node.appendChild(node_id);
    node.appendChild(node_sender);
    node.appendChild(node_created_on);
    node.appendChild(node_content);

    if (node_sender.innerHTML === username) {
        node.classList.add('sentmessage');
    }

    $('.nodelist').append(node);
    sortNodes();
}


function sortNodes() {
    nodes = $('.nodelist .node');
    let nodes_array = [];
    for (let i = 0; i < nodes.length; i++) {
        nodes_array.push(nodes[i]);
    }
    nodes_array.sort((a, b) => {
        return parseInt(a.querySelector('.node_id').innerHTML) - parseInt(b.querySelector('.node_id').innerHTML);
    });
    $('.nodelist').empty();
    for (let i = 0; i < nodes_array.length; i++) {
        $('.nodelist').append(nodes_array[i]);
    }
    $('.nodelist').scrollTop($('.nodelist').prop('scrollHeight'));
}


function quickreply(event) {
    let branch_id = $('.branchlist .selected .branch_id').html();
    let content = $('#quickreply_body').val();
    if (branch_id === undefined || branch_id === ''){
        alert('Please select a branch');
        return;
    }
    
    $.ajax({
        url: '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: {
            'ptype': 'quick_reply',
            'branch_id': branch_id,
            'content': content,
        },
        success: function(response) {
            say(response);
            if (response.status === 'unread_node') {
                getNode(response.node_id);
                $('#quickreply_body').val('');
            }
        },
        error: function(error) {
            console.error(error);
        }
    });
}


function new_branch(event) {
    const tree_id = $('.tree.selected .tree_id').html();
    const subject = $('#branch_subject_input').val();
    const members = $('#branch_members_input').val();
    if (tree_id === undefined || tree_id === ''){
        alert('Please select a tree');
        return;
    }
    if (subject === undefined || subject === ''){
        alert('Please enter a subject');
        return;
    }
    if (members === undefined || members === ''){
        alert('Please enter members');
        return;
    }
    $.ajax({
        url: '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: {
            'ptype': 'new_branch',
            'tree_id': tree_id,
            'subject': subject,
            'members': members,
        },
        success: function(response) {
            say(response);
            if (response.status === 'new_branch') {
                $('.tree.selected').click();
                let branches = $('.branchlist .branch');
                for (let i = 0; i < branches.length; i++) {
                    if (branches[i].querySelector('.branch_id').innerHTML === response.branch_id) {
                        branches[i].click();
                        break;
                    }
                }
            }
        },
        error: function(error) {
            console.error(error);
        }
    });
}

function update_branch() {
    const current_branch = $('.branchlist .selected .branch_id').html();
    if (current_branch === undefined || current_branch === ''){
        return;
    }

    $.ajax({
        url: '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: {
            'ptype': 'update_branch',
            'branch_id': current_branch,
        },
        success: function(response) {
            if (response.branch_id === parseFloat(current_branch)) {
                const unread = response.unread;
                for (let i = 0; i < unread.length; i++) {
                    getNode(unread[i]);
                }
            }
        },
        error: function(error) {
            console.error(error);
        }
    });
}


// prevent form submission
$('#treeform').submit(function(event) {
    event.preventDefault();
    say('trees!');
});

$('#branchform').submit(function(event) {
    event.preventDefault();
});

$('#quickreplyform').submit(function(event) {
    event.preventDefault();
});


$('#quickreply_send').click(quickreply);
$('#branchform_send').click(new_branch);
$('.tree').click(treeClicked);
$('.branch').click(branchClicked);

setInterval(update_branch, 2000);