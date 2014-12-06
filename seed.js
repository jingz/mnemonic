(function (context) {
   context.seed =  function () {
      var adapter = new Adapter();
      adapter.execute("delete from decks;");
      adapter.execute("insert into decks (name) values (?)", ['demo_desk'], function  (res) {
          console.log("deck created", res);
      });
      adapter.execute("select * from decks limit 1;", [], function(rs) {
         var r = rs[0]; 
         var data = []
         data.push({ target: 'test', native: 'กกก'});
         data.push({ target: 'vsdf', native: 'กกก'});
         data.push({ target: 'asdf asdf', native: 'กกก'});
         data.push({ target: 'secsa', native: 'กกก'});
         var _r;
         adapter.execute("delete from cards;")
         for(var o in data){
             _r = data[o]; 
             adapter.execute("insert into cards(deck_id, target, native) values (?,?,?)", [r.id, _r.target, _r.native]);
         }
      });
   }

    context.seed2 = function  () {
      var adapter = new Adapter();
      adapter.execute("delete from decks;");
      adapter.execute("insert into decks (name) values (?)", ['Dict'], function  (res) {
          console.log("deck created", res);
      });
      adapter.execute("select * from decks limit 1;", [], function(rs) {
          var r = rs[0]; 
          var data = []
          chrome.runtime.sendMessage("mhlefjcajngffdkplfpagiphmfffgogl", 
              { my_msg: "Hello !!", params: "first params"}, 
              function(res) {
                var _rs = res.result;
                adapter.execute("delete from cards;");
                for(var i = 0; i < _rs.length; i++){
                  adapter.execute("insert into cards(deck_id, target, native) values (?,?,?)", 
                                          [r.id, _rs[i].word, _rs[i].meaning.replace(/<.*>/,"")], function  () {
                                            console.log("ok")
                                          });
                }
          });
      });
    }

})(window);
