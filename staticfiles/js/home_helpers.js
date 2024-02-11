const hint = document.createElement('div');
const browser = document.getElementById('browser');
const add_member_line = document.getElementById('add_member_line');
const sub_folder_line = document.getElementById('sub_folder_line');
const new_folder_line = document.getElementById('new_folder_line');

// sets up the hint element
function setupMouseHint() {
    hint.id = 'mousehint';
    hint.className = 'mousehint';
    hint.textContent = 'Mouse hint';
    hint.style.position = 'absolute';
    hint.style.top = '0';
    hint.style.left = '0';
    browser.appendChild(hint);
}

function showAddMemberHint(event) {
    hint.textContent = 'Hint: Enter a username and press return to add them to the group.';
    hint.classList.add('active');
    hint.style.left = event.clientX + 30 + 'px';
    const rect = browser.getBoundingClientRect();
    hint.style.top = event.clientY - rect.top + 'px';
}

function subgroupHint(event) {
    hint.textContent = 'Hint: Enter a subgroup name and press return to add a subgroup.';
    hint.classList.add('active');
    hint.style.left = event.clientX + 30 + 'px';
    const rect = browser.getBoundingClientRect();
    hint.style.top = event.clientY - rect.top + 'px';
}

function addgroupHint(event) {
    hint.textContent = 'Hint: Enter a name and press return to add a group chat.';
    hint.classList.add('active');
    hint.style.left = event.clientX + 30 + 'px';
    const rect = browser.getBoundingClientRect();
    hint.style.top = event.clientY - rect.top + 'px';
}


// Hide the hint element
function hideMouseHint(event) {
    hint.classList.remove('active');
}

setupMouseHint();

add_member_line.addEventListener('mouseover', showAddMemberHint);
add_member_line.addEventListener('mouseout', hideMouseHint);

sub_folder_line.addEventListener('mouseover', subgroupHint);
sub_folder_line.addEventListener('mouseout', hideMouseHint);

new_folder_line.addEventListener('mouseover', addgroupHint);
new_folder_line.addEventListener('mouseout', hideMouseHint);

