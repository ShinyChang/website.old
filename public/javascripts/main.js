"use strict";

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-27224084-3']);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;

    ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();


// fancybox
$(".fancybox").fancybox({
    openEffect  : 'none',
    closeEffect : 'none',
    closeBtn: false,
    closeClick:true,
    helpers: {
        buttons:{
            tpl: '<div id="fancybox-buttons"><ul style="width:75px"><li><a class="btnToggle" title="Toggle size" href="javascript:;"></a></li><li><a class="btnClose" title="Close" href="javascript:;"></a></li></ul></div>'
        }
    }
});


// Facebook
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/zh_TW/all.js#xfbml=1&appId=219304874920482";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Google Plus
window.___gcfg = {
    lang: 'zh-TW'
};

(function() {
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://apis.google.com/js/platform.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
})();

// Twitter
! function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
        p = /^http:/.test(d.location) ? 'http' : 'https';
    if (!d.getElementById(id)) {
        js = d.createElement(s);
        js.id = id;
        js.src = p + '://platform.twitter.com/widgets.js';
        fjs.parentNode.insertBefore(js, fjs);
    }
}(document, 'script', 'twitter-wjs');

// global
(function(){
    var t = null;
    $(window).bind('scroll', function() {
        clearTimeout(t);
        t = setTimeout(function() {
            $("body").toggleClass("scroll", $("body").scrollTop() > 0);
        }, 100);
    });

    // Get the click event
    $("#backtotop").bind("click", function() {
        // Set the body top margin
        $("body").css({
            "margin-top": -$(window).scrollTop() + "px",
            "overflow-y": "scroll", // This property is posed for fix the blink of the window width change
        });

        // Make the scroll handle on the position 0
        $(window).scrollTop(0);

        // Add the transition property to the body element
        $("body").css("transition", "all 1s cubic-bezier(0.175, 0.885, 0.320, 1.275)");

        // Apply the scroll effects
        $("body").css("margin-top", "0");

        // Wait until the transition end
        $("body").on("webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd", function() {
            // Remove the transition property
            $("body").css("transition", "none");
        });
    });


    // blank link if link is out of website
    $("a").each(function(idx, item) {
        var href = $(this).attr('href');
        if (/^((https?:)?\/\/(www\.)?shinychang.net|\/)/i.test(href) === false) {
            $(this).attr("target", "_blank");
        }
    });
})();

