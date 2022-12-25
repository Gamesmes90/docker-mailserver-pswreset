function check()
{
  var x;
  x = document.getElementById("password").value;
  if (x == "") {
    alert("Data missing");
    return false;
  };

    $('#form').on('submit', function(e){
        e.preventDefault();
        var url = new URL(window.location.href);
            $.ajax({
                url: 'reset',
                type: 'POST',
                data: { password: x, email:  url.searchParams.get("email").substring(0,url.searchParams.get("email").length-1)},
                dataType: "html",
                error: function(data){
                  document.body.innerHTML = data.responseText;
                },
                success: function(data){
                  document.body.innerHTML = data;
                }
            });
    });
}

function showPasswd() {
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

function empty()
{
  var x;
  x = document.getElementById("email").value;
  if (x == "") {
    alert("Data missing");
    return false;
  };
}