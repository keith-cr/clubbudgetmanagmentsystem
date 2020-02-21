$('#datepicker').datepicker({
  uiLibrary: 'bootstrap4'
});
function submit(e) {
  var deduction_amount_dom_element = document.getElementById('amountInput');
  var datepicker_dom_element = document.getElementById('datepicker');
  e.preventDefault();
  $.ajax({
    type: 'POST',
    url: window.location.pathname,
    data: { amount: deduction_amount_dom_element.value, timestamp: datepicker_dom_element.value },
    success: function() {
      window.location.reload();
    },
    failure: function() {
      window.location.reload();
    },
  });
}

var submit_dom_element = document.getElementById('submit');
submit_dom_element.addEventListener('click', submit);