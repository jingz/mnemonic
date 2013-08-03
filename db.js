// require lib/adapter.js
// require config.js
(function  (context) {
    context.init_db = function() {
        try	{
            ad = new Adapter(ENV.WEB_DB_CONFIG);
            ad.execute("create table if not exists cards(id integer primary key autoincrement,    \
                                                     deck_id integer,               \
                                                     target unique,                 \
                                                     native,                        \
                                                     created_at,                    \
                                                     context)");

            ad.execute("create table if not exists decks(id integer primary key autoincrement,    \
                                                     name unique,                   \
                                                     created_at)");
        } catch(e){
            console.log(e);
        }
    }
})(window);
