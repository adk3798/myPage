/*
File: myPage/HW9/js/hw9js.js
GUI Programming I Assignment 9: Scrabble
Adam M. King, UMass Lowell Computer Science Student
adam_king@student.uml.edu
uml.cs username: aking
Updated December 16, 2019
Description: The Javascript file for the scrabble project. Responsible
for making the draggable tiles, making the board droppable, keeping track of word
and total score, allowing the user to submit a word and allowing the user to restart
the game.
*/

// set the inital max tiles to 100.
var remaining_tiles = 100;
// Array of integers 0-99. Will be used to help select tiles at random.
var tiles = [];
for (var i = 0; i < 100; i++) {
   tiles.push(i);
}
var placing = false;

// After a tile has been added to the holder, this function is used to remove
// it from the list of remaining tiles. It swaps the index to be removed with
// the index at remaining_tiles - 1 which is the largeest index allowed to be picked
// and then decreases remaining_tiles effectively removing that index from the pool
// of possibilites.
function tile_rm(index) {
  var temp = tiles[index];
  tiles[index] = tiles[remaining_tiles - 1];
  tiles[remaining_tiles - 1] = temp;
  remaining_tiles = remaining_tiles - 1;
  $('#tiles_remaining_div p span').html(remaining_tiles);
}

// generates a random number between 0 and remaining_tiles - 1
// used to select from the remaining tiles at random.
function randTileIndex() {
  return Math.floor(Math.random() * remaining_tiles);
}

// adds the draggable to tiles as well as has a function that checks
// if a tile was just dragged and runs a function on it in that case.
function make_tiles_draggable() {
  $( ".tile" ).draggable({
    revert: function(event, ui) {
      //console.log('revert');
      $(this).data("uiDraggable").originalPosition = {
        top : $('#slot' + $(this).attr('id').substr(4, 1)).offset().top - 45,
        left : $('#slot' + $(this).attr('id').substr(4, 1)).offset().left - 10
      };
      // if reverting, may need to remove classes from the tile and update word score
      var spot = findTileSpot($('#' + tileClicked));
      //console.log('xxx ' + spot);
      if(spot !== 'none' && placing === false) {
        $(this).toggleClass(spot);
        $(this).toggleClass('onBoard');
        updateScore();
      }
      placing = false;
      return !event;
    },
    containment: "parent"
  });

  var isDragging = false;
  var tileClicked = '';
  $(".tile")
    .mousedown(function() {
        isDragging = false;
        tileClicked = $(this).attr('id');
    })
    .mousemove(function() {
        isDragging = true;
        //console.log('dragged');
     })
    .mouseup(function() {
        var wasDragging = isDragging;
        isDragging = false;
        //console.log(tileClicked + ' . . . ' + $(this).attr('id'));
        // if was dragging a tile, need to possibly remove a class
        // from the tile and update the word score if it was taken off the board
        if (wasDragging) {
           //console.log('dragged');
           var spot = findTileSpot($('#' + tileClicked));
           //console.log(spot);
           if(spot !== 'none') {
             $('#' + tileClicked).toggleClass(spot);
             if($('#' + tileClicked).hasClass('onBoard')) {
               $('#' + tileClicked).toggleClass('onBoard');
               updateScore();
             }
           }
        }
    });
}

$( function() {

  // initialize the tiles
  fill_tiles();
  make_tiles_draggable();

  // make board squares droppable.
  $('.square').droppable({
    drop: function(event, ui) {
      //console.log('board drop');
      placeOnBoard(ui.draggable, $(this));
    }
  });

   // next two blocks set up submit word and restart game buttons so they
   // run their respective functions when clicked.
    $('#submitWord').click(function() {
      submitWord();
    });

    $('#restart').click(function() {
      restartGame();
    })
});

// This function is used for the animation that drags a tile onto the
// board if it is dropped on the board in an untaken square.
function placeOnBoard(tile, square) {
  //console.log('placeOnBoard ' + square.attr('id'));
  for(var i = 1; i <= 7; i++) {
    var tile_id = 'tile' + i.toString(10);
    //console.log($('#' + tile_id).attr('class'));
    if($('#' + tile_id).hasClass('on' + square.attr('id'))) {
      //console.log( square.attr('id') + ' taken');
      tile.animate({
        top:$('#slot' + tile.attr('id').substr(4, 1)).offset().top - 45,
        left:$('#slot' + tile.attr('id').substr(4, 1)).offset().left - 10},
        {duration:300});
      return;
    }
  }
  placing = true;
  var x_offset = -10;
  var y_offset = -80;
  // if trying to drop into slot 1 need to put it 20px farther to the right
  tile.animate({top:square.offset().top + y_offset,left:square.offset().left + x_offset},{duration:300});
  tile.toggleClass('on' + square.attr('id'));
  tile.toggleClass('onBoard');

  updateScore();
}

// This function is used for finding which board spot, if any,
// a given tile is on.
function findTileSpot(tile) {
  //console.log(tile.attr('class'));
  for(var i = 1; i <= 7; i++) {
    if(tile.hasClass('onsquare' + i.toString(10))) {
      return 'onsquare' + i.toString(10);
    }
  }
  return 'none';
}

// This function updates the word score. It is run whenever a tile is dragged
// and dropped
function updateScore() {
  //console.log('update score');
  var word_score = 0;
  var word_mult = 1;
  $('#submit_error p span').html('');
  if(checkContinuousWord()) {
    // word passed validation, remove word error if it was there.
    $('#word_error p span').html('');
    // loop through board squares and calculate scores by checkign for tile
    // on each square and adding the tiles value to the score.
    for(var i = 1; i <= 7; i++) {
      var onsquare_id = 'onsquare' + i.toString(10);
      if($('.tile' + '.' + onsquare_id)[0]) {
        var tile_val = $('.tile' + '.' + onsquare_id).attr('class');
        tile_val = tile_val.substr(8, 2);
        tile_val = parseInt(tile_val);
        // need to double tile val if it was on double lette square
        if($('#square' + i.toString(10)).hasClass('double_letter')) {
          //console.log('double letter square');
          tile_val = tile_val * 2;
        }
        // need to double word multiplier if it was on double word score
        // square. The word multiplier is applied at the very end.
        else if($('#square' + i.toString(10)).hasClass('double_word')) {
          //console.log('double word square');
          word_mult = word_mult * 2;
        }
        word_score = word_score + tile_val;
      }
    }
  }
  else {
    //console.log('word not continuous');
    // word failed validation. Print error message.
    $('#word_error p span').html('Tiles must be continuous to form word!');
  }
  // calculate word score and print it to screen. If validation failed it Will
  // still be 0.
  word_score = word_score * word_mult;
  //console.log(word_score);
  $('#word_score_div p span').html(word_score);
}

// This function adds in all missing tiles so that there are 7 of them unless
// there are no tiles left. It is responsible for randomly picking a reamining
// tile and creating it.
function fill_tiles() {
  for(var i = 1; i <= 7 && remaining_tiles > 0; i++) {
    if (!($('#tile' + i.toString(10)).length)) {
      var tile_index = randTileIndex();
      // tile_arr is in the tiles.js file. It has 100 elements, each of which
      // is a tile. next_tile is set to the tile at a random index that hasn't
      // already been picked this game.
      var next_tile = tile_arr[tiles[tile_index]];
      // the rest of this is jsut Javascript creating the tile element
      var tileDiv = document.createElement('div');
      tileDiv.classList.add('tile');
      tileDiv.classList.add('val' + next_tile.val.toString(10) + '.');
      tileDiv.id = 'tile' + i.toString(10);
      var tileImg = document.createElement('img');
      tileImg.src = 'img/Tiles/' + next_tile.name + '.jpg';
      tileImg.style.width = '50px';
      tileImg.style.height = '50px';
      tileImg.alt = 'Tile ' + next_tile.name;
      tileDiv.appendChild(tileImg);
      tileDiv.style.position = "absolute";
      topPos = $('#slot' + i.toString(10)).offset().top - 45;
      tileDiv.style.top = topPos.toString(10) + 'px';
      leftPos = $('#slot' + i.toString(10)).offset().left - 10;
      tileDiv.style.left = leftPos.toString(10) + 'px';
      tileDiv.style.margin = '0px';
      document.getElementById('container').appendChild(tileDiv);
      // remove the tile that was just picked form the pool of tiles
      // that can be picked for the rest of this game.
      tile_rm(tile_index);
    }
  }
}

// this function is responsible for allowing he user to submit a word.
// It includes a check that the word is valid to be submitted by checking
// if the word score is not 0.
function submitWord() {
  if($('#word_score_div p span').html() != '0') {
    // word can be submitted. Make sure word error is blank.
    $('#submit_error p span').html('');
    // calculate new total score and print i.
    var old_score =  parseInt($('#score_div p span').html());
    var new_word_score = parseInt($('#word_score_div p span').html());
    var new_score = old_score + new_word_score;
    $('#score_div p span').html(new_score);
    // reset word score to 0 since word was submitted.
    $('#word_score_div p span').html('0');
    // remove all tiles used to make word
    for(var i = 1; i <= 7; i++) {
      var onsquare_id = 'onsquare' + i.toString(10);
      $('.tile' + '.' + onsquare_id).remove();
    }
    // fill in all used tiles with new ones.
    fill_tiles();
    make_tiles_draggable();
  }
  else {
    // if score is 0, tell user they can't submit
    $('#submit_error p span').html('Cannot submit word with score of 0!');
  }
}

// This function is responsible for restarting the game.
function restartGame() {
  // first, reset scores and error messages to defaults.
  $('#word_score_div p span').html('0');
  $('#score_div p span').html('0');
  $('#word_error p span').html('');
  // remove all tiles currently on screen.
  for(var i = 1; i <= 7; i++) {
    $('#tile' + i.toString(10)).remove();
  }
  // reset tiles so all 100 tiles are usable again.
  remaining_tiles = 100;
  fill_tiles();
  make_tiles_draggable();
}

// This function just checks that tiles on board are continuous. If they're
// not continuous it reutrns false to tell updateScore function the word is invalid.
function checkContinuousWord(){
  //console.log('checking word');
  var begin = -1;
  var end = -1;
  // find out on which square the word begins.
  for(var i = 1; i <= 7 && begin == -1; i++) {
    var onsquare_id = 'onsquare' + i.toString(10);
    if($('.tile' + '.' + onsquare_id)[0]) {
      begin = i;
    }
  }
  // if begin == -1 then the board is blank which is technically continuous
  // so it returns true
  if(begin === -1) { return true; }
  // find out on which square the word ends.
  for(var i = 7; i >= 1 && end == -1; i--) {
    var onsquare_id = 'onsquare' + i.toString(10);
    if($('.tile' + '.' + onsquare_id)[0]) {
      end = i;
    }
  }
  // check that there is a tile on every word between the starting square
  // and ending square. If something is missing return false to say word is invalid.
  for(var i = begin; i <= end; i++) {
    var onsquare_id = 'onsquare' + i.toString(10);
    if(!($('.tile' + '.' + onsquare_id).length)) {
      return false;
    }
  }
  // if this point is reached the tiles are continuous so return true
  return true;
}
