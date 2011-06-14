$(document).ready(function() {
  
  var currentWindow = Titanium.UI.getCurrentWindow();
  currentWindow.setWidth(1100);
  currentWindow.setHeight(700);
  
  var db = Titanium.Database.open('webbynode');
  
  // Data for date formatting
  var months = {'01':'January','02':'February','03':'March','04':'April','05':'May','06':'June','07':'July','08':'August','09':'September',10:'October',11:'November',12:'December'};
  
  // Reboot a Webby
  $('.reboot').live("click", function() {
    var webby = $(this).data('webby');
    var email = $(this).data('email');
    var token = $(this).data('token');
    
    jConfirm('Are you sure you want to Reboot ' + webby + '?', 'Confirmation Please', function(r) {
      if (r) {
        $.getJSON("https://manager.webbynode.com/api/json/webby/" + webby + "/reboot?email=" + email + "&token=" + token + "");
        setTimeout(refreshWebbyInfo, 500);
      };
    });
  });
  
  // Shut down a Webby
  $('.shutdown').live("click", function() {
    var webby = $(this).data('webby');
    var email = $(this).data('email');
    var token = $(this).data('token');
    
    jConfirm('Are you sure you want to Shut Down ' + webby + '?', 'Confirmation Please', function(r) {
      if (r) {
        $.getJSON("https://manager.webbynode.com/api/json/webby/" + webby + "/shutdown?email=" + email + "&token=" + token + "");
        setTimeout(refreshWebbyInfo, 500);
      };
    });
  });
  
  // Start a Webby
  $('.start').live("click", function() {
    var webby = $(this).data('webby');
    var email = $(this).data('email');
    var token = $(this).data('token');
    
    jConfirm('Are you sure you want to Start ' + webby + '?', 'Confirmation Please', function(r) {
      if (r) {
        $.getJSON("https://manager.webbynode.com/api/json/webby/" + webby + "/start?email=" + email + "&token=" + token + "");
        setTimeout(refreshWebbyInfo, 500);
      };
    });
  });
  
  // Refresh Webby List
  $(".refresh").live("click", function() {
    refreshWebbyInfo();
  });
  
  // Show Webby Status
  $('.status').live("click", function() {
    var webby = $(this).data('webby');
    getWebbyStatus(webby);
  });
  
  // Show Zone records
  $(".records").live("click", function() {
    var zone = $(this).data('zone');
    var email = $(this).data('email');
    var token = $(this).data('token');
    
    getZoneRecords(zone, email, token);
    $('#zones').hide();
    $('#show_records').show();    
  });
  
  // Add or Update Zone
  $('.new_zone').live("click", function() {
    var domain = $('#domain').val();
    var ttl = $('#ttl').val() - 0;
    var status = $('input:radio[name=status]:checked').val();
    var zone = $('#zone_id').val();
    var email = $('#zone_email').val();
    var token = $('#zone_token').val();
    
    if(domain.length < 4) { jAlert("Please check your domain name."); return; };
    if(ttl.length < 3) { jAlert("Please check your TTL value."); return; };
    if(typeof ttl != 'number') { jAlert("Please check that your TTL is a number."); return; };
    
    if(zone.length == 0) {
      $.getJSON("https://manager.webbynode.com/api/json/dns/new?email=" + email + "&token=" + token + 
                "&zone[domain]=" + domain + "&zone[ttl]=" + ttl + "&zone[status]=" + status + "");
    } else {
      $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "?email=" + email + "&token=" + token + 
                "&zone[domain]=" + domain + "&zone[ttl]=" + ttl + "&zone[status]=" + status + "");
    }
    
    // Reload DNS Info   
    $('.zones_list').remove();
  	setTimeout(getDnsInfo, 500);
  	$('#new_zone').hide();
    $('#zones').show();
  });
  
  // Edit Zone
  $('.edit_zone').live("click", function() {
    var zone = $(this).data('zone');
    var email = $(this).data('email');
    var token = $(this).data('token');
    
    $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "?email=" + email + "&token=" + token + "",
      function(data) {
        $('#zone_id').val(data.zone.id);
        $('#zone_email').val(email);
        $('#zone_token').val(token);
        $('#domain').val(data.zone.domain);
        $('#ttl').val(data.zone.ttl);
        $('input[@name=status]').val(data.zone.status);
      });
    
    $('#zones').hide();
    $('#new_zone').show();
  });
  
  // Delete Zone
  $('.delete_zone').live("click", function() {
    var zone = $(this).data('zone');
    var email = $(this).data('email');
    var token = $(this).data('token');
    
    jConfirm('Are you sure you want to Delete this Zone?', 'Confirmation Please', function(r) {
      if (r) {
        $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "/delete?email=" + email + "&token=" + token + "");
        
        // Reload DNS Info
        $('.zones_list').remove();
      	setTimeout(getDnsInfo, 500);
      };
    });
  });
  
  // Hide Zone Records
  $(".cancel_records").live("click", function() {
    $('#show_records').hide();
    $('#zones').show();
    $('.zone_records').remove();
  });
  
  // Show Add Zone form
  $('.add_zone').live("click", function() {
    var rows = db.execute("select * from wnusers");
    var count = rows.rowCount();
    $('.zone_owner').empty();
    
    if (global === 'checked' && count > 1) {
      var select =  '<label for="zone_owner">Zone Owner</label>' +
                    '<br />' +
                    '<select id="zone_owner" name="zone_owner">';

      while (rows.isValidRow()) {  
        var email = rows.fieldByName('email');
        var token = rows.fieldByName('token');
        
        if (email == prim){
          select += '<option selected>' + email + '</option>';
          $('#zone_email').val(email);
          $('#zone_token').val(token);
        } else {
          select += '<option>' + email + '</option>';
        };
        
        rows.next();
      };

      select += '</select>';
      $(select).appendTo('.zone_owner');
    } else {
      var row = db.execute("select * from wnusers where email='" + prim + "'");
      var email = row.fieldByName('email');
      var token = row.fieldByName('token');
      $('#zone_email').val(email);
      $('#zone_token').val(token);
    };
    
    $('#zone_id').val('');
    $('#domain').val('');
    $('#ttl').val('86400');
    $('input:radio').val(['Active']);
    $('#zones').hide();
    $('#new_zone').show();
    $('#domain').focus();
  });
  
  // Set zone_email and zone_token on change
  $('#zone_owner').live('change', function() {
    var email = $('#zone_owner option:selected').text();
    var row = db.execute("select * from wnusers where email='" + email + "'");
    var email = row.fieldByName('email');
    var token = row.fieldByName('token');
    $('#zone_email').val(email);
    $('#zone_token').val(token);
  });
  
  // Hide Add Zone form
  $(".cancel_zone").live("click", function() {
    $('#new_zone').hide();
    $('#zones').show();
  });
  
  // Show Add Record form
  $('.add_record').live("click", function() {
    var zone = $('#record_zone_id').val;

    $('#record_id').val('');
    $('#type').val('A');
    $('#name').val('');
    $('#data').val('');
    $('#aux').val('0');
    $('#record_ttl').val('86400');
    $('#show_records').hide();
    $('#new_record').show();
  });
  
  // Hide Add Record form
  $(".cancel_record").live("click", function() {
    $('#new_record').hide();
    $('#show_records').show();
  });
  
  // Add or Update Record
  $('.new_record').live("click", function() {
    var record_zone_id = $('#record_zone_id').val();
    var record_id = $('#record_id').val();
    var type = $('#type').val();
    var name = $('#name').val();
    var data = $('#data').val();
    var aux = $('#aux').val();
    var record_ttl = $('#record_ttl').val() - 0;
    
    if(data.length < 1) { jAlert("Please check your domain name."); return; };
    if(record_ttl.length < 3) { jAlert("Please check your TTL value."); return; };
    if(typeof record_ttl != 'number') { jAlert("Please check that your TTL is a number."); return; };
    
    if(record_id.length == 0) {
      $.getJSON("https://manager.webbynode.com/api/json/dns/" + record_zone_id + "/records/new?email=" + email + "&token=" + token + 
                "&record[type]=" + type + "&record[name]=" + name + "&record[data]=" + data + 
                "&record[aux]=" + aux + "&record[ttl]=" + record_ttl + "");
    } else {
      $.getJSON("https://manager.webbynode.com/api/json/records/" + record_id + "?email=" + email + "&token=" + token + 
                "&record[type]=" + type + "&record[name]=" + name + "&record[data]=" + data + 
                "&record[aux]=" + aux + "&record[ttl]=" + record_ttl + "");
    }
    
    // Reload Records Info   
    $('.zone_records').remove();
  	setTimeout(function() {getZoneRecords(record_zone_id)}, 500);
  	$('#new_record').hide();
    $('#show_records').show();
  });
  
  // Add Gmail Records
  $('.add_gmail').live("click", function() {
    var zone = $('#record_zone_id').val();
    var email = $('#record_email').val();
    var token = $('#record_token').val();
    
    $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "/records/new?email=" + email + "&token=" + token + 
              "&record[type]=CNAME&record[name]=mail&record[data]=ghs.google.com");
              
    $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "/records/new?email=" + email + "&token=" + token + 
              "&record[type]=MX&record[data]=ALT1.ASPMX.L.GOOGLE.COM");
              
    $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "/records/new?email=" + email + "&token=" + token + 
              "&record[type]=MX&record[data]=ALT2.ASPMX.L.GOOGLE.COM");
              
    $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "/records/new?email=" + email + "&token=" + token + 
              "&record[type]=MX&record[data]=ASPMX.L.GOOGLE.COM");
              
    $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "/records/new?email=" + email + "&token=" + token + 
              "&record[type]=MX&record[data]=ASPMX2.GOOGLEMAIL.COM");
              
    $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "/records/new?email=" + email + "&token=" + token + 
              "&record[type]=MX&record[data]=ASPMX3.GOOGLEMAIL.COM");
              
    $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "/records/new?email=" + email + "&token=" + token + 
              "&record[type]=MX&record[name]=mail&record[data]=ASPMX.L.GOOGLE.COM");
              
    // Reload Records Info   
    $('.zone_records').remove();
  	setTimeout(function() {getZoneRecords(zone,email,token)}, 500);
  	$('#new_record').hide();
    $('#show_records').show();
  });
  
  // Edit Record
  $('.edit_record').live("click", function() {
    var record = $(this).data('record');
    var zone = $(this).data('zone');
    var email = $(this).data('email');
    var token = $(this).data('token');
    
    $.getJSON("https://manager.webbynode.com/api/json/records/" + record + "?email=" + email + "&token=" + token + "",
      function(data) {
        $('#record_id').val(data.record.id);
        $('#type').val(data.record.type);
        $('#name').val(data.record.name);
        $('#data').val(data.record.data);
        $('#aux').val(data.record.aux);
        $('#record_ttl').val(data.record.ttl);
      });
    
    $('#record_zone_id').val(zone);
    $('#show_records').hide();
    $('#new_record').show();
  });
  
  // Delete Record
  $('.delete_record').live("click", function() {
    var record = $(this).data('record');
    var zone = $(this).data('zone');
    var email = $(this).data('email');
    var token = $(this).data('token');
    
    jConfirm('Are you sure you want to Delete this Record?', 'Confirmation Please', function(r) {
      if (r) {
        $.getJSON("https://manager.webbynode.com/api/json/records/" + record + "/delete?email=" + email + "&token=" + token + "");
        
        // reload DNS info
        refreshZoneInfo(zone,email,token);
      };
    });
  });
  
  // Add or Update Local Info
  $(".add").live("click", function() {
    var acct_email = $('#acct_email').val();
    var email = $('#email').val();
    var token = $('#token').val();

    if(email.length < 6) { jAlert("Please check your email address."); return; };
    if(token.length != 40) { jAlert("Please check your API token."); return; };
    
    if (acct_email != '') {
      var rc = db.execute("UPDATE wnusers SET email='" + email + "', token='" + token + "' WHERE email='" + acct_email + "'");
      $('#acct_email').val('');
    } else {
      var rc = db.execute("INSERT INTO wnusers (email, token) VALUES ('" + email + "', '" + token + "')");
    };
    
    if ($('input[name=prim]').is(':checked')) {
      setPrimaryUser(email);
    };
    
    $('input[name=prim]').attr('checked', false);
    $('#addone').hide();
    $('#local').show();
    
    // Reload All Info
  	refreshAll();
  });
  
  // Delete Local Info record
  $('.delete_profile').live("click", function() {
    var email = $(this).data('acct_email');
    
    jConfirm('Are you sure you want to remove this local account?', 'Confirmation Please', function(r) {
      if (r) {
        var rd = db.execute("DELETE FROM wnusers WHERE email='" + email + "'");
        var rc = db.execute("SELECT * FROM wnusers")
        var count = rc.rowCount();

        switch(count) {
          case 0:
            var currentWindow = Titanium.UI.getCurrentWindow();
            currentWindow.setURL("app://login.html");
            break;
          case 1:
            var user = rc.fieldByName('email');
            setPrimaryUser(user);
          default:
            var row = db.execute("SELECT * FROM wnusers LIMIT 1");
            var user = row.fieldByName('email');
            setPrimaryUser(user);
            refreshAll();
        };
      };
    });
  });
  
  // Show Local Info record
  $(".edit_profile").live("click", function() {
    var email = $(this).data('acct_email');
    var row = db.execute('select * from wnusers where email="' + email + '" LIMIT 1');

    var email = row.fieldByName('email');
    var token = row.fieldByName('token');
    
    $('#acct_email').val(email);
    $('#email').val(email);
    $('#token').val(token);
    if (prim == email) {
      $('#prim').attr('checked', 'checked').button('refresh');
    } else {
      $('#prim').removeAttr('checked').button('refresh');
    };
    
    $('#local').hide();
    $('#addone').show();
    $('#email').focus();
  });
  
  // Show add Local Info record form
  $('.add_profile').live("click", function() {
    $('#email').val('');
    $('#token').val('');
    $('#prim').attr('checked', false).button('refresh');
    
    $('#local').hide();
    $('#addone').show();
    $('#email').focus();
  });
  
  // Show Local Info list
  $('.addcancel').live("click", function() {
    $('#addone').hide();
    $('#local').show();
  });
  
  // Update Settings
  $('.settings').live("click", function() {
    if ($('input[name=global]').is(':checked')) {
      var global = 'checked';
    } else {
      var global = '';
    };
    
    var row = db.execute("UPDATE wnsettings SET global='" + global + "' WHERE prim='" + prim + "'");
    jAlert("Success", "Updating Settings");
    refreshAll();
  });
	
	function parseDate(d)
  	{
  		var parts = d.split('-');
  		var date = months[parts[1]] + " " + parts[2] + ", " + parts[0];
  		return date;
  	}
  	
  function getPrimaryUser()
  {
    var row = db.execute("select * from wnsettings LIMIT 1");
    email = row.fieldByName('prim');
    prim = row.fieldByName('prim');
    
    var row = db.execute("select * from wnusers where email='" + email + "' LIMIT 1");
    token = row.fieldByName('token');
  }
  
  function setPrimaryUser(email)
  {
    var row = db.execute("UPDATE wnsettings SET prim='" + email + "' WHERE prim='" + prim + "'");
    getPrimaryUser();
  }
  
  // Retrieve Webbies' info
	function getWebbyInfo()
  {
    $('<div class="row webby_list">' +
        '<div class="headers">Status</div>' +
        '<div class="headers">Name</div>' +
        '<div class="headers">Plan</div>' +
        '<div class="headers">Primary IP</div>' +
        '<div class="headers">Node</div>' +
        '<div class="headers">Notes</div>' +
        '<div class="headers">Actions</div>' +
      '</div>').appendTo('.webbiesrow');
    
    if (global == 'checked') {  
      var rows = db.execute("select * from wnusers");
    } else {
      var rows = db.execute("select * from wnusers where email='" + prim + "'");
    };
    
    while (rows.isValidRow()) {
      var email = rows.fieldByName('email');
      var token = rows.fieldByName('token');
      
      (function(email, token){
        $.getJSON("https://manager.webbynode.com/api/json/webbies?email=" + email + "&token=" + token + "",
          function(data){
            $.each(data.webbies, function() {
              switch(this.status) {
                case "on":
                  var stat = '<span class="active">Active</span>';
                  var actions = '<img class="reboot" src="../images/reboot.png" title="Reboot" data-webby="' + this.name + '" data-email="' + email + '" data-token="' + token + '">' +
                                '<img class="shutdown" src="../images/shutdown.png" title="Shut Down" data-webby="' + this.name + '" data-email="' + email + '" data-token="' + token + '">';
                  break;
                case "off":
                  var stat = '<span class="off">Off</span>';
                  var actions = '<img class="start" src="../images/start.png" title="Start" data-webby="' + this.name + '" data-email="' + email + '" data-token="' + token + '">';
                  break;
                case "Rebooting":
                  var stat = '<span class="rebooting">Rebooting</span>';
                  var actions = '<img src="../images/gray_reboot.png">' +
                                '<img src="../images/gray_start.png">' +
                                '<img src="../images/gray_stop.png">';
                  break;
                default:
                  var stat = '<span class="unknown">Unknown</span>';
                  var actions = '<img src="../images/gray_reboot.png">' +
                                '<img src="../images/gray_start.png">' +
                                '<img src="../images/gray_stop.png">';
              }

              if (this.notes = 'null') {
                var notes = 'None';
              }

              $('<div class="row webby_list">' +
                  '<div class="cell">' + stat + '</div>' +
                  '<div class="cell">' + this.name + '</div>' +
                  '<div class="cell">' + this.plan + '</div>' +
                  '<div class="cell">' + this.ip + '</div>' +
                  '<div class="cell">' + this.node + '</div>' +
                  '<div class="cell">' + notes + '</div>' +
                  '<div class="cell">' + actions + '</div>' +
                '</div>').appendTo('.webbiesrow');
            });
          });
        rows.next();
      })(email, token);  
    };
  }
  
  // Refresh Webbies Info
  function refreshWebbyInfo()
  {
    $('.webby_list').remove();
  	setTimeout(getWebbyInfo, 500);
  }
  
  // Get single Webby Status
  function getWebbyStatus(webby)
  {
    $.getJSON("https://manager.webbynode.com/api/json/webby/" + webby + "/status?email=" + email + "&token=" + token + "",
      function(data){
        alert(data.status);
      });
  }
  
  // Retrieve all DNS zones
  function getDnsInfo()
  {
    $('<div class="row zones_list">' +
        '<div class="headers">Status</div>' +
        '<div class="headers">Name</div>' +
        '<div class="headers">TTL</div>' +
        '<div class="headers">Actions</div>' +
      '</div>').appendTo('.zonesrow');
    
    if (global == 'checked') {  
      var rows = db.execute("select * from wnusers");
    } else {
      var rows = db.execute("select * from wnusers where email='" + prim + "'");
    };

    while (rows.isValidRow()) {  
      var email = rows.fieldByName('email');
      var token = rows.fieldByName('token');
      
      (function(email, token){
        $.getJSON("https://manager.webbynode.com/api/json/dns?email=" + email + "&token=" + token + "",
          function(data){
            $.each(data.zones, function() {
              switch(this.status) {
                case "Active":
                  var stat = '<span class="active">Active</span>';
                  break;
                default:
                  var stat = '<span class="inactive">Inactive</span>';
              }
          
              $('<div class="row zones_list">' +
                  '<div class="cell">' + stat + '</div>' +
                  '<div class="cell">' + this.domain + '</div>' +
                  '<div class="cell">' + this.ttl + '</div>' +
                  '<div class="cell">' +
                    '<input class="records" type="submit" value="Records" data-zone="' + this.id + '" data-email="' + email + '" data-token="' + token + '">' +
                    '<input class="edit_zone" type="submit" value="Edit" data-zone="' + this.id + '" data-email="' + email + '" data-token="' + token + '">' +
                    '<input class="delete_zone" type="submit" value="Delete" data-zone="' + this.id + '" data-email="' + email + '" data-token="' + token + '">' +
                  '</div>' +
                '</div>').appendTo('.zonesrow');

              $('input:submit').button();
            });
          });
        rows.next();
      })(email, token);
    };
  }
  
  // Refresh DNS Info
  function refreshDnsInfo()
  {
    $('.zones_list').remove();
  	setTimeout(getDnsInfo, 500);
  }
  
  // Retrieve DNS zone records
  function getZoneRecords(zone,email,token)
  {
    $.getJSON("https://manager.webbynode.com/api/json/dns/" + zone + "/records?email=" + email + "&token=" + token + "",
      function(data){
        $.each(data.records, function() {
          $('<div class="row zone_records">' +
              '<div class="cell">' + this.name + '</div>' +
              '<div class="cell">' + this.data + '</div>' +
              '<div class="cell">' + this.type + '</div>' +
              '<div class="cell">' + this.aux + '</div>' +
              '<div class="cell">' + this.ttl + '</div>' +
              '<div class="cell">' +
                '<input class="edit_record" type="submit" value="Edit" data-record="' + this.id + '" data-zone="' + zone + '" data-email="' + email + '" data-token="' + token + '">' +
                '<input class="delete_record" type="submit" value="Delete" data-record="' + this.id + '" data-zone="' + zone + '" data-email="' + email + '" data-token="' + token + '">' +
              '</div>' +
            '</div>').appendTo('.recordsrow');
            
            $('input:submit').button();
        });
      });
      
    $('#record_zone_id').val(zone);
    $('#record_email').val(email);
    $('#record_token').val(token);
  }
  
  // Refresh Zone Info
  function refreshZoneInfo(zone,email,token)
  {
    $('.zone_records').remove();
  	setTimeout(function() {getZoneRecords(zone,email,token)}, 500);
  }
  
  // Retrieve the current Primary account info
  function getClientInfo()
  {
    $.getJSON("https://manager.webbynode.com/api/json/client?email=" + email + "&token=" + token + "",
      function(data){
        
        var prettydate = parseDate(data.client.datecreated);
        
        $('#clientname').text("Currently Managing " + data.client.firstname + " " + data.client.lastname + "'s Account"),
        $('#created').text(prettydate),
        if (data.client.companyname != '-') {
          $('#company').text(data.client.companyname)
        };
        $('#address').text(data.client.address1),
        $('#address2').text(data.client.city + ", " + data.client.state + " " + data.client.postcode + " " + data.client.country),
        $('#phone').text(data.client.phonenumber),
        $('#credit').text("$" + data.client.credit)
      });
  }
  
  // Refresh Client Info
  function refreshClientInfo()
  {
    setTimeout(getClientInfo, 500);
  }
  
  // Show list of local accounts
  function getLocalInfo()
  {
    var rows = db.execute("select * from wnusers");
    
    var row = db.execute("select * from wnsettings LIMIT 1");
    var prim = row.fieldByName('prim');
    
    while (rows.isValidRow()) {  
      var email = rows.fieldByName('email');
      
      if (prim == email) {
        primary = '<img src="../images/success.png">'
      } else {
        primary = ''
      };
      
      $('<div class="row local_records">' +
          '<div class="cell">' + email + '</div>' +
          '<div class="cell">' + primary + '</div>' +
          '<div class="cell">' +
            '<input class="edit_profile" type="submit" value="Edit" data-acct_email="' + email + '">' +
            '<input class="delete_profile" type="submit" value="Delete" data-acct_email="' + email + '">' +
          '</div>' +
        '</div>').appendTo('.profilesrow');
        
      rows.next();
    };
  }
  
  // Refresh Local Info
  function refreshLocalInfo()
  {
    $('.local_records').remove();
  	setTimeout(getLocalInfo, 500);
  }
  
  // Load Settings
  function getSettings()
  {
    var row = db.execute("select * from wnsettings LIMIT 1");
    global = row.fieldByName('global');
    
    if (global == 'checked') {
      $('#global').attr('checked', 'checked').button('refresh');
    } else {
      $('#global').removeAttr('checked').button('refresh');
    };
  }
  
  // Load All Info
  function loadAll()
  {
    getSettings();
    getPrimaryUser();
    getWebbyInfo();
  	getDnsInfo();
  	getClientInfo();
  	getLocalInfo();
  }
  
  // Refresh All Info
  function refreshAll()
  {
    getSettings();
    getPrimaryUser();
    refreshWebbyInfo();
    refreshDnsInfo();
    refreshClientInfo();
    refreshLocalInfo();
  }
  
  // Load All Info
	loadAll();
  
  // UI settings
	$(function() {
	  $('#global').button();
	  $('#prim').button();
	  $('input:submit', '.row').button();
	  $('#radio').buttonset();
	});
	
	// Set jQuery Tabs
	$('#tabs').tabs();
});