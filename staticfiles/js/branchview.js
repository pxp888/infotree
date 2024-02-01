const say = (...msgs) => console.log(...msgs);

const replyForm = document.getElementById('replyform');

replyForm.addEventListener('submit', function(event) {
    if (event.target.tagName === 'INPUT') {
        event.preventDefault();
    }
});


function setparentnode() {
    let nid = $('.node_id').last().html();
    $("#ParentNode").value = nid;
}


setparentnode();

