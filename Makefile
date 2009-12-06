all: js/all.js style/all.css data/all.json

widget-opera.wgt: config-opera.xml index.html js/ style/ data/ images/
	cp -r $^ build; mv build/config-opera.xml build/config.xml; cd build; zip -R ../$@ "*" ; cd ..

JAVA=/usr/bin/java
YUICOMPRESSOR=/usr/local/yuicompressor/build/yuicompressor.jar
SAXON=~/bin/saxon

js/all.js: data/all.json  js/lib/jquery.js js/lib/jquery-ui.js js/lib/ui.tabs.paging.js js/lib/jquery.autocomplete.js js/start.js
	 cat $^ | $(JAVA) -jar $(YUICOMPRESSOR)  --type js --line-break 0 > $@

style/all.css: style/jquery.autocomplete.css  style/jquery-ui.css  style/style.css
	 cat $^ | $(JAVA) -jar $(YUICOMPRESSOR)  --type css > $@


data/html.xml: data/getHTMLInfoset.xsl
	saxon $^ $^ > $@

data/xpath.xml: data/getXpathFunctions.xsl
	saxon $^ $^ > $@

data/css.xml: data/getCSSProperties.xsl
	saxon $^ $^ > $@


data/svg.xml: data/getSVGInfoset.xsl
	saxon $^ $^ > $@

data/%.json: data/%.xml
	$(SAXON)  $^ data/xmltojson.xsl > $@


data/all.json: data/init.json data/html.json data/svg.json data/css.json data/xpath.json
	cat $^ > $@

data/i18n.frag: data/getI18NFragment.xsl
	saxon http://www.w3.org/International/quicktips/ $^ > $@