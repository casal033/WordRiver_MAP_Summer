'use strict';

//var jquery = require('./../../bower_components/jquery/src/jquery.js');

angular.module('WordRiverApp')
  .controller('AssignWordsCtrl', function ($rootScope, $scope, $http, socket, Auth) {
    $scope.currentUser = Auth.getCurrentUser();
    $scope.categoryArray = [];
    $scope.userClasses = [];
    $scope.userWordPacks = [];
    $scope.studentArray = [];
    $scope.allStudents = [];
    $scope.matchWords = [];
    $scope.allWords = [];
    $scope.studentWordPacks = [];
    $scope.studentsInClass = [];
    $scope.value = false;
    $scope.help = false;
    $scope.displayWords = [];

    $scope.selectedWordPacks = [];
    $scope.selectedClasses = [];
    $scope.selectedStudents = [];
    $scope.selectedWords = [];

    $scope.helpText = "Get Help";



    ////////////////////////////////////////////////////////////////////////////
    //This is the section for getting all the things

    $scope.getWords = function(){
      $scope.allWords = [];
      $http.get('/api/tile').success(function(tiles) {
        $scope.allWords = tiles;
      });
    };

    $scope.getClasses = function(){
      $scope.userClasses = [];
      $http.get("/api/users/me").success(function(user){
        $scope.userClasses = user.classList;
      })
    };

    $scope.getStudents = function(){
      $scope.userStudents = [];
      $http.get("/api/students").success(function(allStudents) {
        for(var i = 0; i < allStudents.length; i++) {
          if ($scope.inArray(allStudents[i].teachers, $scope.currentUser._id)) {
            $scope.userStudents.push(allStudents[i]);
          }
        }
      });
    };

    $scope.getWordPacks = function(){
      $http.get('/api/wordPacks/' + $scope.currentUser._id + '/wordPacks').success(function(wordPacks){
        $scope.userWordPacks = wordPacks;
      });
    };

/*
    $scope.getWords();
    $scope.getClasses();
    $scope.getStudents();
    $scope.getWordPacks();


    $scope.getAll = function () {
      $scope.getWords();
      $scope.getClasses();
      $scope.getStudents();
      $scope.getWordPacks();
    };
*/

    $scope.inArray= function(array, item){
      for(var i = 0; i < array.length; i++){
        if(array[i] == item){
          return true;
        }
      }
      return false;
    };

    ////////////////////////////////////////////////////////////////////////////
    //This is the section for switching views

    $scope.classView = true;
    $scope.wordPackView = true;


    $scope.showMiddle = false;
    $scope.wordView = false;
    $scope.studentView = false;
    $scope.showClass = false;
    $scope.showCategory = false;

    $scope.switchMiddle = function(section){
      if(section == "wordPack"){
        $scope.showCategory = true;
        $scope.wordView = false;
        $scope.studentView = false;
        $scope.showClass = false;
        $scope.showMiddle = true;
        $scope.help = false;
      } else if (section == "word"){
        $scope.showCategory = false;
        $scope.wordView = true;
        $scope.studentView = false;
        $scope.showClass = false;
        $scope.showMiddle = true;
        $scope.help = false;
      } else if (section == "student"){
        $scope.showCategory = false;
        $scope.wordView = false;
        $scope.studentView = true;
        $scope.showClass = false;
        $scope.showMiddle = true;
        $scope.help = false;
      } else if (section == "class"){
        $scope.showCategory = false;
        $scope.wordView = false;
        $scope.studentView = false;
        $scope.showClass = true;
        $scope.showMiddle = true;
        $scope.help = false;
      } else if (section == "middle"){
        $scope.showCategory = false;
        $scope.wordView = false;
        $scope.studentView = false;
        $scope.showClass = false;
        $scope.showMiddle = false;
        $scope.help = false;
      }
      $scope.middleText = section;
    };

    $scope.toggleHelp = function(){
      if ($scope.help){
        $scope.helpText= "Get Help";
      }
      else {
        $scope.helpText = "Hide Help";
      }
      $scope.help = !$scope.help;
    };

    ////////////////////////////////////////////////////////////////////////////
    //This is the section for checking boxes

    $scope.checkWordPacks = function (wordPack) {
      var counter = 0;
      for (var i = 0; i < $scope.selectedWordPacks.length; i++) {
        if ($scope.selectedWordPacks[i] == wordPack) {
          $scope.selectedWordPacks.splice(i, 1);
          counter = 1;
        }
      }
      if (counter != 1) {
        $scope.selectedWordPacks.push(wordPack);
      }
    };

    $scope.checkClasses = function (myClass) {
      var counter = 0;
      for (var i = 0; i < $scope.selectedClasses.length; i++) {
        if ($scope.selectedClasses[i] == myClass) {
          $scope.selectedClasses.splice(i, 1);
          counter = 1;
        }
      }
      if (counter != 1) {
        $scope.selectedClasses.push(myClass);
      }
    };

    $scope.checkStudents = function (student) {
      var counter = 0;
      for (var i = 0; i < $scope.selectedStudents.length; i++) {
        if ($scope.selectedStudents[i] == student) {
          $scope.selectedStudents.splice(i, 1);
          counter = 1;
        }
      }
      if (counter != 1) {
        $scope.selectedStudents.push(student);
      }
    };

    $scope.checkWords = function (word) {
      var counter = 0;
      for(var i = 0; i < $scope.selectedWords.length; i++){
        if($scope.selectedWords[i] == word) {
          $scope.selectedWords.splice(i,1);
          counter = 1;
        }
      }
      if(counter != 1){
        $scope.selectedWords.push(word);
      }
    };

    $scope.uncheckAll = function () {
     var checkboxes = document.getElementsByTagName('input');

      for (var i=0; i<checkboxes.length; i++)  {
        if (checkboxes[i].type == 'checkbox')   {
          checkboxes[i].checked = false;
        }
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    //This is the section for switching information in the middle

    //cat is short for wordPack
    $scope.displayWordPackInfo = function (wordPack) {
      $scope.switchMiddle("wordPack");
      $scope.wordPackSelected = wordPack;
      $scope.middleElement = wordPack;
      $scope.matchStudent = [];
      $scope.matchClass = [];
      $scope.matchWords = [];
      for (var j = 0; j < $scope.allWords.length; j++) {
        for (var z = 0; z < $scope.allWords[j].wordPacks.length; z++) {
          if ($scope.allWords[j].wordPacks[z] == wordPack._id) {
            $scope.matchWords.push($scope.allWords[j]);
          }
        }
      }
      for (var i = 0; i < $scope.userClasses.length; i++){
        for (var m = 0; m < $scope.userClasses[i].groupList.length; m++){
          for(var q = 0; q < $scope.userClasses[i].groupList[m].wordPacks.length; q++){
            if($scope.userClasses[i].groupList[m].wordPacks[q] == wordPack._id) {
              $scope.matchClass.push($scope.userClasses[i]);
            }
          }
        }
      }
      for(var k=0; k<$scope.userStudents.length; k++){
        for(var l=0; l<$scope.userStudents[k].wordPacks.length; l++){
          if($scope.userStudents[k].wordPacks[l] == wordPack._id){
            $scope.matchStudent.push($scope.userStudents[k]);
          }
        }
      }
    };

    $scope.displayClassInfo = function (myClass){
      $scope.switchMiddle("class");
      $scope.classSelected = myClass;
      $scope.middleElement = myClass;
      $scope.matchWordPackIDs = [];
      $scope.matchWordPacks = [];
      $scope.matchStudent = [];
      $scope.matchWords = [];
      $scope.matchWordIDs = [];
      for(var i = 0; i<$scope.userClasses.length; i++){
        if ($scope.userClasses[i]._id == myClass._id){
          for(var j = 0; j < $scope.userClasses[i].groupList.length; j++){
            for(var q = 0; q < $scope.userClasses[i].groupList[j].wordPacks.length; q++){
                $scope.matchWordPackIDs.push($scope.userClasses[i].groupList[j].wordPacks[q]);
            }
          }
        }
      }
      for(var z = 0; z < $scope.matchWordPackIDs.length; z++){
        for(var v = 0; v < $scope.userWordPacks.length; v++){
          if($scope.matchWordPackIDs[z] == $scope.userWordPacks[v]._id){
            $scope.matchWordPacks.push($scope.userWordPacks[v]);
          }
        }
      }
      for (var k = 0; k < $scope.userStudents.length; k++){
        for (var l = 0; l < $scope.userStudents[k].classList.length; l++){
          if ($scope.userStudents[k].classList[l]._id == myClass._id){
            $scope.matchStudent.push($scope.userStudents[k]);
          }
        }
      }
      for (var m = 0; m < $scope.userClasses.length; m++) {
        if ($scope.userClasses[m]._id == myClass._id) {
          for (var p = 0; p < $scope.userClasses[m].groupList.length; p++) {
            for(var a = 0; a < $scope.userClasses[m].groupList[p].words.length; a++) {
              $scope.matchWordIDs.push($scope.userClasses[m].groupList[p].words[a]);
            }
          }
        }
      }
      for (var h = 0; h < $scope.matchWordIDs.length; h++){
        for (var o = 0; o < $scope.allWords.length; o++){
          if ($scope.matchWordIDs[h] == $scope.allWords[o]._id){
            $scope.matchWords.push($scope.allWords[o]);
          }
        }
      }
    };

    $scope.displayStudentInfo = function (student){
      $scope.studentSelected = student;
      $scope.switchMiddle("student");
      $scope.matchClass = [];
      $scope.middleElement = student;
      $scope.studentWordPacks = [];
      $scope.matchWords = [];
      $scope.matchWordIDs = [];
      $scope.matchClassesIDs = [];
      $scope.matchWordPackIDs = [];
      $scope.matchWordPacks = [];
      //Go through students to find the selected one and get wordPack and word ids
      for (var j = 0; j < $scope.userStudents.length; j++) {
        if ($scope.userStudents[j]._id == student._id) {
          $scope.matchWordPackIDs = $scope.userStudents[j].wordPacks;
          $scope.matchWordIDs = $scope.userStudents[j].words;
          for(var index = 0; index < $scope.userStudents[j].classList.length; index++){
            $scope.matchClassesIDs.push($scope.userStudents[j].classList[index]);
          }
        }
      }
      $scope.matchClassesIDs = $scope.checkForDuplicates($scope.matchClassesIDs);
      //Go through all words to find matches with the word ids stored in the student
      for (var k = 0; k < $scope.matchWordIDs.length; k++){
        for (var l = 0; l < $scope.allWords.length; l++){
          if ($scope.allWords[l]._id == $scope.matchWordIDs[k]){
            $scope.matchWords.push($scope.allWords[l]);
          }
        }
      }
      $scope.matchWords = $scope.checkForDuplicates($scope.matchWords);
      //Go through user classes and find matches with class ids stored in student
      for (var b = 0; b < $scope.matchClassesIDs.length; b++){
        for (var v = 0; v < $scope.userClasses.length; v++){
          if ($scope.userClasses[v]._id == $scope.matchClassesIDs[b]._id){
            $scope.matchClass.push($scope.userClasses[v]);
          }
        }
      }
      $scope.matchClass = $scope.checkForDuplicates($scope.matchClass);
      //Go through user wordPacks and find matches with wordPack ids stored in student
      for (var q = 0; q < $scope.matchWordPackIDs.length; q++){
        for (var r = 0; r < $scope.currentUser.wordPacks.length; r++){
          if ($scope.currentUser.wordPacks[r] == $scope.matchWordPackIDs[q]){
            $scope.matchWordPacks.push($scope.userWordPacks[r]);
          }
        }
      }
      $scope.matchWordPacks = $scope.checkForDuplicates($scope.matchWordPacks);
    };

    $scope.displayWordInfo = function (word) {
      $scope.wordSelected = word;
      $scope.switchMiddle("word");
      $scope.middleElement = word;
      $scope.matchWordPackIDs = [];
      $scope.matchWordPacks = [];
      $scope.matchClass = [];
      $scope.matchStudent = [];
      //Finds the word in the allWords array and gets the contextTag ids
      for (var i = 0; i < $scope.allWords.length; i++) {
        if ($scope.allWords[i]._id == word._id) {
          for (var j = 0; j < $scope.allWords[i].wordPacks.length; j++) {
            $scope.matchWordPackIDs.push($scope.allWords[i].wordPacks[j]);
          }
        }
      }
      $scope.matchWordPackIDs = $scope.checkForDuplicates($scope.matchWordPackIDs);
      for (var q = 0; q < $scope.matchWordPackIDs.length; q++) {
        for (var r = 0; r < $scope.userWordPacks.length; r++) {
          if ($scope.userWordPacks[r]._id == $scope.matchWordPackIDs[q]) {
            $scope.matchWordPacks.push($scope.userWordPacks[r]);
          }
        }
      }
      $scope.matchWordPacks = $scope.checkForDuplicates($scope.matchWordPacks);
      //Finds the classes that have the word stored as a free tile
      for (var l = 0; l < $scope.userClasses.length; l++) {
        for (var m = 0; m < $scope.userClasses[l].groupList.length; m++) {
          for (var n = 0; n < $scope.userClasses[l].groupList[m].words.length; n++) {
            if ($scope.userClasses[l].groupList[m].words[n] == word._id) {
              $scope.matchClass.push($scope.userClasses[l]);
            }
          }
        }
      }
      $scope.matchClass = $scope.checkForDuplicates($scope.matchClass);
      //Finds the students that have the word stored in their tile buckets
      for (var o = 0; o < $scope.userStudents.length; o++) {
        for (var p = 0; p < $scope.userStudents[o].words.length; p++) {
          if (word._id == $scope.userStudents[o].words[p]) {
            $scope.matchStudent.push($scope.userStudents[o]);
          }
        }
      }
      $scope.matchStudent = $scope.checkForDuplicates($scope.matchStudent);
    };

////////////////////////////////////////////////////////////////////////////
//This is the section for the unassign functions

    $scope.unassignTileFromCategory = function (word, category, view){
      if($scope.confirmUnassign(word.name, category.name)==true) {
        //Tile API remove from context tags [{tagName:id}]
        for (var i = 0; i < $scope.allWords.length; i++) {
          if ($scope.allWords[i]._id == word._id) {
            for (var j = 0; j < $scope.allWords[i].wordPacks.length; j++) {
              if (category._id == $scope.allWords[i].wordPacks[j]) {
                $scope.allWords[i].wordPacks.splice(j, 1);
                $scope.i = i;
                $http.patch('/api/tile/' + word._id,
                  {wordPacks: $scope.allWords[i].wordPacks}).success(function () {
                    $scope.getAll();
                  });
                if (view == 'category') {
                  $scope.displayWordPackInfo(category);
                } else {
                  $scope.displayWordInfo(word);
                }
              }
            }
          }
        }
      }
    };

    $scope.unassignGroupFromCategory = function (group, category, view){
      if($scope.confirmUnassign(group.groupName, category.name)==true) {
        for (var i = 0; i < $scope.userClasses.length; i++) {
          if ($scope.userClasses[i]._id == group._id) {
            for (var j = 0; j < $scope.userClasses[i].wordPacks.length; j++) {
              if ($scope.userClasses[i].wordPacks[j] == category._id) {
                $scope.userClasses[i].wordPacks.splice(j, 1);
              }
            }
          }
        }
        $http.patch('/api/users/' + $scope.currentUser._id + '/group',
          {groupList: $scope.userClasses}).success(function () {
            $scope.getAll();
          });
        if (view == 'category') {
          $scope.displayWordPackInfo(category);
        } else {
          $scope.displayClassInfo(group);
        }
      }
    };

    $scope.unassignStudentFromCategory = function (student, category, view){
      if($scope.confirmUnassign(student.firstName, category.name)==true) {
        for (var i = 0; i < $scope.userStudents.length; i++) {
          if ($scope.userStudents[i]._id == student._id) {
            for (var j = 0; j < $scope.userStudents[i].wordPacks.length; j++) {
              if ($scope.userStudents[i].wordPacks[j] == category._id) {
                $scope.userStudents[i].wordPacks.splice(j, 1);
                $http.patch('/api/students/' + student._id,
                  {wordPacks: $scope.userStudents[i].wordPacks}).success(function () {
                    $scope.getAll();
                  });
                if (view == "wordPack") {
                  $scope.displayWordPackInfo(category);
                } else {
                  $scope.displayStudentInfo(student);
                }
              }
            }
          }
        }
      }
    };

    $scope.unassignWordFromGroup = function (group, word, type){
      if($scope.confirmUnassign(group.groupName, word.name)==true) {
        for (var i = 0; i < $scope.userClasses.length; i++) {
          if ($scope.userClasses[i] == group) {
            for (var j = 0; j < $scope.userClasses[i].words[j].length; j++) {
              if ($scope.userClasses[i].words[j] == word._id) {
                $scope.userClasses[i].words.splice(j, 1);
                $http.patch('/api/users/' + $scope.currentUser._id + '/group',
                  {groupList: $scope.userClasses}).success(function () {
                    $scope.getAll();
                  });
                if (type == 'group') {
                  $scope.displayClassInfo(group);
                } else {
                  $scope.displayWordInfo(word);
                }
              }
            }
          }
        }
      }
    };

    $scope.unassignWordFromStudent = function (student, word, type){
      if ($scope.confirmUnassign(student.firstName, word.name)==true) {
        for (var i = 0; i < $scope.userStudents.length; i++) {
          if ($scope.userStudents[i]._id == student._id) {
            for (var j = 0; j < $scope.userStudents[i].words.length; j++) {
              if ($scope.userStudents[i].words[j] == word._id) {
                $scope.userStudents[i].words.splice(j, 1);
                $http.patch('api/students/' + student._id,
                  {words: $scope.userStudents[i].words}).success(function () {
                    $scope.getAll();
                  });
                if (type == 'tile') {
                  $scope.displayWordInfo(word);
                } else {
                  $scope.displayStudentInfo(student);
                }
              }
            }
          }
        }
      }
    };

    $scope.unassignStudentFromGroup = function (student, group, type){
      if ($scope.confirmUnassign(student.firstName, group.groupName) == true) {
        for (var i = 0; i < $scope.userStudents.length; i++) {
          if ($scope.userStudents[i]._id == student._id) {
            for (var j = 0; j < $scope.userStudents[i].groupList.length; j++) {
              if ($scope.userStudents[i].groupList[j] == group._id) {
                $scope.userStudents[i].groupList.splice(j, 1);
                $http.patch('api/students/' + student._id,
                  {groupList: $scope.userStudents[i].groupList}).success(function () {
                    $scope.getAll();
                  });
                if (type == 'student') {
                  $scope.displayStudentInfo(student);
                } else {
                  $scope.displayClassInfo(group);
                }
              }
            }
          }
        }
      }
    };


    $scope.confirmUnassign = function (thing, place){
      return confirm("Are you sure that you would like to unassign " + thing + " from "+ place + "?")
    };

////////////////////////////////////////////////////////////////////////////
//This is the section for the assign function and its helpers

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

    $scope.assignWords = function () {
      $scope.success = false;
      //If you're viewing classes and word packs
      if ($scope.classView && $scope.wordPackView) {
        //Check how many items are selected.
        if ($scope.selectedClasses.length == 0) {
          alert("You must select at least 1 class.");
        }
        else if ($scope.selectedWordPacks.length == 0) {
          alert("You must select at least 1 word pack.");
        } else {
          for (var a = 0; a < $scope.userClasses.length; a++) {
            for (var b = 0; b < $scope.selectedClasses.length; b++) {
              if ($scope.userClasses[a]._id == $scope.selectedClasses[b]._id) {
                for (var c = 0; c < $scope.selectedWordPacks.length; c++) {
                  $scope.userClasses[a].wordPacks.push($scope.selectedWordPacks[c]._id);
                }
                $scope.userClasses[a].wordPacks = $scope.checkForDuplicates($scope.userClasses[a].wordPacks);
              }
            }
          }
          $http.patch('api/users/' + $scope.currentUser._id + '/class',
            {groupList: $scope.userClasses}).success(function () {
              $scope.getAll();
            });
          $scope.success = true;
        }
      //If you're viewing classes and words
      } else if ($scope.classView && !$scope.wordPackView) {
        //Function to add selected words to selected groups.
        if ($scope.selectedClasses.length == 0) {
          alert("You must select at least 1 group.");
        }
        else if ($scope.selectedWords.length == 0) {
          alert("You must select at least 1 word.");
        }
        else {
          for (var d = 0; d < $scope.userClasses.length; d++) {
            for (var e = 0; e < $scope.selectedClasses.length; e++) {
              if ($scope.userClasses[d]._id == $scope.selectedClasses[e]._id) {
                for (var f = 0; f < $scope.selectedWords.length; f++) {
                  $scope.userClasses[d].words.push($scope.selectedWords[f]._id);
                }
                $scope.userClasses[d].words = $scope.checkForDuplicates($scope.userClasses[d].words);
              }
            }
          }
          $http.patch('api/users/' + $scope.currentUser._id + '/group',
            {groupList: $scope.userClasses}).success(function () {
              $scope.getAll();
            });
          $scope.success = true;
        }
      //If you're viewing students and word packs
      } else if (!$scope.classView && $scope.wordPackView) {
        //Function to add selected wordPacks to selected students.
        if ($scope.selectedStudents.length == 0) {
          alert("You must select at least 1 student.");
        }
        if ($scope.selectedWordPacks.length == 0) {
          alert("You must select at least 1 wordPack.");
        }
        for (var g = 0; g < $scope.userStudents.length; g++) {
          for (var w = 0; w < $scope.selectedStudents.length; w++) {
            if ($scope.userStudents[g]._id == $scope.selectedStudents[w]._id) {
              for (var n = 0; n < $scope.selectedWordPacks.length; n++) {
                $scope.userStudents[g].wordPacks.push($scope.selectedWordPacks[n]._id);
              }
              $scope.userStudents[g].wordPacks = $scope.checkForDuplicates($scope.userStudents[g].wordPacks);
              $http.patch('api/students/' + $scope.userStudents[g]._id,
                {wordPacks: $scope.userStudents[g].wordPacks}).success(function () {
                  $scope.getAll();
                });
            }
          }
        }
        $scope.success = true;
      //If you're viewing students and words
      } else if (!$scope.classView && !$scope.wordPackView){
        //Function to add selected words to selected students.
        if($scope.selectedStudents.length == 0){
          alert("You must select at least 1 student.");
        }
        if($scope.selectedWords.length == 0){
          alert("You must select at least 1 word.");
        }
        for (var r = 0; r < $scope.userStudents.length; r++) {
          for (var y = 0; y < $scope.selectedStudents.length; y++) {
            if ($scope.userStudents[r]._id == $scope.selectedStudents[y]._id) {
              for (var v = 0; v < $scope.selectedWords.length; v++) {
                $scope.userStudents[r].words.push($scope.selectedWords[v]._id);
              }
              $scope.userStudents[r].words = $scope.checkForDuplicates($scope.userStudents[r].words);
              $http.patch('api/students/' + $scope.userStudents[r]._id,
                {words: $scope.userStudents[r].words}).success(function () {
                  $scope.getAll();
                });
            }
          }
        }
        alert("Successfully assigned!");
        $scope.success = true;
      }
      if ($scope.success) {
        $scope.getNewInfo();
        $scope.selectedWordPacks = [];
        $scope.selectedWords = [];
        $scope.selectedClasses = [];
        $scope.selectedStudents = [];
        $scope.uncheckAll();
      }
    };

    //Refreshes the page
$scope.getNewInfo = function() {
  if($scope.showClass){
    $scope.displayClassInfo($scope.classSelected);
  }else if($scope.showCategory){
    $scope.displayWordPackInfo($scope.wordPackSelected);
  }
};

//getting the list of students within a group to show for collapsibility purposes in the assign content to people page
//TODO: Need to look at the collapse function if desired still.
    $scope.studentsInClassAssignment = function(myClass) {
      $scope.studentsInClass = [];
      for (var i = 0; i < $scope.userStudents.length; i++) {
        for (var j = 0; j < $scope.userStudents[i].classList.length; j++) {
          if ($scope.userStudents[i].classList[j]._id == myClass._id) {
            $scope.studentsInClass.push($scope.userStudents[i]);
          }
        }
      }
    };

    $scope.openingOnlyOneClass = function(myClass){
      for(var i = 0; i < $scope.userClasses.length; i++){
        if($scope.userClasses[i]._id == myClass._id){
          $scope.userClasses[i].isGroupsCollapsed = !$scope.userClasses[i].isGroupsCollapsed;
        } else {
          //$scope.userClasses[i].isGroupsCollapsed = true;
        }
      }

    };

    $scope.populateDisplayWords = function(wordPack){
      $scope.displayWords = [];
      for (var j = 0; j < $scope.allWords.length; j++) {
        for (var z = 0; z < $scope.allWords[j].wordPacks.length; z++) {
          if ($scope.allWords[j].wordPacks[z] == wordPack._id) {
            $scope.displayWords.push($scope.allWords[j]);
          }
        }
      }
    };

    $scope.openingOnlyOneWordPack = function(wordPack){
      for(var i = 0; i < $scope.userWordPacks.length; i++){
        if($scope.userWordPacks[i]._id == wordPack._id){
          $scope.userWordPacks[i].isGroupsCollapsed = !$scope.userWordPacks[i].isGroupsCollapsed;
        } else {
          //$scope.userWordPacks[i].isGroupsCollapsed = true;
        }
      }

    };

    $scope.fullNameBoolean = true;

    $scope.fullName = function() {
      if ($scope.fullNameBoolean) {
        for (var i = 0; i < $scope.userStudents.length; i++) {
          $scope.userStudents[i].fullName = $scope.userStudents[i].firstName + $scope.userStudents[i].lastName;
          $scope.fullNameBoolean = false;
        }
      }
    };

  });
