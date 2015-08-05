'use strict';

angular.module('WordRiverApp')
  .controller('WordManagerCtrl', function ($scope, $http, socket, Auth) {

    //global variables
    $scope.currentUser = Auth.getCurrentUser();
    $scope.categoryField = ""; //what's typed in the field when making a new wordPack
    $scope.addField = ""; //what's typed in the field for a new word name
    $scope.addType = ""; //what's typed in the field for a new word type
    $scope.editField = ""; //what's typed into the edit field for a word name
    $scope.editType = ""; //what's typed into the edit field for a word type
    $scope.searchField = ""; //not in use, was used to find a word in existing words
    $scope.categoryArray = []; //an array of all categories a user currently has
    $scope.selectedCategories = []; //categories that have been checked
    $scope.selectedTiles = []; //tiles that have been checked
    $scope.allWords = []; //a list of all tiles from the database
    $scope.allCatTiles = []; //an array of all the tiles within a wordPack
    $scope.allWords = []; //tiles that belong to the specific user
    $scope.matchTiles = []; //a way to find tiles that match other tiles to update the database
    $scope.toSort = "name"; //used for sorting
    $scope.order = false; //used for sorting
    $scope.currentCategory = null; //for some functions, is the wordPack currently in use or looked it
    $scope.currentTile = null; //for some functions, holds the tile in use
    $scope.tileId = "";
    $scope.contextTagsTemp = [];
    $scope.showValue = true; //hide value for the edit fields for the words
    $scope.showValue1 = true; //not in use, hide value for the edit field for categories
    $scope.wordToEdit = null;
    $scope.tempIndex = null;
    $scope.needToAddID = false;
    $scope.IDtoAdd = "";
    $scope.needToAddWordID = false;
    $scope.WordIDtoAdd = "";
    $scope.typeOptions =
      [ "",
        "Adjective",
        "Adverb",
        "Article",
        "Conjunction",
        "Interjection",
        "Noun",
        "Preposition",
        "Pronoun",
        "Verb"
      ];
    $scope.selection = {addType: ""};

    $scope.getWords = function(){
      $http.get('/api/tile').success(function(allTiles) {
        $scope.manageWords(allTiles);
      });
    };

    $scope.manageWords = function(myTiles){
      $scope.allWords = [];
      $scope.allWords = myTiles;
      for(var i= 0; i < myTiles.length; i++){
          $scope.allWords.push(myTiles[i]);
      }
      if( $scope.needToAddWordID ){
        $scope.addWordIDToUser($scope.WordIDtoAdd);
        $scope.needToAddWordID = false;
      }
    };

    //$scope.getWords();

    $scope.getCategories = function() {
      $http.get('/api/categories').success(function (allCategories) {
        $scope.manageCategories(allCategories);
      });
    };

    $scope.manageCategories = function(mycategories){
      $scope.categoryArray = [];
      for (var i = 0; i < mycategories.length; i++) {
          if(mycategories[i].creatorID == $scope.currentUser._id){
            $scope.categoryArray.push(mycategories[i]);
          }
      }
      if( $scope.needToAddID ){
        $scope.addCategoryIDToUser($scope.IDtoAdd);
        $scope.needToAddID = false;
      }
    };

    //$scope.getCategories();

    //Named poorly just to ensure no overlaps between functions in different models
    $scope.checkCategorys = function (category) {
      var counter;
      for (var i = 0; i < $scope.selectedCategories.length; i++) {
        if ($scope.selectedCategories[i] == category) {
          $scope.selectedCategories.splice(i, 1);
          counter = 1;
        }
      }
      if (counter != 1) {
        $scope.selectedCategories.push(category);
      }
    };

    //Named poorly just to ensure no overlaps between functions in different models
    $scope.checkTiles = function (word) {
      //console.log("This is the selected word "+word);
      var counter = 0;
      for(var i = 0; i < $scope.selectedTiles.length; i++){
        if($scope.selectedTiles[i] == word) {
          $scope.selectedTiles.splice(i,1);
          counter = 1;
        }
      }
      if(counter != 1){
        $scope.selectedTiles.push(word);
      }
    };

    $scope.checkForDuplicates = function(array){
      for (var i = 0; i < array.length; i++) {
        for (var j = i + 1; j < array.length; j++) {
          if (array[i]==array[j]){
            array.splice(j,1);
          }
        }
      }
      return array;
    };

    $scope.addTileToCategory = function() {
      for(var r = 0; r < $scope.allWords.length; r++){
        for(var y = 0; y < $scope.selectedTiles.length; y++){
          if ($scope.allWords[r]._id == $scope.selectedTiles[y]._id) {
            for (var v = 0; v < $scope.selectedCategories.length; v++) {
              $scope.allWords[r].wordPacks.push($scope.selectedCategories[v]._id);
            }
            $scope.allWords[r].wordPacks = $scope.checkForDuplicates($scope.allWords[r].wordPacks);
            $http.patch('api/tile/' + $scope.allWords[r]._id,
              {wordPacks: $scope.allWords[r].wordPacks}).success(function () {
              });
          }
        }
      }

      if($scope.currentTile != null) {
        $scope.displayWordInfo($scope.currentTile);
      }
      if($scope.currentCategory != null) {
        $scope.displayCatInfo($scope.currentCategory);
      }

      //Don't refresh anything if there isn't anything to add
      if($scope.selectedCategories.length > 0 && $scope.selectedTiles.length > 0) {
        $scope.getWords();
        $scope.getCategories();
      }
    };

    $scope.findTileByIndex = function(tile){
      for(var i = 0; i < $scope.allWords.length; i++){
        if($scope.allWords[i]._id == tile){
          return i;
        }
      }
      return -1;
    };

    $scope.inArray = function(array, item){
      for(var i = 0; i < array.length; i++){
        if(array[i] == item){
          return true;
        }
      }
      return false;
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('pack');
    });

    /*For creating a new wordPack*/
    $scope.addCategory = function () {
      if ($scope.categoryField.length >= 1) {
        $http.post('/api/categories/', {
            name: $scope.categoryField,
            isWordType: false,
            creatorID: $scope.currentUser._id
          }).success(function(object){
            $scope.makeGlobalID(object._id);
          });
      }
      $scope.categoryField="";
    };

    /*Helper for creating a new wordPack*/
    $scope.makeGlobalID = function (id) {
      $scope.needToAddID = true;
      $scope.getCategories();
      $scope.IDtoAdd = id;
    };

    /*Helper for adding a new wordPack's id to user's contextids array*/
    $scope.addCategoryIDToUser = function (toAddID) {
      for(var index = 0; index < $scope.categoryArray.length; index++) {
        if ($scope.categoryArray[index]._id == toAddID) {
          $http.put('api/users/' + $scope.currentUser._id + '/addContextID',
            {contextID: toAddID}
          ).success(function () {
              //console.log("Successfully added ID to teacher!");
            });
        }
      }
      $scope.IDtoAdd = "";
    };

    $scope.addWord = function() {
      if ($scope.addField.length > 0 && $scope.addType.length > 0) {
        $http.post('/api/tile', {
          name: $scope.addField,
          wordPacks: $scope.selectedCategories,
          wordType: $scope.addType}
        ).success(function(object){
          $scope.makeGlobalWordID(object._id);
        });
        $scope.addField = "";
      }
    };

    $scope.makeGlobalWordID = function (id) {
      $scope.needToAddWordID = true;
      $scope.getWords();
      $scope.WordIDtoAdd = id;
    };

    $scope.addWordIDToUser = function (toAddID) {
      for(var z = 0; z < $scope.allWords.length; z++) {
        if ($scope.allWords[z]._id == toAddID) {
          $http.put('/api/users/' + $scope.currentUser._id + '/addWordID',
            {wordID: toAddID}
          ).success(function () {
              //console.log("Successfully added ID to teacher!");
            });
        }
      }
      $scope.IDtoAdd = "";
    };

    $scope.uncheckAllWords = function(){
      $scope.selectedTiles = [];
      $scope.getWords();
    };

    $scope.uncheckAllCategories = function(){
      $scope.selectedCategories = [];
      $scope.getCategories();
    };

    $scope.displayCatInfo = function (category) {
      $scope.matchTiles = [];
      $scope.currentCategory = category;
        for (var j = 0; j < $scope.allWords.length; j++) {
          for (var z = 0; z < $scope.allWords[j].wordPacks.length; z++) {
            if ($scope.allWords[j].wordPacks[z] == category._id) {
              $scope.matchTiles.push($scope.allWords[j]);
            }
          }
        }
        if ($scope.matchTiles.length <= 0) {
          alert("There are no tiles in this wordPack");
        }

    };

    $scope.getCategoryFromTagName = function(tile, index) {
      for(var i = 0; i < $scope.categoryArray.length; i++){
        //console.log(tile.wordPacks[index] + " "+ $scope.categoryArray[i]._id);
        if(tile.wordPacks[index] == $scope.categoryArray[i]._id){
          $scope.contextTagsTemp.push($scope.categoryArray[i]);
          //console.log($scope.categoryArray[i]);
        }
      }
    };

      $scope.displayWordInfo = function (word) {
        $scope.contextTagsTemp = [];
        $scope.currentTile = word;
        for (var j = 0; j < word.wordPacks.length; j++) {
          $scope.getCategoryFromTagName(word, j);
        }
      };

    //Deletes a wordPack
    $scope.removeCategory = function(category) {
      $scope.tempIndex = $scope.findIndexOfCat(category);
      $scope.catToRemove = $scope.categoryArray[$scope.tempIndex];
      for(var i = 0; i<$scope.currentUser.wordPacks.length; i++){
        if($scope.currentUser.wordPacks[i] == $scope.catToRemove._id){
          $scope.currentUser.wordPacks.splice(i,1);
        }
      }
      $http.delete('/api/categories/'+ $scope.catToRemove._id
      ).success(function(){
          //console.log("ID to Remove "+$scope.catToRemove._id);
        $http.put('/api/users/' + $scope.currentUser._id + '/removeCategoryID',
          {categoryID: $scope.catToRemove._id}
        ).success(function(){
            //console.log('Patched to users context ids');
          })
      });
      $scope.categoryArray.splice($scope.tempIndex, 1);
      $scope.getCategories();
    };

    //part of the delete function, calls the removeCategory function.
    $scope.confirmDelete = function(category) {
      this.index = $scope.findIndexOfCat(category);
      if (confirm("Are you sure you want to delete " + $scope.categoryArray[$scope.findIndexOfCat(category)].name + "?") == true) {
        $scope.removeCategory(category);
      }
    };

      //Removes a word from a wordPack
    $scope.removeFromCategory = function(tile, index) {
      $scope.tileId = tile._id;
      console.log("This is the id I care about "+$scope.tileId);
      $http.put('/api/tile/' + $scope.tileId + "/removeFromCategory",
        {category: $scope.currentCategory._id,
          tileId: tile._id}
      ).success(function(){
        });
      $scope.matchTiles.splice(index, 1);
    };

    //Removes a wordPack from a word, on the server side this does the same thing as removeFromCategory
    $scope.removeCategoryFromWord = function(index) {
      $scope.tileId = $scope.currentTile._id;
      $http.put('/api/tile/' + $scope.tileId + "/removeFromCategory", {category: $scope.contextTagsTemp[index]._id, tileId: $scope.currentTile._id});
      $scope.contextTagsTemp.splice(index, 1);
    };

    //deletes a word
    $scope.removeWord = function(tile) {
      $scope.wordToRemove = $scope.allWords[$scope.findIndexOfClass(tile)];
      $http.delete('/api/tile/'+ $scope.wordToRemove._id
      ).success(function(){
        $http.put('/api/users/' + $scope.currentUser._id + '/removeWordID',
          {wordID: $scope.wordToRemove._id}
        );
      });
      $scope.getWords();
      $scope.allWords.splice($scope.findIndexOfClass(tile),1);
      for(var i = 0; i < $scope.allWords.length; i++){
        if($scope.wordToRemove.id == $scope.allWords[i].id) {
            $scope.allWords.splice(i,1);
          }
      }
    };

    $scope.findIndexOfClass = function(tile){
      for(var i = 0; i < $scope.allWords.length; i++){
        if(tile._id == $scope.allWords[i]._id){
          return i;
        }
      }
    };

    //TODO: THIS FUNCTION IS TERRIBLE - we made it this way due to time and labor constraints. PLEASE FIX.
    $scope.editWord = function(tile){
      $scope.editWordIndex = $scope.findIndexOfClass(tile);
      $scope.showValue = false;
      $scope.wordToEdit = $scope.allWords[$scope.findIndexOfClass(tile)];
    };

    $scope.updateWord = function() {
      if($scope.editField.length >= 1 && $scope.editType.length < 1){
        //Only editing the word text
        $http.post('/api/tile', {
          name: $scope.editField,
          wordPacks: $scope.allWords[$scope.editWordIndex].wordPacks,
          wordType: $scope.allWords[$scope.editWordIndex].wordType
        });
        $scope.removeWord($scope.wordToEdit);

        $scope.editField = "";
      }
      else if($scope.editField.length == 0 && $scope.editType.length >= 1){
        //Only editing the word type
        $http.post('/api/tile', {
          name: $scope.allWords[$scope.editWordIndex].name,
          wordPacks: $scope.allWords[$scope.editWordIndex].wordPacks,
          wordType: $scope.editType
        });
        $scope.removeWord($scope.wordToEdit);

        $scope.editType = "";
      }
      else if($scope.editField.length >= 1 && $scope.editType.length >= 1){
        //Editing both the word type and the word text
        $http.post('/api/tile', {
          name: $scope.editField,
          wordPacks: $scope.allWords[$scope.editWordIndex].wordPacks,
          wordType: $scope.editType
        });
        $scope.removeWord($scope.wordToEdit);

        $scope.editField = "";
        $scope.editType = "";
      }

      $scope.showValue = true;
    };

    $scope.findIndexOfCat = function(category){
      for(var i = 0; i < $scope.categoryArray.length; i++){
        if(category._id == $scope.categoryArray[i]._id){
          return i;
        }
      }
    };

    $scope.editCategory = function(category){
      $scope.editCatIndex = $scope.findIndexOfCat(category);
      $scope.showValue1 = false;
      $scope.categoryToEdit = $scope.allWords[$scope.findIndexOfClass(category)];
    };

    $scope.updateCategory = function(){
      if($scope.editField.length >= 1){

      }
      $scope.showValue1 = true;
    }
  });
