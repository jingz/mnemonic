(function  (context) {
    // create db
    init_db();

})(window);

var app = angular.module('app', [])
app.value('Deck', Deck);
app.value('Card', Card);

// app.config(function  ($routeProvider) {
//     $routeProvider.when("/", { controller: 'DeckController', 
//                                templateUrl:"start_page.html" } )
// });

app.directive('wordInput', function() {
   var d = {
       restrict: 'E',
       scope: { word: '=word' },
       link: function  (scope, iElement, iAttr, ngModel) {
           // console.log(arguments);
           // could be statement
           var statement = scope.word;
           var words = statement.split(" ");
           var outputDOM = [];
           for(var i = 0; i < words.length; i++){
               if(words[i]){
                    for(var j = 0; j < words[i].length; j++){
                      // first char
                      if(j == 0){
                        outputDOM.push('<input type="text" class="char" maxlength="1" value="'+words[i][j]+'" />'); 
                      } else{
                        outputDOM.push('<input type="text" class="char" maxlength="1" />'); 
                      }
                    }
                    outputDOM.push("<b class='well well-small'>+</b>");
               } 
           }
           // pop the last blank
           outputDOM.pop();
           // adding answer button
           outputDOM.push('<button title="show answer" style="margin-left: 1em;" class="btn btn-danger pull-right"><i class="icon-eye-open"></i></button>'); 

           var wrapper = $("<div class='char-wrapper control-group'></div>");
           iElement.append(wrapper.append(outputDOM.join("")));
           var inputs = wrapper.children('input');
           var ansBtn = wrapper.find('button').first();
           var count = inputs.length;

           // answer action 
           ansBtn.click(function  () {
              var k = 0;
              for(var i = 0; i < words.length; i++){
                if(words[i]){
                  for(var j = 0; j < words[i].length; j++, k++){
                    inputs.eq(k).val(words[i][j]);
                  }
                }
              }
              wrapper.addClass('error')
              inputs.attr('readOnly', true);
           });

           inputs.each(function(i, el) {
               var _el = $(el);
               var next = _el.next('input');
               var prev = _el.prev();

               // backspace work on keydown
               _el.on('keydown', function(e) {
                    if(e.keyCode == 8 && _el.val() == ''){
                       prev.val('');
                       prev.focus();
                    }
               });

               _el.on('keypress', function(e) {
                   // backspace key
                   if(e.keyCode != 9 && e.keyCode != 8){
                      next.focus();
                      next.val('');
                   }

               });

               _el.on('keyup', function(e) {

                   // grep all change
                   var val = [];
                   inputs.each(function(j, jel) {
                      if(jel.value)
                          val.push(jel.value);
                      else
                          val.push(' ');

                   });

                   
                   val = val.join('');
                   if(scope.word == val){
                       wrapper.addClass('success');  

                       if(!scope.alreadyCorrect){
                         scope.$parent[iAttr.correct](val);
                       }

                       // make it disable
                       inputs.attr('readOnly', true);

                       scope.alreadyCorrect = true;

                   } else{
                       wrapper.removeClass('success');  
                   }
               });
               
           });
       }
   };
   return d;
});

var DeckController = function($scope, Deck, Card) {
    // setup
    setTimeout(function() {
      if($scope.decks.length == 0){
        var btnAddingDeck = $('#btn-add-deck');
        btnAddingDeck.popover('show');
        setTimeout(function () {
          btnAddingDeck.popover('destroy');
        }, 3000)
      } 
    }, 200)

    // state
    $scope.decks = [];
    $scope.cards = [];
    $scope.selected_deck_id = null;

    // manage or play
    $scope.mode = 'manage';

    // form
    $scope.card_target = "";
    $scope.card_native = "";

    Deck.all(function(rs) {
        angular.forEach(rs, function(r, i) {
            $scope.decks.push(r.attributes); 
        });
        $scope.$digest();
    });

    $scope.pages = function(pageSize) {
      AR.connection.execute("select count(*) as cnt from cards where deck_id = ?", 
                  [$scope.selected_deck_id], function(res) {
        var cnt = res[0].cnt;
      });
      pageSize = pageSize || 7;
      var all = $scope.cards.length;
      var n = +(all / pageSize).toFixed(0);
      if(all % pageSize > 0) n += 1;
      return new Array(n);
    }

    $scope.cardPaging = function(page) {
      Card.find_by_sql("select * from cards offset ? limit 7;", [page*7],
        function(rs) {
          $scope.cards = rs; 
          $scope.$digest();
        });
    }

    $scope.createDeck = function() {
        var deckName = window.prompt("Plase Enter a Deck name");
        if(deckName){
            new Deck( { name: deckName }, function(){
                var self = this;
                this.save(function () {
                    $scope.decks.push(self.attributes);
                    $scope.$digest();
                });
            });
        }
    }    

    $scope.fetchCard = function(deck_id) {
        deck_id = deck_id || $scope.selected_deck_id;
        // reset card
        // TODO it should not be here
        $scope.card = {};

        // reset game
        $scope.$broadcast('reset_game');
        
        if(deck_id){
            $scope.selected_deck_id = deck_id;
            $scope.cards = []; 
            Card.find_by_sql('select * from cards where deck_id = ?', [deck_id], function(cards) {
                angular.forEach(cards, function(c, i) {
                    $scope.cards.push(c.attributes);
                });
                $scope.$digest();
            });
        } else{
            console.log('no deck selected');
        }
    }

    $scope.saveCard = function(card) {
        card.deck_id = card.deck_id || $scope.selected_deck_id;
        if(!card.target || !card.native){
            return false;
        }

        if(card.id){
            // update card 
            Card.find(card.id, function  (c) {
                c.native = card.native;
                c.target = card.target;
                c.save(function() {
                    $scope.card = {};
                    $scope.$digest();
                });
            });
            return; 
        }
        
        // create new card
        new Card(card, function() {
            this.save(function() {
                $scope.card = {};
                $scope.cards.push(this.attributes);
                $scope.$digest();
            });
        });
    }

    $scope.removeCard = function(cardId) {
        Card.find(cardId, function (c) {
            c.destroy(function() {
                $scope.fetchCard();
            }); 
        });
    }

    $scope.setCard = function(c) {
        $scope.card = c; 
    }

    $scope.play = function() {
        // var deck_id = $scope.selected_deck_id;
        $scope.mode = 'playing';
    }

    $scope.stop = function() {
        // var deck_id = $scope.selected_deck_id;
        $scope.mode = 'manage';
    }

    $scope.finishWord = function(word) {
        console.log(word);
    }

    $scope.removeDeck = function  () {
      if(confirm("Sure?")){
        if($scope.selected_deck_id){
          Deck.find($scope.selected_deck_id, function(r) {
            r.destroy(function() {
                var decks = [];
                for(var i = 0; i < $scope.decks.length; i++){
                  if(r.name != $scope.decks[i].name) decks.push($scope.decks[i]);
                }
                $scope.decks = decks;
                $scope.cards = [];
                $scope.selected_deck_id = null;
                $scope.$digest();
            }); 

            Card.find_by_sql("delete from cards where deck_id = ?", 
              [$scope.selected_deck_id], function (res) {});
          });
        }  
      }
    }

    $scope.refreshDeck = function() {
      Deck.all(function(rs) {
          angular.forEach(rs, function(r, i) {
              $scope.decks.push(r.attributes); 
          });
          $scope.$digest();
      });
    }
}

DeckController.$inject = ['$scope', 'Deck', 'Card'];

GameController = function($scope) {
    $scope.score = 0;

    $scope.$on('reset_game', function  () {
      $scope.score = 0; 
    });

    $scope.addScore = function() {
        $scope.score += 1
        $scope.$digest();
    }
}
