$(document).ready(function() {
    $('#dataTable').DataTable();
    $('#dataTableCat').DataTable();
});

function deleteLineitem(e) {
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: `/lineitem/${e.currentTarget.dataset.id}/delete`,
        success: function() {
            window.location.reload();
        },
        failure: function() {
            window.location.reload();
        },
    });
}

document.querySelectorAll('.delete').forEach(item => {
    item.addEventListener('click', deleteLineitem);
});

function deleteCat(e) {
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: `/category/${e.currentTarget.dataset.id}/delete`,
        success: function() {
            window.location.reload();
        },
        failure: function() {
            window.location.reload();
        },
    });
}

document.querySelectorAll('.deleteCat').forEach(item => {
    item.addEventListener('click', deleteCat);
});
