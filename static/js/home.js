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
        say(response);
        make_tree(response);
    });
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
    
    let tree_id = document.createElement('p');
    tree_id.classList.add('tree_id');
    tree_id.classList.add('hidden');
    tree_id.innerHTML = data.tree_id;
    
    tree.appendChild(tree_id);
    tree.appendChild(tree_topic);
    treelist.append(tree);
    tree.addEventListener('click', tree_clicked);
    sort_trees();
}


function tree_clicked(event){
    let target = event.target;
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
        new_branch = make_branch(response);
        $('.branch').removeClass('selected');
        new_branch.classList.add('selected');
    });
    $('#branch_subject_input').val('');
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


function branch_clicked(event){
    let target = event.target;
    if(target.tagName === 'P'){
        target = target.parentElement;
    }
    let branch_id = target.querySelector('.branch_id').innerHTML;

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


function get_node(node_id){
    data = {
        'ptype': 'get_node',
        'node_id': node_id,
    }
    ajaxPost(data, function (response){
        make_node(response);
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
    const nodelist = $('.nodelist').first();
    
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

    nodelist.append(node);
    sort_nodes();
}

function sort_nodes(){
    const nodelist = $('.nodelist').first();
    let nodes = nodelist.children();
    nodes.sort(function(a, b){
        let a_id = a.querySelector('.node_id').innerHTML;
        let b_id = b.querySelector('.node_id').innerHTML;
        return a_id - b_id;
    });
    nodelist.append(nodes);
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
}


function update(){
    data = {
        'ptype': 'update',
    }
    ajaxPost(data, function (response){
        say(response);
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


get_trees();

setInterval(update, 3000);

