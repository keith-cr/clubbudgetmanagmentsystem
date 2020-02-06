$(document).ready(function() {
    $('#dataTable').DataTable();
});

function deleteDeduction(e) {
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: `/deduction/${e.currentTarget.dataset.id}/delete`,
        success: function() {
            window.location.reload();
        },
        failure: function() {
            window.location.reload();
        },
    });
}

document.querySelectorAll('.delete').forEach(item => {
    item.addEventListener('click', deleteDeduction);
});
