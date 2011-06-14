$(document).ready(function() {
  $('#email').focus();
  var currentWindow = Titanium.UI.getCurrentWindow();
  currentWindow.setWidth(700);
  currentWindow.setHeight(525);
  
  var db = Titanium.Database.open('webbynode');
  var rc = db.execute('CREATE TABLE IF NOT EXISTS wnusers (id INT, email TEXT, token TEXT)');
  var rc = db.execute('CREATE TABLE IF NOT EXISTS wnsettings (id INT, global TEXT, prim TEXT)');
  var rows = db.execute("select * from wnusers");
  
  if(rows.rowCount() > 0) {
    var currentWindow = Titanium.UI.getCurrentWindow();
    currentWindow.setURL("app://main.html");
  };
  
  // Attempt Login
  $(".login").click(function() {
    var email = $('#email').val();
    var token = $('#token').val();
    
    if (email.length < 6) { jAlert("Please check your email address."); return; };
    if (token.length != 40) { jAlert("Please check your API token."); return; };
    
    var rc = db.execute("INSERT INTO wnusers (email, token) VALUES ('" + email + "', '" + token + "')");
    var rc = db.execute("INSERT INTO wnsettings (prim) VALUES ('" + email + "')");
    var currentWindow = Titanium.UI.getCurrentWindow();
    currentWindow.setURL("app://main.html");
  });
});