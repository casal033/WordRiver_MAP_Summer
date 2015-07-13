'use strict';

angular.module('WordRiverApp')
  .controller('MyWordsCtrl', function ($scope, $http, socket, Auth) {
    $scope.currentUser = Auth.getCurrentUser();
    $scope.allWords = []; //a list of all words from the database
    $scope.userWords = []; //words that teacher has added
    $scope.userAllWords = []; //a list of all words from the database minus words created by users
    $scope.userWordIDs = []; //words that teacher has added
    $scope.showValue = true; //hide value for the edit fields for the words
    $scope.wordToEdit = null;
    $scope.editField = ""; //what's typed into the edit field for a word name
    $scope.editType = ""; //what's typed into the edit field for a word type
    $scope.typeOptions =
      [
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

    $scope.getAllWords = function () {
      $scope.allWords = []; //a list of all words from the database
      $http.get('/api/tile').success(function (allWords) {
        $scope.allWords = allWords;
        $scope.getAllUserWords();
        $scope.getUserWords();
      });
    };

    $scope.getAllWords();

    $scope.getUserWords = function () {
      $scope.userWordIDs = [];
      $scope.userWords = []; //words that teacher has added
      $http.get("/api/users/me").success(function (user) {
        $scope.userWordIDs = user.words;
        for (var index = 0; index < $scope.allWords.length; index++) {
          for (var index2 = 0; index2 < $scope.userWordIDs.length; index2++) {
            if ($scope.allWords[index]._id == $scope.userWordIDs[index2]) {
              $scope.userWords.push($scope.allWords[index]);
            }
          }
        }
      })
    };

    $scope.getAllUserWords = function () {
      $scope.userAllWords = [];
      for(var index = 0; index < $scope.allWords.length; index++){
        if(!($scope.allWords[index].userCreated)){
          $scope.userAllWords.push($scope.allWords[index]);
        }
      }
    };

    $scope.findIndexOfWord = function (word) {
      for (var i = 0; i < $scope.allWords.length; i++) {
        if (word._id == $scope.allWords[i]._id) {
          return i;
        }
      }
    };

    $scope.editWord = function (word) {
      $scope.editWordIndex = $scope.findIndexOfWord(word);
      $scope.showValue = false;
      $scope.wordToEdit = $scope.allWords[$scope.findIndexOfWord(word)];
    };

    //Updates a word in the server when it's edited
    $scope.updateWord = function () {
      //If a word is entered, but the type is not
      if ($scope.editField.length >= 1 && $scope.editType.length < 1) {
        $http.patch('/api/tile/' + $scope.wordToEdit._id, {
          name: $scope.editField,
          wordPacks: $scope.allWords[$scope.editWordIndex].wordPacks,
          wordType: $scope.allWords[$scope.editWordIndex].wordType
        });
        $scope.editField = "";
        //If a word is not entered, but the type has been
      } else if ($scope.editField.length == 0 && $scope.editType.length >= 1) {
        $http.patch('/api/tile/' + $scope.wordToEdit._id, {
          name: $scope.allWords[$scope.editWordIndex].name,
          wordPacks: $scope.allWords[$scope.editWordIndex].wordPacks,
          wordType: $scope.editType
        });

        $scope.editType = "";
        //If a word is entered, and the type is also entered
      } else if ($scope.editField.length >= 1 && $scope.editType.length >= 1) {
        $http.patch('/api/tile/' + $scope.wordToEdit._id, {
          name: $scope.editField,
          wordPacks: $scope.allWords[$scope.editWordIndex].wordPacks,
          wordType: $scope.editType
        });

        $scope.editField = "";
        $scope.editType = "";
      }
      $scope.getAllWords();
      $scope.showValue = true;
    };

    //Deletes a word from the server and from a user's array of words they've created
    $scope.removeWord = function (word) {
      $scope.wordToRemove = $scope.allWords[$scope.findIndexOfWord(word)];
      $http.delete('/api/tile/' + $scope.wordToRemove._id
      ).success(function () {
          $http.put('/api/users/' + $scope.currentUser._id + '/removeWordID',
            {wordID: $scope.wordToRemove._id}
          ).success(function () {
            });
        });
      $scope.getAllWords();
    };

  });
