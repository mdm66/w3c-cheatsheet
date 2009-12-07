/* Removes redundant elements from an array */
var make_unique = function (b) {
    var a = [];
    b.sort();
    for (var i in b) {
        if (i > 0 && b[i] !== b[i - 1]) {
            a[a.length] = b[i];
        }
    }
    return a;
};

var keywordSources = {
    "css": {"property": "CSS Property",
            "selector": "CSS Selector",
            "at-rule": "CSS At-rules"},
    "html": {"element": "HTML Element",
             "attribute": "HTML Attribute"},
    "svg": {"attribute": "SVG Attribute",
            "element": "SVG Element"},
    "xpath": {"function": "XPath function"}
};

var keywordsMatch = {};
var keywords = [];
for (var infoset in keywordSources) {
    for (var propertytype in keywordSources[infoset]) {
        var source = sources[infoset][propertytype];
        for (var keyword in source) {
            if (!keywordsMatch[keyword]) {
                keywordsMatch[keyword] = {};
                keywords.push(keyword);
            }
            if (!keywordsMatch[keyword][infoset]) {
                keywordsMatch[keyword][infoset] = {};
            }
            if (!keywordsMatch[keyword][infoset][propertytype]) {
                keywordsMatch[keyword][infoset][propertytype] = [];
            }
            for (var k in source[keyword]) {            
                keywordsMatch[keyword][infoset][propertytype].push(source[keyword][k]);
            }       
        }
    }
}

function makeReplacingAccordion(accordion) {
    accordion.css("position", "relative");
    accordion.accordion('option', 'navigation', true);
    accordion.accordion('option', 'autoHeight', 'false');
    accordion.accordion('option', 'collapsible', true);
}

function clearLookUp() {
    if ($("#details").accordion) {
        $("#details").accordion("destroy");
    }
    $("#details").html("");    
}

jQuery(document).ready(function ($) {
  // Tabs
  //$('#content').css("overflow","hidden");
  //$('#content').css("height","480px");
    $('#content').tabs();
    $('#content').tabs('paging');
    $('#content').bind("tabsshow", function (event, ui) { 
        window.location.hash = ui.tab.hash;
    });

    $(".accordion").accordion({header: 'div >h3', active: false, autoHeight: false});
    makeReplacingAccordion($(".accordion"));

    keywords = make_unique(keywords);
    //$("#search").setOptions({"data":keywords});

    function show_keyword(keyword, infoset, propertytype) {
        if (keyword === null) {
            return false;
        }
        var infosetname = keywordSources[infoset][propertytype];
        var div = $("<div></div>").appendTo($("#details"));
        div.append("<h2>" + infosetname + " <code>" + keyword + "</code></h2><div></div>");
        var div2 = $("div", div);
        for (var contextidx in keywordsMatch[keyword][infoset][propertytype]) {
            var context = keywordsMatch[keyword][infoset][propertytype][contextidx];
            var dl = $("<dl></dl>").appendTo(div2);
            for (var property in context) {
                var dt = $("<dt></dt>").appendTo(dl);
                var container = dt;
                if (context[property].url) {
                    container = $("<a href='" + context[property].url + "'></a>").appendTo(dt);
                }
                container.text(property);
                if (context[property]["properties"] && context[property]["properties"].length > 0) {
                    var displayAsList = true;
                    if (context[property]["properties"].length === 1 || context[property].list === "inline") {
                        displayAsList = false;
                    }
                    var dd = $("<dd></dd>").appendTo(dl);
                    var listcontainer = dd;
                    if (displayAsList) {
                        if (context[property].list === "block") {
                            listcontainer = $("<ul></ul>").appendTo(listcontainer);
                        }
                    }
                    for (var propcontentidx in context[property]["properties"]) {
                        var itemcontainer = listcontainer;
                        var propcontent = context[property]["properties"][propcontentidx];
                        if (displayAsList) {
                            itemcontainer = $("<li></li>").appendTo(itemcontainer);
                        } else {
                            itemcontainer = $("<span></span>").appendTo(itemcontainer);
                        }
                        if (propcontent.url) {
                            itemcontainer = $("<a href='" + propcontent.url + "'></a>").appendTo(itemcontainer);
                        } else if (context[property].infoset && context[property].type) {
                            itemcontainer = $("<a href='#inf," + context[property].infoset + "," + escape(context[property].type) + "," + escape(propcontent.title) + "' class='internal'></a>").appendTo(itemcontainer);
                        }
                        itemcontainer.text(propcontent.title);
                        if (!displayAsList && propcontentidx < context[property]["properties"].length - 1) {
                            listcontainer.append(", ");
                        }
                    }
                }
            }
        }
        return true;    
    }

    function load_anchor(anchor) {
        var infoset = false;
        var propertytype = false;
        var keyword = false;
        // selector is a path à la "html-attributes"
        if (anchor !== null) {
            var selector_path = anchor.split(',');
            infoset = unescape(selector_path[1]);
            propertytype = unescape(selector_path[2]);
            keyword = unescape(selector_path.slice(3).join(","));
            if (keyword && infoset && propertytype && keywordSources[infoset] && keywordSources[infoset][propertytype] && keywordsMatch[keyword] && keywordsMatch[keyword][infoset] && keywordsMatch[keyword][infoset][propertytype]
                ) {
                clearLookUp();
                $("#search").val("");
                if (show_keyword(keyword, infoset, propertytype)) {
                    $("#details").accordion({header: 'div>h2', autoHeight: false});
                    return true;
                }
            }
        }
        return false;
    }



    function show_result(item, selector) {
        if (item === null) {
            return;
        }
        var keyword = item.selectValue;
        clearLookUp();
        var detailsLength = 0;
        for (var infoset in keywordsMatch[keyword]) {
            for (var propertytype in keywordsMatch[keyword][infoset]) {
                detailsLength = detailsLength + 1;
                show_keyword(keyword, infoset, propertytype);
            }
        }
        if (detailsLength === 1) {
            $("#details").accordion({header: 'div>h2', autoHeight: false});
        } else {
            $("#details").accordion({header: 'div>h2', autoHeight: false, active: false});
        }
        makeReplacingAccordion($("#details"));
    }

    $("a.internal").live("click",
        function () {
	   return load_anchor($(this).attr("href").split("#")[1]);
	}
     );


    $("#search").autocompleteArray(keywords, {onItemSelect: show_result, onFindValue: show_result, autoFill: false, selectFirst: true, delay: 40, maxItemsToShow: 10});
    $("#search").change(function () {
        clearLookUp();
        if ($("#search").val()) {
            if (!$("#details_clear").length) {
                $("#search").after("<a href='#' class='ui-icon ui-icon-close' id='details_clear'></a>");
                $("#details_clear").click(function () {
                    clearLookUp();
                    $("#search").val("").change();
                });
            }
        } else {
            $("#details_clear").replaceWith("");
        }
    });
    if (window.location.hash && window.location.hash.substring(0,5)==='#inf-') {
	load_anchor(window.location.hash.substring(1));
    }
});
