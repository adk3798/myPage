// ADD NEW ITEM TO END OF LIST
var grocery_list = document.querySelector("ul");
var new_item_end = document.createElement("li");
new_item_end.appendChild(document.createTextNode("cream"));
new_item_end.setAttribute("id", "five");
grocery_list.appendChild(new_item_end);

// ADD NEW ITEM START OF LIST
var new_item_begin = document.createElement("li");
new_item_begin.appendChild(document.createTextNode("kale"));
new_item_begin.setAttribute("id", "zero");
grocery_list.insertBefore(new_item_begin, grocery_list.childNodes[0]);


// ADD A CLASS OF COOL TO ALL LIST ITEMS
var all_li = grocery_list.children;
for(var i = 0; i < all_li.length; i++) {
  all_li[i].setAttribute("class", "cool");
}


// ADD NUMBER OF ITEMS IN THE LIST TO THE HEADING
var heading = document.querySelector("h2");
var heading_extra = document.createElement("span");
heading_extra.appendChild(document.createTextNode(all_li.length));
heading.appendChild(heading_extra);
