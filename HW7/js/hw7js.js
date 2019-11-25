/*
File: myPage/HW7/js/hw7js.js
GUI Programming I Assignment 7: Validate field with jQuery validation plugin
Adam M. King, UMass Lowell Computer Science Student
adam_king@student.uml.edu
uml.cs username: aking
Updated November 24, 2019
Description: This is the javascript filed for the jQuery validation plugin
assignment. It uses the plugin to validate the form and then creates a table
like in Homework 6 if validation is passed
*/

// validation function for form fields
function valform() {
  $.validator.addMethod("isInt", function (value, element, param) {
      // default digits didn't allow negative integers so I'm making my own validation function
      return (/^[-+]?\d+$/.test(value));
  });

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
         makeTable()
       }
  });
};

// once page is loaded, should start validating form
$(document).ready(function() {
  valform();
});

// makeTable taken almost directly from homework 6 (minus validation that was previously done)
function makeTable() {
  var newTable = document.createElement('table');
  var hor_start = parseInt(document.getElementById("hor_start").value);
  var hor_end = parseInt(document.getElementById("hor_end").value);
  var vert_start = parseInt(document.getElementById("vert_start").value);
  var vert_end = parseInt(document.getElementById("vert_end").value);

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

  var mult_table = document.getElementById('mult_table_div');
  // remove any previously added tables
  while(mult_table.firstChild) {
    mult_table.removeChild(mult_table.firstChild);
  }
  // add newly create table
  mult_table.append(newTable);
}
