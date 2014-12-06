(function (context) {
    // doc ready do ..
    $(document).ready(function  () {

        $("#test").click(function  () {
            // send message
            console.log("sending..");
            chrome.runtime.sendMessage("mhlefjcajngffdkplfpagiphmfffgogl", 
                { my_msg: "Hello !!", params: "first params"}, 
                function(res) {
                    console.log("response from sending message", res);
            });
        });

    });

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        console.log(arguments); 
    });
})(window);
