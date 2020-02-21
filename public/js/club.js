$(document).ready(function() {
  $('#dataTable').DataTable({
    "order": [[ 0, "desc" ]]
  });
});

function deleteBudget(e) {
  e.preventDefault();
  $.ajax({
      type: 'POST',
      url: `/budget/${e.currentTarget.dataset.id}/delete`,
      success: function() {
          window.location.reload();
      },
      failure: function() {
          window.location.reload();
      },
  });
}

document.querySelectorAll('.delete').forEach(item => {
  item.addEventListener('click', deleteBudget);
});
