/*
File: myPage/HW6/js/hw6js.js
GUI Programming I Assignment 6: Dynamically generate table with Javascript
Adam M. King, UMass Lowell Computer Science Student
adam_king@student.uml.edu
uml.cs username: aking
Updated November 10, 2019
Description: This is the javascript filed for the dynamically generated
table project. It is responsible for verifying form fields and creating
the table itself.
*-->*/

// These 4 lines force fields to be verified as soon as changes are detected
document.getElementById("hor_start").onchange = function() {verifyHor()};
document.getElementById("hor_end").onchange = function() {verifyHor()};
document.getElementById("vert_start").onchange = function() {verifyVert()};
document.getElementById("vert_end").onchange = function() {verifyVert()};

// this function is run when the "Make Table" button is pressed
// it either prints and error message indicating the fields cannot be verified
// or generates the table and adds it to the page
function makeTable() {
  submsg = document.getElementById("submitmsg");
  // only try to make tale if fields can be verified
  if(verifyVals()) {
    submsg.innerHTML = ""
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
  else {
    // If verification failed, print out an error message
    submsg.innerHTML = "Invalid input. Please fix input and resubmit."
  }
}

// this function verifies whichever field has the id it is passed
function verifyField(name) {
  // assign name2 to corresponding field
  var name2;
  if(name == "hor_start") { name2 = "hor_end"; }
  else if(name == "hor_end") { name2 = "hor_start"; }
  else if(name == "vert_start") { name2 = "vert_end"; }
  else if(name == "vert_end") { name2 = "vert_start"; }
  else {
    console.log("Error: Invalid field name given to verifyField");
    return false;
  }
  // grab element and related element in form
  var field1 = document.getElementById(name);
  var field2 = document.getElementById(name2);
  // create message that will tell erros if applicable
  var msg = "";
  //check value is integer
  if(!(/^[-+]?\d+$/.test(field1.value))) {
    msg = "Value must be an integer!"
  }
  // check value is not below minimum
  else if(parseInt(field1.value) < -10000) {
    msg = "Value must be >= -10000"
  }
  // check value is not above maximum
  else if(parseInt(field1.value) > 10000) {
    msg = "Value must be <= 10000"
  }
  // if correspondin field contains an integer, check it is within
  // 50 of the value in the field you're checking (50 is max range allowed)
  else if((/^[-+]?\d+$/.test(field2.value)) &&
           Math.abs(parseInt(field1.value) - parseInt(field2.value)) > 50) {
    msg = "Max range (difference between start and end) is 50";
  }
  // print error message next to field (if there is one)
  document.getElementById(name + "msg").innerHTML = msg;
  // return if vield is valid (no error meesage means no errors)
  if (msg == "") {
    field1.classList.remove("field_error");
    return true;
  }
  else {
    field1.classList.add("field_error");
    return false;
  }
}

// This function verifies both the multiplier fields
function verifyHor() {
  var hor_start_valid = verifyField("hor_start");
  var hor_end_valid = verifyField("hor_end");
  if(hor_start_valid && hor_end_valid) { return true; }
  else { return false; }
}

// this function verifies both multiplicand fields
function verifyVert() {
  var vert_start_valid = verifyField("vert_start");
  var vert_end_valid = verifyField("vert_end");
  if(vert_start_valid && vert_end_valid) { return true; }
  else { return false; }
}

// this function verifies all fields
function verifyVals() {
  if(verifyHor() && verifyVert()) { return true; }
  else { return false; }
}
