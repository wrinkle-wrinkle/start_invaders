$(document).ready(function () {
    // Get Data
    chrome.storage.local.get("links", function(localData) {
        if (localData.links === undefined) {
            $.getJSON("config.json", function (configData) {
                chrome.storage.local.set({"links": configData.links});
                for (var key in configData.links) {
                    $("#" + key + "_url").attr("href",configData.links[key].url);
                    $("#" + key + "_img").attr("src",configData.links[key].img);
                }
            });
        } else {
            for (var key in localData.links) {
                $("#" + key + "_url").attr("href",localData.links[key].url);
                $("#" + key + "_img").attr("src",localData.links[key].img);
            }
        }
        
    });

    chrome.storage.local.get("darkSky", function(localData) {
        if (localData.darkSky === undefined){
            $.getJSON("config.json", function (configData) {
                chrome.storage.local.set({"darkSky": configData.darksky});
                getWeather(configData.darksky);
            });
        } else {
            getWeather(localData.darkSky);
        }
    });

    chrome.storage.local.get("reddit", function(localData) {
        if (localData.reddit === undefined){
            $.getJSON("config.json", function (configData) {
                chrome.storage.local.set({"reddit": configData.reddit});
                getHot(configData.reddit);
            });
        } else {
            getHot(localData.reddit);
        }
    });

    // Game Setup
    var game = $("#candiv");
    $("#sidePanel").on("transitionend webkitTransitionEnd oTransitionEnd", function (event) {
        if (event.originalEvent.propertyName == "margin-left" && $("#sidePanel").hasClass("collapsed")) {
            game.toggleClass("hider");
            new p5(sketch, document.getElementById("candiv"));
        }
    });

    $("#myButt").click(function () {
        $("#sidePanel").toggleClass("collapsed myMease");
        $("#iconPanel").toggleClass("col-lg-9 col-md-8 col-lg-12 col-md-12 myWease");
        $("#baseSpace").slideToggle();
        $(".button").fadeToggle();
    });


    // Handle Edit Button
    $(".myEdit").click(function () {
        $("#myButt").toggleClass("hider");
        $("#edit_dir").toggleClass("hider");
        $("#myEdit").toggleClass("inactive_butt active_butt");
        // if in edit mode
        if ($("#myEdit").hasClass("active_butt")) {
            // deal with icons
            $("[id$='_url']").click( function(e) {
                e.preventDefault();
                $("#link_row").removeClass("hider");
                $("#label_edit").text(e.currentTarget.id.split("_")[0]);
                $("#url_edit").attr("placeholder", e.currentTarget.href);
                $("#img_edit").attr("src", e.target.src);
                document.getElementById("file_edit").value = "";
                document.getElementById("url_edit").value = "";
                $("#myNav").width("100%");
                return false; 
            });

            // deal with reddit
            $("[id$='_nam'], [id$='_hot'], [id$='_com']").click( function(e) {
                e.preventDefault();
                $("#reddit_row").removeClass("hider");
                $("#label_reddit").text(e.currentTarget.id.split("_")[0]);
                $("#url_reddit").attr("placeholder", $("#" + e.currentTarget.id.split("_")[0] + "_nam").attr("href"));
                $("#nam_reddit").attr("placeholder", $("#" + e.currentTarget.id.split("_")[0] + "_nam").text());
                $("#url_reddit").val("");
                $("#nam_reddit").val("");
                $("#myNav").width("100%");
                return false;
            });

            // deal with weather
            $("#wLink").click( function(e) {
                e.preventDefault();
                $("#weather_row").removeClass("hider");
                $("[id*='w_']").val("");
                $("#myNav").width("100%");
                return false;
            });

        } else {
            $("[id$='_url']").off("click");
            $("[id$='_nam'], [id$='_hot']").off("click");
            $("#wLink").off("click");
        }
    });

    // Link Submit Changes
    $("#sub_edit").click(function(){
        var link = $("#label_edit").text();
        if ($("#url_edit").val()) {
           $("#" + link + "_url").attr("href",$("#url_edit").val());
        }

        $("#" + link + "_img").attr("src", $("#img_edit").attr("src"));

        chrome.storage.local.get("links", function(localData) {
            localData.links[link].url = $("#" + link + "_url").attr("href");
            localData.links[link].img =$("#" + link + "_img").attr("src");
            chrome.storage.local.set({"links": localData.links});
        });

        $("#myNav").width("0%");
        $("#link_row").addClass("hider");
        $("#reddit_row").addClass("hider");
        $("#weather_row").addClass("hider");
    });

    // Reddit Submit Changes
     $("#sub_reddit").click(function(){
        var reddit = $("#label_reddit").text();

        if ($("#url_reddit").val()) {
           var subreddit = $("#url_reddit").val().split("/");
        } else {
            var subreddit = $("#" + reddit + "_nam").attr("href").split("/");
        }

        var sub_idx = subreddit.indexOf("r");
        var mysub = subreddit[sub_idx + 1];

        if ($("#nam_reddit").val()) {
            var mynam = $("#nam_reddit").val() + ": ";
        } else {
            var mynam = mysub + ": ";
        }
        
        chrome.storage.local.get("reddit", function(localData) {
            localData.reddit[reddit].nam = mynam;
            localData.reddit[reddit].url = mysub;
            getHot(localData.reddit);
            chrome.storage.local.set({"reddit": localData.reddit});
        });

        $("#myNav").width("0%");
        $("#link_row").addClass("hider");
        $("#reddit_row").addClass("hider");
        $("#weather_row").addClass("hider");
    });

    // Weather Submit Changes
    $("#sub_w").click(function(){
        chrome.storage.local.get("darkSky", function(localData) {
            if ($("#w_cit").val()) {
                localData.darkSky.name = $("#w_cit").val();
            }

            if ($("#w_key").val()) {
                localData.darkSky.key = $("#w_key").val();
            }
            var lat_long = localData.darkSky.loc.split(",");
            if ($("#w_lat").val()) {
                lat_long[0] = $("#w_lat").val();
            }

            if ($("#w_long").val()) {
                lat_long[1] = $("#w_long").val()
            }
            localData.darkSky.loc = lat_long[0] + "," + lat_long[1];
            getWeather(localData.darkSky);
            chrome.storage.local.set({"darkSky": localData.darkSky});
        });

        $("#myNav").width("0%");
        $("#link_row").addClass("hider");
        $("#reddit_row").addClass("hider");
        $("#weather_row").addClass("hider");
    });
    

    // Hide the forms when overlay is closed
    $(".closebtn").click(function () {
        $("#myNav").width("0%");
        $("#link_row").addClass("hider");
        $("#reddit_row").addClass("hider");
        $("#weather_row").addClass("hider");
    });

    // Import image file as DataURL so it can be saved
    $("#file_edit").change(function(){
        var file = $(this)[0].files[0];
        var reader  = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
        }
        reader.addEventListener("load", function () {
            $("#img_edit").attr("src", reader.result);
        }, false);
    });

    
});

function getWeather(configs) {
    var darkskyKey = configs.key;
    var darkskyLoc = configs.loc;
    var xmlhttp = new XMLHttpRequest();
    var url = "https://api.darksky.net/forecast/" + darkskyKey + "/" + darkskyLoc + "?exclude=minutely,alerts,flags&units=us";
    $("#city").text(configs.name);
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            $("#curTemp").html(Math.round(myArr.currently.temperature) + "&deg;F");
            $("#hi").html("H: " + Math.round(myArr.daily.data[0].temperatureMax) + "&deg;");
            $("#lo").html("L: " + Math.round(myArr.daily.data[0].temperatureMin) + "&deg;");
            // $("#wSum").html(myArr.daily.data[0].summary);
            $("#wSum").html(myArr.hourly.summary);
            var skycons = new Skycons({"color": "white"});
            skycons.add("icon1", myArr.currently.icon);
            skycons.play();
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    $("#wLink").attr("href","https://darksky.net/forecast/" + darkskyLoc + "/us12/en");
}

function getHot(reddit) {
    for (var key in reddit) {
        (function(key) {
            $("#" + key + "_nam").text(reddit[key].nam);
            $("#" + key + "_nam").attr("href","https://www.reddit.com/r/" + reddit[key].url + "/")

            var subURL = "https://www.reddit.com/r/" + reddit[key].url +"/hot/.json?limit=1";
            $.getJSON(subURL, function(subR) {
                var postNum = subR.data.children.length-1;
                $("#" + key + "_hot").text(subR.data.children[postNum].data.title);
                $("#" + key + "_hot").attr("href",subR.data.children[postNum].data.url);
                $("#" + key + "_com").text(subR.data.children[postNum].data.num_comments + " comments");
                $("#" + key + "_com").attr("href", "https://www.reddit.com" + subR.data.children[postNum].data.permalink);
            })
        })(key)
    }
}