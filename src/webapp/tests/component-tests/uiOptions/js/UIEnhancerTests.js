/*
Copyright 2008-2009 University of Toronto
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, start, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        fluid.staticEnvironment.uiEnhancerTests = fluid.typeTag("fluid.uiOptions.uiEnhancerTests");

        var testSettings = {
            textSize: "1.5",
            textFont: "verdana",
            theme: "bw",
            layout: false,
            toc: true,
            links: true
        };
        
        var uiEnhancerOptions = {
            components: {
                settingsStore: {
                    type: "fluid.tempStore"
                }
            },
            tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
        };

        jqUnit.module("UI Enhancer Tests");
        
        jqUnit.test("Initialization", function () {
            jqUnit.expect(11);

            jqUnit.assertEquals("Initially font size classes exist", 3, $(".fl-font-size-90").length);
            jqUnit.assertEquals("Initially layout class exists", 3, $(".fl-layout-linear").length);
            jqUnit.assertEquals("Initially white on black class exists", 1, $(".fl-theme-wb").length);
            jqUnit.assertEquals("Initially font-sans class exists", 1, $(".fl-font-sans").length);
            jqUnit.assertEquals("Initially font-arial class exists", 1, $(".fl-font-arial").length);
            jqUnit.assertEquals("Initially text-spacing class exists", 1, $(".fl-font-spacing-3").length);

            fluid.pageEnhancer(uiEnhancerOptions);
            jqUnit.assertEquals("font size classes should not be removed", 3, $(".fl-font-size-90").length);
            jqUnit.assertEquals("layout class is gone", 0, $(".fl-layout-linear").length);
            jqUnit.assertEquals("FSS theme class has not been removed", 1, $(".fl-theme-wb").length);
            jqUnit.assertEquals("Things are still styled with 'first-class' ", 3, $(".first-class").length);
            jqUnit.assertEquals("Things are still styled with 'last-class' ", 2, $(".last-class").length);
        });

        jqUnit.test("getPx2EmFactor & getTextSizeInEm", function () {
            jqUnit.expect(2);
            
            var container = $(".flt-baseFontSize-child");
            var uiEnhancer = fluid.uiEnhancer(container, uiEnhancerOptions);
            var px2emFactor = fluid.uiEnhancer.getPx2EmFactor(container, uiEnhancer.options.fontSizeMap);

            jqUnit.assertEquals("Check that the factor is pulled from the container correctly", 8, px2emFactor);

            var container = $("html");
            var fontSizeInEm = fluid.uiEnhancer.getTextSizeInEm(container, uiEnhancer.options.fontSizeMap);

            jqUnit.assertEquals("Unable to detect the text size in em for the DOM root element <html>. Always return 1em.", 1, fontSizeInEm);
        });

        jqUnit.test("TextSizer", function () {
            var container = $(".flt-textSizer");
            var uiEnhancer = fluid.uiEnhancer(container, uiEnhancerOptions);
            var textSizer = uiEnhancer.textSize;
            
            var px2emFactor = fluid.uiEnhancer.getPx2EmFactor(container, uiEnhancer.options.fontSizeMap);
            var expectedInitialSize = Math.round(8 / px2emFactor * 10000) / 10000;
            
            jqUnit.assertEquals("Check that the size is pulled from the container correctly", expectedInitialSize, textSizer.initialSize);
            textSizer.set(2);
            jqUnit.assertEquals("The size should be doubled", "16px", textSizer.container.css("fontSize"));
        
        });
        
        jqUnit.test("ClassSwapper", function () {
            var opts = {
                classes: {
                    "default": "",
                    "times": "fl-font-times",
                    "comic": "fl-font-comic-sans",
                    "arial": "fl-font-arial",
                    "verdana": "fl-font-verdana"
                }
            };
            var swapper = fluid.uiEnhancer.classSwapper(".flt-classSwapper", opts);
            
            jqUnit.assertEquals("There should be four classes", 4, swapper.classStr.split(" ").length);
            jqUnit.assertEquals("There should be four class selectors", 4, swapper.classSelector.split(", ").length);
            
            fluid.each(opts.classes, function (classname) {
                jqUnit.assertTrue("All class selectors should be in the combined selector, checking " + classname, swapper.classSelector.indexOf("." + classname) > -1);
                jqUnit.assertTrue("All classes should be in the classes string, checking " + classname, swapper.classStr.indexOf(classname) > -1);
            });
           
            jqUnit.assertTrue("The container has a font setting", swapper.container.is(swapper.classSelector));
            jqUnit.assertEquals("There is a font setting in the container", 1, $(swapper.classSelector, swapper.container).length);
            
            swapper.clearClasses();
            jqUnit.assertFalse("The container's font setting was removed", swapper.container.is(swapper.classSelector));
            
            swapper.swap("times");
            jqUnit.assertTrue("The container has a font setting of times", swapper.container.hasClass(opts.classes.times));
            
        });

        jqUnit.test("getLineHeight", function () {
            // Mimic IE with its DOM lineHeight structure
            var container = [{currentStyle: {lineHeight: "10"}}];
            var lineHeight = fluid.uiEnhancer.getLineHeight(container);
            jqUnit.assertEquals("getLineHeight with IE simulation", "10", lineHeight);

            var container = [{currentStyle: {lineHeight: "14pt"}}];
            var lineHeight = fluid.uiEnhancer.getLineHeight(container);
            jqUnit.assertEquals("getLineHeight with IE simulation", "14pt", lineHeight);

            container = $(".flt-lineSpacer");
            lineHeight = fluid.uiEnhancer.getLineHeight(container);
            jqUnit.assertEquals("getLineHeight without IE simulation", "12px", lineHeight);
        });

        function testNumerizeLineHeight(lineHeight, expected) {
            jqUnit.test("numerizeLineHeight - " + lineHeight, function () { 
                var uiEnhancer = fluid.uiEnhancer(".flt-lineSpacer", uiEnhancerOptions);
                var fontSize = fluid.uiEnhancer.getTextSizeInPx(uiEnhancer.container, uiEnhancer.options.fontSizeMap);
                
                var numerizedLineHeight = fluid.uiEnhancer.numerizeLineHeight(lineHeight, Math.round(fontSize));

                jqUnit.assertEquals("line-height value '" + lineHeight + "' has been converted correctly", expected, numerizedLineHeight);
            });
        }
        
        var undefinedLineHeight;
        testNumerizeLineHeight(undefinedLineHeight, 0);
        testNumerizeLineHeight("normal", 1.2);
        testNumerizeLineHeight("6px", 1);
        testNumerizeLineHeight("1.5", 1.5);
        
        // This is necessary to work around IE differences in handling line-height unitless factors
        var convertLineHeightFactor = function (lineHeight, fontSize) {
            // Continuing the work-around of jQuery + IE bug - http://bugs.jquery.com/ticket/2671
            if (lineHeight.match(/[0-9]$/)) {
                return Math.round(lineHeight * parseFloat(fontSize)) + "px";
            } else {
                return lineHeight;
            }
        };

        jqUnit.test("LineSpacer", function () {
            var uiEnhancer = fluid.uiEnhancer(".flt-lineSpacer", uiEnhancerOptions);
            var lineSpacer = uiEnhancer.lineSpacing;
      
            jqUnit.assertEquals("Check that the size is pulled from the container correctly", 2, Math.round(lineSpacer.initialSize));
            jqUnit.assertEquals("Check the line spacing size in pixels", "12px", convertLineHeightFactor(lineSpacer.container.css("lineHeight"), lineSpacer.container.css("fontSize")));
            lineSpacer.set(2);
            jqUnit.assertEquals("The size should be doubled", "24px", convertLineHeightFactor(lineSpacer.container.css("lineHeight"), lineSpacer.container.css("fontSize")));
        });

        function cleanStaticEnvironment() {
            delete fluid.staticEnvironment.browserIE;
            delete fluid.staticEnvironment.browserMajorVersion;            
        }

        function withIE6Environment(withIt, testFunc) {
            try {
                cleanStaticEnvironment();
                if (withIt) {
                    fluid.staticEnvironment.browserIE = fluid.typeTag("fluid.browser.msie");
                    fluid.staticEnvironment.browserMajorVersion = fluid.typeTag("fluid.browser.majorVersion.6");
                }
                testFunc();
            } finally {
                cleanStaticEnvironment();
            }
        }
        
        function testIE6ColorInversion(withIt, testFunc) {
            jqUnit.test("IE6ColorInversion: " + withIt, function () { 
                withIE6Environment(withIt, function () {
                    fluid.pageEnhancer(uiEnhancerOptions);
                    testFunc();
                });
            });
        }
        
        testIE6ColorInversion(true, function () {  
            jqUnit.assertEquals("fl-inverted-color has been removed", 0, $(".fl-inverted-color").length);
        });
        testIE6ColorInversion(false, function () {
            jqUnit.assertEquals("fl-inverted-color is not touched", 1, $(".fl-inverted-color").length);
        });

        jqUnit.asyncTest("Settings", function () {
            jqUnit.expect(5);

            var body = $("body");
            var initialFontSize = parseFloat(body.css("fontSize"));
            var refreshCount = 0;
            
            function testTocStyling() {
                var tocLinks = $(".flc-toc-tocContainer a");
                var filtered = tocLinks.filter(".fl-link-enhanced");
                ++refreshCount;
                if (refreshCount === 2) {
                    jqUnit.assertEquals("All toc links have been styled", tocLinks.length, filtered.length);
                    jqUnit.assertNotEquals("Some toc links generated on 2nd pass", 0, tocLinks.length);
                    jqUnit.start();
                }
            }
            
            var options = fluid.merge(null, {}, uiEnhancerOptions, {
                listeners: {
                    lateRefreshView: {
                        priority: "last",
                        listener: testTocStyling
                    }
                }
            });
            
            var uiEnhancer = fluid.pageEnhancer(options).uiEnhancer;
            uiEnhancer.updateModel(testSettings);
            
            var expectedTextSize = initialFontSize * testSettings.textSize;
            
            jqUnit.assertEquals("Large text size is set", expectedTextSize.toFixed(0) + "px", body.css("fontSize"));
            jqUnit.assertTrue("Verdana font is set", body.hasClass("fl-font-uio-verdana"));
            jqUnit.assertTrue("High contrast is set", body.hasClass("fl-theme-bw"));

        });
        
        jqUnit.test("Options munging", function () {
            jqUnit.expect(2);

            uiEnhancerOptions = {
                components: {
                    settingsStore: {
                        type: "fluid.tempStore"
                    }
                },
                tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html",
                classnameMap: {
                    "textFont": {
                        "default": "fl-font-times"
                    },
                    "theme": {
                        "yb": "fl-test"
                    }
                },
                defaultSiteSettings: {
                    theme: "yb"
                }
            };

            fluid.pageEnhancer(uiEnhancerOptions);

            var body = $("body");
                
            jqUnit.assertTrue("The initial times font is set correctly", body.hasClass("fl-font-times"));
            jqUnit.assertTrue("The initial test theme is set correctly", body.hasClass("fl-test"));
        });

        jqUnit.test("FLUID-4703: Line height unit", function () {
            var child1El = $(".flt-lineHeight-child-1em");
            var child2El = $(".flt-lineHeight-child-2em");

            var child1emHeight = child1El.height() - 1; // adjusted to account for rounding by jQuery
            var child2emHeight = child2El.height();
            jqUnit.assertTrue("The line height of the 2em child should be close to twice the size of the 1em child", 2*child1emHeight < child2emHeight);
        });

    });
})(jQuery);
