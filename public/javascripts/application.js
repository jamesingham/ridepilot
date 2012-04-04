function ISODateFormatToDateObject(str) {
  if(str === null) return null;

  var parts = str.split(' ');
  if(parts.length < 3) return null;

  var dateParts = parts[1].split('-'),
  timeSubParts = parts[2].split(':'),
  timeHours = Number(timeSubParts[0]),
  amPm = parts[3].toUpperCase();

  _date = new Date();
  _date.setFullYear( Number(dateParts[0]), (Number(dateParts[1])-1), Number(dateParts[2]) );
  
  _date.setHours(Number( amPm.slice(0,1) == "P" && timeHours != 12 ? timeHours + 12 : timeHours), Number(timeSubParts[1]), 0, 0);

  return _date;
}

function supports_history_api() {
  return !!(window.history && history.pushState);
}

MS_in_a_minute = 60000;
MS_in_a_day    = 86400000;
MS_in_an_hour  = 3600000;
MS_in_a_week   = 604800000;

// does time fall within the current week ? 
function week_differs (time) {
  var current_start = $("#calendar").data("start-time");
  return !(current_start <= time && time < current_start + MS_in_a_week);
}

// finds start of monday for week of given time, sets calendar start_time
function set_calendar_time(time) {
  var date       = new Date(time);
  var start_time = time - (date.getDay() - 1) * MS_in_a_day - 
    date.getHours() * MS_in_an_hour - 
    date.getMinutes() * MS_in_a_minute - 
    date.getSeconds() * 1000 - 
    date.getMilliseconds() ;
  
  $("#calendar").data("start-time", start_time)
}

$(function() {

  $("tr:odd").addClass("odd");
  
  // delete a customer from the show page
  $("body.customers.show .profile-actions .delete, body.addresses.edit .profile-actions .delete").click( function(event){
    event.preventDefault();

    var link = $(this);
    
    if ( $("#confirm-destroy").length > 0 ) {
      $( "#confirm-destroy" ).dialog({
        resizable: false,
        width: 480,
      	modal: true,
      	title: $("#confirm-destroy").find("legend").text(),
      	buttons: {
      		Confirm: function() {
      			$( this ).find( "form" ).submit();
      		},
      		Cancel: function() {
      			$( this ).dialog( "close" );
      		}
      	}
      });
    } else {
      $( "<div>" ).text("This will be permanently deleted. Are you sure?").dialog({
      	resizable: false,
      	modal: true,
      	buttons: {
      		Confirm: function() {
      		  link.attr("data-method", "delete").click();
      		},
      		Cancel: function() {
      			$( this ).dialog( "close" );
      		}
      	}
      });
    }
  });

  // set default driver for trip based on selected vehicle
  $("#trip_vehicle_id").live("change", function(event){
    $("#trip_driver_id").val( $(this).find("option[value=" + $(this).val() + "]").data("driver-id") );
  });

  // hide middle/last names for group customer
  var updateGroupField = function() {
    if ( $('input#customer_group').is(':checked') ){
      $('li.middlename, li.lastname').hide();
      $('li.firstname label').html("Group Name:");
    } else {
      $('li.middlename, li.lastname').show();
      $('li.firstname label').html("First Name:");
    }
  };
  updateGroupField();
  $('input#customer_group').click(updateGroupField);

  $('#new_monthly #monthly_start_date, #new_monthly #monthly_end_date, input.datepicker').datepicker({
		dateFormat: 'yy-mm-dd'    		
  });
  
  // when trip pickup time is changed, update appointment time and displayed week
  $('#trip_pickup_time').live('change', function() {
    var pickupTimeDate      = ISODateFormatToDateObject( $('#trip_pickup_time').attr("value") );
    var appointmentTimeDate = new Date(pickupTimeDate.getTime() + (1000 * 60 * 30));    

    $('#trip_appointment_time').attr( "value", appointmentTimeDate.format("ddd yyyy-mm-dd hh:MM t") );
    
    if ( week_differs(appointmentTimeDate.getTime()) ) {
      $("#calendar").weekCalendar("gotoWeek", appointmentTimeDate.getTime());
      set_calendar_time(appointmentTimeDate.getTime());
    }    
  });
  
  // needs to be -1 for field nulling
  $("#trip_vehicle_id option:contains(cab)").attr("value", "-1")
  
  $("#trip_run_id").live('change', function(){
    $("#trip_vehicle_id").val("");
    $("#trip_driver_id").val("");
  });
  
  $("#trip_vehicle_id, #trip_driver_id").live("change", function(){
    $("#trip_run_id").val("");
  });
  
  $("#vehicle_filter #vehicle_id").live("change", function(){
    var form = $(this).parents("form");
    $.get(form.attr("action"), form.serialize() + "&" + window.location.search.replace(/^\?/,""), function(data) {
      $("#calendar").weekCalendar("clear");
      $.each( data.events, function(i, e){
        $("#calendar").weekCalendar("updateEvent", e);
      } );
      var table = $("#calendar").next("table");
      table.find("tr.trip").remove();
      $.each(data.rows, function(i, row){
        table.append(row);
      })
      $("tr:odd").addClass("odd");
    }, "json");
  });
  
  $('#new_trip #customer_name').bind('railsAutocomplete.select', function(e){ 
    if ($("#trip_group").val() == "true") {
      $("li.passengers").hide();
      $("li.group_size").show();
    } else {
      $("li.passengers").show();
      $("li.group_size").hide();
    } 
  });
  
  $("#new_customer[data-path]").live("click", function(e) {
    window.location = $(this).attr("data-path") + "?customer_name=" + $("#customer_name").val();
  });
    
  $("body.runs .wc-nav button").click(function(e){
    var current_start, new_start, new_end;
    var target    = $(this);
    var week_nav  = target.parent(".wc-nav");
    
    if (target.hasClass("wc-today")){
      current_start = new Date(parseInt(week_nav.attr("data-current-week-start")));
      new_start     = new Date(current_start.getTime());
      new_end       = new Date(current_start.getTime());
      new_end.setDate(new_end.getDate() + 7);
    } else {
      current_start = new Date(parseInt(week_nav.attr("data-start-time")));
      new_start     = new Date(current_start.getTime());
      new_end       = new Date(current_start.getTime());
      
      if (target.hasClass("wc-prev")) {
        new_start.setDate(new_start.getDate() - 7); 
        new_end = current_start;
      } else {
        new_start.setDate(new_start.getDate() + 7); 
        new_end.setDate(new_end.getDate() + 14);
      }
    }

    $.get(window.location.href, {
      start : new_start.getTime(),
      end : new_end.getTime()
    }, function(data) {
      $("#runs tr").not(".head").remove();
      $("#runs").append(data.rows.join(""));
      week_nav.attr("data-start-time", new_start.getTime());
      $("#start_date").html((new_start.getMonth()+1) + "-" + new_start.getDate() + "-" + new_start.getFullYear());
      $("#end_date").html((new_end.getMonth()+1) + "-" + new_end.getDate() + "-" + new_end.getFullYear());  
    }, "json");
    
  });
  
  $("#search_addresses").bind('ajax:complete', function(event, data, xhr, status){
    var form    = $(this);
    var table   = $("#address_results");
    var results = $(data.responseText);
    
    table.find("tr").not("tr:first-child").remove();
    
    if (results[0] && results[0].nodeName.toUpperCase() == "TR")
      table.append(results);
    else
      table.append("<tr><td>There was an error searching</td></tr>");
  });
  
  $(".delete.device_pool_driver").live('ajax:complete', function(event, data, xhr, status){
    $(this).parents("tr").eq(0).hide("slow").remove();
        
    var json = eval('(' + data.responseText + ')');
    
    if (json.device_pool_driver) {
      var option = $("<option>").val(json.device_pool_driver.driver_id).text(json.device_pool_driver.name);
      $("select.new_device_pool_driver").append(option);
    }
  });
  
  $("a.add_driver_to_pool").bind("click", function(click){
    var link   = $(this);
    var select = link.prev("select");
    
    $.post( link.attr("href"),
      { device_pool_driver : { driver_id : select.val() } }, 
      function(data) {
        if (data.row) {
          var table = link.parents("td").eq(0).find("table");
          table.find("tr.empty").hide();
          table.append(data.row);
          $("select.new_device_pool_driver option[value=" + select.val() + "]").remove();
          
          link.parent("p").hide().prev("p").show();          
        } else console.log(data);
      }, "json"
    );
    
    click.preventDefault();
  });
  
  $("a.add_device_pool_driver").live("click", function(click){
    var link = $(this);
    link.parent("p").hide().next("p").show();
    
    click.preventDefault();
  });

  $('[data-behavior=date-time-picker]').datetimepicker({
    ampm: true,
    stepMinute: 15,
    stepHour: 1,
    hourMin: 7,
    hourMax: 18,
    hourGrid: 2,
    minuteGrid: 15,
    showOn: "button",
    timeFormat: 'hh:mm TT',
    dateFormat: 'yy-mm-dd',
    buttonImage: "../../images/calendar-clock.png",
    buttonImageOnly: true,
    constrainInput: false
  });
});
