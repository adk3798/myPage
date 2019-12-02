/*
File: myPage/HW8/js/hw8js.js
GUI Programming I Assignment 8: Use jQuery sliders and tabs
Adam M. King, UMass Lowell Computer Science Student
adam_king@student.uml.edu
uml.cs username: aking
Updated December 1, 2019
Description: This is the javascript filed for the jQuery slider and tabs assignment.
It uses a slider as an option to adjust table boundaries and stores tables made
inside of tabs
*/

// setup remove current tab and remove all tabs buttons to run respective
// functions when clicked
document.getElementById("delTabButton").onclick = function() {delCurTab()};
document.getElementById("delAllTabButton").onclick = function() {delAllTabs()};

// validation function for make table form fields
function valform() {
  $.validator.addMethod("isInt", function (value, element, param) {
      // default digits didn't allow negative integers so I'm making my own validation function
      return (/^[-+]?\d+$/.test(value));
  });

  // This function is from hw7 and isn't necessary for 8 but I've left it in.
  $.validator.addMethod("inRange", function (value, element, param) {
      // validation function to make sure start and end values are within 50 of each other
      // only actually checks range if other field is an integer
      return (!(/^[-+]?\d+$/.test($(param).val())) ||
               Math.abs(parseInt(value) - parseInt($(param).val())) <= 50)
  });

  $("#tableform").validate({
    // set rules for each field. The rules for each are essentially the same outside of which
    // field it is compared to in the inRange function
    rules: {
      hor_start: {
        required: true,
        isInt: true,
        min: -10000,
        max: 10000,
        inRange: "#hor_end"
      },
      hor_end: {
        required: true,
        isInt: true,
        min: -10000,
        max: 10000,
        inRange: "#hor_start"
      },
      vert_start: {
        required: true,
        isInt: true,
        min: -10000,
        max: 10000,
        inRange: "#vert_end"
      },
      vert_end: {
        required: true,
        isInt: true,
        min: -10000,
        max: 10000,
        inRange: "#vert_start"
      },
    },

    // create custom error messages based on what validation was failed. The same for each field
    messages: {
         hor_start: {
           required: "This field is required!",
           isInt: "This field must be given an integer.",
           min: "Given integer must be >= -10000",
           max: "Given integer must be <= 10000",
           inRange: "Max range (difference between start and end) is 50"
         },
         hor_end: {
           required: "This field is required!",
           isInt: "This field must be given an integer.",
           min: "Given integer must be >= -10000",
           max: "Given integer must be <= 10000",
           inRange: "Max range (difference between start and end) is 50"
         },
         vert_start: {
           required: "This field is required!",
           isInt: "This field must be given an integer.",
           min: "Given integer must be >= -10000",
           max: "Given integer must be <= 10000",
           inRange: "Max range (difference between start and end) is 50"
         },
         vert_end: {
           required: "This field is required!",
           isInt: "This field must be given an integer.",
           min: "Given integer must be >= -10000",
           max: "Given integer must be <= 10000",
           inRange: "Max range (difference between start and end) is 50"
         }
       },

       wrapper: 'span',

       // this function is run if the form is submitted and validation is passed
       submitHandler: function (form) {
         $("#myTabs").tabs({
           // want to change slider and fields to match current table
           // when user clicks different tab. This initializes that
           activate: function( event, ui ) {tabChange();}
         });

         // want to change slider and fields to match current table
         // when user clicks different tab. This is a listener for that
         $( ".selector" ).on( "tabsactivate", function( event, ui ) {tabChange();} );

         // Get form values and pass them into "getNextTab" which will make a tab for the table
         var hor_start = parseInt(document.getElementById("hor_start").value);
         var hor_end = parseInt(document.getElementById("hor_end").value);
         var vert_start = parseInt(document.getElementById("vert_start").value);
         var vert_end = parseInt(document.getElementById("vert_end").value);
         var tabContent = getNextTab(hor_start, hor_end, vert_start, vert_end);

         // Now  make that table. The argument passed in is the id of the tab which the table will belong to.
         makeTable(tabContent);
       }
  });
};

// This validates the form for deleting tabs within a certain range
function valDelForm() {
  //console.log('val del form');
  $.validator.addMethod("isInt", function (value, element, param) {
      // default digits didn't allow negative integers so I'm making my own validation function
      return (/^[-+]?\d+$/.test(value));
  });

  // This function checks that min field is less than max field
  $.validator.addMethod("isLower", function (value, element, param) {
      // validation function to make sure min value is less than max value
      return (!(/^[-+]?\d+$/.test($(param).val())) ||
               parseInt(value) <= parseInt($(param).val()))
  });

  $("#del_form").validate({
    // set rules for each field. The rules for each are essentially the same outside of
    // min field having extra check for being less than max
    rules: {
      del_min: {
        required: true,
        isInt: true,
        min: 1,
        isLower: "#del_max"
      },
      del_max: {
        required: true,
        isInt: true,
        min: 1,
      },
    },

    // create custom error messages based on what validation was failed.
    messages: {
         del_min: {
           required: "Min field is required!",
           isInt: "Min field must be given an integer.",
           min: "Min field must be >= 1",
           isLower: "Min must be lower than max"
         },
         del_max: {
           required: "Max field is required!",
           isInt: "Max field must be given an integer.",
           min: "Max field must be >= 1",
         },
       },

       wrapper: 'span',
       errorElement : 'div',
       errorLabelContainer: '.delErr',

       // this function is run if the form is submitted and validation is passed
       submitHandler: function (form) {
         //console.log('del form submit handler');

         // call the function to actually delete the tabs
         delTabsRange();
       }
  });
};

// once page is loaded, should start validating forms and setup sliders
$(document).ready(function() {
  valform();
  valDelForm();
  setup_slider("#hor_start_slider", "#hor_start");
  setup_slider("#hor_end_slider", "#hor_end");
  setup_slider("#vert_start_slider", "#vert_start");
  setup_slider("#vert_end_slider", "#vert_end");

});

// this function creates the sliders and creates the two-way binding with the text fields
function setup_slider(slider_id, textbox_id) {
  $(function () {
  // this generates the slider
  $(slider_id).slider({
    min: -10, max: 10, value: 0,
    // this function is run when slider is moved. It will also update text box
    slide: function( event, ui) {
      //console.log(ui.value);
      $(textbox_id).val(ui.value);
      // if there are tabs present at least one is active so the table must be
      // dynamically updated.
      if($("#myTabs ul li").length > 0){
        var active_index = $("#myTabs").tabs('option', 'active');
        //console.log(active_index);
        var tab = $("#myTabs").find(".ui-tabs-nav li:eq(" + active_index + ")");
        var div_id = tab.attr('id');
        div_id = div_id.substring(3, div_id.length);
        // update the table. Pass in the id of the div where the table resides
        makeTable(div_id);
        // update the tab. The tab keeps info of the bounds of the table it
        // contains so if the bounds of the table are changed the tab should be
        // changed as well.
        updateTab(tab.attr('id'));
      }
    }
  });
  var initialValue = $(slider_id).slider("option", "value");
  $(textbox_id).val(initialValue);
  // this function is run if the text fields are updated. It must update
  // the slider's value as well as the table and tab if a tab exists
  $(textbox_id).change(function() {
    var oldVal = $(slider_id).slider("option", "value");
    var newVal = $(this).val();
    // similar to what is done with slide function, if tabs exist, get tab and div
    // for table so they can be updated.
    if($("#myTabs ul li").length > 0){
      var active_index = $("#myTabs").tabs('option', 'active');
      //console.log(active_index);
      var tab = $("#myTabs").find(".ui-tabs-nav li:eq(" + active_index + ")");
      var div_id = tab.attr('id');
      div_id = div_id.substring(3, div_id.length);
    }
    // Next 4 if-else blocks check if field change is valid. If it's not, go to
    // a default value and then regardless, update table and tab
    if (isNaN(newVal)) {
      $(textbox_id).val(0);
      if($("#myTabs ul li").length > 0){
        makeTable(div_id);
        updateTab(tab.attr('id'));
      }
    } else if(newVal < -10) {
      $(textbox_id).val(-10);
      if($("#myTabs ul li").length > 0){
        makeTable(div_id);
        updateTab(tab.attr('id'));
      }
    } else if(newVal > 10) {
      $(textbox_id).val(10);
      if($("#myTabs ul li").length > 0){
        makeTable(div_id);
        updateTab(tab.attr('id'));
      }
    } else {
      $(slider_id).slider("option", "value", newVal);
      if($("#myTabs ul li").length > 0){
        makeTable(div_id);
        updateTab(tab.attr('id'));
      }
    }
  });
 });
}

// function for deleting current active tab
function delCurTab() {
  if($("#myTabs ul li").length <= 0) {
    // if there's no tabs, just return since there's nothing to delete
    return;
  }
  // get index of active tab
  var active_index = $("#myTabs").tabs('option', 'active');
  //console.log(active_index);
  // grab active tab
  var tab = $("#myTabs").find(".ui-tabs-nav li:eq(" + active_index + ")");
  dead_div_id = tab.attr('id');
  dead_div_id = dead_div_id.substring(3, dead_div_id.length);
  //console.log(dead_div_id);
  // actually remove tab and corresponding div where table resides
  $("#" + dead_div_id.toString(10)).remove();
  tab.remove();
  // If there are still tabs left after deletion, make active tab the next tab to
  // the left unless it was leftmost tab in which make the tab to the right the
  // active tab
  if ($("#myTabs ul li").length > 0) {
    if(active_index > 0) {
      $("#myTabs").tabs({ active: active_index-1 });
    } else {
      $("#myTabs").tabs({ active: active_index });
    }
  }
  // refresh tabs now that deletion is done and new active tab is chosen
  $("#myTabs").tabs("refresh");
}

// delete tabs in range function
function delTabsRange() {
  //console.log("del tabs in range");
  var del_min = parseInt(document.getElementById("del_min").value);
  var del_max = parseInt(document.getElementById("del_max").value);
  var i = del_min;
  while(i <= del_max){
    //console.log(i);
    if ($("#tab" + i.toString(10)).length > 0) {
      // remove the tab
      $("#tab" + i.toString(10)).remove();
      // remove the div that held the tab's content
      $("#" + i.toString(10)).remove();
    }
    i = i + 1;
  }
  // refresh tabs now that deletion is done
  $("#myTabs").tabs("refresh");
}

// function to remove all tabs
function delAllTabs() {
  // loop through deleting tabs and corresponding divs until no
  // tabs are left
  while($("#myTabs ul li").length > 0) {
    var tab = $("#myTabs").find(".ui-tabs-nav li:eq(" + 0 + ")");
    dead_div_id = tab.attr('id');
    dead_div_id = dead_div_id.substring(3, dead_div_id.length);
    //console.log(dead_div_id);
    $("#" + dead_div_id.toString(10)).remove();
    tab.remove();
  }
  // refresh tabs after done deleting
  $("#myTabs").tabs("refresh");
}

// function that creates new tab and div for table when "Make Table" button is
// pressed and validation is passed. It returns the tab number (x in "Tab x" displayed
// in tab)
function getNextTab(x1, x2, y1, y2) {
  var tabNum = 1
  while($("#tab" + tabNum.toString(10)).length) {
    tabNum = tabNum + 1
  }
  // create all the elements needed for the tab. This includes a list item, link
  // and some text
  var newTab = document.createElement('li');
  newTab.setAttribute("id", "tab" + tabNum.toString(10));
  var tabLink = document.createElement('a');
  tabLink.setAttribute("href", "#" + tabNum.toString(10));
  var tabLinkText = document.createElement('p');
  var tabText0 = document.createTextNode("Tab " + tabNum.toString(10));
  var tabText1 = document.createTextNode("Columns: " + x1.toString(10) + " to " + x2.toString(10));
  var tabText2 = document.createTextNode("Rows: " + y1.toString(10) + " to " + y2.toString(10));
  tabLinkText.appendChild(tabText0);
  tabLinkText.appendChild(document.createElement('br'));
  tabLinkText.appendChild(tabText1);
  tabLinkText.appendChild(document.createElement('br'));
  tabLinkText.appendChild(tabText2);
  tabLink.appendChild(tabLinkText);
  newTab.appendChild(tabLink);
  // choose where to place tab so that they are ordered properly. This first check
  // checks if any tabs are currently present. If there are none appen the tab to the
  // tabList list
  if ($("#myTabs ul li").length <= 0) {
    document.getElementById("tabList").appendChild(newTab);
  } else {
    // tabNum === 1 means this is "Tab 1" which is the leftmost tabs so prepend
    // it to tabList
    if(tabNum === 1){
      $("#tabList").prepend(newTab);
    } else {
      // if it isn't leftmost tab there is some tab before it so add this tab
      // after that one
      prevTab = tabNum - 1;
      $("#tab" + prevTab.toString(10)).after(newTab);
    }
  }
  // create div to hold table
  var newDiv = document.createElement('div');
  newDiv.setAttribute("id", tabNum.toString(10));
  document.getElementById("myTabs").appendChild(newDiv);
  $("#myTabs").tabs("refresh");
  return tabNum.toString(10);
}

// if user clicks a new tab, must change slider and text field to mach table
// in new active tab. This function does that.
function tabChange() {
  var active_index = $("#myTabs").tabs('option', 'active');
  //console.log(active_index);
  var tab = $("#myTabs").find(".ui-tabs-nav li:eq(" + active_index + ")");
  var div_id = tab.attr('id');
  div_id = div_id.substring(3, div_id.length);

  // Next 4 blocks of code grab the bounds directly from the table then update
  // the text fields and sliders to match what's in the table.
  var x1_val = $("#" + div_id + " table tr:first-child td:nth-child(2)").html();
  //console.log(x1_val);
  $("#hor_start").val(parseInt(x1_val));
  $("#hor_start_slider").slider("option", "value", parseInt(x1_val));

  var x2_val = $("#" + div_id + " table tr:first-child td:last-child").html();
  $("#hor_end").val(parseInt(x2_val));
  $("#hor_end_slider").slider("option", "value", parseInt(x2_val));

  var y1_val = $("#" + div_id + " table tr:nth-child(2) td:first-child").html();
  $("#vert_start").val(parseInt(y1_val));
  $("#vert_start_slider").slider("option", "value", parseInt(y1_val));

  var y2_val = $("#" + div_id + " table tr:last-child td:first-child").html();
  $("#vert_end").val(parseInt(y2_val));
  $("#vert_end_slider").slider("option", "value", parseInt(y2_val));
}

// if slider or text fields are changed and table is dynamically updated then
// tab must be updated to reflect the bounds of the table in its content
function updateTab(tab_id) {
  //console.log("update tab");
  var x1_val = $("#hor_start").val();
  var x2_val = $("#hor_end").val();
  var y1_val = $("#vert_start").val();
  var y2_val = $("#vert_end").val();
  tabText = document.getElementById(tab_id).firstChild.firstChild;
  //console.log(tabText);
  var tabNum = document.getElementById(tab_id).getAttribute('id');
  tabNum = tabNum.substring(3, tabNum.length);
  //console.log(tabNum);
  var tabText0 = document.createTextNode("Tab " + tabNum);
  var tabText1 = document.createTextNode("Columns: " + x1_val.toString(10) + " to " + x2_val.toString(10));
  var tabText2 = document.createTextNode("Rows: " + y1_val.toString(10) + " to " + y2_val.toString(10));
  tabText.innerHTML="";
  tabText.appendChild(tabText0);
  tabText.appendChild(document.createElement('br'));
  tabText.appendChild(tabText1);
  tabText.appendChild(document.createElement('br'));
  tabText.appendChild(tabText2);
}

// makeTable taken almost directly from homework 6 (minus validation that was previously done)
// change from homework 7 is it now takes argument which is id of div where it should palce the
// table it creates
function makeTable(content_id) {
  var newTable = document.createElement('table');
  var hor_start = parseInt(document.getElementById("hor_start").value);
  var hor_end = parseInt(document.getElementById("hor_end").value);
  var vert_start = parseInt(document.getElementById("vert_start").value);
  var vert_end = parseInt(document.getElementById("vert_end").value);
  //var tabContent = getNextTab(hor_start, hor_end, vert_start, vert_end);

  // decide whether the table will use the small, medium or large text size
  // depending on the max range between start and end values
  var sz = "lg-ele";
  if(Math.abs(hor_start - hor_end) > 30 || Math.abs(vert_start - vert_end) > 30) {
    sz = "sm-ele";
  }
  else if(Math.abs(hor_start - hor_end) > 15 || Math.abs(vert_start - vert_end) > 15) {
    sz = "md-ele";
  }

  // need blank spot in top left of table
  var row = document.createElement('tr');
  var column = document.createElement('td');
  column.appendChild(document.createTextNode(""));
  row.appendChild(column);

  // start by creating top row to show what value is
  // being multiplied in this column
  var final = false;
  var i = hor_start;
  do {
    column = document.createElement('td');
    column.classList.add("multiplier");
    column.classList.add(sz);
    column.appendChild(document.createTextNode(i));
    row.appendChild(column);
    if( i < hor_end) { i++; }
    else if(i > hor_end) { i--; }
    else { final = true; }
  } while(i != hor_end || !final);
  // add row to table
  newTable.appendChild(row);

  var j = hor_start;
  var i = vert_start
  final = false;
  var final2 = false;

  // make rest of rows in table
  do {
    // first add column with value to multiply by in this row
    row = document.createElement('tr');
    column = document.createElement('td');
    column.classList.add("multiplicand");
    column.classList.add(sz);
    column.appendChild(document.createTextNode(i));
    row.appendChild(column);
    // now create columns that show multiplication of value for
    // this row and value for this column
    j = hor_start;
    final2 = false;
    do {
      column = document.createElement('td');
      column.classList.add("result");
      column.classList.add(sz);
      column.appendChild(document.createTextNode(i*j));
      row.appendChild(column);
      if( j < hor_end) { j++; }
      else if(j > hor_end) { j--; }
      else { final2 = true; }
    } while(j != hor_end || !final2)
    newTable.appendChild(row);
    if( i < vert_end) { i++; }
    else if(i > vert_end) { i--; }
    else { final = true; }
  } while(i != vert_end || !final)

  //console.log(content_id);
  var mult_table = document.getElementById(content_id);
  // remove any previously added tables
  while(mult_table.firstChild) {
    mult_table.removeChild(mult_table.firstChild);
  }
  // add newly create table
  mult_table.append(newTable);
  // make the user's active tab the one with the newly created table
  $("#myTabs").tabs({ active: parseInt(content_id)-1 });
}
