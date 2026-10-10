$(function(){ 
  /* Clean form */ 
  $("button[id^='cls_frm']").click(function(e)
  {
    resetFields();
  });

  $("a[name^='btn_trigger']").click(function(e)
  {
     $('#vid').text($(this).attr('id')); 
  });
  $('#send').click(function(e)
  {
     var errs = 0;
     // Validate email addresses 
     var _to = trim($('#_to').val());
     var _from = trim($('#_from').val());
     // If commas -> multiple addresses, parse and validate each 
     if (_to.indexOf(",") != -1)
     {
       var _to_errs = new Array(); 
       var _tos = _to.split(",");
       for (var i=0; i < _tos.length; i ++)
       {
         if (!isValidEmail(trim(_tos[i])))
         {
            _to_errs.push(_tos[i]);
         }
       }   
       if (_to_errs.length > 0)
       {
         errs ++; 
         if (_to_errs.length == 1)
         { 
           $('#_err_to').text('Invalid email: ' + _to_errs[0]);
         }
         else {
            $('#_err_to').text('Invalid emails: ' + _to_errs.join(","));
         }
       }
     }
     else {
       if (!isValidEmail(_to))
       {
         $('#_err_to').text('Invalid email address');
          errs ++; 
       }
     }
     if (errs == 0)
     {
       $('#_err_to').text('');
     }
     if (!isValidEmail(_from))
     {
        $('#_err_frm').text('Invalid email address');
        errs ++; 
     }
     else {
        $('#_err_frm').text('');
     }
     // Validate subject 
     var _subject = trim($('#_subject').val());
     if (_subject == '')
     {
       $('#_err_subject').text('Missing');
       errs ++;
     }
     else {
       $('#_err_subject').text('');
     }
     if (errs > 0)
     {
        alert('Please correct the errors in red.');
        return;  
     }
     var params = { 'subject' : _subject, 'to' : _to, 'from' : _from, 'article_id' : $('#vid').text() };
     var _content = trim($('#_content').val());
     if (_content != '')
     {
       params['content'] = _content;
     }
     if ($('#_page_id').length > 0)
     {
       params['page_id'] = $('#_page_id').val();
     }
     // Send using Ajax 
      $.ajax({ cache: false,
             url : '/insights/ibtr_email_share.php',
             type : 'POST',
             data : params,
             success : function(d){ handleResponse(d); },
             error: function(a, b, c){ alert('An error occurred. Your email could not be submitted.'); },
             dataType: 'json'
           });
  });
});
function handleResponse(d)
{
 if (!d)
 {
   alert("An error occurred. Please try again later.");
   return false;
 }
 else {
   if (d.S == -1)
   {
     alert("Email could not be submitted. Please try again later.");
     return false;
   }
   else {
     alert("Email has been submitted");
     setTimeout(function(){ $('#emailModal').modal('hide'); resetFields(); }, 2000); 
     return true;
   }
 }
}
function resetFields()
{
  $('#_to').val('');
  $('#_content').val('');
  $('#_err_to').text('');
  $('#_err_frm').text('');
  $('#_err_subject').text('');
}
function isValidEmail(email)
{
  var regex=/^[\+a-zA-Z0-9._-]+@([a-zA-Z0-9.-]+(\.)?)+[a-zA-Z0-9.-]{0,10}$/;
  return regex.test(email);
}