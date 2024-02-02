const say = (...msgs) => console.log(...msgs);

const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const username = $('.username').html();

function treeClicked(event) {
    target = event.target;
    if (target.tagName === 'P') {
        target = target.parentElement;
    }
    let tree_id = target.querySelector('.tree_id').innerHTML;

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
    say(branch_id);

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
    node_id.innerHTML = response.id;
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
    $('.nodelist').scrollTop($('.nodelist')[0].scrollHeight);
}




$('.tree').click(treeClicked);
$('.branch').click(branchClicked);