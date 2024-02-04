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


function add_tree(){
    const tree_topic = $('#tree_topic_input').val();

    const current_topics = $('.tree_topic');
    for (let i = 0; i < current_topics.length; i++){
        if (current_topics[i].innerHTML === tree_topic){
            current_topics[i].parentElement.click();
            return;
        }
    }

    $('#tree_topic_input').val('');

    if(tree_topic === ''){
        alert('Please enter a topic');
        return;
    }
    data = {
        'ptype': 'add_tree',
        'topic': tree_topic,
    }
    ajaxPost(data, function (response){
        let new_tree = make_tree(response);
        $('.tree').removeClass('selected');
        new_tree.classList.add('selected');
        new_tree.click();
    });
    $('#branch_subject_input').focus();
}


function get_trees(){
    data = {
        'ptype': 'get_trees',
    }
    ajaxPost(data, function (response){
        trees = response.trees;
        for (let i = 0; i < trees.length; i++){
            get_tree(trees[i]);
        }
    });
}


function get_tree(tree_id){
    data = {
        'ptype': 'get_tree',
        'tree_id': tree_id,
    }
    ajaxPost(data, function (response){
        make_tree(response);
    });
}


function sort_trees(){
    const treelist = $('.treelist').first();
    let trees = treelist.children();
    trees.sort(function(a, b){
        let a_id = a.querySelector('.tree_id').innerHTML;
        let b_id = b.querySelector('.tree_id').innerHTML;
        return a_id - b_id;
    });
    treelist.append(trees);
}


function make_tree(data){
    const treelist = $('.treelist').first();
    let tree = document.createElement('div');
    tree.classList.add('tree');
    tree.classList.add('listitem');

    let tree_topic = document.createElement('p');
    tree_topic.innerHTML = data.topic;
    tree_topic.classList.add('tree_topic');

    let tree_id = document.createElement('p');
    tree_id.classList.add('tree_id');
    tree_id.classList.add('hidden');
    tree_id.innerHTML = data.tree_id;

    
    tree.appendChild(tree_id);
    tree.appendChild(tree_topic);

    let remove_button = document.createElement('p');
    remove_button.classList.add('remove_button');
    remove_button.innerHTML = 'Remove';
    tree.appendChild(remove_button);

    treelist.append(tree);
    tree.addEventListener('click', tree_clicked);
    sort_trees();
    return tree;
}


function remove_tree(tree_id){
    let userConfirmed = confirm('Are you sure you want to remove this tree?');
    if (!userConfirmed){
        return;
    }

    data = {
        'ptype': 'remove_tree',
        'tree_id': tree_id,
    }
    ajaxPost(data, function (response){
        const trees = $('.tree');
        for (let i = 0; i < trees.length; i++){
            if (trees[i].querySelector('.tree_id').innerHTML === tree_id){
                trees[i].remove();
                break;
            }
        }
        const branchlist = $('.branchlist.itemlist');
        branchlist.empty();
        const nodelist = $('.nodelist.itemlist');
        nodelist.empty();
    });
}


function tree_clicked(event){
    let target = event.target;
    if(target.classList.contains('remove_button')){
        let tree_id = target.parentElement.querySelector('.tree_id').innerHTML;
        remove_tree(tree_id);
        return;
    }

    if(target.tagName === 'P'){
        target = target.parentElement;
    }
    let tree_id = target.querySelector('.tree_id').innerHTML;

    let trees = $('.tree');
    for (let i = 0; i < trees.length; i++){
        trees[i].classList.remove('selected');
    }
    target.classList.add('selected');
    const branchlist = $('.branchlist.itemlist');
    branchlist.empty();
    const nodelist = $('.nodelist.itemlist');
    nodelist.empty();
    get_branches(tree_id);
}


function add_branch() {
    const branch_subject = $('#branch_subject_input').val();

    const current_subjects = $('.branch_subject');
    for (let i = 0; i < current_subjects.length; i++){
        if (current_subjects[i].innerHTML === branch_subject){
            current_subjects[i].parentElement.click();
            return;
        }
    }

    const tree_id = $('.selected .tree_id').html();
    if (tree_id === undefined){
        alert('Please select a tree');
        return;
    }
    if(branch_subject === ''){
        alert('Please enter a subject');
        return;
    }
    data = {
        'ptype': 'add_branch',
        'tree_id': tree_id,
        'subject': branch_subject,
    }
    ajaxPost(data, function (response){
        let new_branch = make_branch(response);
        $('.branch').removeClass('selected');
        new_branch.classList.add('selected');
        new_branch.click();
    });
    $('#branch_subject_input').val('');
    $('#member_input').focus();
}


function get_branches(tree_id) {
    data = {
        'ptype': 'get_branches',
        'tree_id': tree_id,
    };
    ajaxPost(data, function (response){
        branches = response.branches;
        for (let i = 0; i < branches.length; i++){
            get_branch(branches[i]);
        }
    });

}


function get_branch(branch_id) {
    data = {
        'ptype': 'get_branch',
        'branch_id': branch_id,
    }
    ajaxPost(data, function (response){
        make_branch(response);
    });
}



function make_branch(data){
    const branchlist = $('.branchlist').first();
    let branch = document.createElement('div');
    branch.classList.add('branch');
    branch.classList.add('listitem');

    let branch_subject = document.createElement('p');
    branch_subject.classList.add('branch_subject');
    branch_subject.innerHTML = data.subject;

    let branch_id = document.createElement('p');
    branch_id.classList.add('branch_id');
    branch_id.classList.add('hidden');
    branch_id.innerHTML = data.branch_id;

    let branch_members = document.createElement('p');
    branch_members.classList.add('branch_members');
    branch_members.innerHTML = data.members;

    branch.appendChild(branch_id);
    branch.appendChild(branch_subject);
    branch.appendChild(branch_members);

    let remove_button = document.createElement('p');
    remove_button.classList.add('remove_button');
    remove_button.innerHTML = 'Remove';
    branch.appendChild(remove_button);

    branchlist.append(branch);
    branch.addEventListener('click', branch_clicked);
    sort_branches();
    return branch;
}


function sort_branches(){
    const branchlist = $('.branchlist').first();
    let branches = branchlist.children();
    branches.sort(function(a, b){
        let a_id = a.querySelector('.branch_id').innerHTML;
        let b_id = b.querySelector('.branch_id').innerHTML;
        return a_id - b_id;
    });
    branchlist.append(branches);
}


function remove_branch(branch_id){
    let userConfirmed = confirm('Are you sure you want to remove this branch?');
    if (!userConfirmed){
        return;
    }

    data = {
        'ptype': 'remove_branch',
        'branch_id': branch_id,
    }
    ajaxPost(data, function (response){
        const branches = $('.branch');
        for (let i = 0; i < branches.length; i++){
            if (branches[i].querySelector('.branch_id').innerHTML === branch_id){
                branches[i].remove();
                break;
            }
        }
        const nodelist = $('.nodelist.itemlist');
        nodelist.empty();
    });
}


function branch_clicked(event){
    let target = event.target;
    if(target.classList.contains('remove_button')){
        let branch_id = target.parentElement.querySelector('.branch_id').innerHTML;
        remove_branch(branch_id);
        return;
    }
    
    if(target.tagName === 'P'){
        target = target.parentElement;
    }
    // let branch_id = target.querySelector('.branch_id').innerHTML;
    let branch_id = target.children[0].innerHTML;

    let branches = $('.branch');
    for (let i = 0; i < branches.length; i++){
        branches[i].classList.remove('selected');
    }
    target.classList.add('selected');
    const nodelist = $('.nodelist.itemlist');
    nodelist.empty();
    get_nodes(branch_id);
}


function get_nodes(branch_id){
    data = {
        'ptype': 'get_nodes',
        'branch_id': branch_id,
    }
    ajaxPost(data, function (response){
        nodes = response.nodes;
        for (let i = 0; i < nodes.length; i++){
            get_node(nodes[i]);
        }
    });
}

function mark_read(node_id){
    data = {
        'ptype': 'mark_read',
        'node_id': node_id,
    }
    ajaxPost(data, function (response){
        
    });
}


function get_node(node_id){
    data = {
        'ptype': 'get_node',
        'node_id': node_id,
    }
    ajaxPost(data, function (response){
        make_node(response);
        mark_read(node_id);
    });
}


function add_node(){
    const branch_id = $('.selected .branch_id').html();
    if (branch_id === undefined){
        alert('Please select a branch');
        return;
    }
    const node_text = $('#quickreply_body').val();
    if(node_text === ''){
        alert('Please enter a message');
        return;
    }
    data = {
        'ptype': 'add_node',
        'branch_id': branch_id,
        'content': node_text,
    }
    ajaxPost(data, function (response){
        make_node(response);
    });
    $('#quickreply_body').val('');
}


function make_node(data){
    const nodelist = $('.nodelist')[0];

    let node = document.createElement('div');
    node.classList.add('node');
    node.classList.add('listitem');

    let node_content = document.createElement('p');
    node_content.classList.add('node_content');
    node_content.innerHTML = data.content;

    let node_id = document.createElement('p');
    node_id.classList.add('node_id');
    node_id.classList.add('hidden');
    node_id.innerHTML = data.node_id;

    let node_sender = document.createElement('p');
    node_sender.classList.add('node_sender');
    node_sender.innerHTML = data.sender;

    let node_created_on = document.createElement('p');
    node_created_on.classList.add('node_created_on');
    node_created_on.innerHTML = data.created_on;

    node.appendChild(node_id);
    node.appendChild(node_sender);
    node.appendChild(node_created_on);
    node.appendChild(node_content);
    const username = $('.top_username').html();
    if (username === data.sender){
        node.classList.add('sentmessage');
    }
    if (data.read===false){
        node.classList.add('unread');
    }

    const nodes = nodelist.children;
    if (nodes.length === 0){
        nodelist.append(node);
    }
    else{
        let last_node = nodes[nodes.length-1];
        let last_node_id = last_node.querySelector('.node_id').innerHTML;
        if (data.node_id > last_node_id){
            nodelist.append(node);
        }
        else{
            for (let i = 0; i < nodes.length; i++){
                let node_id = nodes[i].querySelector('.node_id').innerHTML;
                if (data.node_id < node_id){
                    nodelist.insertBefore(node, nodes[i]);
                    break;
                }
            }
        }
    }
    nodelist.scrollTop = nodelist.scrollHeight;
}


function add_member(){
    const branch_id = $('.selected .branch_id').html();

    if (branch_id === undefined){
        alert('Please select a branch');
        return;
    }
    const member_username = $('#member_input').val();
    if(member_username === ''){
        alert('Please enter a username');
        return;
    }

    data = {
        'ptype': 'add_member',
        'branch_id': branch_id,
        'username': member_username,
    }
    ajaxPost(data, function (response){
        const thing = $('.selected .branch_members')[0];
        thing.innerHTML = response.members;
    });
    $('#member_input').val('');
    $('#quickreply_body').focus();
}


function update(){
    const current_branch_id = parseInt($('.selected .branch_id').html());
    
    data = {
        'ptype': 'update',
        'current_branch_id': current_branch_id,
    }
    ajaxPost(data, function (response){

        utargets = response.utargets;
        for (let i = 0; i < utargets.length; i++){
            get_node(utargets[i]);
        }

        ubranches = response.ubranches;
        let branch_ids = $('.branch_id');
        for (let i = 0; i < branch_ids.length; i++){
            let branch_id = parseInt(branch_ids[i].innerHTML);
            let branch = branch_ids[i].parentElement;
            if (ubranches.includes(branch_id)){
                branch.classList.add('unread');
            }
            else{
                branch.classList.remove('unread');
            }
        }

        utrees = response.utrees;
        let tree_obs = $('.tree_id');
        let tree_ids = [];
        for (let i = 0; i < tree_obs.length; i++){
            tree_id = parseInt(tree_obs[i].innerHTML);
            tree_ids.push(tree_id);
            if (utrees.includes(tree_id)){
                tree_obs[i].parentElement.classList.add('unread');
            }
            else{
                tree_obs[i].parentElement.classList.remove('unread');
            }
        }
        for (let i = 0; i < utrees.length; i++){
            if (!tree_ids.includes(utrees[i])){
                get_tree(utrees[i]);
            }
        }
    });
}


// prevent form submission
$('#treeform').submit(function(event) {
    event.preventDefault();
});

$('#branchform').submit(function(event) {
    event.preventDefault();
});

$('#quickreplyform').submit(function(event) {
    event.preventDefault();
});

$('#memberform').submit(function(event) {
    event.preventDefault();
});



// Event Listeners
$('#add_tree_send').click(add_tree);
$('#add_branch_send').click(add_branch);
$('#quickreply_send').click(add_node);
$('#memberform_send').click(add_member);

$('#tree_topic_input').blur(function(){
    if ($('#tree_topic_input').val() === ''){
        return;
    }
    else{
        add_tree();
    }
})

$('#branch_subject_input').blur(function(){
    if ($('#branch_subject_input').val() === ''){
        return;
    }
    else{
        add_branch();
    }
})

$('#member_input').blur(function(){
    if ($('#member_input').val() === ''){
        return;
    }
    else{
        add_member();
    }
})


get_trees();

setInterval(update, 1000);

