/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 2.5.0 - 2017-01-28
 * License: MIT
 */angular.module("ui.bootstrap",["ui.bootstrap.tpls","ui.bootstrap.typeahead","ui.bootstrap.debounce","ui.bootstrap.position"]),angular.module("ui.bootstrap.tpls",["uib/template/typeahead/typeahead-match.html","uib/template/typeahead/typeahead-popup.html"]),angular.module("ui.bootstrap.typeahead",["ui.bootstrap.debounce","ui.bootstrap.position"]).factory("uibTypeaheadParser",["$parse",function(e){var t=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;return{parse:function(a){var o=a.match(t);if(!o)throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "'+a+'".');return{itemName:o[3],source:e(o[4]),viewMapper:e(o[2]||o[1]),modelMapper:e(o[1])}}}}]).controller("UibTypeaheadController",["$scope","$element","$attrs","$compile","$parse","$q","$timeout","$document","$window","$rootScope","$$debounce","$uibPosition","uibTypeaheadParser",function(e,t,a,o,i,n,r,l,s,p,d,u,c){function h(){L.moveInProgress||(L.moveInProgress=!0,L.$digest()),Q()}function f(){L.position=C?u.offset(t):u.position(t),L.position.top+=t.prop("offsetHeight")}function g(e){var t;return angular.version.minor<6?(t=e.$options||{},t.getOption=function(e){return t[e]}):t=e.$options,t}var m,b,v=[9,13,27,38,40],y=200,$=e.$eval(a.typeaheadMinLength);$||0===$||($=1),e.$watch(a.typeaheadMinLength,function(e){$=e||0===e?e:1});var w=e.$eval(a.typeaheadWaitMs)||0,x=e.$eval(a.typeaheadEditable)!==!1;e.$watch(a.typeaheadEditable,function(e){x=e!==!1});var S,M,I=i(a.typeaheadLoading).assign||angular.noop,T=a.typeaheadShouldSelect?i(a.typeaheadShouldSelect):function(e,t){var a=t.$event;return 13===a.which||9===a.which},U=i(a.typeaheadOnSelect),O=angular.isDefined(a.typeaheadSelectOnBlur)?e.$eval(a.typeaheadSelectOnBlur):!1,N=i(a.typeaheadNoResults).assign||angular.noop,P=a.typeaheadInputFormatter?i(a.typeaheadInputFormatter):void 0,C=a.typeaheadAppendToBody?e.$eval(a.typeaheadAppendToBody):!1,k=a.typeaheadAppendTo?e.$eval(a.typeaheadAppendTo):null,R=e.$eval(a.typeaheadFocusFirst)!==!1,E=a.typeaheadSelectOnExact?e.$eval(a.typeaheadSelectOnExact):!1,W=i(a.typeaheadIsOpen).assign||angular.noop,q=e.$eval(a.typeaheadShowHint)||!1,A=i(a.ngModel),V=i(a.ngModel+"($$$p)"),H=function(t,a){return angular.isFunction(A(e))&&b.getOption("getterSetter")?V(t,{$$$p:a}):A.assign(t,a)},B=c.parse(a.uibTypeahead),L=e.$new(),F=e.$on("$destroy",function(){L.$destroy()});L.$on("$destroy",F);var _="typeahead-"+L.$id+"-"+Math.floor(1e4*Math.random());t.attr({"aria-autocomplete":"list","aria-expanded":!1,"aria-owns":_});var D,j;q&&(D=angular.element("<div></div>"),D.css("position","relative"),t.after(D),j=t.clone(),j.attr("placeholder",""),j.attr("tabindex","-1"),j.val(""),j.css({position:"absolute",top:"0px",left:"0px","border-color":"transparent","box-shadow":"none",opacity:1,background:"none 0% 0% / auto repeat scroll padding-box border-box rgb(255, 255, 255)",color:"#999"}),t.css({position:"relative","vertical-align":"top","background-color":"transparent"}),j.attr("id")&&j.removeAttr("id"),D.append(j),j.after(t));var Y=angular.element("<div uib-typeahead-popup></div>");Y.attr({id:_,matches:"matches",active:"activeIdx",select:"select(activeIdx, evt)","move-in-progress":"moveInProgress",query:"query",position:"position","assign-is-open":"assignIsOpen(isOpen)",debounce:"debounceUpdate"}),angular.isDefined(a.typeaheadTemplateUrl)&&Y.attr("template-url",a.typeaheadTemplateUrl),angular.isDefined(a.typeaheadPopupTemplateUrl)&&Y.attr("popup-template-url",a.typeaheadPopupTemplateUrl);var X=function(){q&&j.val("")},z=function(){L.matches=[],L.activeIdx=-1,t.attr("aria-expanded",!1),X()},K=function(e){return _+"-option-"+e};L.$watch("activeIdx",function(e){0>e?t.removeAttr("aria-activedescendant"):t.attr("aria-activedescendant",K(e))});var G=function(e,t){return L.matches.length>t&&e?e.toUpperCase()===L.matches[t].label.toUpperCase():!1},J=function(a,o){var i={$viewValue:a};I(e,!0),N(e,!1),n.when(B.source(e,i)).then(function(n){var r=a===m.$viewValue;if(r&&S)if(n&&n.length>0){L.activeIdx=R?0:-1,N(e,!1),L.matches.length=0;for(var l=0;l<n.length;l++)i[B.itemName]=n[l],L.matches.push({id:K(l),label:B.viewMapper(L,i),model:n[l]});if(L.query=a,f(),t.attr("aria-expanded",!0),E&&1===L.matches.length&&G(a,0)&&(angular.isNumber(L.debounceUpdate)||angular.isObject(L.debounceUpdate)?d(function(){L.select(0,o)},angular.isNumber(L.debounceUpdate)?L.debounceUpdate:L.debounceUpdate["default"]):L.select(0,o)),q){var s=L.matches[0].label;j.val(angular.isString(a)&&a.length>0&&s.slice(0,a.length).toUpperCase()===a.toUpperCase()?a+s.slice(a.length):"")}}else z(),N(e,!0);r&&I(e,!1)},function(){z(),I(e,!1),N(e,!0)})};C&&(angular.element(s).on("resize",h),l.find("body").on("scroll",h));var Q=d(function(){L.matches.length&&f(),L.moveInProgress=!1},y);L.moveInProgress=!1,L.query=void 0;var Z,et=function(e){Z=r(function(){J(e)},w)},tt=function(){Z&&r.cancel(Z)};z(),L.assignIsOpen=function(t){W(e,t)},L.select=function(o,i){var n,l,s={};M=!0,s[B.itemName]=l=L.matches[o].model,n=B.modelMapper(e,s),H(e,n),m.$setValidity("editable",!0),m.$setValidity("parse",!0),U(e,{$item:l,$model:n,$label:B.viewMapper(e,s),$event:i}),z(),L.$eval(a.typeaheadFocusOnSelect)!==!1&&r(function(){t[0].focus()},0,!1)},t.on("keydown",function(t){if(0!==L.matches.length&&-1!==v.indexOf(t.which)){var a=T(e,{$event:t});if(-1===L.activeIdx&&a||9===t.which&&t.shiftKey)return z(),void L.$digest();t.preventDefault();var o;switch(t.which){case 27:t.stopPropagation(),z(),e.$digest();break;case 38:L.activeIdx=(L.activeIdx>0?L.activeIdx:L.matches.length)-1,L.$digest(),o=Y[0].querySelectorAll(".uib-typeahead-match")[L.activeIdx],o.parentNode.scrollTop=o.offsetTop;break;case 40:L.activeIdx=(L.activeIdx+1)%L.matches.length,L.$digest(),o=Y[0].querySelectorAll(".uib-typeahead-match")[L.activeIdx],o.parentNode.scrollTop=o.offsetTop;break;default:a&&L.$apply(function(){angular.isNumber(L.debounceUpdate)||angular.isObject(L.debounceUpdate)?d(function(){L.select(L.activeIdx,t)},angular.isNumber(L.debounceUpdate)?L.debounceUpdate:L.debounceUpdate["default"]):L.select(L.activeIdx,t)})}}}),t.on("focus",function(e){S=!0,0!==$||m.$viewValue||r(function(){J(m.$viewValue,e)},0)}),t.on("blur",function(e){O&&L.matches.length&&-1!==L.activeIdx&&!M&&(M=!0,L.$apply(function(){angular.isObject(L.debounceUpdate)&&angular.isNumber(L.debounceUpdate.blur)?d(function(){L.select(L.activeIdx,e)},L.debounceUpdate.blur):L.select(L.activeIdx,e)})),!x&&m.$error.editable&&(m.$setViewValue(),L.$apply(function(){m.$setValidity("editable",!0),m.$setValidity("parse",!0)}),t.val("")),S=!1,M=!1});var at=function(a){t[0]!==a.target&&3!==a.which&&0!==L.matches.length&&(z(),p.$$phase||e.$digest())};l.on("click",at),e.$on("$destroy",function(){l.off("click",at),(C||k)&&ot.remove(),C&&(angular.element(s).off("resize",h),l.find("body").off("scroll",h)),Y.remove(),q&&D.remove()});var ot=o(Y)(L);C?l.find("body").append(ot):k?angular.element(k).eq(0).append(ot):t.after(ot),this.init=function(t){m=t,b=g(m),L.debounceUpdate=i(b.getOption("debounce"))(e),m.$parsers.unshift(function(t){return S=!0,0===$||t&&t.length>=$?w>0?(tt(),et(t)):J(t):(I(e,!1),tt(),z()),x?t:t?void m.$setValidity("editable",!1):(m.$setValidity("editable",!0),null)}),m.$formatters.push(function(t){var a,o,i={};return x||m.$setValidity("editable",!0),P?(i.$model=t,P(e,i)):(i[B.itemName]=t,a=B.viewMapper(e,i),i[B.itemName]=void 0,o=B.viewMapper(e,i),a!==o?a:t)})}}]).directive("uibTypeahead",function(){return{controller:"UibTypeaheadController",require:["ngModel","uibTypeahead"],link:function(e,t,a,o){o[1].init(o[0])}}}).directive("uibTypeaheadPopup",["$$debounce",function(e){return{scope:{matches:"=",query:"=",active:"=",position:"&",moveInProgress:"=",select:"&",assignIsOpen:"&",debounce:"&"},replace:!0,templateUrl:function(e,t){return t.popupTemplateUrl||"uib/template/typeahead/typeahead-popup.html"},link:function(t,a,o){t.templateUrl=o.templateUrl,t.isOpen=function(){var e=t.matches.length>0;return t.assignIsOpen({isOpen:e}),e},t.isActive=function(e){return t.active===e},t.selectActive=function(e){t.active=e},t.selectMatch=function(a,o){var i=t.debounce();angular.isNumber(i)||angular.isObject(i)?e(function(){t.select({activeIdx:a,evt:o})},angular.isNumber(i)?i:i["default"]):t.select({activeIdx:a,evt:o})}}}}]).directive("uibTypeaheadMatch",["$templateRequest","$compile","$parse",function(e,t,a){return{scope:{index:"=",match:"=",query:"="},link:function(o,i,n){var r=a(n.templateUrl)(o.$parent)||"uib/template/typeahead/typeahead-match.html";e(r).then(function(e){var a=angular.element(e.trim());i.replaceWith(a),t(a)(o)})}}}]).filter("uibTypeaheadHighlight",["$sce","$injector","$log",function(e,t,a){function o(e){return e.replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")}function i(e){return/<.*>/g.test(e)}var n;return n=t.has("$sanitize"),function(t,r){return!n&&i(t)&&a.warn("Unsafe use of typeahead please use ngSanitize"),t=r?(""+t).replace(new RegExp(o(r),"gi"),"<strong>$&</strong>"):t,n||(t=e.trustAsHtml(t)),t}}]),angular.module("ui.bootstrap.debounce",[]).factory("$$debounce",["$timeout",function(e){return function(t,a){var o;return function(){var i=this,n=Array.prototype.slice.call(arguments);o&&e.cancel(o),o=e(function(){t.apply(i,n)},a)}}}]),angular.module("ui.bootstrap.position",[]).factory("$uibPosition",["$document","$window",function(e,t){var a,o,i={normal:/(auto|scroll)/,hidden:/(auto|scroll|hidden)/},n={auto:/\s?auto?\s?/i,primary:/^(top|bottom|left|right)$/,secondary:/^(top|bottom|left|right|center)$/,vertical:/^(top|bottom)$/},r=/(HTML|BODY)/;return{getRawNode:function(e){return e.nodeName?e:e[0]||e},parseStyle:function(e){return e=parseFloat(e),isFinite(e)?e:0},offsetParent:function(a){function o(e){return"static"===(t.getComputedStyle(e).position||"static")}a=this.getRawNode(a);for(var i=a.offsetParent||e[0].documentElement;i&&i!==e[0].documentElement&&o(i);)i=i.offsetParent;return i||e[0].documentElement},scrollbarWidth:function(i){if(i){if(angular.isUndefined(o)){var n=e.find("body");n.addClass("uib-position-body-scrollbar-measure"),o=t.innerWidth-n[0].clientWidth,o=isFinite(o)?o:0,n.removeClass("uib-position-body-scrollbar-measure")}return o}if(angular.isUndefined(a)){var r=angular.element('<div class="uib-position-scrollbar-measure"></div>');e.find("body").append(r),a=r[0].offsetWidth-r[0].clientWidth,a=isFinite(a)?a:0,r.remove()}return a},scrollbarPadding:function(e){e=this.getRawNode(e);var a=t.getComputedStyle(e),o=this.parseStyle(a.paddingRight),i=this.parseStyle(a.paddingBottom),n=this.scrollParent(e,!1,!0),l=this.scrollbarWidth(r.test(n.tagName));return{scrollbarWidth:l,widthOverflow:n.scrollWidth>n.clientWidth,right:o+l,originalRight:o,heightOverflow:n.scrollHeight>n.clientHeight,bottom:i+l,originalBottom:i}},isScrollable:function(e,a){e=this.getRawNode(e);var o=a?i.hidden:i.normal,n=t.getComputedStyle(e);return o.test(n.overflow+n.overflowY+n.overflowX)},scrollParent:function(a,o,n){a=this.getRawNode(a);var r=o?i.hidden:i.normal,l=e[0].documentElement,s=t.getComputedStyle(a);if(n&&r.test(s.overflow+s.overflowY+s.overflowX))return a;var p="absolute"===s.position,d=a.parentElement||l;if(d===l||"fixed"===s.position)return l;for(;d.parentElement&&d!==l;){var u=t.getComputedStyle(d);if(p&&"static"!==u.position&&(p=!1),!p&&r.test(u.overflow+u.overflowY+u.overflowX))break;d=d.parentElement}return d},position:function(a,o){a=this.getRawNode(a);var i=this.offset(a);if(o){var n=t.getComputedStyle(a);i.top-=this.parseStyle(n.marginTop),i.left-=this.parseStyle(n.marginLeft)}var r=this.offsetParent(a),l={top:0,left:0};return r!==e[0].documentElement&&(l=this.offset(r),l.top+=r.clientTop-r.scrollTop,l.left+=r.clientLeft-r.scrollLeft),{width:Math.round(angular.isNumber(i.width)?i.width:a.offsetWidth),height:Math.round(angular.isNumber(i.height)?i.height:a.offsetHeight),top:Math.round(i.top-l.top),left:Math.round(i.left-l.left)}},offset:function(a){a=this.getRawNode(a);var o=a.getBoundingClientRect();return{width:Math.round(angular.isNumber(o.width)?o.width:a.offsetWidth),height:Math.round(angular.isNumber(o.height)?o.height:a.offsetHeight),top:Math.round(o.top+(t.pageYOffset||e[0].documentElement.scrollTop)),left:Math.round(o.left+(t.pageXOffset||e[0].documentElement.scrollLeft))}},viewportOffset:function(a,o,i){a=this.getRawNode(a),i=i!==!1?!0:!1;var n=a.getBoundingClientRect(),r={top:0,left:0,bottom:0,right:0},l=o?e[0].documentElement:this.scrollParent(a),s=l.getBoundingClientRect();if(r.top=s.top+l.clientTop,r.left=s.left+l.clientLeft,l===e[0].documentElement&&(r.top+=t.pageYOffset,r.left+=t.pageXOffset),r.bottom=r.top+l.clientHeight,r.right=r.left+l.clientWidth,i){var p=t.getComputedStyle(l);r.top+=this.parseStyle(p.paddingTop),r.bottom-=this.parseStyle(p.paddingBottom),r.left+=this.parseStyle(p.paddingLeft),r.right-=this.parseStyle(p.paddingRight)}return{top:Math.round(n.top-r.top),bottom:Math.round(r.bottom-n.bottom),left:Math.round(n.left-r.left),right:Math.round(r.right-n.right)}},parsePlacement:function(e){var t=n.auto.test(e);return t&&(e=e.replace(n.auto,"")),e=e.split("-"),e[0]=e[0]||"top",n.primary.test(e[0])||(e[0]="top"),e[1]=e[1]||"center",n.secondary.test(e[1])||(e[1]="center"),e[2]=t?!0:!1,e},positionElements:function(e,a,o,i){e=this.getRawNode(e),a=this.getRawNode(a);var r=angular.isDefined(a.offsetWidth)?a.offsetWidth:a.prop("offsetWidth"),l=angular.isDefined(a.offsetHeight)?a.offsetHeight:a.prop("offsetHeight");o=this.parsePlacement(o);var s=i?this.offset(e):this.position(e),p={top:0,left:0,placement:""};if(o[2]){var d=this.viewportOffset(e,i),u=t.getComputedStyle(a),c={width:r+Math.round(Math.abs(this.parseStyle(u.marginLeft)+this.parseStyle(u.marginRight))),height:l+Math.round(Math.abs(this.parseStyle(u.marginTop)+this.parseStyle(u.marginBottom)))};if(o[0]="top"===o[0]&&c.height>d.top&&c.height<=d.bottom?"bottom":"bottom"===o[0]&&c.height>d.bottom&&c.height<=d.top?"top":"left"===o[0]&&c.width>d.left&&c.width<=d.right?"right":"right"===o[0]&&c.width>d.right&&c.width<=d.left?"left":o[0],o[1]="top"===o[1]&&c.height-s.height>d.bottom&&c.height-s.height<=d.top?"bottom":"bottom"===o[1]&&c.height-s.height>d.top&&c.height-s.height<=d.bottom?"top":"left"===o[1]&&c.width-s.width>d.right&&c.width-s.width<=d.left?"right":"right"===o[1]&&c.width-s.width>d.left&&c.width-s.width<=d.right?"left":o[1],"center"===o[1])if(n.vertical.test(o[0])){var h=s.width/2-r/2;d.left+h<0&&c.width-s.width<=d.right?o[1]="left":d.right+h<0&&c.width-s.width<=d.left&&(o[1]="right")}else{var f=s.height/2-c.height/2;d.top+f<0&&c.height-s.height<=d.bottom?o[1]="top":d.bottom+f<0&&c.height-s.height<=d.top&&(o[1]="bottom")}}switch(o[0]){case"top":p.top=s.top-l;break;case"bottom":p.top=s.top+s.height;break;case"left":p.left=s.left-r;break;case"right":p.left=s.left+s.width}switch(o[1]){case"top":p.top=s.top;break;case"bottom":p.top=s.top+s.height-l;break;case"left":p.left=s.left;break;case"right":p.left=s.left+s.width-r;break;case"center":n.vertical.test(o[0])?p.left=s.left+s.width/2-r/2:p.top=s.top+s.height/2-l/2}return p.top=Math.round(p.top),p.left=Math.round(p.left),p.placement="center"===o[1]?o[0]:o[0]+"-"+o[1],p},adjustTop:function(e,t,a,o){return-1!==e.indexOf("top")&&a!==o?{top:t.top-o+"px"}:void 0},positionArrow:function(e,a){e=this.getRawNode(e);var o=e.querySelector(".tooltip-inner, .popover-inner");if(o){var i=angular.element(o).hasClass("tooltip-inner"),r=e.querySelector(i?".tooltip-arrow":".arrow");if(r){var l={top:"",bottom:"",left:"",right:""};if(a=this.parsePlacement(a),"center"===a[1])return void angular.element(r).css(l);var s="border-"+a[0]+"-width",p=t.getComputedStyle(r)[s],d="border-";d+=n.vertical.test(a[0])?a[0]+"-"+a[1]:a[1]+"-"+a[0],d+="-radius";var u=t.getComputedStyle(i?o:e)[d];switch(a[0]){case"top":l.bottom=i?"0":"-"+p;break;case"bottom":l.top=i?"0":"-"+p;break;case"left":l.right=i?"0":"-"+p;break;case"right":l.left=i?"0":"-"+p}l[a[1]]=u,angular.element(r).css(l)}}}}}]),angular.module("uib/template/typeahead/typeahead-match.html",[]).run(["$templateCache",function(e){e.put("uib/template/typeahead/typeahead-match.html",'<a href\n   tabindex="-1"\n   ng-bind-html="match.label | uibTypeaheadHighlight:query"\n   ng-attr-title="{{match.label}}"></a>\n')}]),angular.module("uib/template/typeahead/typeahead-popup.html",[]).run(["$templateCache",function(e){e.put("uib/template/typeahead/typeahead-popup.html",'<ul class="dropdown-menu" ng-show="isOpen() && !moveInProgress" ng-style="{top: position().top+\'px\', left: position().left+\'px\'}" role="listbox" aria-hidden="{{!isOpen()}}">\n    <li class="uib-typeahead-match" ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index, $event)" role="option" id="{{::match.id}}">\n        <div uib-typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>\n    </li>\n</ul>\n')}]),angular.module("ui.bootstrap.typeahead").run(function(){!angular.$$csp().noInlineStyle&&!angular.$$uibTypeaheadCss&&angular.element(document).find("head").prepend('<style type="text/css">[uib-typeahead-popup].dropdown-menu{display:block;}</style>'),angular.$$uibTypeaheadCss=!0}),angular.module("ui.bootstrap.position").run(function(){!angular.$$csp().noInlineStyle&&!angular.$$uibPositionCss&&angular.element(document).find("head").prepend('<style type="text/css">.uib-position-measure{display:block !important;visibility:hidden !important;position:absolute !important;top:-9999px !important;left:-9999px !important;}.uib-position-scrollbar-measure{position:absolute !important;top:-9999px !important;width:50px !important;height:50px !important;overflow:scroll !important;}.uib-position-body-scrollbar-measure{overflow:scroll !important;}</style>'),angular.$$uibPositionCss=!0});
'use strict';

/**
 * @ngdoc overview
 * @name
 * @description
 */
angular
  .module('FieldDoc', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ipCookie',
    'leaflet-directive',
    'angularFileUpload',
    'geolocation',
    'monospaced.elastic',
    'angularMoment',
    'config',
    'MapboxGL',
    'MapboxGLGeocoding',
    'Mapbox',
    'save2pdf',
    'collaborator',
    'ui.bootstrap'
  ]);

'use strict';

/**
 * @ngdoc overview
 * @name
 * @description
 */
angular.module('FieldDoc')
    .config(function($routeProvider, $locationProvider) {

        $routeProvider
            .otherwise({
                templateUrl: '/modules/shared/errors/error404--view.html'
            });

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

    })
    .run(['$rootScope', '$window', '$location', '$anchorScroll', function($rootScope, $window, $location, $anchorScroll) {

        $rootScope.$on('$routeChangeSuccess', function() {

            $anchorScroll();

        });

    }]);
"use strict";

 angular.module('config', [])

.constant('environment', {name:'staging',apiUrl:'https://api.drwi.chesapeakecommons.org',siteUrl:'https://drwi.chesapeakecommons.org',clientId:'lynCelX7eoAV1i7pcltLRcNXHvUDOML405kXYeJ1'})

;
/**
 * angular-save2pdf - angular jsPDF wrapper
 * Copyright (c) 2015 John Daily Jr.,
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
(function() {
    'use strict';

    angular
        .module('save2pdf', [])
        .directive('save2pdf', function() {
            return {
                link: function($scope, element, Attrs, controller) {
                    $scope.$on('saveToPdf', function(event, mass) {

                        if (!element[0]) {
                            return;
                        }
                        var pdf = new jsPDF('p', 'pt', 'letter');

                        //
                        // Make sure we modify the scale of the images.
                        //
                        pdf.internal.scaleFactor = 2.25;

                        pdf.addHTML(element[0], 0, 0, {
                            pagesplit: true
                        }, function() {
                            pdf.save('FieldStack-PracticeMetrics-' + new Date() + '.pdf');
                        });
                    });
                }
            }
        });
})();
(function() {

    'use strict';

    /**
     * @ngdoc overview
     * @name FieldDoc
     * @description
     * # FieldDoc
     *
     * Main module of the application.
     */
    angular.module('FieldDoc')
        .config(function($routeProvider) {
            $routeProvider
                .when('/', {
                    redirectTo: '/account/login'
                })
                .when('/user', {
                    redirectTo: '/account/login'
                })
                .when('/user/login', {
                    redirectTo: '/account/login'
                })
                .when('/account/login', {
                    templateUrl: '/modules/shared/security/views/securityLogin--view.html',
                    controller: 'SecurityController',
                    controllerAs: 'page'
                })
                .when('/account/register', {
                    templateUrl: '/modules/shared/security/views/securityRegister--view.html',
                    controller: 'SecurityRegisterController',
                    controllerAs: 'page'
                })
                .when('/account/reset', {
                    templateUrl: '/modules/shared/security/views/securityResetPassword--view.html',
                    controller: 'SecurityResetPasswordController',
                    controllerAs: 'page'
                })
                .when('/logout', {
                    redirectTo: '/user/logout'
                })
                .when('/user/logout', {
                    template: 'Logging out ...',
                    controller: 'SecurityLogoutController',
                    controllerAs: 'page'
                });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('SecurityController', function(Account, $location, Security, ipCookie, Notifications, $route, $rootScope, $timeout) {

            var self = this;

            self.cookieOptions = {
                'path': '/',
                'expires': 7
            };

            //
            // Before showing the user the login page,
            //
            if (ipCookie('FIELDSTACKIO_SESSION')) {

                $location.path('/projects');
                
            }

            self.login = {
                processing: false,
                submit: function(firstTime) {

                    self.login.processing = true;

                    var credentials = new Security({
                        email: self.login.email,
                        password: self.login.password,
                    });

                    credentials.$save(function(response) {

                        //
                        // Check to see if there are any errors by checking for the existence
                        // of response.response.errors
                        //
                        if (response.response && response.response.errors) {
                            self.login.errors = response.response.errors;
                            self.register.processing = false;
                            self.login.processing = false;

                            $timeout(function() {
                                self.login.errors = null;
                            }, 3500);
                        } else {
                            //
                            // Make sure our cookies for the Session are being set properly
                            //
                            ipCookie.remove('FIELDSTACKIO_SESSION');
                            ipCookie('FIELDSTACKIO_SESSION', response.access_token, self.cookieOptions);

                            //
                            // Make sure we also set the User ID Cookie, so we need to wait to
                            // redirect until we're really sure the cookie is set
                            //
                            Account.setUserId().$promise.then(function() {
                                Account.getUser().$promise.then(function(userResponse) {

                                    Account.userObject = userResponse;

                                    $rootScope.user = Account.userObject;
                                    $rootScope.isLoggedIn = Account.hasToken();
                                    $rootScope.isAdmin = Account.hasRole('admin');

                                    $location.path('/projects');

                                });
                            });

                        }
                    }, function() {
                        self.login.processing = false;

                        var messageTitle = 'Incorrect Credentials',
                            messageDescription = ['The email or password you provided was incorrect'];

                        $rootScope.notifications.error(messageTitle, messageDescription);

                        $timeout(function() {
                            $rootScope.notifications.objects = [];
                        }, 3500);
                    });
                }
            };
        });

}());
(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
     angular.module('FieldDoc')
       .controller('SecurityRegisterController', function (Account, $location, Notifications, Security, ipCookie, $rootScope, $timeout, User) {

             var self = this,
                 userId = null;

             self.cookieOptions = {
               path: '/',
               expires: 2
             };

             //
             // We have a continuing problem with bad data being placed in the URL,
             // the following fixes that
             //
             $location.search({
               q: undefined,
               results_per_page: undefined
             });

             self.register = {
               data: {
                 email: null,
                 first_name: null,
                 last_name: null,
                 organizations: [],
                 password: null
               },
               organizations: function() {
                 var _organizations = [];

                 angular.forEach(self.register.data.organizations, function(_organization, _index) {
                   if (_organization.id) {
                     _organizations.push({
                       "id": _organization.id
                     })
                   }
                   else {
                     _organizations.push({
                       "name": _organization.properties.name
                     })
                   }
                 });

                 return _organizations;
               },
               visible: false,
               login: function(userId) {

                 var credentials = new Security({
                   email: self.register.data.email,
                   password: self.register.data.password,
                 });

                 credentials.$save(function(response) {

                   //
                   // Check to see if there are any errors by checking for the existence
                   // of response.response.errors
                   //
                   if (response.response && response.response.errors) {

                     if (response.response.errors.email) {
                       $rootScope.notifications.error('', response.response.errors.email);
                     }
                     if (response.response.errors.password) {
                       $rootScope.notifications.error('', response.response.errors.password);
                     }

                     self.register.processing = false;

                     $timeout(function() {
                       $rootScope.notifications.objects = [];
                     }, 3500);

                     return;
                   } else {

                     ipCookie.remove('FIELDSTACKIO_SESSION');

                     ipCookie('FIELDSTACKIO_SESSION', response.access_token, self.cookieOptions);

                     //
                     // Make sure we also set the User ID Cookie, so we need to wait to
                     // redirect until we're really sure the cookie is set
                     //
                     Account.setUserId().$promise.then(function() {
                       Account.getUser().$promise.then(function(userResponse) {

                         Account.userObject = userResponse;

                         $rootScope.user = Account.userObject;

                         $rootScope.isLoggedIn = Account.hasToken();

                         self.newUser = new User({
                           id: $rootScope.user.id,
                           first_name: self.register.data.first_name,
                           last_name: self.register.data.last_name,
                           organizations: self.register.organizations()
                         });

                         self.newUser.$update().then(function (updateUserSuccessResponse) {
                           $location.path('/projects');
                         }, function(updateUserErrorResponse) {
                           console.log('updateUserErrorResponse', updateUserErrorResponse);
                         });

                       });
                     });

                   }
                 }, function(response){

                   if (response.response.errors.email) {
                     $rootScope.notifications.error('', response.response.errors.email);
                   }
                   if (response.response.errors.password) {
                     $rootScope.notifications.error('', response.response.errors.password);
                   }

                   self.register.processing = false;

                   $timeout(function() {
                     $rootScope.notifications.objects = [];
                   }, 3500);

                   return;
                 });

               },
               submit: function() {

                 self.register.processing = true;

                 //
                 // Check to see if Username and Password field are valid
                 //
                 if (!self.register.data.email) {
                   $rootScope.notifications.warning('Email', 'field is required');

                   self.register.processing = false;

                   $timeout(function() {
                     $rootScope.notifications.objects = [];
                   }, 3500);

                   return;
                 }
                 else if (!self.register.data.password) {
                   $rootScope.notifications.warning('Password', 'field is required');

                   self.register.processing = false;

                   $timeout(function() {
                     $rootScope.notifications.objects = [];
                   }, 3500);

                   return;
                 }

                 //
                 // If all fields have values move on to the next step
                 //
                 Security.register({
                   email: self.register.data.email,
                   password: self.register.data.password
                 }, function(response) {

                   //
                   // Check to see if there are any errors by checking for the
                   // existence of response.response.errors
                   //
                   if (response.response && response.response.errors) {

                     if (response.response.errors.email) {
                       $rootScope.notifications.error('', response.response.errors.email);
                     }
                     if (response.response.errors.password) {
                       $rootScope.notifications.error('', response.response.errors.password);
                     }

                     self.register.processing = false;

                     $timeout(function() {
                       $rootScope.notifications.objects = [];
                     }, 3500);

                     return;
                   } else {

                     self.register.processing = false;

                     self.register.processingLogin = true;

                     self.register.login(response.response.user.id);
                   }
                 });
               }
             };

       });

}());

(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('SecurityLogoutController', function(Account, ipCookie, $location, $rootScope) {

            /**
             * Remove all cookies present for authentication
             */
            ipCookie.remove('FIELDSTACKIO_SESSION');
            ipCookie.remove('FIELDSTACKIO_SESSION', {
                path: '/'
            });

            ipCookie.remove('FIELDSTACKIO_CURRENTUSER');
            ipCookie.remove('FIELDSTACKIO_CURRENTUSER', {
                path: '/'
            });

            /**
             * Remove all data from the User and Account objects, this is really just
             * for display purposes and has no bearing on the actual session
             */
            $rootScope.user = Account.userObject = null;

            /**
             * Redirect individuals back to the activity list
             */
            $location.path('/');
            
        });

}());
(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('SecurityResetPasswordController', function ($location, Security, $timeout) {

      var self = this;

      self.reset = {
        success: false,
        processing: false,
        visible: true,
        submit: function() {

          self.reset.processing = true;

          var credentials = new Security({
            email: self.reset.email
          });

          credentials.$reset(function(response) {

            //
            // Check to see if there are any errors by checking for the existence
            // of response.response.errors
            //
            if (response.response && response.response.errors) {
              self.reset.errors = response.response.errors;
              self.register.processing = false;
              self.reset.processing = false;

              $timeout(function() {
                self.reset.errors = null;
              }, 3500);
            } else {
              self.reset.processing = false;
              self.reset.success = true;
            }
          }, function(){
            self.reset.processing = false;

            self.reset.errors = {
              email: ['The email or password you provided was incorrect']
            };

            $timeout(function() {
              self.reset.errors = null;
            }, 3500);
          });
        }
      };

    });

} ());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name FieldDoc.authorizationInterceptor
     * @description
     * # authorizationInterceptor
     * Service in the FieldDoc.
     */
    angular.module('FieldDoc')
        .factory('AuthorizationInterceptor', function($location, $q, ipCookie, $log) {

            return {
                request: function(config) {

                    var sessionCookie = ipCookie('FIELDSTACKIO_SESSION');

                    //
                    // Configure our headers to contain the appropriate tags
                    //

                    config.headers = config.headers || {};

                    if (config.headers['Authorization-Bypass'] === true) {

                        delete config.headers['Authorization-Bypass'];

                        return config || $q.when(config);

                    }

                    if (sessionCookie) {

                        config.headers.Authorization = 'Bearer ' + sessionCookie;

                    } else if (!sessionCookie &&
                        $location.path() !== '/account/register' &&
                        $location.path() !== '/account/reset' &&
                        $location.path().lastIndexOf('/dashboard', 0) !== 0) {
                        /**
                         * Remove all cookies present for authentication
                         */
                        ipCookie.remove('FIELDSTACKIO_SESSION');
                        ipCookie.remove('FIELDSTACKIO_SESSION', {
                            path: '/'
                        });

                        ipCookie.remove('FIELDSTACKIO_CURRENTUSER');
                        ipCookie.remove('FIELDSTACKIO_CURRENTUSER', {
                            path: '/'
                        });

                        $location.path('/account/login').search('');

                    }

                    config.headers['Cache-Control'] = 'no-cache, max-age=0, must-revalidate';

                    //
                    // Configure or override parameters where necessary
                    //
                    config.params = (config.params === undefined) ? {} : config.params;

                    console.log('SecurityInterceptor::Request', config || $q.when(config));

                    return config || $q.when(config);

                },
                response: function(response) {

                    $log.info('AuthorizationInterceptor::Response', response || $q.when(response));

                    return response || $q.when(response);

                },
                responseError: function(response) {

                    $log.info('AuthorizationInterceptor::ResponseError', response || $q.when(response));

                    if (response.status === 401 || response.status === 403) {

                        $location.path('/user/logout');
                        
                    }

                    return $q.reject(response);

                }
            };

        }).config(function($httpProvider) {

            $httpProvider.interceptors.push('AuthorizationInterceptor');

        });

}());
'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.Navigation
 * @description
 * # Navigation
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('token', ['$location', 'ipCookie', function ($location, ipCookie) {

    return {
      get: function() {
        return ipCookie('COMMONS_SESSION');
      },
      remove: function() {
        //
        // Clear out existing COMMONS_SESSION cookies that may be invalid or
        // expired. This may happen when a user closes the window and comes back
        //
        ipCookie.remove('COMMONS_SESSION');
        ipCookie.remove('COMMONS_SESSION', { path: '/' });
      },
      save: function() {
        var locationHash = $location.hash(),
            accessToken = locationHash.substring(0, locationHash.indexOf('&')).replace('access_token=', '');

        ipCookie('COMMONS_SESSION', accessToken, {
              path: '/',
              expires: 2
            });

        $location.hash(null);

        $location.path('/projects');
      }
    };

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
    .config(function($routeProvider, commonscloud) {

        $routeProvider
            .when('/dashboards', {
                templateUrl: '/modules/components/snapshot/views/snapshotList--view.html',
                controller: 'SnapshotListCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    snapshots: function($route, $location, Snapshot) {

                        return Snapshot.query();

                    },
                    user: function(Account) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }
                }
            })
            .when('/dashboards/:snapshotId', {
                templateUrl: '/modules/components/snapshot/views/snapshot--view.html',
                controller: 'SnapshotCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    geographies: function($route, $location, Snapshot) {

                        return Snapshot.geographies({
                            id: $route.current.params.snapshotId
                        });

                    },
                    baseProjects: function($route, $location, Snapshot) {

                        return Snapshot.projects({
                            id: $route.current.params.snapshotId
                        });

                    },
                    snapshot: function($route, $location, Snapshot) {

                        return Snapshot.get({
                            id: $route.current.params.snapshotId
                        });

                    }
                }
            })
            .when('/dashboards/collection/new', {
                templateUrl: '/modules/components/snapshot/views/snapshotCreate--view.html',
                controller: 'SnapshotCreateCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    user: function(Account) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }
                }
            })
            .when('/dashboards/:snapshotId/edit', {
                templateUrl: '/modules/components/snapshot/views/snapshotEdit--view.html',
                controller: 'SnapshotEditCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    snapshot: function($route, $location, Snapshot) {

                        return Snapshot.get({
                            id: $route.current.params.snapshotId
                        });

                    },
                    user: function(Account) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }
                }
            });

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SnapshotCtrl', function(Account, $location, $log, $interval, $timeout, Project, Map,
        baseProjects, $rootScope, $scope, Site, leafletData, leafletBoundsHelpers,
        MetricService, OutcomeService, ProjectStore, FilterStore, geographies, mapbox,
        Practice, snapshot) {

        $scope.filterStore = FilterStore;

        FilterStore.clearAll();

        // $scope.projectStore = ProjectStore;

        var self = this;

        self.loading = true;

        self.fillMeter = $interval(function() {

            var tempValue = (self.progressValue || 10) * 0.1;

            if (!self.progressValue) {

                self.progressValue = tempValue;

            } else if ((100 - tempValue) > self.progressValue) {

                self.progressValue += tempValue;

            }

            console.log('progressValue', self.progressValue);

        }, 100);

        self.showElements = function() {

            $interval.cancel(self.fillMeter);

            self.progressValue = 100;

            $timeout(function() {

                self.loading = false;

            }, 800);

        };

        //
        // Setup basic page variables
        //
        $rootScope.page = {
            title: 'Snapshot'
        };

        self.activeTab = {
            collection: 'metric'
        };

        self.cardTpl = {};

        self.card = {};

        // self.cardTpl = {
        //     featureType: 'program',
        //     featureTabLabel: 'Projects',
        //     feature: null,
        //     heading: 'Delaware River Watershed Initiative',
        //     yearsActive: '2013 - 2018',
        //     funding: '$2.65 million',
        //     url: 'https://4states1source.org',
        //     resourceUrl: null,
        //     linkTarget: '_blank',
        //     description: 'The Delaware River Watershed Initiative is a cross-cutting collaboration working to conserve and restore the streams that supply drinking water to 15 million people in New York, New Jersey, Pennsylvania and Delaware.',
        // };

        // self.card = self.cardTpl;

        self.historyItem = null;

        self.historyIndex = [];

        self.project = {};

        self.map = JSON.parse(JSON.stringify(Map));

        self.map.layers = {
            baselayers: {
                streets: {
                    name: 'Streets',
                    type: 'xyz',
                    url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    layerOptions: {
                        apikey: mapbox.access_token,
                        mapid: 'mapbox.streets',
                        attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                    }
                },
                terrain: {
                    name: 'Terrain',
                    type: 'xyz',
                    url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    layerOptions: {
                        apikey: mapbox.access_token,
                        mapid: 'mapbox.run-bike-hike',
                        attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                    }
                },
                satellite: {
                    name: 'Satellite',
                    type: 'xyz',
                    url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    layerOptions: {
                        apikey: mapbox.access_token,
                        mapid: 'mapbox.streets-satellite',
                        attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                    }
                }
            }
        };

        self.map.markers = {};

        self.map.layers.overlays = {
            projects: {
                type: 'group',
                name: 'projects',
                visible: true,
                layerOptions: {
                    showOnSelector: false
                },
                layerParams: {
                    showOnSelector: false
                }
            }
        };

        console.log('self.map', self.map);

        self.popupTemplate = function(feature) {

            return '<div class=\"project--popup\">' +
                '<div class=\"marker--title border--right\">' + feature.name + '</div>' +
                '<a href=\"projects/' + feature.id + '\">' +
                '<i class=\"material-icons\">keyboard_arrow_right</i>' +
                '</a>' +
                '</div>';

        };

        self.processLocations = function(features) {

            self.map.markers = {};

            features.forEach(function(feature) {

                var centroid = feature.centroid;

                console.log('centroid', centroid);

                if (centroid) {

                    self.map.markers['project_' + feature.id] = {
                        lat: centroid.coordinates[1],
                        lng: centroid.coordinates[0],
                        layer: 'projects',
                        focus: false,
                        icon: {
                            type: 'div',
                            className: 'project--marker',
                            iconSize: [24, 24],
                            popupAnchor: [-2, -10],
                            html: ''
                        },
                        message: self.popupTemplate(feature)
                    };

                }

            });

            console.log('self.map.markers', self.map.markers);

        };

        self.resetMapExtent = function() {

            self.map.geojson.data = self.geographies;

            leafletData.getMap('dashboard--map').then(function(map) {

                map.closePopup();

                leafletData.getLayers('dashboard--map').then(function(layers) {

                    console.log('leafletData.getLayers', layers);

                    map.removeLayer(layers.baselayers.satellite);

                    map.removeLayer(layers.baselayers.terrain);

                    map.addLayer(layers.baselayers.streets);

                });

                leafletData.getGeoJSON('dashboard--map').then(function(geoJsonLayer) {

                    console.log('geoJsonLayer', geoJsonLayer);

                    map.fitBounds(geoJsonLayer.getBounds(), {
                        maxZoom: 18
                    });

                });

            });

        };

        self.setMapBoundsToFeature = function(feature) {

            console.log('setMapBoundsToFeature', feature);

            var geoJsonLayer = L.geoJson(feature, {});

            leafletData.getMap('dashboard--map').then(function(map) {

                map.fitBounds(geoJsonLayer.getBounds(), {
                    maxZoom: 18
                });

            });

        };

        //
        // Load custom geographies
        //

        function onEachFeature(feature, layer) {

            console.log('onEachFeature', feature, layer);

            var popup;

            layer.on({

                click: function() {

                    console.log(layer.feature.properties.name);

                    self.setMapBoundsToFeature(layer.feature);

                    if (layer.feature.properties.feature_type === 'site') {

                        self.activeSite = feature;

                        self.card = {
                            featureType: 'site',
                            featureTabLabel: 'Practices',
                            feature: feature.properties,
                            heading: feature.properties.name,
                            yearsActive: '2018',
                            funding: '$100k',
                            url: '/sites/' + feature.properties.id,
                            description: feature.properties.description,
                            linkTarget: '_self'
                        };

                        self.loadSitePractices(layer.feature.properties);

                        self.loadMetrics(null, {
                            collection: 'site',
                            featureId: feature.properties.id
                        });

                        self.loadOutcomes(null, {
                            collection: 'site',
                            featureId: feature.properties.id
                        });

                        //
                        // Set value of `self.historyItem`
                        //

                        self.historyItem = {
                            feature: self.activeProject,
                            label: self.activeProject.properties.name,
                            geoJson: self.activeProject,
                            type: 'project'
                        };

                    } else if (layer.feature.properties.feature_type === 'geography') {

                        self.setGeoFilter(layer.feature.properties);

                        self.card = {
                            featureType: 'geography',
                            featureTabLabel: 'Projects',
                            feature: feature.properties,
                            heading: feature.properties.name,
                            yearsActive: '2013-2018',
                            funding: '$50k',
                            url: 'geographies/' + feature.properties.id,
                            description: feature.properties.description,
                            linkTarget: '_self'
                        };

                    } else if (layer.feature.properties.feature_type === 'practice') {

                        self.loadMetrics(null, {
                            collection: 'practice',
                            featureId: feature.properties.id
                        });

                        self.loadOutcomes(null, {
                            collection: 'practice',
                            featureId: feature.properties.id
                        });

                        self.card = {
                            featureType: 'practice',
                            featureTabLabel: null,
                            feature: feature.properties,
                            heading: feature.properties.name,
                            yearsActive: null,
                            funding: null,
                            url: '/practices/' + feature.properties.id,
                            description: feature.properties.description,
                            linkTarget: '_self'
                        };

                        //
                        // Set value of `self.historyItem`
                        //

                        self.historyItem = {
                            feature: self.activeSite,
                            label: self.activeSite.properties.name,
                            geoJson: self.activeSite,
                            type: 'site'
                        };

                    }

                },
                mouseover: function(event) {

                    console.log('onEachFeature.mouseover', event);

                    console.log(layer.feature.properties.name);

                    self.removeMarkerPopups();

                    leafletData.getMap('dashboard--map').then(function(map) {

                        if (popup) {

                            map.closePopup(popup);

                        }

                        popup = L.popup()
                            .setLatLng(event.latlng)
                            .setContent('<div class=\"marker--title\">' + feature.properties.name + '</div>');

                        popup.openOn(map);

                    });

                },
                mouseout: function(event) {

                    console.log('onEachFeature.mouseout', event);

                    console.log(layer.feature.properties.name);

                    leafletData.getMap('dashboard--map').then(function(map) {

                        if (popup) {

                            map.closePopup(popup);

                        }

                    });

                }

            });
        }

        self.loadGeographies = function() {

            geographies.$promise.then(function(successResponse) {

                console.log('geographies.successResponse', successResponse);

                if (self.progressValue < 100 &&
                    self.filteredProjects) {

                    self.showElements();

                }

                self.geographies = successResponse;

                self.map.geojson = {
                    data: successResponse,
                    onEachFeature: onEachFeature,
                    style: {
                        color: '#00D',
                        fillColor: 'red',
                        weight: 2.0,
                        opacity: 0.6,
                        fillOpacity: 0.2
                    }
                };

                //
                // Fit map bounds to GeoJSON
                //

                self.resetMapExtent();

                //
                // Set up layer visibility logic
                //

                leafletData.getMap('dashboard--map').then(function(map) {

                    map.on('zoomend', function(event) {

                        var zoomLevel = map.getZoom();

                        leafletData.getLayers('dashboard--map').then(function(layers) {

                            console.log('leafletData.getLayers', layers);

                            if (zoomLevel > 15) {

                                map.removeLayer(layers.baselayers.streets);

                                map.removeLayer(layers.baselayers.terrain);

                                map.addLayer(layers.baselayers.satellite);

                            } else {

                                map.removeLayer(layers.baselayers.satellite);

                                map.removeLayer(layers.baselayers.terrain);

                                map.addLayer(layers.baselayers.streets);

                            }

                        });

                    });

                });

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.extractIds = function(arr) {

            var projectIds = [];

            arr.forEach(function(datum) {

                projectIds.push(datum.id);

            });

            return projectIds.join(',');

        };

        self.loadMetrics = function(arr, options) {

            if (options) {

                if (options.collection === 'site') {

                    Site.metrics({
                        id: options.featureId
                    }).$promise.then(function(successResponse) {

                        console.log('granteeResponse', successResponse);

                        self.metrics = successResponse.features;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                } else {

                    Practice.metrics({
                        id: options.featureId
                    }).$promise.then(function(successResponse) {

                        console.log('granteeResponse', successResponse);

                        self.metrics = successResponse.features;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                }

            } else {

                //
                // A program (account) identifier
                // is required by default.
                //

                var params = {};

                //
                // If the `arr` parameter is valid,
                // constrain the query to the given
                // set of numeric project identifiers.
                //

                if (arr && arr.length) {

                    params.projects = self.extractIds(arr);

                }

                MetricService.query(params).$promise.then(function(successResponse) {

                    console.log('granteeResponse', successResponse);

                    self.metrics = successResponse.features;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            }

        };

        self.loadOutcomes = function(arr, options) {

            if (options) {

                if (options.collection === 'site') {

                    Site.outcomes({
                        id: options.featureId
                    }).$promise.then(function(successResponse) {

                        console.log('siteOutcomesResponse', successResponse);

                        self.outcomes = successResponse;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                } else {

                    Practice.outcomes({
                        id: options.featureId
                    }).$promise.then(function(successResponse) {

                        console.log('practiceOutcomesResponse', successResponse);

                        self.outcomes = successResponse;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                }

            } else {

                //
                // A program (account) identifier
                // is required by default.
                //

                var params = {};

                //
                // If the `arr` parameter is valid,
                // constrain the query to the given
                // set of numeric project identifiers.
                //

                if (arr && arr.length) {

                    params.projects = self.extractIds(arr);

                }

                OutcomeService.query(params).$promise.then(function(successResponse) {

                    console.log('granteeResponse', successResponse);

                    self.outcomes = successResponse;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            }

        };

        self.search = {
            query: '',
            execute: function(page) {

                //
                // Get all of our existing URL Parameters so that we can
                // modify them to meet our goals
                //

                var q = {
                    filters: [{
                        'and': [{
                            name: 'name',
                            op: 'ilike',
                            val: '%' + self.search.query + '%'
                        }]
                    }],
                    order_by: [{
                        field: 'created_on',
                        direction: 'desc'
                    }]
                };

                if (self.filters.active.workflow_state !== null) {
                    console.log('add workflow state filter');

                    q.filters.push({
                        'name': 'workflow_state',
                        'op': 'like',
                        'val': self.filters.active.workflow_state
                    });
                }

                if (self.filters.active.year && self.filters.active.year.year) {
                    q.filters.push({
                        'name': 'created_on',
                        'op': 'gte',
                        'val': self.filters.active.year.year + '-01-01'
                    });
                    q.filters.push({
                        'name': 'created_on',
                        'op': 'lte',
                        'val': self.filters.active.year.year + '-12-31'
                    });
                }

                Project.query({
                    'q': q,
                    'page': (page ? page : 1)
                }).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    self.projects = successResponse;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            },
            paginate: function(pageNumber) {

                //
                // Get all of our existing URL Parameters so that we can
                // modify them to meet our goals
                //
                self.search.execute(pageNumber);
            },
            clear: function() {

                // $location.path('/projects/').search('');

                self.q = {};

                self.filteredProjects = self.projects;

                self.processLocations(self.filteredProjects);

            }
        };

        //
        // Set Default Search Filter value
        //
        if (self.search && self.search.query === '') {

            var searchParams = $location.search(),
                q = angular.fromJson(searchParams.q);

            if (q && q.filters && q.filters.length) {
                angular.forEach(q.filters[0].and, function(filter) {
                    if (filter.name === 'name') {
                        self.search.query = filter.val.replace(/%/g, '');
                    }
                });
            }
        }

        self.removeMarkerPopups = function() {

            for (var key in self.map.markers) {

                if (self.map.markers.hasOwnProperty(key)) {

                    self.map.markers[key].focus = false;

                }

            }

        };

        self.setMarkerFocus = function(feature, collection, setFilter) {

            if (collection === 'project') {

                var markerId = 'project_' + feature.id,
                    marker = self.map.markers[markerId];

                self.removeMarkerPopups();

                if (marker) {

                    self.map.markers[markerId].focus = true;

                    if (setFilter) {

                        self.setProjectFilter(feature);

                    }

                }

                console.log('setMarkerFocus', markerId, self.map.markers[markerId]);

            } else {

                if (collection === 'practice') {

                    self.map.geojson.data = self.practices;

                }

                self.setMapBoundsToFeature(feature);

            }

        };

        self.clearMarkerFocus = function(feature) {

            var markerId = 'project_' + feature.id,
                marker = self.map.markers[markerId];

            if (marker) {

                self.map.markers[markerId].focus = false;

            }

            console.log('clearMarkerFocus', markerId, self.map.markers[markerId]);

        };

        self.loadProjectSites = function(obj) {

            Project.sites({
                id: obj.id
            }).$promise.then(function(successResponse) {

                console.log('projectSiteResponse', successResponse);

                self.sites = successResponse;

                self.map.geojson = {
                    data: successResponse,
                    onEachFeature: onEachFeature,
                    style: {
                        color: '#00D',
                        fillColor: 'red',
                        weight: 2.0,
                        opacity: 0.6,
                        fillOpacity: 0.2
                    }
                };

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.loadSitePractices = function(obj) {

            Site.practices({
                id: obj.id
            }).$promise.then(function(successResponse) {

                console.log('sitePracticeResponse', successResponse);

                self.practices = successResponse;

                leafletData.getMap('dashboard--map').then(function(map) {

                    map.closePopup();

                    self.setMapBoundsToFeature(successResponse);

                });

                self.map.geojson = {
                    data: successResponse,
                    onEachFeature: onEachFeature,
                    style: {
                        color: '#00D',
                        fillColor: 'red',
                        weight: 2.0,
                        opacity: 0.6,
                        fillOpacity: 0.2
                    }
                };

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.navigateBack = function() {

            var historyType = self.historyItem.type;

            switch (historyType) {

                case 'program':

                    self.resetMapExtent();

                    self.clearAllFilters(true);

                    break;

                case 'project':

                    // self.setMapBoundsToFeature(self.activeProject);

                    self.setProjectFilter(self.activeProject.properties);

                    self.card = {
                        featureType: 'project',
                        featureTabLabel: 'Sites',
                        feature: self.activeProject.properties,
                        heading: self.activeProject.properties.name,
                        yearsActive: '2018',
                        funding: '$100k',
                        url: 'projects/' + self.activeProject.properties.id,
                        description: self.activeProject.properties.description,
                        linkTarget: '_self'
                    };

                    break;

                case 'site':

                    self.map.geojson.data = self.activeSite;

                    self.setMapBoundsToFeature(self.activeSite);

                    // self.practices = null;

                    self.card = {
                        featureType: 'site',
                        featureTabLabel: 'Practices',
                        feature: self.activeSite.properties,
                        heading: self.activeSite.properties.name,
                        yearsActive: '2018',
                        funding: '$10k',
                        url: '/sites/' + self.activeSite.properties.id,
                        description: self.activeSite.properties.description,
                        linkTarget: '_self'
                    };

                    //
                    // Update history item
                    //

                    self.historyItem = {
                        feature: self.activeProject,
                        label: self.activeProject.properties.name,
                        geoJson: self.activeProject,
                        type: 'project'
                    };

                    break;

                default:

                    break;

            }

        };

        self.setProjectFilter = function(obj) {

            //
            // Fit map bounds to GeoJSON
            //

            var feature = {
                type: 'Feature',
                properties: obj,
                geometry: obj.extent
            };

            self.setMapBoundsToFeature(feature);

            self.loadProjectSites(obj);

            FilterStore.clearAll();

            var _filterObject = {
                id: obj.id,
                name: obj.name,
                category: 'project'
            };

            FilterStore.addItem(_filterObject);

            // ProjectStore.filterAll(FilterStore.index);

            self.loadMetrics([
                obj
            ]);

            self.loadOutcomes([
                obj
            ]);

            //
            // Set value of `self.historyItem`
            //

            self.historyItem = {
                feature: null,
                label: 'All projects',
                geoJson: self.geographies,
                type: 'program'
            };

            //
            // Track project object
            //

            self.activeProject = feature;

            //
            // Update `self.card` values
            //

            self.card = {
                featureType: 'project',
                featureTabLabel: 'Sites',
                feature: feature,
                heading: obj.name,
                yearsActive: '2018',
                funding: '$100k',
                url: 'projects/' + obj.id,
                description: obj.description,
                linkTarget: '_self'
            };

        };

        self.setGeoFilter = function(obj) {

            FilterStore.clearAll();

            var _filterObject = {
                id: obj.id,
                name: obj.name,
                category: 'geography'
            };

            FilterStore.addItem(_filterObject);

            self.filterProjects();

        };

        self.setTab = function(collection) {

            self.activeTab = {
                collection: collection
            };

        };

        self.closeFilterModal = function() {

            if (FilterStore.index.length < 1) {

                self.clearAllFilters(true);

            }

            self.showFilters = false;

        };

        self.clearFilter = function(obj) {

            FilterStore.clearItem(obj);

        };

        self.clearAllFilters = function(reload) {

            //
            // Remove all stored filter objects
            //

            FilterStore.clearAll();

            //
            // Dismiss filter modal
            //

            self.showFilters = false;

            //
            // Reset map extent
            //

            self.resetMapExtent();

            //
            // Reset metadata card values
            //

            self.card = self.cardTpl;

            //
            // Reset value of `self.historyItem`
            //

            self.historyItem = null;

            //
            // Reset value of `self.activeProject`
            //

            self.activeProject = null;

            //
            // Reset value of `self.activeSite`
            //

            self.activeSite = null;

            //
            // Refresh project list
            //

            if (reload) {

                // self.loadProjects({}, false);

                self.loadBaseProjects();

            }

        };

        self.zoomToProjects = function() {

            var featureCollection = {
                type: 'FeatureCollection',
                features: []
            };

            self.filteredProjects.forEach(function(feature) {

                featureCollection.features.push({
                    type: 'Feature',
                    properties: {},
                    geometry: feature.extent
                });

            });

            self.setMapBoundsToFeature(featureCollection);

        };

        self.processProjectData = function(data) {

            self.filteredProjects = data.features;

            self.processLocations(data.features);

            self.loadOutcomes(self.filteredProjects);

            self.loadMetrics(self.filteredProjects);

            self.zoomToProjects();

        };

        self.loadSnapshot = function() {

            snapshot.$promise.then(function(successResponse) {

                console.log('self.loadSnapshot.successResponse', successResponse);

                self.snapshotObject = successResponse;

                self.cardTpl = {
                    featureType: 'snapshot',
                    featureTabLabel: 'Projects',
                    feature: null,
                    heading: self.snapshotObject.name,
                    // yearsActive: '2013 - 2018',
                    // funding: '$2.65 million',
                    // url: 'https://4states1source.org',
                    // resourceUrl: null,
                    // linkTarget: '_blank',
                    description: self.snapshotObject.description
                };

                self.card = self.cardTpl;

                self.loadBaseProjects();

                self.loadGeographies();

            }, function(errorResponse) {

                console.log('self.loadSnapshot.errorResponse', errorResponse);

            });

        };

        self.loadBaseProjects = function() {

            baseProjects.$promise.then(function(successResponse) {

                console.log('self.loadBaseProjects.successResponse', successResponse);

                if (self.progressValue < 100 &&
                    self.geographies) {

                    self.showElements();

                }

                self.baseProjects = successResponse.features;

                self.processProjectData(successResponse);

            }, function(errorResponse) {

                console.log('self.loadBaseProjects.errorResponse', errorResponse);

            });

        };

        self.loadProjects = function(params) {

            Project.collection(params).$promise.then(function(successResponse) {

                console.log('self.filterProjects.successResponse', successResponse);

                self.processProjectData(successResponse);

            }, function(errorResponse) {

                console.log('self.filterProjects.errorResponse', errorResponse);

            });

        };

        self.filterProjects = function() {

            //
            // Dismiss filter modal
            //

            self.showFilters = false;

            //
            // Extract feature identifiers from active filters
            //

            var params = {};

            if (self.limitScope) {

                params.user = $rootScope.user.id;

            }

            FilterStore.index.forEach(function(obj) {

                if (params.hasOwnProperty(obj.category)) {

                    params[obj.category].push(obj.id);

                } else {

                    params[obj.category] = [obj.id];

                }

            });

            console.log('self.filterProjects.params', params);

            //
            // Convert arrays of feature identifiers to strings
            //

            for (var key in params) {

                if (params.hasOwnProperty(key)) {

                    //
                    // If attribute value is an array, convert it to a string
                    //

                    if (Array.isArray(params[key])) {

                        var parsedValue = params[key].join(',');

                        params[key] = parsedValue;

                    }

                }

            }

            //
            // Execute API request
            //

            self.loadProjects(params);

        };

        $scope.$watch('filterStore.index', function(newVal) {

            console.log('Updated filterStore', newVal);

            self.activeFilters = newVal;

        });

        $scope.$on('leafletDirectiveMarker.dashboard--map.click', function(event, args) {

            console.log('leafletDirectiveMarker.dashboard--map.click', event, args);

            var project = self.filteredProjects.filter(function(datum) {

                var id = +(args.modelName.split('project_')[1]);

                return datum.id === id;

            })[0];

            self.setMarkerFocus(project, 'project', true);

        });

        $scope.$on('leafletDirectiveMarker.dashboard--map.mouseover', function(event, args) {

            console.log('leafletDirectiveMarker.dashboard--map.mouseover', event, args);

            var project = self.filteredProjects.filter(function(datum) {

                var id = +(args.modelName.split('project_')[1]);

                return datum.id === id;

            })[0];

            self.setMarkerFocus(project, 'project');

        });

        self.changeScope = function() {

            //
            // Reset map extent
            //

            self.resetMapExtent();

            //
            // Reset dashboard state
            //

            self.clearAllFilters(false);

            //
            // Refresh project data
            //

            if (self.limitScope) {

                self.loadProjects({
                    user: $rootScope.user.id
                });

            } else {

                // self.loadProjects({});

                // self.loadBaseProjects();

                self.loadSnapshot();

            }

        };

        //
        // Verify Account information for proper UI element display
        //
        // if (Account.userObject && user) {

        //     user.$promise.then(function(userResponse) {

        //         $rootScope.user = Account.userObject = userResponse;

        //         self.permissions = {
        //             isLoggedIn: Account.hasToken(),
        //             isAdmin: Account.hasRole('admin')
        //         };

        //     });

        // }

        self.loadSnapshot();

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SnapshotListCtrl',
        function(Account, $location, $log, Notifications, $rootScope,
            $route, user, User, snapshots, $interval, $timeout, Snapshot) {

            var self = this;

            $rootScope.viewState = {
                'snapshot': true
            };

            self.loading = true;

            self.fillMeter = $interval(function() {

                var tempValue = (self.progressValue || 10) * 0.2;

                if (!self.progressValue) {

                    self.progressValue = tempValue;

                } else if ((100 - tempValue) > self.progressValue) {

                    self.progressValue += tempValue;

                }

                console.log('progressValue', self.progressValue);

            }, 100);

            self.showElements = function() {

                $interval.cancel(self.fillMeter);

                self.progressValue = 100;

                $timeout(function() {

                    self.loading = false;

                }, 1000);

            };

            self.confirmDelete = function(obj) {

                self.deletionTarget = obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function(obj, index) {

                Snapshot.delete({
                    id: obj.id
                }).$promise.then(function(data) {

                    self.deletionTarget = null;

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this snapshot.',
                        'prompt': 'OK'
                    }];

                    $timeout(function(){

                        self.alerts = [];

                    }, 2000);

                    self.snapshots.splice(index, 1);

                });

            };

            //
            // Assign project to a scoped variable
            //
            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = self.user = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Snapshots'
                    };

                    //
                    // Load snapshot data
                    //

                    self.actions.snapshots();

                });


            } else {
                //
                // If there is not Account.userObject and no user object, then the
                // user is not properly authenticated and we should send them, at
                // minimum, back to the projects page, and have them attempt to
                // come back to this page again.
                //
                self.actions.exit();

            }

            self.createSnapshot = function() {

                $location.path('/dashboards/collection/new');

            };

            //
            //
            //
            self.status = {
                'saving': false
            };

            self.actions = {
                organizations: function() {

                    var _organizations = [];

                    angular.forEach(self.user.properties.organizations, function(_organization, _index) {
                        if (_organization.id) {
                            _organizations.push({
                                'id': _organization.id
                            });
                        } else {
                            _organizations.push({
                                'name': _organization.properties.name
                            });
                        }
                    });

                    return _organizations;
                },
                save: function() {

                    self.status.saving = true;

                    var _organizations = self.actions.organizations();

                    var _user = new User({
                        'id': self.user.id,
                        'first_name': self.user.properties.first_name,
                        'last_name': self.user.properties.last_name,
                        'organizations': _organizations
                    });

                    _user.$update(function(successResponse) {

                        self.status.saving = false;

                        $rootScope.notifications.success('Great!', 'Your account changes were saved');

                        $location.path('/account/');

                    }, function(errorResponse) {
                        self.status.saving = false;
                    });
                },
                snapshots: function() {

                    snapshots.$promise.then(function(snapshotResponse) {

                        self.snapshots = snapshotResponse.features;

                        self.showElements();

                    });

                },
                exit: function() {
                    $location.path('/projects');
                }
            };

        });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SnapshotCreateCtrl', function(Account, $location, $log, Snapshot, $rootScope, $route, user) {

        var self = this;

        $rootScope.viewState = {
            'snapshot': true
        };

        $rootScope.page = {};

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                };

                self.snapshot = new Snapshot();

                //
                // Setup page meta data
                //
                $rootScope.page = {
                    'title': 'Create Snapshot'
                };

            });

        }

        self.saveSnapshot = function() {

            self.snapshot.$save().then(function(response) {

                self.snapshot = response;

                $location.path('/dashboards/' + self.snapshot.id + '/edit');

            }).then(function(error) {
                // Do something with the error
            });

        };

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SnapshotEditCtrl',
        function($scope, Account, $location, $log, Snapshot, snapshot, $rootScope, $route, user, FilterStore) {

            var self = this;

            $rootScope.viewState = {
                'snapshot': true
            };

            $rootScope.toolbarState = {
                'edit': true
            };

            $rootScope.page = {};

            $scope.filterStore = FilterStore;

            console.log('self.filterStore', self.filterStore);

            self.loadSnapshot = function() {

                //
                // Assign snapshot to a scoped variable
                //
                snapshot.$promise.then(function(successResponse) {

                    self.processSnapshot(successResponse);

                }, function(errorResponse) {

                    $log.error('Unable to load snapshot');

                });

            };

            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };

                    self.loadSnapshot();

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Edit Snapshot'
                    };

                });

            } else {

                $location.path('/user/login');

            }

            self.clearFilter = function(obj) {

                FilterStore.clearItem(obj);

            };

            self.clearAllFilters = function(reload) {

                //
                // Remove all stored filter objects
                //

                FilterStore.clearAll();

            };

            self.updateCollection = function(obj, collection) {

                self.snapshotObject[collection].push({
                    id: obj.id
                });

            };

            self.transformRelation = function(obj, category) {

                switch (category) {

                    case 'geography':

                        self.updateCollection(obj, 'geographies');

                        break;

                    case 'organization':

                        self.updateCollection(obj, 'organizations');

                        break;

                    case 'practice':

                        self.updateCollection(obj, 'practices');

                        break;

                    case 'program':

                        self.updateCollection(obj, 'programs');

                        break;

                    case 'project':

                        self.updateCollection(obj, 'projects');

                        break;

                    case 'status':

                        self.updateCollection(obj, 'statuses');

                        break;

                    case 'tag':

                        self.updateCollection(obj, 'tags');

                        break;

                    default:

                        self.updateCollection(obj, category);

                        break;

                }

            };

            self.extractFilter = function(key, data) {

                data.forEach(function(datum) {

                    FilterStore.addItem({
                        id: datum.id,
                        name: datum.name || datum.properties.name,
                        category: self.parseKey(key)
                    });

                });

            };

            self.parseKey = function(obj, pluralize) {

                var keyMap = {
                    plural: {
                        'geography': 'geographies',
                        'organization': 'organizations',
                        'practice': 'practices',
                        'program': 'programs',
                        'project': 'projects',
                        'status': 'statuses',
                        'tag': 'tags'
                    },
                    single: {
                        'geographies': 'geography',
                        'organizations': 'organization',
                        'practices': 'practice',
                        'programs': 'program',
                        'projects': 'project',
                        'statuses': 'status',
                        'tags': 'tag'
                    }
                };

                if (pluralize) {

                    return keyMap.plural[obj];

                }

                console.log('keyMap.single', obj, keyMap.single[obj]);

                return keyMap.single[obj];

            };

            self.processSnapshot = function(data) {

                //
                // Reset filters
                //

                self.clearAllFilters();

                var relations = [
                    'creator',
                    'geographies',
                    'last_modified_by',
                    'organizations',
                    'organization',
                    'practices',
                    'programs',
                    'projects',
                    'statuses',
                    'tags'
                ];

                self.snapshotObject = data;

                relations.forEach(function(relation) {

                    if (Array.isArray(self.snapshotObject[relation])) {

                        self.extractFilter(relation, self.snapshotObject[relation]);

                        self.snapshotObject[relation] = [];

                    } else {

                        delete self.snapshotObject[relation];

                    }

                });

            };

            self.processRelations = function(arr) {

                arr.forEach(function(filter) {

                    self.transformRelation(filter, filter.category);

                });

            };

            self.saveSnapshot = function() {

                self.processRelations(self.activeFilters);

                Snapshot.update({
                    id: +self.snapshotObject.id
                }, self.snapshotObject).$promise.then(function(data) {

                    self.processSnapshot(data.properties);

                }).then(function(error) {
                    // Do something with the error
                });

            };

            self.deleteSnapshot = function() {

                snapshot.$delete().then(function(response) {

                    $location.path('/account');

                }).then(function(error) {
                    // Do something with the error
                });
            };

            $scope.$watch('filterStore.index', function(newVal) {

                console.log('Updated filterStore', newVal);

                self.activeFilters = newVal;

            });

        });
'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
    .config(function($routeProvider, commonscloud) {

        $routeProvider
            .when('/dashboard', {
                templateUrl: '/modules/components/dashboard/views/dashboard--view.html',
                controller: 'DashboardCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    geographies: function($location, GeographyService) {

                        return GeographyService.query({
                            id: 3
                        });

                    },
                    projects: function($location, Project) {

                        //
                        // Get all of our existing URL Parameters so that we can
                        // modify them to meet our goals
                        //

                        var search_params = $location.search();

                        //
                        // Prepare any pre-filters to append to any of our user-defined
                        // filters in the browser address bar
                        //

                        search_params.q = (search_params.q) ? angular.fromJson(search_params.q) : {};

                        search_params.q.filters = (search_params.q.filters) ? search_params.q.filters : [];

                        search_params.q.order_by = [{
                            field: 'created_on',
                            direction: 'desc'
                        }];

                        //
                        // Execute our query so that we can get the Reports back
                        //

                        return Project.collection();

                    },
                    user: function(Account) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }
                }
            });

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('DashboardCtrl', function(Account, $location, $log, Project, Map,
        projects, $rootScope, $scope, Site, user, leafletData, leafletBoundsHelpers,
        MetricService, OutcomeService, ProjectStore, FilterStore, geographies, mapbox,
        Practice) {

        $scope.filterStore = FilterStore;

        // $scope.projectStore = ProjectStore;

        var self = this;

        //
        // Setup basic page variables
        //
        $rootScope.page = {
            title: 'Dashboard'
        };

        self.activeTab = {
            collection: 'metric'
        };

        self.cardTpl = {
            featureType: 'program',
            featureTabLabel: 'Projects',
            feature: null,
            heading: 'Delaware River Watershed Initiative',
            yearsActive: '2013 - 2018',
            funding: '$2.65 million',
            url: 'https://4states1source.org',
            resourceUrl: null,
            linkTarget: '_blank',
            description: 'The Delaware River Watershed Initiative is a cross-cutting collaboration working to conserve and restore the streams that supply drinking water to 15 million people in New York, New Jersey, Pennsylvania and Delaware.',
        };

        self.card = self.cardTpl;

        self.historyItem = null;

        self.historyIndex = [];

        self.project = {};

        self.map = Object.assign({}, Map);

        self.map.layers = {
            baselayers: {
                streets: {
                    name: 'Streets',
                    type: 'xyz',
                    url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    layerOptions: {
                        apikey: mapbox.access_token,
                        mapid: 'mapbox.streets',
                        attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                    }
                },
                terrain: {
                    name: 'Terrain',
                    type: 'xyz',
                    url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    layerOptions: {
                        apikey: mapbox.access_token,
                        mapid: 'mapbox.run-bike-hike',
                        attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                    }
                },
                satellite: {
                    name: 'Satellite',
                    type: 'xyz',
                    url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    layerOptions: {
                        apikey: mapbox.access_token,
                        mapid: 'mapbox.streets-satellite',
                        attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                    }
                }
            }
        };

        self.map.markers = {};

        self.map.layers.overlays = {
            projects: {
                type: 'group',
                name: 'projects',
                visible: true,
                layerOptions: {
                    showOnSelector: false
                },
                layerParams: {
                    showOnSelector: false
                }
            }
        };

        console.log('self.map', self.map);

        self.popupTemplate = function(feature) {

            return '<div class=\"project--popup\">' +
                '<div class=\"marker--title border--right\">' + feature.name + '</div>' +
                '<a href=\"projects/' + feature.id + '\">' +
                '<i class=\"material-icons\">keyboard_arrow_right</i>' +
                '</a>' +
                '</div>';

        };

        self.processLocations = function(features) {

            self.map.markers = {};

            features.forEach(function(feature) {

                var centroid = feature.centroid;

                console.log('centroid', centroid);

                if (centroid) {

                    self.map.markers['project_' + feature.id] = {
                        lat: centroid.coordinates[1],
                        lng: centroid.coordinates[0],
                        layer: 'projects',
                        focus: false,
                        icon: {
                            type: 'div',
                            className: 'project--marker',
                            iconSize: [24, 24],
                            popupAnchor: [-2, -10],
                            html: ''
                        },
                        message: self.popupTemplate(feature)
                    };

                }

            });

            console.log('self.map.markers', self.map.markers);

        };

        self.resetMapExtent = function() {

            self.map.geojson.data = self.programGeographies;

            leafletData.getMap('dashboard--map').then(function(map) {

                map.closePopup();

                leafletData.getLayers('dashboard--map').then(function(layers) {

                    console.log('leafletData.getLayers', layers);

                    map.removeLayer(layers.baselayers.satellite);

                    map.removeLayer(layers.baselayers.terrain);

                    map.addLayer(layers.baselayers.streets);

                });

                leafletData.getGeoJSON('dashboard--map').then(function(geoJsonLayer) {

                    console.log('geoJsonLayer', geoJsonLayer);

                    map.fitBounds(geoJsonLayer.getBounds(), {
                        maxZoom: 18
                    });

                });

            });

        };

        self.setMapBoundsToFeature = function(feature) {

            console.log('setMapBoundsToFeature', feature);

            var geoJsonLayer = L.geoJson(feature, {});

            leafletData.getMap('dashboard--map').then(function(map) {

                map.fitBounds(geoJsonLayer.getBounds(), {
                    maxZoom: 18
                });

            });

        };

        //
        // Load custom geographies
        //

        function onEachFeature(feature, layer) {

            console.log('onEachFeature', feature, layer);

            var popup;

            layer.on({

                click: function() {

                    console.log(layer.feature.properties.name);

                    self.setMapBoundsToFeature(layer.feature);

                    if (layer.feature.properties.feature_type === 'site') {

                        self.activeSite = feature;

                        self.card = {
                            featureType: 'site',
                            featureTabLabel: 'Practices',
                            feature: feature.properties,
                            heading: feature.properties.name,
                            yearsActive: '2018',
                            funding: '$100k',
                            url: 'projects/' + self.activeProject.properties.id + '/sites/' + feature.properties.id,
                            description: feature.properties.description,
                            linkTarget: '_self'
                        };

                        self.loadSitePractices(layer.feature.properties);

                        self.loadMetrics(null, {
                            collection: 'site',
                            featureId: feature.properties.id
                        });

                        self.loadOutcomes(null, {
                            collection: 'site',
                            featureId: feature.properties.id
                        });

                        //
                        // Set value of `self.historyItem`
                        //

                        self.historyItem = {
                            feature: self.activeProject,
                            label: self.activeProject.properties.name,
                            geoJson: self.activeProject,
                            type: 'project'
                        };

                    } else if (layer.feature.properties.feature_type === 'geography') {

                        self.setGeoFilter(layer.feature.properties);

                        self.card = {
                            featureType: 'geography',
                            featureTabLabel: 'Projects',
                            feature: feature.properties,
                            heading: feature.properties.name,
                            yearsActive: '2013-2018',
                            funding: '$50k',
                            url: 'geographies/' + feature.properties.id,
                            description: feature.properties.description,
                            linkTarget: '_self'
                        };

                    } else if (layer.feature.properties.feature_type === 'practice') {

                        self.loadMetrics(null, {
                            collection: 'practice',
                            featureId: feature.properties.id
                        });

                        self.loadOutcomes(null, {
                            collection: 'practice',
                            featureId: feature.properties.id
                        });

                        self.card = {
                            featureType: 'practice',
                            featureTabLabel: null,
                            feature: feature.properties,
                            heading: feature.properties.name,
                            yearsActive: null,
                            funding: null,
                            url: 'projects/' + self.activeProject.properties.id + '/sites/' + self.activeSite.properties.id + '/practices/' + feature.properties.id,
                            description: feature.properties.description,
                            linkTarget: '_self'
                        };

                        //
                        // Set value of `self.historyItem`
                        //

                        self.historyItem = {
                            feature: self.activeSite,
                            label: self.activeSite.properties.name,
                            geoJson: self.activeSite,
                            type: 'site'
                        };

                    }

                },
                mouseover: function(event) {

                    console.log('onEachFeature.mouseover', event);

                    console.log(layer.feature.properties.name);

                    self.removeMarkerPopups();

                    leafletData.getMap('dashboard--map').then(function(map) {

                        if (popup) {

                            map.closePopup(popup);

                        }

                        popup = L.popup()
                            .setLatLng(event.latlng)
                            .setContent('<div class=\"marker--title\">' + feature.properties.name + '</div>');

                        popup.openOn(map);

                    });

                },
                mouseout: function(event) {

                    console.log('onEachFeature.mouseout', event);

                    console.log(layer.feature.properties.name);

                    leafletData.getMap('dashboard--map').then(function(map) {

                        if (popup) {

                            map.closePopup(popup);

                        }

                    });

                }

            });
        }

        geographies.$promise.then(function(successResponse) {

            console.log('geographies.successResponse', successResponse);

            self.programGeographies = successResponse;

            self.map.geojson = {
                data: successResponse,
                onEachFeature: onEachFeature,
                style: {
                    color: '#00D',
                    fillColor: 'red',
                    weight: 2.0,
                    opacity: 0.6,
                    fillOpacity: 0.2
                }
            };

            //
            // Fit map bounds to GeoJSON
            //

            self.resetMapExtent();

            //
            // Set up layer visibility logic
            //

            leafletData.getMap('dashboard--map').then(function(map) {

                map.on('zoomend', function(event) {

                    var zoomLevel = map.getZoom();

                    leafletData.getLayers('dashboard--map').then(function(layers) {

                        console.log('leafletData.getLayers', layers);

                        if (zoomLevel > 15) {

                            map.removeLayer(layers.baselayers.streets);

                            map.removeLayer(layers.baselayers.terrain);

                            map.addLayer(layers.baselayers.satellite);

                        } else {

                            map.removeLayer(layers.baselayers.satellite);

                            map.removeLayer(layers.baselayers.terrain);

                            map.addLayer(layers.baselayers.streets);

                        }

                    });

                });

            });

        }, function(errorResponse) {

            console.log('errorResponse', errorResponse);

        });

        self.extractIds = function(arr) {

            var projectIds = [];

            arr.forEach(function(datum) {

                projectIds.push(datum.id);

            });

            return projectIds.join(',');

        };

        self.loadMetrics = function(arr, options) {

            if (options) {

                if (options.collection === 'site') {

                    Site.metrics({
                        id: options.featureId
                    }).$promise.then(function(successResponse) {

                        console.log('granteeResponse', successResponse);

                        self.metrics = successResponse.features;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                } else {

                    Practice.metrics({
                        id: options.featureId
                    }).$promise.then(function(successResponse) {

                        console.log('granteeResponse', successResponse);

                        self.metrics = successResponse.features;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                }

            } else {

                //
                // A program (account) identifier
                // is required by default.
                //

                var params = {
                    id: 3
                };

                //
                // If the `arr` parameter is valid,
                // constrain the query to the given
                // set of numeric project identifiers.
                //

                if (arr && arr.length) {

                    params.projects = self.extractIds(arr);

                }

                MetricService.query(params).$promise.then(function(successResponse) {

                    console.log('granteeResponse', successResponse);

                    self.metrics = successResponse.features;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            }

        };

        self.loadOutcomes = function(arr, options) {

            if (options) {

                if (options.collection === 'site') {

                    Site.outcomes({
                        id: options.featureId
                    }).$promise.then(function(successResponse) {

                        console.log('siteOutcomesResponse', successResponse);

                        self.outcomes = successResponse;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                } else {

                    Practice.outcomes({
                        id: options.featureId
                    }).$promise.then(function(successResponse) {

                        console.log('practiceOutcomesResponse', successResponse);

                        self.outcomes = successResponse;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                }

            } else {

                //
                // A program (account) identifier
                // is required by default.
                //

                var params = {
                    id: 3
                };

                //
                // If the `arr` parameter is valid,
                // constrain the query to the given
                // set of numeric project identifiers.
                //

                if (arr && arr.length) {

                    params.projects = self.extractIds(arr);

                }

                OutcomeService.query(params).$promise.then(function(successResponse) {

                    console.log('granteeResponse', successResponse);

                    self.outcomes = successResponse;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            }

        };

        self.search = {
            query: '',
            execute: function(page) {

                //
                // Get all of our existing URL Parameters so that we can
                // modify them to meet our goals
                //

                var q = {
                    filters: [{
                        'and': [{
                            name: 'name',
                            op: 'ilike',
                            val: '%' + self.search.query + '%'
                        }]
                    }],
                    order_by: [{
                        field: 'created_on',
                        direction: 'desc'
                    }]
                };

                if (self.filters.active.workflow_state !== null) {
                    console.log('add workflow state filter');

                    q.filters.push({
                        'name': 'workflow_state',
                        'op': 'like',
                        'val': self.filters.active.workflow_state
                    });
                }

                if (self.filters.active.year && self.filters.active.year.year) {
                    q.filters.push({
                        'name': 'created_on',
                        'op': 'gte',
                        'val': self.filters.active.year.year + '-01-01'
                    });
                    q.filters.push({
                        'name': 'created_on',
                        'op': 'lte',
                        'val': self.filters.active.year.year + '-12-31'
                    });
                }

                Project.query({
                    'q': q,
                    'page': (page ? page : 1)
                }).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    self.projects = successResponse;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            },
            paginate: function(pageNumber) {

                //
                // Get all of our existing URL Parameters so that we can
                // modify them to meet our goals
                //
                self.search.execute(pageNumber);
            },
            clear: function() {

                // $location.path('/projects/').search('');

                self.q = {};

                self.filteredProjects = self.projects;

                self.processLocations(self.filteredProjects);

            }
        };

        //
        // Set Default Search Filter value
        //
        if (self.search && self.search.query === '') {

            var searchParams = $location.search(),
                q = angular.fromJson(searchParams.q);

            if (q && q.filters && q.filters.length) {
                angular.forEach(q.filters[0].and, function(filter) {
                    if (filter.name === 'name') {
                        self.search.query = filter.val.replace(/%/g, '');
                    }
                });
            }
        }

        self.removeMarkerPopups = function() {

            for (var key in self.map.markers) {

                if (self.map.markers.hasOwnProperty(key)) {

                    self.map.markers[key].focus = false;

                }

            }

        };

        self.setMarkerFocus = function(feature, collection, setFilter) {

            if (collection === 'project') {

                var markerId = 'project_' + feature.id,
                    marker = self.map.markers[markerId];

                self.removeMarkerPopups();

                if (marker) {

                    self.map.markers[markerId].focus = true;

                    if (setFilter) {

                        self.setProjectFilter(feature);

                    }

                }

                console.log('setMarkerFocus', markerId, self.map.markers[markerId]);

            } else {

                if (collection === 'practice') {

                    self.map.geojson.data = self.practices;

                }

                self.setMapBoundsToFeature(feature);

            }

        };

        self.clearMarkerFocus = function(feature) {

            var markerId = 'project_' + feature.id,
                marker = self.map.markers[markerId];

            if (marker) {

                self.map.markers[markerId].focus = false;

            }

            console.log('clearMarkerFocus', markerId, self.map.markers[markerId]);

        };

        self.loadProjectSites = function(obj) {

            Project.sites({
                id: obj.id
            }).$promise.then(function(successResponse) {

                console.log('projectSiteResponse', successResponse);

                self.sites = successResponse;

                self.map.geojson = {
                    data: successResponse,
                    onEachFeature: onEachFeature,
                    style: {
                        color: '#00D',
                        fillColor: 'red',
                        weight: 2.0,
                        opacity: 0.6,
                        fillOpacity: 0.2
                    }
                };

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.loadSitePractices = function(obj) {

            Site.practices({
                id: obj.id
            }).$promise.then(function(successResponse) {

                console.log('sitePracticeResponse', successResponse);

                self.practices = successResponse;

                leafletData.getMap('dashboard--map').then(function(map) {

                    map.closePopup();

                    self.setMapBoundsToFeature(successResponse);

                });

                self.map.geojson = {
                    data: successResponse,
                    onEachFeature: onEachFeature,
                    style: {
                        color: '#00D',
                        fillColor: 'red',
                        weight: 2.0,
                        opacity: 0.6,
                        fillOpacity: 0.2
                    }
                };

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.navigateBack = function() {

            var historyType = self.historyItem.type;

            switch(historyType) {

                case 'program':

                    self.resetMapExtent();

                    self.clearAllFilters(true);

                    break;

                case 'project':

                    // self.setMapBoundsToFeature(self.activeProject);

                    self.setProjectFilter(self.activeProject.properties);

                    self.card = {
                        featureType: 'project',
                        featureTabLabel: 'Sites',
                        feature: self.activeProject.properties,
                        heading: self.activeProject.properties.name,
                        yearsActive: '2018',
                        funding: '$100k',
                        url: 'projects/' + self.activeProject.properties.id,
                        description: self.activeProject.properties.description,
                        linkTarget: '_self'
                    };

                    break;

                case 'site':

                    self.map.geojson.data = self.activeSite;

                    self.setMapBoundsToFeature(self.activeSite);

                    // self.practices = null;

                    self.card = {
                        featureType: 'site',
                        featureTabLabel: 'Practices',
                        feature: self.activeSite.properties,
                        heading: self.activeSite.properties.name,
                        yearsActive: '2018',
                        funding: '$10k',
                        url: 'projects/' + self.activeProject.properties.id + '/sites/' + self.activeSite.properties.id,
                        description: self.activeSite.properties.description,
                        linkTarget: '_self'
                    };

                    //
                    // Update history item
                    //

                    self.historyItem = {
                        feature: self.activeProject,
                        label: self.activeProject.properties.name,
                        geoJson: self.activeProject,
                        type: 'project'
                    };

                    break;

                default:

                    break;

            }

        };

        self.setProjectFilter = function(obj) {

            //
            // Fit map bounds to GeoJSON
            //

            var feature = {
                type: 'Feature',
                properties: obj,
                geometry: obj.extent
            };

            self.setMapBoundsToFeature(feature);

            self.loadProjectSites(obj);

            FilterStore.clearAll();

            var _filterObject = {
                id: obj.id,
                name: obj.name,
                category: 'project'
            };

            FilterStore.addItem(_filterObject);

            // ProjectStore.filterAll(FilterStore.index);

            self.loadMetrics([
                obj
            ]);

            self.loadOutcomes([
                obj
            ]);

            //
            // Set value of `self.historyItem`
            //

            self.historyItem = {
                feature: null,
                label: 'All projects',
                geoJson: self.programGeographies,
                type: 'program'
            };

            //
            // Track project object
            //

            self.activeProject = feature;

            //
            // Update `self.card` values
            //

            self.card = {
                featureType: 'project',
                featureTabLabel: 'Sites',
                feature: feature,
                heading: obj.name,
                yearsActive: '2018',
                funding: '$100k',
                url: 'projects/' + obj.id,
                description: obj.description,
                linkTarget: '_self'
            };

        };

        self.setGeoFilter = function(obj) {

            FilterStore.clearAll();

            var _filterObject = {
                id: obj.id,
                name: obj.name,
                category: 'geography'
            };

            FilterStore.addItem(_filterObject);

            self.filterProjects();

        };

        self.setTab = function(collection) {

            self.activeTab = {
                collection: collection
            };

        };

        self.closeFilterModal = function() {

            if (FilterStore.index.length < 1) {

                self.clearAllFilters(true);

            }

            self.showFilters = false;

        };

        self.clearFilter = function(obj) {

            FilterStore.clearItem(obj);

        };

        self.clearAllFilters = function(reload) {

            //
            // Remove all stored filter objects
            //

            FilterStore.clearAll();

            //
            // Dismiss filter modal
            //

            self.showFilters = false;

            //
            // Reset map extent
            //

            self.resetMapExtent();

            //
            // Reset metadata card values
            //

            self.card = self.cardTpl;

            //
            // Reset value of `self.historyItem`
            //

            self.historyItem = null;

            //
            // Reset value of `self.activeProject`
            //

            self.activeProject = null;

            //
            // Reset value of `self.activeSite`
            //

            self.activeSite = null;

            //
            // Refresh project list
            //

            if (reload) {

                self.loadProjects({
                    id: 3
                }, false);

            }

        };

        self.zoomToProjects = function() {

            var featureCollection = {
                type: 'FeatureCollection',
                features: []
            };

            self.filteredProjects.forEach(function(feature) {

                featureCollection.features.push({
                    type: 'Feature',
                    properties: {},
                    geometry: feature.extent
                });

            });

            self.setMapBoundsToFeature(featureCollection);

        };

        self.loadProjects = function(params, trackIds) {

            Project.collection(params).$promise.then(function(successResponse) {

                console.log('self.filterProjects.successResponse', successResponse);

                // $scope.projectStore.setProjects(successResponse.features);

                self.filteredProjects = successResponse.features;

                self.processLocations(successResponse.features);

                if (!trackIds) {

                    self.loadOutcomes();

                    self.loadMetrics();

                } else {

                    self.loadOutcomes(self.filteredProjects);

                    self.loadMetrics(self.filteredProjects);

                    self.zoomToProjects();

                }

            }, function(errorResponse) {

                console.log('self.filterProjects.errorResponse', errorResponse);

            });

        };

        self.filterProjects = function() {

            //
            // Dismiss filter modal
            //

            self.showFilters = false;

            //
            // Extract feature identifiers from active filters
            //

            var params = {
                id: 3
            };

            if (self.limitScope) {

                params.user = $rootScope.user.id

            }

            FilterStore.index.forEach(function(obj) {

                if (params.hasOwnProperty(obj.category)) {

                    params[obj.category].push(obj.id);

                } else {

                    params[obj.category] = [obj.id];

                }

            });

            console.log('self.filterProjects.params', params);

            //
            // Convert arrays of feature identifiers to strings
            //

            for (var key in params) {

                if (params.hasOwnProperty(key)) {

                    //
                    // If attribute value is an array, convert it to a string
                    //

                    if (Array.isArray(params[key])) {

                        var parsedValue = params[key].join(',');

                        params[key] = parsedValue;

                    }

                }

            }

            //
            // Execute API request
            //

            self.loadProjects(params, true);

        };

        $scope.$watch('filterStore.index', function(newVal) {

            console.log('Updated filterStore', newVal);

            self.activeFilters = newVal;

        });

        $scope.$on('leafletDirectiveMarker.dashboard--map.click', function(event, args) {

            console.log('leafletDirectiveMarker.dashboard--map.click', event, args);

            var project = self.filteredProjects.filter(function(datum) {

                var id = +(args.modelName.split('project_')[1]);

                return datum.id === id;

            })[0];

            self.setMarkerFocus(project, 'project', true);

        });

        $scope.$on('leafletDirectiveMarker.dashboard--map.mouseover', function(event, args) {

            console.log('leafletDirectiveMarker.dashboard--map.mouseover', event, args);

            var project = self.filteredProjects.filter(function(datum) {

                var id = +(args.modelName.split('project_')[1]);

                return datum.id === id;

            })[0];

            self.setMarkerFocus(project, 'project');

        });

        self.changeScope = function() {

            //
            // Reset map extent
            //

            self.resetMapExtent()

            //
            // Reset dashboard state
            //

            self.clearAllFilters(false);

            //
            // Refresh project data
            //

            if (self.limitScope) {

                self.loadProjects({
                    id: 3,
                    user: $rootScope.user.id
                }, true);

            } else {

                self.loadProjects({
                    id: 3
                }, false);

            }

        };

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    isAdmin: Account.hasRole('admin')
                };

                if (!self.permissions.isAdmin) {

                    self.limitScope = true;

                }

                self.loadProjects({
                    id: 3
                }, false);

            });

        } else {

            $location.path('/user/login');

        }

    });
(function() {

    'use strict';

    /**
     * @ngdoc
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .config(function($routeProvider, commonscloud) {

            $routeProvider
                .when('/organization', {
                    templateUrl: '/modules/components/organization/views/organizationEdit--view.html',
                    controller: 'OrganizationEditViewController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        }
                    }
                });

        });

}());
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('OrganizationEditViewController',
        function(Account, $location, $log, Notifications, $rootScope,
            $route, user, User, Organization) {

            var self = this;

            $rootScope.viewState = {
                'organization': true
            };

            //
            // Assign project to a scoped variable
            //
            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = self.user = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Edit Organization'
                    };

                    //
                    // Load organization data
                    //

                    self.actions.organization(self.user);

                });


            } else {
                //
                // If there is not Account.userObject and no user object, then the
                // user is not properly authenticated and we should send them, at
                // minimum, back to the projects page, and have them attempt to
                // come back to this page again.
                //
                self.actions.exit();

            }

            //
            //
            //
            self.status = {
                'saving': false
            };

            self.actions = {
                parseFeature:  function(data) {

                    self.organization = data.properties;

                    delete self.organization.creator;
                    delete self.organization.last_modified_by;
                    delete self.organization.project;
                    delete self.organization.snapshots;

                    console.log('self.organization', self.organization);

                },
                organization: function(user) {

                    var organizationId = user.properties.organization.properties.id;

                    Organization.get({
                        id: organizationId
                    }).$promise.then(function(successResponse) {

                        console.log('self.actions.organization', successResponse);

                        self.actions.parseFeature(successResponse);

                    }, function(errorResponse) {

                        console.error('Unable to load organization.');

                    });

                },
                save: function() {

                    self.status.saving = true;

                    Organization.update({
                        id: self.organization.id
                    }, self.organization).$promise.then(function(successResponse) {

                        self.status.saving = false;

                        $rootScope.notifications.success('Great!', 'Your organization changes were saved.');

                        self.actions.parseFeature(successResponse);

                    }, function(errorResponse) {

                        self.status.saving = false;

                        $rootScope.notifications.error('', 'Unable to save your organization changes.');

                    });
                },
                exit: function() {
                    $location.path('/projects');
                }
            };

        });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('OrganizationListViewController', function(Account, $location, $log, Notifications, $rootScope, $route, user, User, snapshots) {

        var self = this;

        //
        // Assign project to a scoped variable
        //
        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = self.user = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                };

                //
                // Setup page meta data
                //
                $rootScope.page = {
                    'title': 'Organizations',
                    'links': []
                };

                //
                // Load snapshot data
                //

                self.actions.snapshots();

            });


        } else {
            //
            // If there is not Account.userObject and no user object, then the
            // user is not properly authenticated and we should send them, at
            // minimum, back to the projects page, and have them attempt to
            // come back to this page again.
            //
            self.actions.exit();

        }

        //
        //
        //
        self.status = {
            'saving': false
        };

        self.actions = {
            organizations: function() {

                var _organizations = [];

                angular.forEach(self.user.properties.organizations, function(_organization, _index) {
                    if (_organization.id) {
                        _organizations.push({
                            'id': _organization.id
                        });
                    } else {
                        _organizations.push({
                            'name': _organization.properties.name
                        });
                    }
                });

                return _organizations;
            },
            save: function() {

                self.status.saving = true;

                var _organizations = self.actions.organizations();

                var _user = new User({
                    'id': self.user.id,
                    'first_name': self.user.properties.first_name,
                    'last_name': self.user.properties.last_name,
                    'organizations': _organizations
                });

                _user.$update(function(successResponse) {

                    self.status.saving = false;

                    $rootScope.notifications.success('Great!', 'Your account changes were saved');

                    $location.path('/account/');

                }, function(errorResponse) {
                    self.status.saving = false;
                });
            },
            snapshots: function() {

                snapshots.$promise.then(function(snapshotResponse) {

                    self.snapshots = snapshotResponse.features;


                });

            },
            exit: function() {
                $location.path('/projects');
            }
        };

    });
'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
    .config(function($routeProvider, commonscloud) {

        $routeProvider
            .when('/projects', {
                templateUrl: '/modules/components/projects/views/projectsList--view.html',
                controller: 'ProjectsCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    projects: function($location, Project) {

                        return Project.collection({});

                    },
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    }
                }
            })
            .when('/projects/:projectId', {
                templateUrl: '/modules/components/projects/views/projectsSummary--view.html',
                controller: 'ProjectSummaryCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    project: function(Project, $route) {
                        return Project.get({
                            'id': $route.current.params.projectId
                        });
                    },
                    // summary: function(Project, $route) {
                    //     return Project.summary({
                    //         'id': $route.current.params.projectId
                    //     });
                    // },
                    metrics: function(Project, $route) {
                        return Project.metrics({
                            id: $route.current.params.projectId
                        });
                    },
                    // nodes: function(Site, $route) {
                    //     return Site.nodes({
                    //         id: $route.current.params.projectId
                    //     });
                    // },
                    outcomes: function(Project, $route) {
                        return Project.outcomes({
                            id: $route.current.params.projectId
                        });
                    },
                    sites: function(Project, $route) {
                        return Project.sites({
                            id: $route.current.params.projectId
                        });
                    }
                }
            })
            .when('/projects/collection/new', {
                templateUrl: '/modules/components/projects/views/projectsCreate--view.html',
                controller: 'ProjectCreateCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    }
                }
            })
            .when('/projects/:projectId/edit', {
                templateUrl: '/modules/components/projects/views/projectsEdit--view.html',
                controller: 'ProjectEditCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    project: function(Project, $route) {
                        return Project.get({
                            'id': $route.current.params.projectId
                        });
                    }
                }
            })
            .when('/projects/:projectId/users', {
                templateUrl: '/modules/components/projects/views/projectsUsers--view.html',
                controller: 'ProjectUsersCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    project: function(Project, $route) {
                        return Project.get({
                            'id': $route.current.params.projectId
                        });
                    },
                    members: function(Project, $route) {
                        return Project.members({
                            'id': $route.current.params.projectId
                        });
                    }
                }
            });

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectsCtrl',
        function(Account, $location, $log, Project,
            projects, $rootScope, $scope, Site, user,
            ProjectStore, FilterStore, $interval, $timeout) {

            $scope.filterStore = FilterStore;

            $scope.projectStore = ProjectStore;

            var self = this;

            self.dashboardFilters = {
                geographies: [],
                grantees: [],
                practices: []
            };

            $rootScope.viewState = {
                'project': true
            };

            //
            // Setup basic page variables
            //
            $rootScope.page = {
                title: 'Projects',
                actions: []
            };

            self.loading = true;

            self.fillMeter = $interval(function() {

                var tempValue = (self.progressValue || 10) * 0.2;

                if (!self.progressValue) {

                    self.progressValue = tempValue;

                } else if ((100 - tempValue) > self.progressValue) {

                    self.progressValue += tempValue;

                }

                console.log('progressValue', self.progressValue);

            }, 100);

            self.showElements = function() {

                $interval.cancel(self.fillMeter);

                self.progressValue = 100;

                $timeout(function() {

                    self.loading = false;

                }, 1000);

            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            self.confirmDelete = function(obj) {

                self.deletionTarget = obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function(obj, index) {

                Project.delete({
                    id: obj.id
                }).$promise.then(function(data) {

                    self.deletionTarget = null;

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this project.',
                        'prompt': 'OK'
                    }];

                    self.filteredProjects.splice(index, 1);

                    $timeout(closeAlerts, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + obj.name + '”. There are pending tasks affecting this project.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this project.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this project.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };

            self.search = {
                query: '',
                execute: function(page) {

                    //
                    // Get all of our existing URL Parameters so that we can
                    // modify them to meet our goals
                    //

                    var q = {
                        filters: [{
                            'and': [{
                                name: 'name',
                                op: 'ilike',
                                val: '%' + self.search.query + '%'
                            }]
                        }],
                        order_by: [{
                            field: 'created_on',
                            direction: 'desc'
                        }]
                    };

                    if (self.filters.active.workflow_state !== null) {
                        console.log('add workflow state filter');

                        q.filters.push({
                            'name': 'workflow_state',
                            'op': 'like',
                            'val': self.filters.active.workflow_state
                        });
                    }

                    if (self.filters.active.year && self.filters.active.year.year) {
                        q.filters.push({
                            'name': 'created_on',
                            'op': 'gte',
                            'val': self.filters.active.year.year + '-01-01'
                        });
                        q.filters.push({
                            'name': 'created_on',
                            'op': 'lte',
                            'val': self.filters.active.year.year + '-12-31'
                        });
                    }

                    Project.query({
                        'q': q,
                        'page': (page ? page : 1)
                    }).$promise.then(function(successResponse) {

                        console.log('successResponse', successResponse);

                        self.projects = successResponse;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                },
                paginate: function(pageNumber) {

                    //
                    // Get all of our existing URL Parameters so that we can
                    // modify them to meet our goals
                    //
                    self.search.execute(pageNumber);
                },
                clear: function() {

                    self.q = {};

                    self.filteredProjects = self.projects;

                    self.processLocations(self.filteredProjects);

                }
            };

            self.createProject = function() {

                $location.path('/projects/collection/new');

            };

            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {
                    $rootScope.user = Account.userObject = userResponse;
                    self.permissions = {
                        isLoggedIn: Account.hasToken()
                    };
                });

                //
                // Project functionality
                //

                self.projects = projects;

                console.log('self.projects', self.projects);

                projects.$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    successResponse.features.forEach(function(feature) {

                        if (feature.extent) {

                            var styledFeature = {
                                "type": "Feature",
                                "geometry": feature.extent,
                                "properties": {
                                    "marker-size": "small",
                                    "marker-color": "#2196F3",
                                    "stroke": "#2196F3",
                                    "stroke-opacity": 1.0,
                                    "stroke-width": 2,
                                    "fill": "#2196F3",
                                    "fill-opacity": 0.5
                                }
                            };

                            feature.geometry = styledFeature;

                            // Build static map URL for Mapbox API

                            var staticURL = 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/geojson(' + encodeURIComponent(JSON.stringify(styledFeature)) + ')/auto/400x200@2x?access_token=pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw';

                            feature.staticURL = staticURL;

                        }

                    });

                    $scope.projectStore.setProjects(successResponse.features);

                    self.filteredProjects = $scope.projectStore.filteredProjects;

                    self.showElements();

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            } else {

                $location.path('/user/logout');

            }

            self.clearFilter = function(obj) {

                // ProjectStore.reset();

                FilterStore.clearItem(obj);

            };

        });
'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
    .controller('ProjectSummaryCtrl',
        function(Account, Notifications, $rootScope, Project, $routeParams,
            $scope, $location, Map, mapbox, Site, user, $window,
            leafletData, leafletBoundsHelpers, $timeout, Practice, project,
            metrics, outcomes, sites) {

            //controller is set to self
            var self = this;

            self.actions = {
                print: function() {

                    $window.print();

                },
                saveToPdf: function() {

                    $scope.$emit('saveToPdf');

                }
            };

            $rootScope.viewState = {
                'project': true
            };

            $rootScope.toolbarState = {
                'dashboard': true
            };

            $rootScope.page = {};

            self.map = JSON.parse(JSON.stringify(Map));

            self.map.markers = {};

            console.log('self.map', self.map);

            self.status = {
                "loading": true
            };

            //draw tools
            function addNonGroupLayers(sourceLayer, targetGroup) {

                if (sourceLayer instanceof L.LayerGroup) {

                    sourceLayer.eachLayer(function(layer) {

                        addNonGroupLayers(layer, targetGroup);

                    });

                } else {

                    targetGroup.addLayer(sourceLayer);

                }

            }

            self.setGeoJsonLayer = function(data, layerGroup, clearLayers) {

                if (clearLayers) {

                    layerGroup.clearLayers();

                }

                var featureGeometry = L.geoJson(data, {});

                addNonGroupLayers(featureGeometry, layerGroup);

            };

            self.buildStaticMapURL = function(geometry) {

                var styledFeature = {
                    "type": "Feature",
                    "geometry": geometry,
                    "properties": {
                        "marker-size": "small",
                        "marker-color": "#2196F3",
                        "stroke": "#2196F3",
                        "stroke-opacity": 1.0,
                        "stroke-width": 2,
                        "fill": "#2196F3",
                        "fill-opacity": 0.5
                    }
                };

                // Build static map URL for Mapbox API

                return 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/geojson(' + encodeURIComponent(JSON.stringify(styledFeature)) + ')/auto/400x200@2x?access_token=pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw';

            };

            //
            // Assign project to a scoped variable
            //
            self.loadProject = function() {

                project.$promise.then(function(successResponse) {

                    console.log('self.project', successResponse);

                    var project_ = successResponse;

                    self.permissions.can_edit = Account.canEdit(project_);
                    self.permissions.is_manager = (Account.hasRole('manager') || Account.inGroup(project_.properties.organization_id, Account.userObject.properties.account));

                    if (project_.properties.extent) {

                        project_.staticURL = self.buildStaticMapURL(project_.properties.extent);

                    }

                    self.project = project_;

                    self.status.loading = false;

                    $rootScope.page.title = 'Project Summary';

                    leafletData.getMap('project--map').then(function(map) {

                        var southWest = L.latLng(25.837377, -124.211606),
                            northEast = L.latLng(49.384359, -67.158958),
                            bounds = L.latLngBounds(southWest, northEast);

                        self.projectExtent = new L.FeatureGroup();

                        if (self.project.properties.extent) {

                            self.setGeoJsonLayer(self.project.properties.extent, self.projectExtent);

                            map.fitBounds(self.projectExtent.getBounds(), {
                                maxZoom: 18
                            });

                        } else {

                            map.fitBounds(bounds, {
                                maxZoom: 18
                            });

                        }

                    });

                    self.loadSites();

                });

            };

            self.submitProject = function() {

                if (!self.project.properties.organization_id) {
                    $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.");
                    return;
                }

                var _project = new Project({
                    "id": self.project.id,
                    "properties": {
                        "workflow_state": "Submitted"
                    }
                });

                _project.$update(function(successResponse) {
                    self.project = successResponse;
                }, function(errorResponse) {

                });
            };

            self.fundProject = function() {

                if (!self.project.properties.organization_id) {
                    $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.");
                    return;
                }

                var _project = new Project({
                    "id": self.project.id,
                    "properties": {
                        "workflow_state": "Funded"
                    }
                });

                _project.$update(function(successResponse) {
                    self.project = successResponse;
                }, function(errorResponse) {

                });
            };

            self.completeProject = function() {

                if (!self.project.properties.organization_id) {
                    $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.");
                    return;
                }

                var _project = new Project({
                    "id": self.project.id,
                    "properties": {
                        "workflow_state": "Completed"
                    }
                });

                _project.$update(function(successResponse) {
                    self.project = successResponse;
                }, function(errorResponse) {

                });
            };

            self.rollbackProjectSubmission = function() {

                var _project = new Project({
                    "id": self.project.id,
                    "properties": {
                        "workflow_state": "Draft"
                    }
                });

                _project.$update(function(successResponse) {
                    self.project = successResponse;
                }, function(errorResponse) {

                });

            };

            self.createSite = function() {

                self.site = new Site({
                    'project_id': self.project.id,
                    'organization_id': self.project.properties.organization_id
                });

                self.site.$save(function(successResponse) {

                    $location.path('/sites/' + successResponse.id + '/edit');

                }, function(errorResponse) {

                    console.error('Unable to create your site, please try again later');

                });

            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeRoute() {

                $location.path('/projects');

            }

            self.confirmDelete = function(obj, targetCollection) {

                console.log('self.confirmDelete', obj, targetCollection);

                if (self.deletionTarget &&
                    self.deletionTarget.collection === 'project') {

                    self.cancelDelete();

                } else {

                    self.deletionTarget = {
                        'collection': targetCollection,
                        'feature': obj
                    };

                }

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function(featureType, index) {

                var targetCollection,
                    targetId;

                switch (featureType) {

                    case 'practice':

                        targetCollection = Practice;

                        break;

                    case 'site':

                        targetCollection = Site;

                        break;

                    default:

                        targetCollection = Project;

                        break;

                }

                if (self.deletionTarget.feature.properties) {

                    targetId = self.deletionTarget.feature.properties.id;

                } else {

                    targetId = self.deletionTarget.feature.id;

                }

                targetCollection.delete({
                    id: +targetId
                }).$promise.then(function(data) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this ' + featureType + '.',
                        'prompt': 'OK'
                    });

                    if (index !== null &&
                        typeof index === 'number' &&
                        featureType === 'site') {

                        self.sites.splice(index, 1);

                        self.cancelDelete();

                        $timeout(closeAlerts, 2000);

                    } else {

                        $timeout(closeRoute, 2000);

                    }

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + self.deletionTarget.feature.name + '”. There are pending tasks affecting this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };

            self.loadSites = function() {

                sites.$promise.then(function(successResponse) {

                    console.log('Project sites', successResponse);

                    successResponse.features.forEach(function(feature) {

                        if (feature.geometry) {

                            feature.staticURL = self.buildStaticMapURL(feature.geometry);

                        }

                    });

                    self.sites = successResponse.features;

                    leafletData.getMap('project--map').then(function(map) {

                        self.projectExtent.clearLayers();

                        self.sites.forEach(function(feature) {

                            if (feature.geometry) {

                                self.setGeoJsonLayer(feature.geometry, self.projectExtent);

                            }

                        });

                        map.fitBounds(self.projectExtent.getBounds(), {
                            maxZoom: 18
                        });

                        self.projectExtent.addTo(map);

                    });

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            };

            self.loadMetrics = function() {

                metrics.$promise.then(function(successResponse) {

                    console.log('Project metrics', successResponse);

                    successResponse.features.forEach(function(metric) {

                        var _percentComplete = +((metric.installation / metric.planning) * 100).toFixed(0);

                        metric.percentComplete = _percentComplete;

                    });

                    self.metrics = successResponse.features;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            };

            self.loadOutcomes = function() {

                outcomes.$promise.then(function(successResponse) {

                    console.log('Project outcomes', successResponse);

                    self.outcomes = successResponse;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            };

            //
            // Verify Account information for proper UI element display
            //

            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                        // can_edit: Account.canEdit(self.project),
                        // is_manager: (Account.hasRole('manager') || Account.inGroup(self.project.properties.organization_id, Account.userObject.properties.account)),
                        is_admin: Account.hasRole('admin')
                    };

                    self.loadProject();

                    self.loadMetrics();

                    self.loadOutcomes();

                });

            }

        });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectCreateCtrl',
        function(Account, $location, $log, Project, $rootScope, $route, user) {

        var self = this;

        $rootScope.page = {};

        self.funders = [{
            id: 1,
            name: 'Maryland Department of Natural Resources'
        }, {
            id: 2,
            name: 'National Fish and Wildlife Foundation'
        }];

        self.programs = [{
            id: 1,
            name: 'Chesapeake Bay Conservation Innovation Grant'
        }, {
            id: 2,
            name: 'Chesapeake Bay Innovative Sediment and Nutrient Reduction'
        }, {
            id: 3,
            name: 'Chesapeake Bay Small Watershed Grant'
        }, {
            id: 4,
            name: 'Delaware River Restoration Fund'
        }, {
            id: 5,
            name: 'Maryland Trust Fund'
        }];

        self.project = {};

        $rootScope.page.title = 'Create Project';

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                };

                self.project.organization_id = $rootScope.user.properties.organization.id;

            });

        }

        self.saveProject = function() {

            var project = new Project(self.project);

            project.workflow_state = 'Draft';

            project.$save().then(function(response) {

                $location.path('/projects');

            }).then(function(error) {

                $log.error('Unable to create Project object');

            });

        };

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectEditCtrl',
        function(Account, $location, $log, Project, project, $rootScope, $route, user) {

        var self = this;

        $rootScope.toolbarState = {
            'edit': true
        };

        $rootScope.page = {};

        //
        // Assign project to a scoped variable
        //
        project.$promise.then(function(successResponse) {

            self.project = successResponse;

            $rootScope.page.title = 'Edit Project';

            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {
                user.$promise.then(function(userResponse) {
                    $rootScope.user = Account.userObject = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                        can_edit: Account.canEdit(project),
                        can_delete: Account.canDelete(project)
                    };
                });
            }

        }, function(errorResponse) {
            $log.error('Unable to load request project');
        });

        self.saveProject = function() {

            self.project.properties.workflow_state = "Draft";

            // We are simply removing this from the request because we should not
            // be saving updates to the Projects Sites at this point, just the Project
            delete self.project.properties.sites;

            self.project.$update().then(function(response) {

                $location.path('/projects/' + self.project.id);

            }).then(function(error) {
                // Do something with the error
            });

        };

        self.deleteProject = function() {
            self.project.$delete().then(function(response) {

                $location.path('/projects/');

            }).then(function(error) {
                // Do something with the error
            });
        };

    });
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:ProjectUsersCtrl
     * @description
     * # ProjectUsersCtrl
     * Controller of the FieldDoc
     */
    angular.module('FieldDoc')
        .controller('ProjectUsersCtrl', 
            function(Account, Collaborators, $window, $rootScope, $scope, $route,
                $location, project, user, members) {

            var self = this;

            $rootScope.page = {};

            self.actions = {
                print: function() {

                    $window.print();

                },
                saveToPdf: function() {

                    $scope.$emit('saveToPdf');

                }
            };

            $rootScope.viewState = {
                'project': true
            };

            $rootScope.toolbarState = {
                'users': true
            };

            //
            // Assign project to a scoped variable
            //
            project.$promise.then(function(successResponse) {

                self.project = successResponse;

                $rootScope.page.title = self.project.properties.name;

                self.project.users = members;
                self.project.users_edit = false;

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {
                    user.$promise.then(function(userResponse) {
                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                            can_edit: Account.canEdit(project)
                        };
                    });
                }

            }, function(errorResponse) {
                console.error('Unable to load request project');
            });

            //
            // Empty Collaborators object
            //
            // We need to have an empty geocode object so that we can fill it in later
            // in the address geocoding process. This allows us to pass the results along
            // to the Form Submit function we have in place below.
            //
            self.collaborator = {
                invitations: [],
                sendInvitations: function() {
                    Collaborators.invite({
                        'collaborators': self.collaborator.invitations,
                        'project_id': self.project.id
                    }).$promise.then(function(successResponse) {
                        $route.reload();
                    }, function(errorResponse) {
                        console.log('errorResponse', errorResponse);
                    });
                }
            };

            //
            // When the user has selected a response, we need to perform a few extra
            // tasks so that our scope is updated properly.
            //
            $scope.$watch(angular.bind(this, function() {
                return this.collaborator.response;
            }), function(response) {

                if (response) {

                    // Reset the fields we are done using
                    self.collaborator.query = null;
                    self.collaborator.response = null;

                    // Add the selected user value to the invitations list
                    self.collaborator.invitations.push(response);
                }

            });

            self.users = {
                list: members,
                search: null,
                invite: function(user) {
                    self.invite.push(user); // Add selected User object to invitation list
                    this.search = null; // Clear search text
                },
                add: function() {
                    angular.forEach(self.invite, function(user_, $index) {
                        Feature.AddUser({
                            storage: storage,
                            featureId: $scope.project.id,
                            userId: user_.id,
                            data: {
                                read: true,
                                write: true,
                                is_admin: false
                            }
                        }).then(function(response) {
                            //
                            // Once the users have been added to the project refresh the page
                            //
                            self.page.refresh();
                        });
                    });
                },
                remove: function() {
                    self.project.$update().then(function(response) {
                        $route.reload();
                    }).then(function(error) {
                        // Do something with the error
                    });
                },
                remove_confirm: false
            };

        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .config(function($routeProvider, commonscloud) {

            $routeProvider
                .when('/account', {
                    templateUrl: '/modules/components/account/views/accountEdit--view.html',
                    controller: 'AccountEditViewController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        },
                        snapshots: function(Snapshot) {
                            return Snapshot.query();
                        }
                    }
                });

        });

}());
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('AccountEditViewController',
        function(Account, $location, $log, Notifications, $rootScope,
            $route, user, User, snapshots) {

        var self = this;

        $rootScope.viewState = {
            'profile': true
        };

        //
        // Assign project to a scoped variable
        //
        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = self.user = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                };

                //
                // Setup page meta data
                //
                $rootScope.page = {
                    'title': 'Profile'
                };

                //
                // Load snapshot data
                //

                self.actions.snapshots();

            });


        } else {
            //
            // If there is not Account.userObject and no user object, then the
            // user is not properly authenticated and we should send them, at
            // minimum, back to the projects page, and have them attempt to
            // come back to this page again.
            //
            self.actions.exit();

        }

        //
        //
        //
        self.status = {
            'saving': false
        };

        self.actions = {
            organizations: function() {

                var _organizations = [];

                angular.forEach(self.user.properties.organizations, function(_organization, _index) {
                    if (_organization.id) {
                        _organizations.push({
                            'id': _organization.id
                        });
                    } else {
                        _organizations.push({
                            'name': _organization.properties.name
                        });
                    }
                });

                return _organizations;
            },
            save: function() {

                self.status.saving = true;

                var _organizations = self.actions.organizations();

                var _user = new User({
                    'id': self.user.id,
                    'first_name': self.user.properties.first_name,
                    'last_name': self.user.properties.last_name,
                    'organizations': _organizations
                });

                _user.$update(function(successResponse) {

                    self.status.saving = false;

                    $rootScope.notifications.success('Great!', 'Your account changes were saved');

                    $location.path('/account/');

                }, function(errorResponse) {
                    self.status.saving = false;
                });
            },
            snapshots: function() {

                snapshots.$promise.then(function(snapshotResponse) {

                    self.snapshots = snapshotResponse.features;


                });

            },
            exit: function() {
                $location.path('/projects');
            }
        };

    });
'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
    .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

        $routeProvider
            // .when('/sites', {
            //     redirectTo: '/projects/:projectId'
            // })
            .when('/sites/:siteId', {
                templateUrl: '/modules/components/sites/views/sites--summary.html',
                controller: 'SiteSummaryCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    metrics: function(Site, $route) {
                        return Site.metrics({
                            id: $route.current.params.siteId
                        });
                    },
                    nodes: function(Site, $route) {
                        return Site.nodes({
                            id: $route.current.params.siteId
                        });
                    },
                    outcomes: function(Site, $route) {
                        return Site.outcomes({
                            id: $route.current.params.siteId
                        });
                    },
                    practices: function(Site, $route) {
                        return Site.practices({
                            id: $route.current.params.siteId
                        });
                    },
                    site: function(Site, $route) {
                        return Site.get({
                            id: $route.current.params.siteId
                        });
                    }
                }
            })
            .when('/sites/:siteId/geographies', {
                templateUrl: '/modules/components/sites/views/siteGeography--view.html',
                controller: 'SiteGeographyCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    nodes: function(Site, $route) {
                        return Site.nodes({
                            id: $route.current.params.siteId
                        });
                    },
                    site: function(Site, $route) {
                        return Site.get({
                            id: $route.current.params.siteId
                        });
                    }
                }
            })
            .when('/sites/:siteId/edit', {
                templateUrl: '/modules/components/sites/views/sites--edit.html',
                controller: 'SiteEditCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    site: function(Site, $route) {
                        return Site.get({
                            id: $route.current.params.siteId
                        });
                    }
                }
            })
            .when('/sites/:siteId/location', {
                templateUrl: '/modules/components/sites/views/siteLocation--view.html',
                controller: 'SiteLocationCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    site: function(Site, $route) {
                        return Site.get({
                            id: $route.current.params.siteId
                        });
                    }
                }
            })
            .when('/sites/:siteId/photos', {
                templateUrl: '/modules/components/sites/views/sitePhoto--view.html',
                controller: 'SitePhotoCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    site: function(Site, $route) {
                        return Site.get({
                            id: $route.current.params.siteId
                        });
                    }
                }
            });

    }]);
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteSummaryCtrl
     * @description
     */
    angular.module('FieldDoc')
        .controller('SiteSummaryCtrl',
            function(Account, $location, $window, $timeout, Practice, $rootScope, $scope,
                $route, nodes, user, Utility, metrics, outcomes, site, Map, mapbox, leafletData,
                leafletBoundsHelpers, Site, Project, practices) {

                var self = this;

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.map = JSON.parse(JSON.stringify(Map));

                self.status = {
                    'loading': true
                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path(self.site.links.project.html);

                }

                self.confirmDelete = function(obj, targetCollection) {

                    console.log('self.confirmDelete', obj, targetCollection);

                    if (self.deletionTarget &&
                        self.deletionTarget.collection === 'site') {

                        self.cancelDelete();

                    } else {

                        self.deletionTarget = {
                            'collection': targetCollection,
                            'feature': obj
                        };

                    }

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.deleteFeature = function(featureType, index) {

                    console.log('self.deleteFeature', featureType, index);

                    var targetCollection,
                        targetId;

                    switch (featureType) {

                        case 'practice':

                            targetCollection = Practice;

                            break;

                        case 'site':

                            targetCollection = Site;

                            break;

                        default:

                            targetCollection = Project;

                            break;

                    }

                    if (self.deletionTarget.feature.properties) {

                        targetId = self.deletionTarget.feature.properties.id;

                    } else {

                        targetId = self.deletionTarget.feature.id;

                    }

                    targetCollection.delete({
                        id: +targetId
                    }).$promise.then(function(data) {

                        self.alerts.push({
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this ' + featureType + '.',
                            'prompt': 'OK'
                        });

                        if (index !== null &&
                            typeof index === 'number' &&
                            featureType === 'practice') {

                            self.practices.splice(index, 1);

                            self.cancelDelete();

                            $timeout(closeAlerts, 2000);

                        } else {

                            $timeout(closeRoute, 2000);

                        }

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + self.deletionTarget.feature.properties.name + '”. There are pending tasks affecting this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        } else if (errorResponse.status === 403) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'You don’t have permission to delete this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        } else {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Something went wrong while attempting to delete this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        }

                        $timeout(closeAlerts, 2000);

                    });

                };

                function addNonGroupLayers(sourceLayer, targetGroup) {

                    if (sourceLayer instanceof L.LayerGroup) {

                        sourceLayer.eachLayer(function(layer) {

                            addNonGroupLayers(layer, targetGroup);

                        });

                    } else {

                        targetGroup.addLayer(sourceLayer);

                    }

                }

                self.setGeoJsonLayer = function(data, layerGroup, clearLayers) {

                    if (clearLayers) {

                        layerGroup.clearLayers();

                    }

                    var featureGeometry = L.geoJson(data, {});

                    addNonGroupLayers(featureGeometry, layerGroup);

                };

                self.cleanName = function(string_) {
                    return Utility.machineName(string_);
                };

                self.loadSite = function() {

                    site.$promise.then(function(successResponse) {

                        console.log('self.site', successResponse);

                        self.site = successResponse;

                        self.permissions.can_edit = Account.canEdit(self.site);

                        $rootScope.page.title = self.site.properties.name;

                        self.project = successResponse.properties.project;

                        console.log('self.project', self.project);

                        self.status.loading = false;

                        //
                        // Load spatial nodes
                        //

                        nodes.$promise.then(function(successResponse) {

                            console.log('self.nodes', successResponse);

                            self.nodes = successResponse;

                        }, function(errorResponse) {

                        });

                        //
                        // Load practices
                        //

                        practices.$promise.then(function(successResponse) {

                            console.log('self.practices', successResponse);

                            successResponse.features.forEach(function(feature) {

                                if (feature.geometry) {

                                    var styledFeature = {
                                        "type": "Feature",
                                        "geometry": feature.geometry.geometries[0],
                                        "properties": {
                                            "marker-size": "small",
                                            "marker-color": "#2196F3",
                                            "stroke": "#2196F3",
                                            "stroke-opacity": 1.0,
                                            "stroke-width": 2,
                                            "fill": "#2196F3",
                                            "fill-opacity": 0.5
                                        }
                                    };

                                    // Build static map URL for Mapbox API

                                    var staticURL = 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/static/geojson(' + encodeURIComponent(JSON.stringify(styledFeature)) + ')/auto/400x200@2x?access_token=pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw';

                                    feature.staticURL = staticURL;

                                }

                            });

                            self.practices = successResponse.features;

                        }, function(errorResponse) {

                        });

                        //
                        // If a valid site geometry is present, add it to the map
                        // and track the object in `self.savedObjects`.
                        //

                        if (self.site.geometry !== null &&
                            typeof self.site.geometry !== 'undefined') {

                            leafletData.getMap('site--map').then(function(map) {

                                self.siteExtent = new L.FeatureGroup();

                                self.setGeoJsonLayer(self.site.geometry, self.siteExtent);

                                map.fitBounds(self.siteExtent.getBounds(), {
                                    maxZoom: 18
                                });

                            });

                            self.map.geojson = {
                                data: self.site.geometry
                            };

                        }

                    });

                };

                self.createPractice = function() {

                    self.practice = new Practice({
                        'practice_type': 'Custom',
                        'site_id': self.site.id,
                        'project_id': self.site.properties.project.id,
                        'organization_id': self.site.properties.organization_id
                    });

                    self.practice.$save(function(successResponse) {

                        $location.path('/practices/' + successResponse.id + '/edit');

                    }, function(errorResponse) {

                        console.error('Unable to create your practice, please try again later');

                    });

                };

                self.loadMetrics = function() {

                    metrics.$promise.then(function(successResponse) {

                        console.log('Project metrics', successResponse);

                        successResponse.features.forEach(function(metric) {

                            var _percentComplete = +((metric.installation/metric.planning)*100).toFixed(0);

                            metric.percentComplete = _percentComplete;

                        });

                        self.metrics = successResponse.features;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                };

                self.loadOutcomes = function() {

                    outcomes.$promise.then(function(successResponse) {

                        console.log('Project outcomes', successResponse);

                        self.outcomes = successResponse;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                };

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {

                    user.$promise.then(function(userResponse) {

                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                        };

                        self.loadSite();

                        self.loadMetrics();

                        self.loadOutcomes();

                    });

                }

            });

})();
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteEditCtrl
     * @description
     * # SiteEditCtrl
     * Controller of the FieldDoc
     */
    angular.module('FieldDoc')
        .controller('SiteEditCtrl',
            function(Account, environment, $http, leafletData, leafletBoundsHelpers, $location,
            Map, mapbox, Notifications, Site, site, $rootScope, $route, $scope, Segment,
            $timeout, $interval, user, Shapefile) {

            var self = this,
                timeout;

            $rootScope.toolbarState = {
                'edit': true
            };

            $rootScope.page = {};

            self.map = JSON.parse(JSON.stringify(Map));

            self.savedObjects = [];

            self.editableLayers = new L.FeatureGroup();

            //
            // Set default image path for Leaflet iconography
            //
            L.Icon.Default.imagePath = '/images/leaflet';

            function addNonGroupLayers(sourceLayer, targetGroup) {

                if (sourceLayer instanceof L.LayerGroup) {

                    sourceLayer.eachLayer(function(layer) {

                        addNonGroupLayers(layer, targetGroup);

                    });

                } else {

                    targetGroup.addLayer(sourceLayer);

                }

            }

            //
            // We use this function for handle any type of geographic change, whether
            // through the map or through the fields
            //
            self.processPin = function(coordinates, zoom) {

                if (coordinates.lat === null ||
                    coordinates.lat === undefined ||
                    coordinates.lng === null ||
                    coordinates.lng === undefined) {
                    return;
                }

                //
                // Update the visible pin on the map
                //

                self.map.center = {
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    zoom: (zoom < 10) ? 10 : zoom
                };

                self.showGeocoder = false;

            };

            //
            // Empty Geocode object
            //
            // We need to have an empty geocode object so that we can fill it in later
            // in the address geocoding process. This allows us to pass the results along
            // to the Form Submit function we have in place below.
            //
            self.geocode = {};

            //
            // When the user has selected a response, we need to perform a few extra
            // tasks so that our scope is updated properly.
            //
            $scope.$watch(angular.bind(this, function() {
                return this.geocode.response;
            }), function(response) {

                //
                // Only execute the following block of code if the user has geocoded an
                // address. This block of code expects this to be a single feature from a
                // Carmen GeoJSON object.
                //
                // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
                //
                if (response) {

                    self.processPin({
                        lat: response.geometry.coordinates[1],
                        lng: response.geometry.coordinates[0]
                    }, 16);

                    self.geocode = {
                        query: null,
                        response: null
                    };
                }

            });

            self.setGeoJsonLayer = function(data) {

                self.editableLayers.clearLayers();

                var siteGeometry = L.geoJson(data, {});

                addNonGroupLayers(siteGeometry, self.editableLayers);

                self.savedObjects = [{
                    id: self.editableLayers._leaflet_id,
                    geoJson: data
                }];

                console.log('self.savedObjects', self.savedObjects);

            };

            site.$promise.then(function(successResponse) {

                console.log('self.site', successResponse);

                self.site = successResponse;

                $rootScope.page.title = self.site.properties.name;

                //
                // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
                // selected their property, so we just need to display it on the map for them again.
                //
                // if (self.site && self.site.properties && self.site.properties.segment) {
                //     self.geolocation.drawSegment(self.site.properties.segment);
                // }

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {
                    user.$promise.then(function(userResponse) {
                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                            can_edit: Account.canEdit(self.site.properties.project)
                        };
                    });
                }

                //
                // If a valid site geometry is present, add it to the map
                // and track the object in `self.savedObjects`.
                //

                if (self.site.geometry !== null &&
                    typeof self.site.geometry !== 'undefined') {

                    var geometry = self.site.geometry;

                    if (geometry.geometries) {

                        self.setGeoJsonLayer(geometry.geometries[0]);

                    } else {

                        self.setGeoJsonLayer(geometry);

                    }

                }

            }, function(errorResponse) {

            });

            self.uploadShapefile = function() {

                if (!self.shapefile ||
                    !self.shapefile.length) {

                    $rootScope.notifications.warning('Uh-oh!', 'You forgot to add a file.');

                    $timeout(function() {
                        $rootScope.notifications.objects = [];
                    }, 1200);

                    return false;

                }

                // self.status.saving.action = true;

                if (self.shapefile) {

                    self.progressMessage = 'Uploading your file...';

                    var fileData = new FormData();

                    fileData.append('file', self.shapefile[0]);

                    console.log('fileData', fileData);

                    self.fillMeter = $interval(function() {

                        var tempValue = (self.progressValue || 10) * 0.50;

                        if (!self.progressValue) {

                            self.progressValue = tempValue;

                        } else if ((100 - tempValue) > self.progressValue) {

                            self.progressValue += tempValue;

                        }

                        console.log('progressValue', self.progressValue);

                        if (self.progressValue > 75) {

                            self.progressMessage = 'Analyzing data...';

                        }

                    }, 100);

                    console.log('Shapefile', Shapefile);

                    try {

                        Shapefile.upload({}, fileData, function(shapefileResponse) {

                            console.log('shapefileResponse', shapefileResponse);

                            self.progressValue = 100;

                            self.progressMessage = 'Upload successful, rendering shape...';

                            $interval.cancel(self.fillMeter);

                            $timeout(function() {

                                self.progressValue = null;

                                if (shapefileResponse.msg.length) {

                                    console.log('Shapefile --> GeoJSON', shapefileResponse.msg[0]);

                                    if (shapefileResponse.msg[0] !== null &&
                                        typeof shapefileResponse.msg[0].geometry !== 'undefined') {

                                        self.setGeoJsonLayer(shapefileResponse.msg[0]);

                                    }

                                }

                            }, 1600);

                            self.error = null;

                        }, function(errorResponse) {

                            console.log(errorResponse);

                            $interval.cancel(self.fillMeter);

                            self.progressValue = null;

                            $rootScope.notifications.error('', 'An error occurred and we couldn\'t process your file.');

                            $timeout(function() {
                                $rootScope.notifications.objects = [];
                            }, 2000);

                            return;

                        });

                    } catch (error) {

                        console.log('Shapefile upload error', error);

                    }

                }

            };

            self.saveSite = function() {

                if (self.savedObjects.length) {

                    self.savedObjects.forEach(function(object) {

                        console.log('Iterating self.savedObjects', object);

                        if (object.geoJson.geometry &&
                            typeof object.geoJson.geometry !== 'undefined') {

                            self.site.geometry = object.geoJson.geometry;

                        }

                    });

                } else {

                    self.site.geometry = {
                        type: 'Point',
                        coordinates: [-98.5795,
                            39.828175
                        ]
                    };

                }

                self.site.$update().then(function(successResponse) {

                    $location.path('/sites/' + $route.current.params.siteId);

                }, function(errorResponse) {

                });
            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeRoute() {

                $location.path(self.site.links.project.html);

            }

            self.confirmDelete = function(obj) {

                console.log('self.confirmDelete', obj);

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function() {

                Site.delete({
                    id: +self.deletionTarget.id
                }).$promise.then(function(data) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this site.',
                        'prompt': 'OK'
                    });

                    $timeout(closeRoute, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this site.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this site.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this site.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };

            /**
             * Mapping functionality
             *
             *
             *
             *
             *
             *
             */

            //
            // Define a layer to add geometries to later
            //
            var featureGroup = new L.FeatureGroup();

            //
            // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
            //
            self.geojsonToLayer = function(geojson, layer) {
                layer.clearLayers();

                function add(l) {
                    l.addTo(layer);
                }

                //
                // Make sure the GeoJSON object is added to the layer with appropriate styles
                //
                L.geoJson(geojson, {
                    style: {
                        stroke: true,
                        fill: false,
                        weight: 2,
                        opacity: 1,
                        color: 'rgb(255,255,255)',
                        lineCap: 'square'
                    }
                }).eachLayer(add);
            };

            self.geolocation = {
                drawSegment: function(geojson) {

                    leafletData.getMap().then(function(map) {
                        //
                        // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
                        //
                        map.removeLayer(featureGroup);

                        //
                        // Convert the GeoJSON to a layer and add it to our FeatureGroup
                        //
                        self.geojsonToLayer(geojson, featureGroup);

                        //
                        // Add the FeatureGroup to the map
                        //
                        map.addLayer(featureGroup);
                    });

                },
                getSegment: function(coordinates) {

                    leafletData.getMap().then(function(map) {

                        Segment.query({
                            q: {
                                filters: [{
                                    name: 'geometry',
                                    op: 'intersects',
                                    val: 'SRID=4326;POINT(' + coordinates.lng + ' ' + coordinates.lat + ')'
                                }]
                            }
                        }).$promise.then(function(successResponse) {

                            var segments = successResponse;

                            if (segments.features.length) {
                                self.geolocation.drawSegment(segments);

                                if (segments.features.length) {
                                    self.site.properties.segment_id = segments.features[0].id;
                                    self.site.properties.segment = segments.features[0];
                                }
                            } else {
                                $rootScope.notifications.error('Outside Chesapeake Bay Watershed', 'Please select a project site that falls within the Chesapeake Bay Watershed');

                                $timeout(function() {
                                    $rootScope.notifications.objects = [];
                                }, 3500);
                            }


                        }, function(errorResponse) {
                            console.error('Error', errorResponse);
                        });

                    });

                }
            };

            //
            // Define our map interactions via the Angular Leaflet Directive
            //
            leafletData.getMap('site--map').then(function(map) {

                //
                // Add draw toolbar
                //

                var drawControls = new L.Control.Draw({
                    draw: {
                        circle: false,
                        circlemarker: false,
                        rectangle: false
                    },
                    edit: {
                        featureGroup: self.editableLayers
                    }
                });

                console.log('drawControls', drawControls);

                map.addControl(drawControls);

                var drawnItems = drawControls.options.edit.featureGroup;

                // Init the map with the saved elements
                var printLayers = function() {
                    // console.log("After: ");
                    map.eachLayer(function(layer) {
                        console.log('Existing layer', layer);
                    });
                };

                drawnItems.addTo(map);
                printLayers();

                map.on('draw:created', function(e) {

                    var layer = e.layer;

                    //
                    // Sites must only have one geometry feature
                    //

                    drawnItems.clearLayers();
                    drawnItems.addLayer(layer);
                    console.log('Layer added', JSON.stringify(layer.toGeoJSON()));

                    self.savedObjects = [{
                        id: layer._leaflet_id,
                        geoJson: layer.toGeoJSON()
                    }];

                    // map.fitBounds(drawnItems.getBounds(), {
                    //     padding: [20, 20],
                    //     maxZoom: 18
                    // });

                });

                map.on('draw:edited', function(e) {

                    var layers = e.layers;

                    console.log('map.draw:edited', layers);

                    // self.savedObjects = [{
                    //     id: layers[0]._leaflet_id,
                    //     geoJson: layers[0].toGeoJSON()
                    // }];

                    // console.log('Layer changed', JSON.stringify(layers[0].toGeoJSON()));

                    layers.eachLayer(function(layer) {

                        self.savedObjects = [{
                            id: layer._leaflet_id,
                            geoJson: layer.toGeoJSON()
                        }];

                        // for (var i = 0; i < self.savedObjects.length; i++) {
                        //     if (self.savedObjects[i].id == layer._leaflet_id) {
                        //         console.log('draw:edited layer match', self.savedObjects[i].id, layer._leaflet_id);
                        //         self.savedObjects[i].geoJson = layer.toGeoJSON();
                        //     }
                        // }

                        console.log('Layer changed', layer._leaflet_id, JSON.stringify(layer.toGeoJSON()));

                    });

                    // map.fitBounds(drawnItems.getBounds(), {
                    //     padding: [20, 20],
                    //     maxZoom: 18
                    // });

                });

                map.on('draw:deleted', function(e) {

                    var layers = e.layers;

                    layers.eachLayer(function(layer) {

                        for (var i = 0; i < self.savedObjects.length; i++) {
                            if (self.savedObjects[i].id == layer._leaflet_id) {
                                self.savedObjects.splice(i, 1);
                            }
                        }

                        console.log('Layer removed', JSON.stringify(layer.toGeoJSON()));

                    });

                    self.savedObjects = [];

                    console.log('Saved objects', self.savedObjects);

                });

                map.on('layeradd', function(e) {

                    console.log('map:layeradd', e);

                    if (e.layer.getBounds) {

                        map.fitBounds(e.layer.getBounds(), {
                            padding: [20, 20],
                            maxZoom: 18
                        });

                    }

                });

                map.on('zoomend', function(e) {

                    console.log('map:zoomend', map.getZoom());

                });

                // leafletData.getLayers().then(function(baselayers) {
                //     var drawnItems = baselayers.overlays.draw;
                //     map.on('draw:created', function(e) {
                //         var layer = e.layer;
                //         drawnItems.addLayer(layer);
                //         console.log(JSON.stringify(layer.toGeoJSON()));
                //     });
                // });

                //
                // Update the pin and segment information when the user clicks on the map
                // or drags the pin to a new location
                //
                $scope.$on('leafletDirectiveMap.click', function(event, args) {
                    self.processPin(args.leafletEvent.latlng, map._zoom);
                });

                $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
                    self.processPin(args.leafletEvent.latlng, map._zoom + 1);
                });

                $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
                    self.processPin(args.leafletEvent.target._latlng, map._zoom);
                });

                $scope.$on('leafletDirectiveMarker.dblclick', function(event, args) {
                    var zoom = map._zoom + 1;
                    map.setZoom(zoom);
                });

            });

        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteEditCtrl
     * @description
     * # SiteEditCtrl
     * Controller of the FieldDoc
     */
    angular.module('FieldDoc')
        .controller('SiteLocationCtrl',
            function(Account, environment, $http, leafletData, leafletBoundsHelpers, $location,
            Map, mapbox, Notifications, Site, site, $rootScope, $route, $scope, Segment,
            $timeout, $interval, user, Shapefile) {

            var self = this,
                timeout;

            $rootScope.toolbarState = {
                'editLocation': true
            };

            $rootScope.page = {};

            self.map = JSON.parse(JSON.stringify(Map));

            self.savedObjects = [];

            self.editableLayers = new L.FeatureGroup();

            //
            // Set default image path for Leaflet iconography
            //
            L.Icon.Default.imagePath = '/images/leaflet';

            function addNonGroupLayers(sourceLayer, targetGroup) {

                if (sourceLayer instanceof L.LayerGroup) {

                    sourceLayer.eachLayer(function(layer) {

                        addNonGroupLayers(layer, targetGroup);

                    });

                } else {

                    targetGroup.addLayer(sourceLayer);

                }

            }

            //
            // We use this function for handle any type of geographic change, whether
            // through the map or through the fields
            //
            self.processPin = function(coordinates, zoom) {

                if (coordinates.lat === null ||
                    coordinates.lat === undefined ||
                    coordinates.lng === null ||
                    coordinates.lng === undefined) {
                    return;
                }

                //
                // Update the visible pin on the map
                //

                self.map.center = {
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    zoom: (zoom < 10) ? 10 : zoom
                };

                self.showGeocoder = false;

            };

            //
            // Empty Geocode object
            //
            // We need to have an empty geocode object so that we can fill it in later
            // in the address geocoding process. This allows us to pass the results along
            // to the Form Submit function we have in place below.
            //
            self.geocode = {};

            //
            // When the user has selected a response, we need to perform a few extra
            // tasks so that our scope is updated properly.
            //
            $scope.$watch(angular.bind(this, function() {
                return this.geocode.response;
            }), function(response) {

                //
                // Only execute the following block of code if the user has geocoded an
                // address. This block of code expects this to be a single feature from a
                // Carmen GeoJSON object.
                //
                // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
                //
                if (response) {

                    self.processPin({
                        lat: response.geometry.coordinates[1],
                        lng: response.geometry.coordinates[0]
                    }, 16);

                    self.geocode = {
                        query: null,
                        response: null
                    };
                }

            });

            self.setGeoJsonLayer = function(data) {

                self.editableLayers.clearLayers();

                var siteGeometry = L.geoJson(data, {});

                addNonGroupLayers(siteGeometry, self.editableLayers);

                self.savedObjects = [{
                    id: self.editableLayers._leaflet_id,
                    geoJson: data
                }];

                console.log('self.savedObjects', self.savedObjects);

            };

            site.$promise.then(function(successResponse) {

                console.log('self.site', successResponse);

                self.site = successResponse;

                $rootScope.page.title = self.site.properties.name;

                //
                // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
                // selected their property, so we just need to display it on the map for them again.
                //
                // if (self.site && self.site.properties && self.site.properties.segment) {
                //     self.geolocation.drawSegment(self.site.properties.segment);
                // }

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {
                    user.$promise.then(function(userResponse) {
                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                            can_edit: Account.canEdit(self.site.properties.project)
                        };
                    });
                }

                //
                // If a valid site geometry is present, add it to the map
                // and track the object in `self.savedObjects`.
                //

                if (self.site.geometry !== null &&
                    typeof self.site.geometry !== 'undefined') {

                    var geometry = self.site.geometry;

                    if (geometry.geometries) {

                        self.setGeoJsonLayer(geometry.geometries[0]);

                    } else {

                        self.setGeoJsonLayer(geometry);

                    }

                }

            }, function(errorResponse) {

            });

            self.uploadShapefile = function() {

                if (!self.shapefile ||
                    !self.shapefile.length) {

                    $rootScope.notifications.warning('Uh-oh!', 'You forgot to add a file.');

                    $timeout(function() {
                        $rootScope.notifications.objects = [];
                    }, 1200);

                    return false;

                }

                // self.status.saving.action = true;

                if (self.shapefile) {

                    self.progressMessage = 'Uploading your file...';

                    var fileData = new FormData();

                    fileData.append('file', self.shapefile[0]);

                    console.log('fileData', fileData);

                    self.fillMeter = $interval(function() {

                        var tempValue = (self.progressValue || 10) * 0.50;

                        if (!self.progressValue) {

                            self.progressValue = tempValue;

                        } else if ((100 - tempValue) > self.progressValue) {

                            self.progressValue += tempValue;

                        }

                        console.log('progressValue', self.progressValue);

                        if (self.progressValue > 75) {

                            self.progressMessage = 'Analyzing data...';

                        }

                    }, 100);

                    console.log('Shapefile', Shapefile);

                    try {

                        Shapefile.upload({}, fileData, function(shapefileResponse) {

                            console.log('shapefileResponse', shapefileResponse);

                            self.progressValue = 100;

                            self.progressMessage = 'Upload successful, rendering shape...';

                            $interval.cancel(self.fillMeter);

                            $timeout(function() {

                                self.progressValue = null;

                                if (shapefileResponse.msg.length) {

                                    console.log('Shapefile --> GeoJSON', shapefileResponse.msg[0]);

                                    if (shapefileResponse.msg[0] !== null &&
                                        typeof shapefileResponse.msg[0].geometry !== 'undefined') {

                                        self.setGeoJsonLayer(shapefileResponse.msg[0]);

                                    }

                                }

                            }, 1600);

                            self.error = null;

                        }, function(errorResponse) {

                            console.log(errorResponse);

                            $interval.cancel(self.fillMeter);

                            self.progressValue = null;

                            $rootScope.notifications.error('', 'An error occurred and we couldn\'t process your file.');

                            $timeout(function() {
                                $rootScope.notifications.objects = [];
                            }, 2000);

                            return;

                        });

                    } catch (error) {

                        console.log('Shapefile upload error', error);

                    }

                }

            };

            self.saveSite = function() {

                if (self.savedObjects.length) {

                    self.savedObjects.forEach(function(object) {

                        console.log('Iterating self.savedObjects', object);

                        if (object.geoJson.geometry &&
                            typeof object.geoJson.geometry !== 'undefined') {

                            self.site.geometry = object.geoJson.geometry;

                        }

                    });

                } else {

                    self.site.geometry = {
                        type: 'Point',
                        coordinates: [-98.5795,
                            39.828175
                        ]
                    };

                }

                self.site.$update().then(function(successResponse) {

                    $location.path('/sites/' + $route.current.params.siteId);

                }, function(errorResponse) {

                });
            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeRoute() {

                $location.path(self.site.links.project.html);

            }

            self.confirmDelete = function(obj) {

                console.log('self.confirmDelete', obj);

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function() {

                Site.delete({
                    id: +self.deletionTarget.id
                }).$promise.then(function(data) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this site.',
                        'prompt': 'OK'
                    });

                    $timeout(closeRoute, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this site.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this site.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this site.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };

            /**
             * Mapping functionality
             *
             *
             *
             *
             *
             *
             */

            //
            // Define a layer to add geometries to later
            //
            var featureGroup = new L.FeatureGroup();

            //
            // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
            //
            self.geojsonToLayer = function(geojson, layer) {
                layer.clearLayers();

                function add(l) {
                    l.addTo(layer);
                }

                //
                // Make sure the GeoJSON object is added to the layer with appropriate styles
                //
                L.geoJson(geojson, {
                    style: {
                        stroke: true,
                        fill: false,
                        weight: 2,
                        opacity: 1,
                        color: 'rgb(255,255,255)',
                        lineCap: 'square'
                    }
                }).eachLayer(add);
            };

            self.geolocation = {
                drawSegment: function(geojson) {

                    leafletData.getMap().then(function(map) {
                        //
                        // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
                        //
                        map.removeLayer(featureGroup);

                        //
                        // Convert the GeoJSON to a layer and add it to our FeatureGroup
                        //
                        self.geojsonToLayer(geojson, featureGroup);

                        //
                        // Add the FeatureGroup to the map
                        //
                        map.addLayer(featureGroup);
                    });

                },
                getSegment: function(coordinates) {

                    leafletData.getMap().then(function(map) {

                        Segment.query({
                            q: {
                                filters: [{
                                    name: 'geometry',
                                    op: 'intersects',
                                    val: 'SRID=4326;POINT(' + coordinates.lng + ' ' + coordinates.lat + ')'
                                }]
                            }
                        }).$promise.then(function(successResponse) {

                            var segments = successResponse;

                            if (segments.features.length) {
                                self.geolocation.drawSegment(segments);

                                if (segments.features.length) {
                                    self.site.properties.segment_id = segments.features[0].id;
                                    self.site.properties.segment = segments.features[0];
                                }
                            } else {
                                $rootScope.notifications.error('Outside Chesapeake Bay Watershed', 'Please select a project site that falls within the Chesapeake Bay Watershed');

                                $timeout(function() {
                                    $rootScope.notifications.objects = [];
                                }, 3500);
                            }


                        }, function(errorResponse) {
                            console.error('Error', errorResponse);
                        });

                    });

                }
            };

            //
            // Define our map interactions via the Angular Leaflet Directive
            //
            leafletData.getMap('site--map').then(function(map) {

                //
                // Add draw toolbar
                //

                var drawControls = new L.Control.Draw({
                    draw: {
                        circle: false,
                        circlemarker: false,
                        rectangle: false
                    },
                    edit: {
                        featureGroup: self.editableLayers
                    }
                });

                console.log('drawControls', drawControls);

                map.addControl(drawControls);

                var drawnItems = drawControls.options.edit.featureGroup;

                // Init the map with the saved elements
                var printLayers = function() {
                    // console.log("After: ");
                    map.eachLayer(function(layer) {
                        console.log('Existing layer', layer);
                    });
                };

                drawnItems.addTo(map);
                printLayers();

                map.on('draw:created', function(e) {

                    var layer = e.layer;

                    //
                    // Sites must only have one geometry feature
                    //

                    drawnItems.clearLayers();
                    drawnItems.addLayer(layer);
                    console.log('Layer added', JSON.stringify(layer.toGeoJSON()));

                    self.savedObjects = [{
                        id: layer._leaflet_id,
                        geoJson: layer.toGeoJSON()
                    }];

                    // map.fitBounds(drawnItems.getBounds(), {
                    //     padding: [20, 20],
                    //     maxZoom: 18
                    // });

                });

                map.on('draw:edited', function(e) {

                    var layers = e.layers;

                    console.log('map.draw:edited', layers);

                    // self.savedObjects = [{
                    //     id: layers[0]._leaflet_id,
                    //     geoJson: layers[0].toGeoJSON()
                    // }];

                    // console.log('Layer changed', JSON.stringify(layers[0].toGeoJSON()));

                    layers.eachLayer(function(layer) {

                        self.savedObjects = [{
                            id: layer._leaflet_id,
                            geoJson: layer.toGeoJSON()
                        }];

                        // for (var i = 0; i < self.savedObjects.length; i++) {
                        //     if (self.savedObjects[i].id == layer._leaflet_id) {
                        //         console.log('draw:edited layer match', self.savedObjects[i].id, layer._leaflet_id);
                        //         self.savedObjects[i].geoJson = layer.toGeoJSON();
                        //     }
                        // }

                        console.log('Layer changed', layer._leaflet_id, JSON.stringify(layer.toGeoJSON()));

                    });

                    // map.fitBounds(drawnItems.getBounds(), {
                    //     padding: [20, 20],
                    //     maxZoom: 18
                    // });

                });

                map.on('draw:deleted', function(e) {

                    var layers = e.layers;

                    layers.eachLayer(function(layer) {

                        for (var i = 0; i < self.savedObjects.length; i++) {
                            if (self.savedObjects[i].id == layer._leaflet_id) {
                                self.savedObjects.splice(i, 1);
                            }
                        }

                        console.log('Layer removed', JSON.stringify(layer.toGeoJSON()));

                    });

                    self.savedObjects = [];

                    console.log('Saved objects', self.savedObjects);

                });

                map.on('layeradd', function(e) {

                    console.log('map:layeradd', e);

                    if (e.layer.getBounds) {

                        map.fitBounds(e.layer.getBounds(), {
                            padding: [20, 20],
                            maxZoom: 18
                        });

                    }

                });

                map.on('zoomend', function(e) {

                    console.log('map:zoomend', map.getZoom());

                });

                // leafletData.getLayers().then(function(baselayers) {
                //     var drawnItems = baselayers.overlays.draw;
                //     map.on('draw:created', function(e) {
                //         var layer = e.layer;
                //         drawnItems.addLayer(layer);
                //         console.log(JSON.stringify(layer.toGeoJSON()));
                //     });
                // });

                //
                // Update the pin and segment information when the user clicks on the map
                // or drags the pin to a new location
                //
                $scope.$on('leafletDirectiveMap.click', function(event, args) {
                    self.processPin(args.leafletEvent.latlng, map._zoom);
                });

                $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
                    self.processPin(args.leafletEvent.latlng, map._zoom + 1);
                });

                $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
                    self.processPin(args.leafletEvent.target._latlng, map._zoom);
                });

                $scope.$on('leafletDirectiveMarker.dblclick', function(event, args) {
                    var zoom = map._zoom + 1;
                    map.setZoom(zoom);
                });

            });

        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteEditCtrl
     * @description
     * # SiteEditCtrl
     * Controller of the FieldDoc
     */
    angular.module('FieldDoc')
        .controller('SitePhotoCtrl',
            function(Account, environment, $http, leafletData, leafletBoundsHelpers, $location,
            Map, mapbox, Notifications, Site, site, $rootScope, $route, $scope, Segment,
            $timeout, $interval, user, Shapefile) {

            var self = this,
                timeout;

            $rootScope.toolbarState = {
                'editPhotos': true
            };

            $rootScope.page = {};

            self.map = JSON.parse(JSON.stringify(Map));

            self.savedObjects = [];

            self.editableLayers = new L.FeatureGroup();

            //
            // Set default image path for Leaflet iconography
            //
            L.Icon.Default.imagePath = '/images/leaflet';

            function addNonGroupLayers(sourceLayer, targetGroup) {

                if (sourceLayer instanceof L.LayerGroup) {

                    sourceLayer.eachLayer(function(layer) {

                        addNonGroupLayers(layer, targetGroup);

                    });

                } else {

                    targetGroup.addLayer(sourceLayer);

                }

            }

            //
            // We use this function for handle any type of geographic change, whether
            // through the map or through the fields
            //
            self.processPin = function(coordinates, zoom) {

                if (coordinates.lat === null ||
                    coordinates.lat === undefined ||
                    coordinates.lng === null ||
                    coordinates.lng === undefined) {
                    return;
                }

                //
                // Update the visible pin on the map
                //

                self.map.center = {
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    zoom: (zoom < 10) ? 10 : zoom
                };

                self.showGeocoder = false;

            };

            //
            // Empty Geocode object
            //
            // We need to have an empty geocode object so that we can fill it in later
            // in the address geocoding process. This allows us to pass the results along
            // to the Form Submit function we have in place below.
            //
            self.geocode = {};

            //
            // When the user has selected a response, we need to perform a few extra
            // tasks so that our scope is updated properly.
            //
            $scope.$watch(angular.bind(this, function() {
                return this.geocode.response;
            }), function(response) {

                //
                // Only execute the following block of code if the user has geocoded an
                // address. This block of code expects this to be a single feature from a
                // Carmen GeoJSON object.
                //
                // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
                //
                if (response) {

                    self.processPin({
                        lat: response.geometry.coordinates[1],
                        lng: response.geometry.coordinates[0]
                    }, 16);

                    self.geocode = {
                        query: null,
                        response: null
                    };
                }

            });

            self.setGeoJsonLayer = function(data) {

                self.editableLayers.clearLayers();

                var siteGeometry = L.geoJson(data, {});

                addNonGroupLayers(siteGeometry, self.editableLayers);

                self.savedObjects = [{
                    id: self.editableLayers._leaflet_id,
                    geoJson: data
                }];

                console.log('self.savedObjects', self.savedObjects);

            };

            site.$promise.then(function(successResponse) {

                console.log('self.site', successResponse);

                self.site = successResponse;

                $rootScope.page.title = self.site.properties.name;

                //
                // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
                // selected their property, so we just need to display it on the map for them again.
                //
                // if (self.site && self.site.properties && self.site.properties.segment) {
                //     self.geolocation.drawSegment(self.site.properties.segment);
                // }

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {
                    user.$promise.then(function(userResponse) {
                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                            can_edit: Account.canEdit(self.site.properties.project)
                        };
                    });
                }

                //
                // If a valid site geometry is present, add it to the map
                // and track the object in `self.savedObjects`.
                //

                if (self.site.geometry !== null &&
                    typeof self.site.geometry !== 'undefined') {

                    var geometry = self.site.geometry;

                    if (geometry.geometries) {

                        self.setGeoJsonLayer(geometry.geometries[0]);

                    } else {

                        self.setGeoJsonLayer(geometry);

                    }

                }

            }, function(errorResponse) {

            });

            self.uploadShapefile = function() {

                if (!self.shapefile ||
                    !self.shapefile.length) {

                    $rootScope.notifications.warning('Uh-oh!', 'You forgot to add a file.');

                    $timeout(function() {
                        $rootScope.notifications.objects = [];
                    }, 1200);

                    return false;

                }

                // self.status.saving.action = true;

                if (self.shapefile) {

                    self.progressMessage = 'Uploading your file...';

                    var fileData = new FormData();

                    fileData.append('file', self.shapefile[0]);

                    console.log('fileData', fileData);

                    self.fillMeter = $interval(function() {

                        var tempValue = (self.progressValue || 10) * 0.50;

                        if (!self.progressValue) {

                            self.progressValue = tempValue;

                        } else if ((100 - tempValue) > self.progressValue) {

                            self.progressValue += tempValue;

                        }

                        console.log('progressValue', self.progressValue);

                        if (self.progressValue > 75) {

                            self.progressMessage = 'Analyzing data...';

                        }

                    }, 100);

                    console.log('Shapefile', Shapefile);

                    try {

                        Shapefile.upload({}, fileData, function(shapefileResponse) {

                            console.log('shapefileResponse', shapefileResponse);

                            self.progressValue = 100;

                            self.progressMessage = 'Upload successful, rendering shape...';

                            $interval.cancel(self.fillMeter);

                            $timeout(function() {

                                self.progressValue = null;

                                if (shapefileResponse.msg.length) {

                                    console.log('Shapefile --> GeoJSON', shapefileResponse.msg[0]);

                                    if (shapefileResponse.msg[0] !== null &&
                                        typeof shapefileResponse.msg[0].geometry !== 'undefined') {

                                        self.setGeoJsonLayer(shapefileResponse.msg[0]);

                                    }

                                }

                            }, 1600);

                            self.error = null;

                        }, function(errorResponse) {

                            console.log(errorResponse);

                            $interval.cancel(self.fillMeter);

                            self.progressValue = null;

                            $rootScope.notifications.error('', 'An error occurred and we couldn\'t process your file.');

                            $timeout(function() {
                                $rootScope.notifications.objects = [];
                            }, 2000);

                            return;

                        });

                    } catch (error) {

                        console.log('Shapefile upload error', error);

                    }

                }

            };

            self.saveSite = function() {

                if (self.savedObjects.length) {

                    self.savedObjects.forEach(function(object) {

                        console.log('Iterating self.savedObjects', object);

                        if (object.geoJson.geometry &&
                            typeof object.geoJson.geometry !== 'undefined') {

                            self.site.geometry = object.geoJson.geometry;

                        }

                    });

                } else {

                    self.site.geometry = {
                        type: 'Point',
                        coordinates: [-98.5795,
                            39.828175
                        ]
                    };

                }

                self.site.$update().then(function(successResponse) {

                    $location.path('/sites/' + $route.current.params.siteId);

                }, function(errorResponse) {

                });
            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeRoute() {

                $location.path(self.site.links.project.html);

            }

            self.confirmDelete = function(obj) {

                console.log('self.confirmDelete', obj);

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function() {

                Site.delete({
                    id: +self.deletionTarget.id
                }).$promise.then(function(data) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this site.',
                        'prompt': 'OK'
                    });

                    $timeout(closeRoute, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this site.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this site.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this site.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };

            /**
             * Mapping functionality
             *
             *
             *
             *
             *
             *
             */

            //
            // Define a layer to add geometries to later
            //
            var featureGroup = new L.FeatureGroup();

            //
            // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
            //
            self.geojsonToLayer = function(geojson, layer) {
                layer.clearLayers();

                function add(l) {
                    l.addTo(layer);
                }

                //
                // Make sure the GeoJSON object is added to the layer with appropriate styles
                //
                L.geoJson(geojson, {
                    style: {
                        stroke: true,
                        fill: false,
                        weight: 2,
                        opacity: 1,
                        color: 'rgb(255,255,255)',
                        lineCap: 'square'
                    }
                }).eachLayer(add);
            };

            self.geolocation = {
                drawSegment: function(geojson) {

                    leafletData.getMap().then(function(map) {
                        //
                        // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
                        //
                        map.removeLayer(featureGroup);

                        //
                        // Convert the GeoJSON to a layer and add it to our FeatureGroup
                        //
                        self.geojsonToLayer(geojson, featureGroup);

                        //
                        // Add the FeatureGroup to the map
                        //
                        map.addLayer(featureGroup);
                    });

                },
                getSegment: function(coordinates) {

                    leafletData.getMap().then(function(map) {

                        Segment.query({
                            q: {
                                filters: [{
                                    name: 'geometry',
                                    op: 'intersects',
                                    val: 'SRID=4326;POINT(' + coordinates.lng + ' ' + coordinates.lat + ')'
                                }]
                            }
                        }).$promise.then(function(successResponse) {

                            var segments = successResponse;

                            if (segments.features.length) {
                                self.geolocation.drawSegment(segments);

                                if (segments.features.length) {
                                    self.site.properties.segment_id = segments.features[0].id;
                                    self.site.properties.segment = segments.features[0];
                                }
                            } else {
                                $rootScope.notifications.error('Outside Chesapeake Bay Watershed', 'Please select a project site that falls within the Chesapeake Bay Watershed');

                                $timeout(function() {
                                    $rootScope.notifications.objects = [];
                                }, 3500);
                            }


                        }, function(errorResponse) {
                            console.error('Error', errorResponse);
                        });

                    });

                }
            };

            //
            // Define our map interactions via the Angular Leaflet Directive
            //
            leafletData.getMap('site--map').then(function(map) {

                //
                // Add draw toolbar
                //

                var drawControls = new L.Control.Draw({
                    draw: {
                        circle: false,
                        circlemarker: false,
                        rectangle: false
                    },
                    edit: {
                        featureGroup: self.editableLayers
                    }
                });

                console.log('drawControls', drawControls);

                map.addControl(drawControls);

                var drawnItems = drawControls.options.edit.featureGroup;

                // Init the map with the saved elements
                var printLayers = function() {
                    // console.log("After: ");
                    map.eachLayer(function(layer) {
                        console.log('Existing layer', layer);
                    });
                };

                drawnItems.addTo(map);
                printLayers();

                map.on('draw:created', function(e) {

                    var layer = e.layer;

                    //
                    // Sites must only have one geometry feature
                    //

                    drawnItems.clearLayers();
                    drawnItems.addLayer(layer);
                    console.log('Layer added', JSON.stringify(layer.toGeoJSON()));

                    self.savedObjects = [{
                        id: layer._leaflet_id,
                        geoJson: layer.toGeoJSON()
                    }];

                    // map.fitBounds(drawnItems.getBounds(), {
                    //     padding: [20, 20],
                    //     maxZoom: 18
                    // });

                });

                map.on('draw:edited', function(e) {

                    var layers = e.layers;

                    console.log('map.draw:edited', layers);

                    // self.savedObjects = [{
                    //     id: layers[0]._leaflet_id,
                    //     geoJson: layers[0].toGeoJSON()
                    // }];

                    // console.log('Layer changed', JSON.stringify(layers[0].toGeoJSON()));

                    layers.eachLayer(function(layer) {

                        self.savedObjects = [{
                            id: layer._leaflet_id,
                            geoJson: layer.toGeoJSON()
                        }];

                        // for (var i = 0; i < self.savedObjects.length; i++) {
                        //     if (self.savedObjects[i].id == layer._leaflet_id) {
                        //         console.log('draw:edited layer match', self.savedObjects[i].id, layer._leaflet_id);
                        //         self.savedObjects[i].geoJson = layer.toGeoJSON();
                        //     }
                        // }

                        console.log('Layer changed', layer._leaflet_id, JSON.stringify(layer.toGeoJSON()));

                    });

                    // map.fitBounds(drawnItems.getBounds(), {
                    //     padding: [20, 20],
                    //     maxZoom: 18
                    // });

                });

                map.on('draw:deleted', function(e) {

                    var layers = e.layers;

                    layers.eachLayer(function(layer) {

                        for (var i = 0; i < self.savedObjects.length; i++) {
                            if (self.savedObjects[i].id == layer._leaflet_id) {
                                self.savedObjects.splice(i, 1);
                            }
                        }

                        console.log('Layer removed', JSON.stringify(layer.toGeoJSON()));

                    });

                    self.savedObjects = [];

                    console.log('Saved objects', self.savedObjects);

                });

                map.on('layeradd', function(e) {

                    console.log('map:layeradd', e);

                    if (e.layer.getBounds) {

                        map.fitBounds(e.layer.getBounds(), {
                            padding: [20, 20],
                            maxZoom: 18
                        });

                    }

                });

                map.on('zoomend', function(e) {

                    console.log('map:zoomend', map.getZoom());

                });

                // leafletData.getLayers().then(function(baselayers) {
                //     var drawnItems = baselayers.overlays.draw;
                //     map.on('draw:created', function(e) {
                //         var layer = e.layer;
                //         drawnItems.addLayer(layer);
                //         console.log(JSON.stringify(layer.toGeoJSON()));
                //     });
                // });

                //
                // Update the pin and segment information when the user clicks on the map
                // or drags the pin to a new location
                //
                $scope.$on('leafletDirectiveMap.click', function(event, args) {
                    self.processPin(args.leafletEvent.latlng, map._zoom);
                });

                $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
                    self.processPin(args.leafletEvent.latlng, map._zoom + 1);
                });

                $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
                    self.processPin(args.leafletEvent.target._latlng, map._zoom);
                });

                $scope.$on('leafletDirectiveMarker.dblclick', function(event, args) {
                    var zoom = map._zoom + 1;
                    map.setZoom(zoom);
                });

            });

        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteSummaryCtrl
     * @description
     */
    angular.module('FieldDoc')
        .controller('SiteGeographyCtrl',
            function(Account, $location, $window, $timeout, $rootScope, $scope,
                $route, nodes, user, Utility, site, Site, Practice) {

                var self = this;

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.status = {
                    'loading': true
                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path(self.site.links.project.html);

                }

                self.confirmDelete = function(obj, targetCollection) {

                    console.log('self.confirmDelete', obj, targetCollection);

                    if (self.deletionTarget &&
                        self.deletionTarget.collection === 'site') {

                        self.cancelDelete();

                    } else {

                        self.deletionTarget = {
                            'collection': targetCollection,
                            'feature': obj
                        };

                    }

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.deleteFeature = function(featureType, index) {

                    console.log('self.deleteFeature', featureType, index);

                    var targetCollection,
                        targetId;

                    switch (featureType) {

                        case 'practice':

                            targetCollection = Practice;

                            break;

                        default:

                            targetCollection = Site;

                            break;

                    }

                    if (self.deletionTarget.feature.properties) {

                        targetId = self.deletionTarget.feature.properties.id;

                    } else {

                        targetId = self.deletionTarget.feature.id;

                    }

                    targetCollection.delete({
                        id: +targetId
                    }).$promise.then(function(data) {

                        self.alerts.push({
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this ' + featureType + '.',
                            'prompt': 'OK'
                        });

                        if (index !== null &&
                            typeof index === 'number' &&
                            featureType === 'practice') {

                            self.practices.splice(index, 1);

                            self.cancelDelete();

                            $timeout(closeAlerts, 2000);

                        } else {

                            $timeout(closeRoute, 2000);

                        }

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + self.deletionTarget.feature.properties.name + '”. There are pending tasks affecting this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        } else if (errorResponse.status === 403) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'You don’t have permission to delete this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        } else {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Something went wrong while attempting to delete this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        }

                        $timeout(closeAlerts, 2000);

                    });

                };

                self.buildStaticMapURL = function(geometry) {

                    var styledFeature = {
                        "type": "Feature",
                        "geometry": geometry,
                        "properties": {
                            "marker-size": "small",
                            "marker-color": "#2196F3",
                            "stroke": "#2196F3",
                            "stroke-opacity": 1.0,
                            "stroke-width": 2,
                            "fill": "#2196F3",
                            "fill-opacity": 0.5
                        }
                    };

                    // Build static map URL for Mapbox API

                    return 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/geojson(' + encodeURIComponent(JSON.stringify(styledFeature)) + ')/auto/400x200@2x?access_token=pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw';

                };

                self.processCollection = function(arr) {

                    arr.forEach(function(feature) {

                        if (feature.geometry !== null) {

                            feature.staticURL = self.buildStaticMapURL(feature.geometry);

                        }

                    });

                };

                self.loadSite = function() {

                    site.$promise.then(function(successResponse) {

                        console.log('self.site', successResponse);

                        self.site = successResponse;

                        if (self.site.geometry !== null) {

                            self.site.staticURL = self.buildStaticMapURL(self.site.geometry);

                        }

                        self.permissions.can_edit = Account.canEdit(self.site);

                        $rootScope.page.title = self.site.properties.name;

                        self.project = successResponse.properties.project;

                        console.log('self.project', self.project);

                        self.status.loading = false;

                        //
                        // Load spatial nodes
                        //

                        nodes.$promise.then(function(successResponse) {

                            console.log('self.nodes', successResponse);

                            for (var collection in successResponse) {

                                if (successResponse.hasOwnProperty(collection) &&
                                    Array.isArray(successResponse[collection])) {

                                    self.processCollection(successResponse[collection]);

                                }

                            }

                            self.nodes = successResponse;

                        }, function(errorResponse) {

                        });

                    });

                };

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {

                    user.$promise.then(function(userResponse) {

                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                        };

                        self.loadSite();

                    });

                }

            });

})();
'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
    .config(function($routeProvider) {

        $routeProvider
            .when('/practices/:practiceId', {
                templateUrl: '/modules/components/practices/views/summary--view.html',
                controller: 'CustomSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    metrics: function(Practice, $route) {
                        return Practice.metrics({
                            id: $route.current.params.practiceId
                        });
                    },
                    outcomes: function(Practice, $route) {
                        return Practice.outcomes({
                            id: $route.current.params.practiceId
                        });
                    },
                    practice: function(Practice, $route) {
                        return Practice.get({
                            id: $route.current.params.practiceId
                        });
                    }
                }
            })
            .when('/practices/:practiceId/:reportId/edit', {
                templateUrl: '/modules/components/practices/views/edit--view.html',
                controller: 'CustomFormController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    practice: function(Practice, $route) {
                        return Practice.get({
                            id: $route.current.params.practiceId
                        });
                    },
                    report: function(PracticeCustom, $route) {
                        return PracticeCustom.get({
                            id: $route.current.params.reportId
                        });
                    },
                    report_metrics: function(PracticeCustom, $route) {
                        return PracticeCustom.metrics({
                            id: $route.current.params.reportId
                        });
                    },
                    practice_types: function(PracticeType, $route) {
                        return PracticeType.query({
                            results_per_page: 500
                        });
                    },
                    metric_types: function(MetricType, $route) {
                        return MetricType.query({
                            results_per_page: 500
                        });
                    },
                    monitoring_types: function(MonitoringType, $route) {
                        return MonitoringType.query({
                            results_per_page: 500
                        });
                    },
                    unit_types: function(UnitType, $route) {
                        return UnitType.query({
                            results_per_page: 500
                        });
                    }

                }
            })
            .when('/practices/:practiceId/edit', {
                templateUrl: '/modules/components/practices/views/practiceEdit--view.html',
                controller: 'PracticeEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    site: function(Practice, $route) {
                        return Practice.site({
                            id: $route.current.params.practiceId
                        });
                    },
                    practice_types: function(PracticeType, $route) {
                        return PracticeType.query({
                            results_per_page: 500
                        });
                    },
                    practice: function(Practice, $route) {
                        return Practice.get({
                            id: $route.current.params.practiceId
                        });
                    }
                }
            })
            .when('/practices/:practiceId/location', {
                templateUrl: '/modules/components/practices/views/practiceLocation--view.html',
                controller: 'PracticeLocationController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    site: function(Practice, $route) {
                        return Practice.site({
                            id: $route.current.params.practiceId
                        });
                    },
                    practice_types: function(PracticeType, $route) {
                        return PracticeType.query({
                            results_per_page: 500
                        });
                    },
                    practice: function(Practice, $route) {
                        return Practice.get({
                            id: $route.current.params.practiceId
                        });
                    }
                }
            })
            .when('/practices/:practiceId/photos', {
                templateUrl: '/modules/components/practices/views/practicePhoto--view.html',
                controller: 'PracticePhotoController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    site: function(Practice, $route) {
                        return Practice.site({
                            id: $route.current.params.practiceId
                        });
                    },
                    practice_types: function(PracticeType, $route) {
                        return PracticeType.query({
                            results_per_page: 500
                        });
                    },
                    practice: function(Practice, $route) {
                        return Practice.get({
                            id: $route.current.params.practiceId
                        });
                    }
                }
            });

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeEditController', function(Account, Image, leafletData, $location, $log, Map,
        mapbox, Media, Practice, practice, practice_types, $q, $rootScope, $route,
        $scope, $timeout, $interval, site, user, Shapefile, leafletBoundsHelpers) {

        var self = this;

        $rootScope.toolbarState = {
            'edit': true
        };

        // self.practiceTypes = practice_types;

        self.files = Media;
        self.files.images = [];

        self.map = JSON.parse(JSON.stringify(Map));

        self.savedObjects = [];

        self.editableLayers = new L.FeatureGroup();

        //
        // Set default image path for Leaflet iconography
        //

        L.Icon.Default.imagePath = '/images/leaflet';

        function addNonGroupLayers(sourceLayer, targetGroup) {
            if (sourceLayer instanceof L.LayerGroup) {
                sourceLayer.eachLayer(function(layer) {
                    addNonGroupLayers(layer, targetGroup);
                });
            } else {
                targetGroup.addLayer(sourceLayer);
            }
        }

        self.setGeoJsonLayer = function(data) {

            self.editableLayers.clearLayers();

            var siteGeometry = L.geoJson(data, {});

            addNonGroupLayers(siteGeometry, self.editableLayers);

            self.savedObjects = [{
                id: self.editableLayers._leaflet_id,
                geoJson: data
            }];

            console.log('self.savedObjects', self.savedObjects);

        };

        //
        // We use this function for handle any type of geographic change, whether
        // through the map or through the fields
        //

        self.processPin = function(coordinates, zoom) {

            if (coordinates.lat === null || coordinates.lat === undefined || coordinates.lng === null || coordinates.lng === undefined) {
                return;
            }

            self.map.center = {
                lat: coordinates.lat,
                lng: coordinates.lng,
                zoom: (zoom < 10) ? 10 : zoom
            };

            self.showGeocoder = false;
        };

        //
        // Empty Geocode object
        //
        // We need to have an empty geocode object so that we can fill it in later
        // in the address geocoding process. This allows us to pass the results along
        // to the Form Submit function we have in place below.
        //
        self.geocode = {};

        //
        // When the user has selected a response, we need to perform a few extra
        // tasks so that our scope is updated properly.
        //

        $scope.$watch(angular.bind(this, function() {
            return this.geocode.response;
        }), function(response) {

            //
            // Only execute the following block of code if the user has geocoded an
            // address. This block of code expects this to be a single feature from a
            // Carmen GeoJSON object.
            //
            // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
            //
            if (response) {

                self.processPin({
                    lat: response.geometry.coordinates[1],
                    lng: response.geometry.coordinates[0]
                }, 16);

                self.geocode = {
                    query: null,
                    response: null
                };
            }

        });

        self.removeImage = function(image) {

            if (self.practice.properties.images.length !== 0) {
                var _image_index = self.practice.properties.images.indexOf(image);
                self.practice.properties.images.splice(_image_index, 1);
            }

            return;
        };

        $rootScope.page = {};

        self.loadSite = function() {

            site.$promise.then(function(successResponse) {

                console.log('self.site', successResponse);

                self.site = successResponse;

                if (self.site.geometry) {

                    leafletData.getMap('practice--map').then(function(map) {

                        var siteExtent = new L.FeatureGroup();

                        var siteGeometry = L.geoJson(successResponse, {});

                        siteExtent.addLayer(siteGeometry);

                        map.fitBounds(siteExtent.getBounds(), {
                            maxZoom: 18
                        });

                    });

                }

                self.loadPractice();

            }, function(errorResponse) {

                //

            });

        };

        self.loadPractice = function() {

            practice.$promise.then(function(successResponse) {

                console.log('self.practice', successResponse);

                self.practice = successResponse;

                delete self.practice.properties.organization;
                delete self.practice.properties.project;
                delete self.practice.properties.site;

                self.practiceType = successResponse.properties.category;

                $rootScope.page.title = self.practice.properties.name ? self.practice.properties.name : 'Un-named Practice';

                //
                // If a valid practice geometry is present, add it to the map
                // and track the object in `self.savedObjects`.
                //

                if (self.practice.geometry !== null &&
                    typeof self.practice.geometry !== 'undefined') {

                    //Added by Lin 
                    leafletData.getMap('practice--map').then(function(map) {

                        self.practiceExtent = new L.FeatureGroup();

                        self.setGeoJsonLayer(self.practice.geometry);

                        map.fitBounds(self.editableLayers.getBounds(), {
                            // padding: [20, 20],
                            maxZoom: 18
                        });

                    });

                    self.map.geojson = {
                        data: self.practice.geometry
                    };
                    //existing
                    // var practiceGeometry = L.geoJson(self.practice.geometry, {});

                    // addNonGroupLayers(practiceGeometry, self.editableLayers);

                    self.savedObjects = [{
                        id: self.editableLayers._leaflet_id,
                        geoJson: self.practice.geometry
                    }];
                    console.log('self.practice.geometry', self.practice.geometry);

                    console.log('self.savedObjects', self.savedObjects);

                    var rawGeometry = self.practice.geometry.geometries[0];

                    console.log('rawGeometry', rawGeometry);

                }

            }, function(errorResponse) {
                //
            });

        };

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: true
                };

                self.loadSite();

            });

        }

        self.uploadShapefile = function() {

            if (!self.shapefile ||
                !self.shapefile.length) {

                $rootScope.notifications.warning('Uh-oh!', 'You forgot to add a file.');

                $timeout(function() {
                    $rootScope.notifications.objects = [];
                }, 1200);

                return false;

            }

            // self.status.saving.action = true;

            if (self.shapefile) {

                self.progressMessage = 'Uploading your file...';

                var fileData = new FormData();

                fileData.append('file', self.shapefile[0]);

                console.log('fileData', fileData);

                self.fillMeter = $interval(function() {

                    var tempValue = (self.progressValue || 10) * 0.50;

                    if (!self.progressValue) {

                        self.progressValue = tempValue;

                    } else if ((100 - tempValue) > self.progressValue) {

                        self.progressValue += tempValue;

                    }

                    console.log('progressValue', self.progressValue);

                    if (self.progressValue > 75) {

                        self.progressMessage = 'Analyzing data...';

                    }

                }, 100);

                console.log('Shapefile', Shapefile);

                try {

                    Shapefile.upload({}, fileData, function(shapefileResponse) {

                        console.log('shapefileResponse', shapefileResponse);

                        self.progressValue = 100;

                        self.progressMessage = 'Upload successful, rendering shape...';

                        $interval.cancel(self.fillMeter);

                        $timeout(function() {

                            self.progressValue = null;

                            if (shapefileResponse.msg.length) {

                                console.log('Shapefile --> GeoJSON', shapefileResponse.msg[0]);

                                if (shapefileResponse.msg[0] !== null &&
                                    typeof shapefileResponse.msg[0].geometry !== 'undefined') {

                                    self.setGeoJsonLayer(shapefileResponse.msg[0]);

                                }

                            }

                        }, 1600);

                        self.error = null;

                    }, function(errorResponse) {

                        console.log(errorResponse);

                        $interval.cancel(self.fillMeter);

                        self.progressValue = null;

                        $rootScope.notifications.error('', 'An error occurred and we couldn\'t process your file.');

                        $timeout(function() {
                            $rootScope.notifications.objects = [];
                        }, 2000);

                        return;

                    });

                } catch (error) {

                    console.log('Shapefile upload error', error);

                }

            }

        };

        self.savePractice = function() {

            self.practice.geometry = {
                type: 'GeometryCollection',
                geometries: []
            };

            if (self.savedObjects.length) {

                self.savedObjects.forEach(function(object) {

                    console.log('Iterating self.savedObjects', object);

                    if (object.geoJson.geometry) {

                        self.practice.geometry.geometries.push(object.geoJson.geometry);

                    } else {

                        self.practice.geometry = object.geoJson;

                    }

                });

            } else {

                self.practice.geometry.geometries.push({
                    type: 'Point',
                    coordinates: [-98.5795,
                        39.828175
                    ]
                });

            }

            if (self.files.images.length) {

                var savedQueries = self.files.preupload(self.files.images);

                $q.all(savedQueries).then(function(successResponse) {

                    $log.log('Images::successResponse', successResponse);

                    angular.forEach(successResponse, function(image) {
                        self.practice.properties.images.push({
                            id: image.id
                        });
                    });

                    self.practice.$update().then(function(successResponse) {

                        $location.path('/practices/' + self.practice.id);

                    }, function(errorResponse) {

                        // Error message

                    });

                }, function(errorResponse) {

                    $log.log('errorResponse', errorResponse);

                });

            } else {

                self.practice.$update().then(function(successResponse) {

                    $location.path('/practices/' + self.practice.id);

                }, function(errorResponse) {

                    // Error message

                });

            }

        };

        self.alerts = [];

        function closeAlerts() {

            self.alerts = [];

        }

        function closeRoute() {

            $location.path(self.practice.links.site.html);

        }

        self.confirmDelete = function(obj) {

            console.log('self.confirmDelete', obj);

            self.deletionTarget = self.deletionTarget ? null : obj;

        };

        self.cancelDelete = function() {

            self.deletionTarget = null;

        };

        self.deleteFeature = function() {

            Practice.delete({
                id: +self.deletionTarget.id
            }).$promise.then(function(data) {

                self.alerts.push({
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Successfully deleted this practice.',
                    'prompt': 'OK'
                });

                $timeout(closeRoute, 2000);

            }).catch(function(errorResponse) {

                console.log('self.deleteFeature.errorResponse', errorResponse);

                if (errorResponse.status === 409) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this practice.',
                        'prompt': 'OK'
                    }];

                } else if (errorResponse.status === 403) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'You don’t have permission to delete this practice.',
                        'prompt': 'OK'
                    }];

                } else {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong while attempting to delete this practice.',
                        'prompt': 'OK'
                    }];

                }

                $timeout(closeAlerts, 2000);

            });

        };

        //
        // Define a layer to add geometries to later
        //
        var featureGroup = new L.FeatureGroup();

        //
        // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
        //
        self.geojsonToLayer = function(geojson, layer) {
            layer.clearLayers();

            function add(l) {
                l.addTo(layer);
            }

            //
            // Make sure the GeoJSON object is added to the layer with appropriate styles
            //
            L.geoJson(geojson, {
                style: {
                    stroke: true,
                    fill: false,
                    weight: 2,
                    opacity: 1,
                    color: 'rgb(255,255,255)',
                    lineCap: 'square'
                }
            }).eachLayer(add);
        };

        //
        // Define our map interactions via the Angular Leaflet Directive
        //
        leafletData.getMap('practice--map').then(function(map) {

            //
            // Add draw toolbar
            //

            var drawControls = new L.Control.Draw({
                draw: {
                    circle: false,
                    circlemarker: false,
                    rectangle: false
                },
                edit: {
                    featureGroup: self.editableLayers
                }
            });

            console.log('drawControls', drawControls);

            map.addControl(drawControls);

            var drawnItems = drawControls.options.edit.featureGroup;

            // map.fitBounds(self.editableLayers.getBounds());

            // if (drawnItems.getLayers().length > 1) {

            //     map.fitBounds(drawnItems.getBounds());

            // }

            // Init the map with the saved elements
            var printLayers = function() {
                // console.log("After: ");
                map.eachLayer(function(layer) {
                    console.log('Existing layer', layer);
                });
            };

            drawnItems.addTo(map);
            printLayers();

            map.on('draw:created', function(e) {

                var layer = e.layer;

                //
                // Sites must only have one geometry feature
                //

                drawnItems.clearLayers();
                drawnItems.addLayer(layer);
                console.log('Layer added', JSON.stringify(layer.toGeoJSON()));

                self.savedObjects = [{
                    id: layer._leaflet_id,
                    geoJson: layer.toGeoJSON()
                }];

            });

            map.on('draw:edited', function(e) {

                var layers = e.layers;

                console.log('map.draw:edited', layers);

                layers.eachLayer(function(layer) {

                    self.savedObjects = [{
                        id: layer._leaflet_id,
                        geoJson: layer.toGeoJSON()
                    }];

                    console.log('Layer changed', layer._leaflet_id, JSON.stringify(layer.toGeoJSON()));

                });

            });

            map.on('draw:deleted', function(e) {

                var layers = e.layers;

                layers.eachLayer(function(layer) {

                    for (var i = 0; i < self.savedObjects.length; i++) {
                        if (self.savedObjects[i].id == layer._leaflet_id) {
                            self.savedObjects.splice(i, 1);
                        }
                    }

                    console.log('Layer removed', JSON.stringify(layer.toGeoJSON()));

                });

                self.savedObjects = [];

                console.log('Saved objects', self.savedObjects);

            });

            map.on('layeradd', function(e) {

                console.log('map:layeradd', e);

                if (e.layer.getBounds) {

                    map.fitBounds(e.layer.getBounds(), {
                        padding: [20, 20],
                        maxZoom: 18
                    });

                }

            });

            map.on('zoomend', function(e) {

                console.log('map:zoomend', map.getZoom());

            });

            //
            // Update the pin and segment information when the user clicks on the map
            // or drags the pin to a new location
            //
            $scope.$on('leafletDirectiveMap.click', function(event, args) {
                self.processPin(args.leafletEvent.latlng, map._zoom);
            });

            $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
                self.processPin(args.leafletEvent.latlng, map._zoom + 1);
            });

            $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
                self.processPin(args.leafletEvent.target._latlng, map._zoom);
            });

            $scope.$on('leafletDirectiveMarker.dblclick', function(event, args) {
                var zoom = map._zoom + 1;
                map.setZoom(zoom);
            });

        });

        self.setPracticeType = function($item,$model,$label) {

            console.log('self.practiceType', $item);

            self.practice.properties.category_id = $item.id;

        };

        //
        // Load practices
        //

        practice_types.$promise.then(function(successResponse) {

            console.log('self.practiceTypes', successResponse);

            var _practiceTypes = [];

            successResponse.features.forEach(function(feature) {

                _practiceTypes.push(feature.properties);

            });

            self.practiceTypes = _practiceTypes;

        }, function(errorResponse) {

        });

    });
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('CustomSummaryController', [
            'Account',
            '$location',
            '$timeout',
            '$log',
            'PracticeCustom',
            '$rootScope',
            '$route',
            'Utility',
            'user',
            'Project',
            'Site',
            '$window',
            'Map',
            'mapbox',
            'leafletData',
            'leafletBoundsHelpers',
            'Practice',
            'metrics',
            'outcomes',
            'practice',
            function(Account, $location, $timeout, $log, PracticeCustom, $rootScope,
                $route, Utility, user, Project, Site, $window, Map, mapbox,
                leafletData, leafletBoundsHelpers, Practice, metrics, outcomes, practice) {

                var self = this,
                    practiceId = $route.current.params.practiceId;

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.map = JSON.parse(JSON.stringify(Map));

                self.status = {
                    loading: true
                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path(self.practice.links.site.html);

                }

                self.confirmDelete = function(obj, targetCollection) {

                    console.log('self.confirmDelete', obj, targetCollection);

                    if (self.deletionTarget &&
                        self.deletionTarget.collection === 'practice') {

                        self.cancelDelete();

                    } else {

                        self.deletionTarget = {
                            'collection': targetCollection,
                            'feature': obj
                        };

                    }

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.deleteFeature = function(featureType, index) {

                    console.log('self.deleteFeature', featureType, index);

                    var targetCollection;

                    switch (featureType) {

                        case 'report':

                            targetCollection = PracticeCustom;

                            break;

                        default:

                            targetCollection = Practice;

                            break;

                    }

                    targetCollection.delete({
                        id: +self.deletionTarget.feature.id
                    }).$promise.then(function(data) {

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                        if (index !== null &&
                            typeof index === 'number' &&
                            featureType === 'report') {

                            self.practice.properties.readings_custom.splice(index, 1);

                            self.cancelDelete();

                            $timeout(closeAlerts, 2000);

                            if (index === 0) {

                                $route.reload();

                            }

                        } else {

                            $timeout(closeRoute, 2000);

                        }

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete this ' + featureType + '. There are pending tasks affecting this feature.',
                                'prompt': 'OK'
                            }];

                        } else if (errorResponse.status === 403) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'You don’t have permission to delete this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        } else {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Something went wrong while attempting to delete this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        }

                        $timeout(closeAlerts, 2000);

                    });

                };

                function addNonGroupLayers(sourceLayer, targetGroup) {

                    if (sourceLayer instanceof L.LayerGroup) {

                        sourceLayer.eachLayer(function(layer) {

                            addNonGroupLayers(layer, targetGroup);

                        });

                    } else {

                        targetGroup.addLayer(sourceLayer);

                    }

                }

                self.setGeoJsonLayer = function(data, layerGroup, clearLayers) {

                    if (clearLayers) {

                        layerGroup.clearLayers();

                    }

                    var featureGeometry = L.geoJson(data, {});

                    addNonGroupLayers(featureGeometry, layerGroup);

                };

                self.loadPractice = function() {

                    practice.$promise.then(function(successResponse) {

                        console.log('self.practice', successResponse);

                        self.practice = successResponse;

                        $rootScope.page.title = self.practice.properties.name ? self.practice.properties.name : 'Un-named Practice';

                        //
                        // If a valid practice geometry is present, add it to the map
                        // and track the object in `self.savedObjects`.
                        //

                        if (self.practice.geometry !== null &&
                            typeof self.practice.geometry !== 'undefined') {

                            leafletData.getMap('practice--map').then(function(map) {

                                self.practiceExtent = new L.FeatureGroup();

                                self.setGeoJsonLayer(self.practice.geometry.geometries[0], self.practiceExtent);

                                map.fitBounds(self.practiceExtent.getBounds(), {
                                    maxZoom: 18
                                });

                            });

                            self.map.geojson = {
                                data: self.practice.geometry.geometries[0]
                            };

                        }

                        self.status.loading = false;

                    }, function(errorResponse) {



                    });

                };

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {

                    user.$promise.then(function(userResponse) {

                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[
                                0].properties.name,
                            account: ($rootScope.account &&
                                    $rootScope.account.length) ?
                                $rootScope.account[0] : null,
                            can_edit: true
                        };

                        self.loadPractice();

                        self.loadMetrics();

                        self.loadOutcomes();

                    });
                }

                self.addReading = function(measurementPeriod) {

                    var newReading = new PracticeCustom({
                        'measurement_period': 'Planning',
                        'report_date': new Date(),
                        'practice_id': practiceId,
                        'organization_id': self.practice.properties.organization_id
                    });

                    newReading.$save().then(function(successResponse) {

                        $location.path('/practices/' + practiceId +
                            '/' + successResponse.id + '/edit');

                    }, function(errorResponse) {

                        console.error('ERROR: ', errorResponse);

                    });

                };

                self.loadMetrics = function() {

                    metrics.$promise.then(function(successResponse) {

                        console.log('Project metrics', successResponse);

                        successResponse.features.forEach(function(metric) {

                            var _percentComplete = +((metric.installation/metric.planning)*100).toFixed(0);

                            metric.percentComplete = _percentComplete;

                        });

                        self.metrics = successResponse.features;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                };

                self.loadOutcomes = function() {

                    outcomes.$promise.then(function(successResponse) {

                        console.log('Project outcomes', successResponse);

                        self.outcomes = successResponse;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                };

            }
        ]);

}());
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeLocationController', function(Account, Image, leafletData, $location, $log, Map,
        mapbox, Media, Practice, practice, practice_types, $q, $rootScope, $route,
        $scope, $timeout, $interval, site, user, Shapefile, leafletBoundsHelpers) {

        var self = this;

        $rootScope.toolbarState = {
            'editLocation': true
        };

        // self.practiceTypes = practice_types;

        self.files = Media;
        self.files.images = [];

        self.map = JSON.parse(JSON.stringify(Map));

        self.savedObjects = [];

        self.editableLayers = new L.FeatureGroup();

        //
        // Set default image path for Leaflet iconography
        //

        L.Icon.Default.imagePath = '/images/leaflet';

        function addNonGroupLayers(sourceLayer, targetGroup) {
            if (sourceLayer instanceof L.LayerGroup) {
                sourceLayer.eachLayer(function(layer) {
                    addNonGroupLayers(layer, targetGroup);
                });
            } else {
                targetGroup.addLayer(sourceLayer);
            }
        }

        self.setGeoJsonLayer = function(data) {

            self.editableLayers.clearLayers();

            var siteGeometry = L.geoJson(data, {});

            addNonGroupLayers(siteGeometry, self.editableLayers);

            self.savedObjects = [{
                id: self.editableLayers._leaflet_id,
                geoJson: data
            }];

            console.log('self.savedObjects', self.savedObjects);

        };

        //
        // We use this function for handle any type of geographic change, whether
        // through the map or through the fields
        //

        self.processPin = function(coordinates, zoom) {

            if (coordinates.lat === null || coordinates.lat === undefined || coordinates.lng === null || coordinates.lng === undefined) {
                return;
            }

            self.map.center = {
                lat: coordinates.lat,
                lng: coordinates.lng,
                zoom: (zoom < 10) ? 10 : zoom
            };

            self.showGeocoder = false;
        };

        //
        // Empty Geocode object
        //
        // We need to have an empty geocode object so that we can fill it in later
        // in the address geocoding process. This allows us to pass the results along
        // to the Form Submit function we have in place below.
        //
        self.geocode = {};

        //
        // When the user has selected a response, we need to perform a few extra
        // tasks so that our scope is updated properly.
        //

        $scope.$watch(angular.bind(this, function() {
            return this.geocode.response;
        }), function(response) {

            //
            // Only execute the following block of code if the user has geocoded an
            // address. This block of code expects this to be a single feature from a
            // Carmen GeoJSON object.
            //
            // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
            //
            if (response) {

                self.processPin({
                    lat: response.geometry.coordinates[1],
                    lng: response.geometry.coordinates[0]
                }, 16);

                self.geocode = {
                    query: null,
                    response: null
                };
            }

        });

        self.removeImage = function(image) {

            if (self.practice.properties.images.length !== 0) {
                var _image_index = self.practice.properties.images.indexOf(image);
                self.practice.properties.images.splice(_image_index, 1);
            }

            return;
        };

        $rootScope.page = {};

        self.loadSite = function() {

            site.$promise.then(function(successResponse) {

                console.log('self.site', successResponse);

                self.site = successResponse;

                if (self.site.geometry) {

                    leafletData.getMap('practice--map').then(function(map) {

                        var siteExtent = new L.FeatureGroup();

                        var siteGeometry = L.geoJson(successResponse, {});

                        siteExtent.addLayer(siteGeometry);

                        map.fitBounds(siteExtent.getBounds(), {
                            maxZoom: 18
                        });

                    });

                }

                self.loadPractice();

            }, function(errorResponse) {

                //

            });

        };

        self.loadPractice = function() {

            practice.$promise.then(function(successResponse) {

                console.log('self.practice', successResponse);

                self.practice = successResponse;

                delete self.practice.properties.organization;
                delete self.practice.properties.project;
                delete self.practice.properties.site;

                self.practiceType = successResponse.properties.category;

                $rootScope.page.title = self.practice.properties.name ? self.practice.properties.name : 'Un-named Practice';

                //
                // If a valid practice geometry is present, add it to the map
                // and track the object in `self.savedObjects`.
                //

                if (self.practice.geometry !== null &&
                    typeof self.practice.geometry !== 'undefined') {

                    //Added by Lin 
                    leafletData.getMap('practice--map').then(function(map) {

                        self.practiceExtent = new L.FeatureGroup();

                        self.setGeoJsonLayer(self.practice.geometry);

                        map.fitBounds(self.editableLayers.getBounds(), {
                            // padding: [20, 20],
                            maxZoom: 18
                        });

                    });

                    self.map.geojson = {
                        data: self.practice.geometry
                    };
                    //existing
                    // var practiceGeometry = L.geoJson(self.practice.geometry, {});

                    // addNonGroupLayers(practiceGeometry, self.editableLayers);

                    self.savedObjects = [{
                        id: self.editableLayers._leaflet_id,
                        geoJson: self.practice.geometry
                    }];
                    console.log('self.practice.geometry', self.practice.geometry);

                    console.log('self.savedObjects', self.savedObjects);

                    var rawGeometry = self.practice.geometry.geometries[0];

                    console.log('rawGeometry', rawGeometry);

                }

            }, function(errorResponse) {
                //
            });

        };

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: true
                };

                self.loadSite();

            });

        }

        self.uploadShapefile = function() {

            if (!self.shapefile ||
                !self.shapefile.length) {

                $rootScope.notifications.warning('Uh-oh!', 'You forgot to add a file.');

                $timeout(function() {
                    $rootScope.notifications.objects = [];
                }, 1200);

                return false;

            }

            // self.status.saving.action = true;

            if (self.shapefile) {

                self.progressMessage = 'Uploading your file...';

                var fileData = new FormData();

                fileData.append('file', self.shapefile[0]);

                console.log('fileData', fileData);

                self.fillMeter = $interval(function() {

                    var tempValue = (self.progressValue || 10) * 0.50;

                    if (!self.progressValue) {

                        self.progressValue = tempValue;

                    } else if ((100 - tempValue) > self.progressValue) {

                        self.progressValue += tempValue;

                    }

                    console.log('progressValue', self.progressValue);

                    if (self.progressValue > 75) {

                        self.progressMessage = 'Analyzing data...';

                    }

                }, 100);

                console.log('Shapefile', Shapefile);

                try {

                    Shapefile.upload({}, fileData, function(shapefileResponse) {

                        console.log('shapefileResponse', shapefileResponse);

                        self.progressValue = 100;

                        self.progressMessage = 'Upload successful, rendering shape...';

                        $interval.cancel(self.fillMeter);

                        $timeout(function() {

                            self.progressValue = null;

                            if (shapefileResponse.msg.length) {

                                console.log('Shapefile --> GeoJSON', shapefileResponse.msg[0]);

                                if (shapefileResponse.msg[0] !== null &&
                                    typeof shapefileResponse.msg[0].geometry !== 'undefined') {

                                    self.setGeoJsonLayer(shapefileResponse.msg[0]);

                                }

                            }

                        }, 1600);

                        self.error = null;

                    }, function(errorResponse) {

                        console.log(errorResponse);

                        $interval.cancel(self.fillMeter);

                        self.progressValue = null;

                        $rootScope.notifications.error('', 'An error occurred and we couldn\'t process your file.');

                        $timeout(function() {
                            $rootScope.notifications.objects = [];
                        }, 2000);

                        return;

                    });

                } catch (error) {

                    console.log('Shapefile upload error', error);

                }

            }

        };

        self.savePractice = function() {

            self.practice.geometry = {
                type: 'GeometryCollection',
                geometries: []
            };

            if (self.savedObjects.length) {

                self.savedObjects.forEach(function(object) {

                    console.log('Iterating self.savedObjects', object);

                    if (object.geoJson.geometry) {

                        self.practice.geometry.geometries.push(object.geoJson.geometry);

                    } else {

                        self.practice.geometry = object.geoJson;

                    }

                });

            } else {

                self.practice.geometry.geometries.push({
                    type: 'Point',
                    coordinates: [-98.5795,
                        39.828175
                    ]
                });

            }

            if (self.files.images.length) {

                var savedQueries = self.files.preupload(self.files.images);

                $q.all(savedQueries).then(function(successResponse) {

                    $log.log('Images::successResponse', successResponse);

                    angular.forEach(successResponse, function(image) {
                        self.practice.properties.images.push({
                            id: image.id
                        });
                    });

                    self.practice.$update().then(function(successResponse) {

                        $location.path('/practices/' + self.practice.id);

                    }, function(errorResponse) {

                        // Error message

                    });

                }, function(errorResponse) {

                    $log.log('errorResponse', errorResponse);

                });

            } else {

                self.practice.$update().then(function(successResponse) {

                    $location.path('/practices/' + self.practice.id);

                }, function(errorResponse) {

                    // Error message

                });

            }

        };

        self.alerts = [];

        function closeAlerts() {

            self.alerts = [];

        }

        function closeRoute() {

            $location.path(self.practice.links.site.html);

        }

        self.confirmDelete = function(obj) {

            console.log('self.confirmDelete', obj);

            self.deletionTarget = self.deletionTarget ? null : obj;

        };

        self.cancelDelete = function() {

            self.deletionTarget = null;

        };

        self.deleteFeature = function() {

            Practice.delete({
                id: +self.deletionTarget.id
            }).$promise.then(function(data) {

                self.alerts.push({
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Successfully deleted this practice.',
                    'prompt': 'OK'
                });

                $timeout(closeRoute, 2000);

            }).catch(function(errorResponse) {

                console.log('self.deleteFeature.errorResponse', errorResponse);

                if (errorResponse.status === 409) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this practice.',
                        'prompt': 'OK'
                    }];

                } else if (errorResponse.status === 403) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'You don’t have permission to delete this practice.',
                        'prompt': 'OK'
                    }];

                } else {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong while attempting to delete this practice.',
                        'prompt': 'OK'
                    }];

                }

                $timeout(closeAlerts, 2000);

            });

        };

        //
        // Define a layer to add geometries to later
        //
        var featureGroup = new L.FeatureGroup();

        //
        // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
        //
        self.geojsonToLayer = function(geojson, layer) {
            layer.clearLayers();

            function add(l) {
                l.addTo(layer);
            }

            //
            // Make sure the GeoJSON object is added to the layer with appropriate styles
            //
            L.geoJson(geojson, {
                style: {
                    stroke: true,
                    fill: false,
                    weight: 2,
                    opacity: 1,
                    color: 'rgb(255,255,255)',
                    lineCap: 'square'
                }
            }).eachLayer(add);
        };

        //
        // Define our map interactions via the Angular Leaflet Directive
        //
        leafletData.getMap('practice--map').then(function(map) {

            //
            // Add draw toolbar
            //

            var drawControls = new L.Control.Draw({
                draw: {
                    circle: false,
                    circlemarker: false,
                    rectangle: false
                },
                edit: {
                    featureGroup: self.editableLayers
                }
            });

            console.log('drawControls', drawControls);

            map.addControl(drawControls);

            var drawnItems = drawControls.options.edit.featureGroup;

            // map.fitBounds(self.editableLayers.getBounds());

            // if (drawnItems.getLayers().length > 1) {

            //     map.fitBounds(drawnItems.getBounds());

            // }

            // Init the map with the saved elements
            var printLayers = function() {
                // console.log("After: ");
                map.eachLayer(function(layer) {
                    console.log('Existing layer', layer);
                });
            };

            drawnItems.addTo(map);
            printLayers();

            map.on('draw:created', function(e) {

                var layer = e.layer;

                //
                // Sites must only have one geometry feature
                //

                drawnItems.clearLayers();
                drawnItems.addLayer(layer);
                console.log('Layer added', JSON.stringify(layer.toGeoJSON()));

                self.savedObjects = [{
                    id: layer._leaflet_id,
                    geoJson: layer.toGeoJSON()
                }];

            });

            map.on('draw:edited', function(e) {

                var layers = e.layers;

                console.log('map.draw:edited', layers);

                layers.eachLayer(function(layer) {

                    self.savedObjects = [{
                        id: layer._leaflet_id,
                        geoJson: layer.toGeoJSON()
                    }];

                    console.log('Layer changed', layer._leaflet_id, JSON.stringify(layer.toGeoJSON()));

                });

            });

            map.on('draw:deleted', function(e) {

                var layers = e.layers;

                layers.eachLayer(function(layer) {

                    for (var i = 0; i < self.savedObjects.length; i++) {
                        if (self.savedObjects[i].id == layer._leaflet_id) {
                            self.savedObjects.splice(i, 1);
                        }
                    }

                    console.log('Layer removed', JSON.stringify(layer.toGeoJSON()));

                });

                self.savedObjects = [];

                console.log('Saved objects', self.savedObjects);

            });

            map.on('layeradd', function(e) {

                console.log('map:layeradd', e);

                if (e.layer.getBounds) {

                    map.fitBounds(e.layer.getBounds(), {
                        padding: [20, 20],
                        maxZoom: 18
                    });

                }

            });

            map.on('zoomend', function(e) {

                console.log('map:zoomend', map.getZoom());

            });

            //
            // Update the pin and segment information when the user clicks on the map
            // or drags the pin to a new location
            //
            $scope.$on('leafletDirectiveMap.click', function(event, args) {
                self.processPin(args.leafletEvent.latlng, map._zoom);
            });

            $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
                self.processPin(args.leafletEvent.latlng, map._zoom + 1);
            });

            $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
                self.processPin(args.leafletEvent.target._latlng, map._zoom);
            });

            $scope.$on('leafletDirectiveMarker.dblclick', function(event, args) {
                var zoom = map._zoom + 1;
                map.setZoom(zoom);
            });

        });

        self.setPracticeType = function($item,$model,$label) {

            console.log('self.practiceType', $item);

            self.practice.properties.category_id = $item.id;

        };

        //
        // Load practices
        //

        practice_types.$promise.then(function(successResponse) {

            console.log('self.practiceTypes', successResponse);

            var _practiceTypes = [];

            successResponse.features.forEach(function(feature) {

                _practiceTypes.push(feature.properties);

            });

            self.practiceTypes = _practiceTypes;

        }, function(errorResponse) {

        });

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticePhotoController', function(Account, Image, leafletData, $location, $log, Map,
        mapbox, Media, Practice, practice, practice_types, $q, $rootScope, $route,
        $scope, $timeout, $interval, site, user) {

        var self = this;

        $rootScope.toolbarState = {
            'editPhotos': true
        };

        self.files = Media;
        self.files.images = [];

        $rootScope.page = {};

        self.alerts = [];

        self.closeAlerts = function() {

            self.alerts = [];

        };

        self.closeRoute = function() {

            $location.path(self.practice.links.site.html);

        };

        self.loadPractice = function() {

            practice.$promise.then(function(successResponse) {

                console.log('self.practice', successResponse);

                self.practice = successResponse;

                delete self.practice.properties.organization;
                delete self.practice.properties.project;
                delete self.practice.properties.site;

                self.practiceType = successResponse.properties.category;

                $rootScope.page.title = self.practice.properties.name ? self.practice.properties.name : 'Un-named Practice';

            }, function(errorResponse) {

                //

            });

        };

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: true
                };

                self.loadPractice();

            });

        }

        self.savePractice = function() {

            var _images = [];

            self.practice.properties.images.forEach(function(image) {

                _images.push({
                    id: image.id
                });

            });

            self.practice.properties = {
                'images': _images
            };

            if (self.files.images.length) {

                var savedQueries = self.files.preupload(self.files.images);

                $q.all(savedQueries).then(function(successResponse) {

                    $log.log('Images::successResponse', successResponse);

                    angular.forEach(successResponse, function(image) {

                        self.practice.properties.images.push({

                            id: image.id

                        });

                    });

                    self.practice.$update().then(function(successResponse) {

                        self.practice = successResponse;

                        self.files.images = [];

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Photo library updated.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                    }, function(errorResponse) {

                        // Error message

                    });

                }, function(errorResponse) {

                    $log.log('errorResponse', errorResponse);

                });

            } else {

                self.practice.$update().then(function(successResponse) {

                    self.practice = successResponse;

                    self.files.images = [];

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Photo library updated.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                }, function(errorResponse) {

                    // Error message

                });

            }

        };

        self.confirmDelete = function(obj, targetCollection) {

            console.log('self.confirmDelete', obj, targetCollection);

            if (self.deletionTarget &&
                self.deletionTarget.collection === 'practice') {

                self.cancelDelete();

            } else {

                self.deletionTarget = {
                    'collection': targetCollection,
                    'feature': obj
                };

            }

        };

        self.cancelDelete = function() {

            self.deletionTarget = null;

        };

        self.deleteFeature = function(featureType, index) {

            console.log('self.deleteFeature', featureType, index);

            var targetCollection;

            if (featureType === 'image') {

                self.practice.properties.images.splice(index, 1);

                return;

            }

            switch (featureType) {

                case 'image':

                    targetCollection = Image;

                    break;

                default:

                    targetCollection = Practice;

                    break;

            }

            targetCollection.delete({
                id: +self.deletionTarget.feature.id
            }).$promise.then(function(data) {

                self.alerts = [{
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Successfully deleted this ' + featureType + '.',
                    'prompt': 'OK'
                }];

                if (index !== null &&
                    typeof index === 'number' &&
                    featureType === 'image') {

                    self.practice.properties.images.splice(index, 1);

                    self.cancelDelete();

                    $timeout(self.closeAlerts, 2000);

                    if (index === 0) {

                        $route.reload();

                    }

                } else {

                    $timeout(self.closeRoute, 2000);

                }

            }).catch(function(errorResponse) {

                console.log('self.deleteFeature.errorResponse', errorResponse);

                if (errorResponse.status === 409) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Unable to delete this ' + featureType + '. There are pending tasks affecting this feature.',
                        'prompt': 'OK'
                    }];

                } else if (errorResponse.status === 403) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'You don’t have permission to delete this ' + featureType + '.',
                        'prompt': 'OK'
                    }];

                } else {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong while attempting to delete this ' + featureType + '.',
                        'prompt': 'OK'
                    }];

                }

                $timeout(self.closeAlerts, 2000);

            });

        };

    });
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('CustomFormController',
            function(Account, leafletData, $location, metric_types,
                monitoring_types, practice, PracticeCustom, PracticeCustomReading, PracticeCustomMetric,
                PracticeCustomMonitoring, practice_types, report, $rootScope, $route, $scope,
                unit_types, user, Utility, $timeout, report_metrics) {

                var self = this,
                    practiceId = $route.current.params.practiceId;

                self.measurementPeriods = [{
                        'name': 'Installation',
                        'description': null
                    },
                    {
                        'name': 'Planning',
                        'description': null
                    },
                    {
                        'name': 'Monitoring',
                        'description': null
                    }
                ];

                $rootScope.page = {};

                self.status = {
                    loading: true,
                    readings: {
                        loading: false
                    },
                    metrics: {
                        loading: false
                    },
                    monitoring: {
                        loading: false
                    }
                };

                unit_types.$promise.then(function(successResponse) {

                    console.log('Unit types', successResponse);

                    var _unitTypes = [];

                    successResponse.features.forEach(function(unit) {

                        var datum = unit.properties;

                        datum.name = datum.plural;

                        _unitTypes.push(datum);

                    });

                    self.unitTypes = _unitTypes;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

                self.processMetric = function(metric) {

                    var datum = metric.properties;

                    if (metric.properties.metric_type !== null) {

                        datum.metric_type = metric.properties.metric_type.properties;

                    } else {

                        datum.metric_type = null;

                    }

                    if (metric.properties.metric_unit !== null) {

                        datum.metric_unit = metric.properties.metric_unit.properties;

                        datum.metric_unit.name = datum.metric_unit.plural;

                    } else {

                        datum.metric_unit = null;

                    }

                    return datum;

                };

                metric_types.$promise.then(function(successResponse) {

                    console.log('Metric types', successResponse);

                    var _metricTypes = [];

                    successResponse.features.forEach(function(metric) {

                        var datum = metric.properties;

                        _metricTypes.push(datum);

                    });

                    self.metricTypes = _metricTypes;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

                report_metrics.$promise.then(function(successResponse) {

                    console.log('Report metrics', successResponse);

                    var _reportMetrics = [];

                    successResponse.features.forEach(function(metric) {

                        var datum = self.processMetric(metric);

                        _reportMetrics.push(datum);

                    });

                    self.reportMetrics = _reportMetrics;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

                self.monitoringType = null;
                self.monitoringTypes = monitoring_types;

                //
                // Setup all of our basic date information so that we can use it
                // throughout the page
                //
                self.today = new Date();

                self.days = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday'
                ];

                self.months = [{
                        'shortName': 'Jan',
                        'name': 'January',
                        'numeric': '01'
                    },
                    {
                        'shortName': 'Feb',
                        'name': 'February',
                        'numeric': '02'
                    },
                    {
                        'shortName': 'Mar',
                        'name': 'March',
                        'numeric': '03'
                    },
                    {
                        'shortName': 'Apr',
                        'name': 'April',
                        'numeric': '04'
                    },
                    {
                        'shortName': 'May',
                        'name': 'May',
                        'numeric': '05'
                    },
                    {
                        'shortName': 'Jun',
                        'name': 'June',
                        'numeric': '06'
                    },
                    {
                        'shortName': 'Jul',
                        'name': 'July',
                        'numeric': '07'
                    },
                    {
                        'shortName': 'Aug',
                        'name': 'August',
                        'numeric': '08'
                    },
                    {
                        'shortName': 'Sep',
                        'name': 'September',
                        'numeric': '09'
                    },
                    {
                        'shortName': 'Oct',
                        'name': 'October',
                        'numeric': '10'
                    },
                    {
                        'shortName': 'Nov',
                        'name': 'November',
                        'numeric': '11'
                    },
                    {
                        'shortName': 'Dec',
                        'name': 'December',
                        'numeric': '12'
                    }
                ];

                function parseISOLike(s) {
                    var b = s.split(/\D/);
                    return new Date(b[0], b[1] - 1, b[2]);
                }

                practice.$promise.then(function(successResponse) {

                    self.practice = successResponse;

                    self.practiceType = Utility.machineName(self.practice.properties.practice_type);

                    //
                    // 
                    //
                    report.$promise.then(function(successResponse) {

                        console.log('self.report', successResponse);

                        self.report = successResponse;

                        if (self.report.properties.practice_unit !== null) {

                            var _unit = self.report.properties.practice_unit.properties;

                            _unit.name = _unit.plural;

                            self.report.properties.practice_unit = _unit;

                        }

                        if (self.report.properties.report_date) {

                            self.today = parseISOLike(self.report.properties.report_date);

                        }

                        //
                        // Check to see if there is a valid date
                        //
                        self.date = {
                            month: self.months[self.today.getMonth()],
                            date: self.today.getDate(),
                            day: self.days[self.today.getDay()],
                            year: self.today.getFullYear()
                        };

                        // $rootScope.page.title = "Other Conservation Practice";

                        $rootScope.page.title = 'Edit measurement data';


                    }, function(errorResponse) {

                        console.error('ERROR: ', errorResponse);

                    });

                    //
                    // Verify Account information for proper UI element display
                    //
                    if (Account.userObject && user) {

                        user.$promise.then(function(userResponse) {

                            $rootScope.user = Account.userObject = userResponse;

                            self.permissions = {
                                isLoggedIn: Account.hasToken(),
                                role: $rootScope.user.properties.roles[0].properties.name,
                                account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                            };

                        });

                    }

                });

                $scope.$watch(angular.bind(this, function() {

                    return this.date;

                }), function(response) {

                    if (response) {

                        var _new = response.year + '-' + response.month.numeric + '-' + response.date,
                            _date = new Date(_new);
                        self.date.day = self.days[_date.getDay()];

                    }

                }, true);

                self.saveReport = function(metricArray) {

                    console.log('self.saveReport.metricArray', metricArray);

                    if (self.report.properties.measurement_period.name) {

                        self.report.properties.measurement_period = self.report.properties.measurement_period.name;

                    }

                    self.report.properties.metrics = metricArray;

                    if (self.date.month.numeric !== null &&
                        typeof self.date.month.numeric === 'string') {

                        self.report.properties.report_date = self.date.year + '-' + self.date.month.numeric + '-' + self.date.date;

                    } else {

                        self.report.properties.report_date = self.date.year + '-' + self.date.month + '-' + self.date.date;

                    }

                    self.report.$update().then(function(successResponse) {

                        $location.path('/practices/' + practiceId);

                    }, function(errorResponse) {

                        console.error('ERROR: ', errorResponse);

                    });

                };

                self.saveMetrics = function() {

                    console.log('self.saveMetrics.reportMetrics', self.reportMetrics);

                    var _modifiedMetrics = [];

                    self.reportMetrics.forEach(function(metric) {

                        console.log('Updating metric...', metric);

                        var datum = metric;

                        if (datum.metric_type !== null) {

                            datum.metric_type_id = datum.metric_type.id;

                        }

                        if (datum.metric_unit !== null) {

                            datum.metric_unit_id = datum.metric_unit.id;

                        }

                        // delete datum.id;
                        delete datum.metric_type;
                        delete datum.metric_unit;

                        PracticeCustomMetric.update({
                            id: metric.id
                        }, datum).$promise.then(function(successResponse) {

                            _modifiedMetrics.push(successResponse.properties);

                            if (_modifiedMetrics.length === self.reportMetrics.length) {

                                self.saveReport(_modifiedMetrics);

                            }

                        }, function(errorResponse) {

                            console.error('ERROR: ', errorResponse);

                        });

                    });

                };

                self.addReading = function(reading_) {

                    self.status.readings.loading = true;

                    //
                    // Step 1: Show a new row with a "loading" indiciator
                    //

                    //
                    // Step 2: Create empty Reading to post to the system
                    //
                    var newReading = new PracticeCustomReading({
                        "geometry": null,
                        "properties": {
                            "bmp_custom_id": self.report.id,
                            "practice_type_id": null,
                            "practice_extent": 0,
                            "practice_unit_id": null,
                            "practice_description": "",
                            "practice_nutrient_reductions": {
                                "properties": {
                                    "nitrogen": 0,
                                    "phosphorus": 0,
                                    "sediment": 0,
                                    "protocol": ""
                                }
                            }
                        }
                    });

                    //
                    // Step 3: POST this empty reading to the `/v1/data/bmp-custom-readings` endpoint
                    //
                    newReading.$save().then(function(successResponse) {

                        console.log('A new reading has been created for this report', successResponse);

                        var reading_ = successResponse;

                        //
                        // Step 4: Add the new reading to the existing report
                        //
                        self.report.properties.readings.push(reading_);

                        //
                        // Step 6: Hide Loading Indicator and display the form to the user
                        //
                        self.status.readings.loading = false;

                    }, function(errorResponse) {

                        console.log('An error occurred while trying to create a new reading', errorResponse);

                        self.status.readings.loading = false;

                    });

                };

                self.addMetric = function() {

                    //
                    // Step 1: Show a new row with a "loading" indiciator
                    //
                    self.status.metrics.loading = true;

                    // var datum = {
                    //     "metric_type_id": null,
                    //     "metric_value": 0,
                    //     "metric_unit_id": null,
                    //     "metric_description": ""
                    // };

                    // self.reportMetrics.push(datum);

                    //
                    // Step 2: Create empty Reading to post to the system
                    //
                    var newMetric = new PracticeCustomMetric({
                        "geometry": null,
                        "properties": {
                            "metric_type_id": null,
                            "metric_value": 0,
                            "metric_unit_id": null,
                            "metric_description": ""
                        }
                    });

                    //
                    // Step 3: POST this empty reading to the `/v1/data/bmp-custom-readings` endpoint
                    //
                    newMetric.$save().then(function(successResponse) {

                        console.log('A new reading has been created for this report', successResponse);

                        //
                        // Step 4: Add the new reading to the existing report
                        //
                        // self.reportMetrics.push(metric_);

                        if (successResponse.properties.metric_type !== null) {
                            successResponse.properties.metric_type.properties = successResponse.properties.metric_type;
                        }
                        if (successResponse.properties.metric_unit !== null) {
                            successResponse.properties.metric_unit.properties = successResponse.properties.metric_unit;
                        }

                        var datum = self.processMetric(successResponse);

                        self.reportMetrics.push(datum);

                        //
                        // Step 5: Hide Loading Indicator and display the form to the user
                        //
                        self.status.metrics.loading = false;

                    }, function(errorResponse) {

                        console.log('An error occurred while trying to create a new metric', errorResponse);

                        self.status.metrics.loading = false;

                    });

                };

                self.addMonitoringCheck = function() {

                    //
                    // Step 1: Show a new row with a "loading" indiciator
                    //
                    self.status.monitoring.loading = true;

                    //
                    // Step 2: Create empty Reading to post to the system
                    //
                    var newMetric = new PracticeCustomMonitoring({
                        "geometry": null,
                        "properties": {
                            "monitoring_type_id": null,
                            "monitoring_value": 0,
                            "was_verified": false,
                            "monitoring_description": ""
                        }
                    });

                    //
                    // Step 3: POST this empty reading to the `/v1/data/bmp-custom-readings` endpoint
                    //
                    newMetric.$save().then(function(successResponse) {

                        console.log('A new reading has been created for this report', successResponse);

                        var monitoring_ = successResponse;

                        //
                        // Step 4: Add the new reading to the existing report
                        //
                        self.report.properties.monitoring.push(monitoring_);

                        //
                        // Step 5: Hide Loading Indicator and display the form to the user
                        //
                        self.status.monitoring.loading = false;

                    }, function(errorResponse) {

                        console.log('An error occurred while trying to create a new metric', errorResponse);

                        self.status.monitoring.loading = false;

                    });

                };

                self.deleteSubPractice = function(reading_id) {

                    var readings_ = [];

                    angular.forEach(self.report.properties.readings, function(reading_, index_) {
                        if (reading_id !== reading_.id) {
                            readings_.push(reading_);
                        }
                    });

                    self.report.properties.readings = readings_;

                };

                self.deleteMetric = function(metric_id) {

                    var metrics_ = [];

                    angular.forEach(self.reportMetrics, function(metric_, index_) {

                        if (metric_id !== metric_.id) {

                            metrics_.push(metric_);

                        }

                    });

                    self.reportMetrics = metrics_;

                };

                self.deleteMonitoringCheck = function(monitoring_id) {

                    var monitorings_ = [];

                    angular.forEach(self.report.properties.monitoring, function(monitoring_, index_) {
                        if (monitoring_id !== monitoring_.id) {
                            monitorings_.push(monitoring_);
                        }
                    });

                    self.report.properties.monitoring = monitorings_;

                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path('/practices/' + practiceId);

                }

                self.confirmDelete = function(obj) {

                    console.log('self.confirmDelete', obj);

                    self.deletionTarget = self.deletionTarget ? null : obj;

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.deleteFeature = function() {

                    PracticeCustom.delete({
                        id: +self.deletionTarget.id
                    }).$promise.then(function(data) {

                        self.alerts.push({
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this report.',
                            'prompt': 'OK'
                        });

                        $timeout(closeRoute, 2000);

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this report.',
                                'prompt': 'OK'
                            }];

                        } else if (errorResponse.status === 403) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'You don’t have permission to delete this report.',
                                'prompt': 'OK'
                            }];

                        } else {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Something went wrong while attempting to delete this report.',
                                'prompt': 'OK'
                            }];

                        }

                        $timeout(closeAlerts, 2000);

                    });

                };

            });

}());
'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.CommonsCloud
 * @description
 * # Site
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .constant('commonscloud', {
    baseurl: 'https://api.commonscloud.org/v2/',
    collections: {
      project: {
        templateId: 121,
        storage: 'type_061edec30db54fa0b96703b40af8d8ca'
      },
      site: {
        templateId: 122,
        storage: 'type_646f23aa91a64f7c89a008322f4f1093'
      },
      practice: {
        templateId: 123,
        storage: 'type_77f5c44516674e8da2532939619759dd'
      },
      land_river_segment: {
        templateId: 272,
        storage: 'type_f9d8609090494dac811e6a58eb8ef4be'
      },
      loaddata: {
        templateId: 282,
        storage: 'type_3fbea3190b634d0c9021d8e67df84187'
      },
      stateloaddata: {
        templateId: 379,
        storage: 'type_053d71f4258746ceb0bef2d914c97876'
      }
    }
  });

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.GeometryService
 * @description
 *   
 */
angular.module('FieldDoc')
  .service('commonsGeometry', ['$http', 'commonscloud', 'leafletData', function Navigation($http, commonscloud, leafletData) {
    return {
      drawGeoJSON: function(geojson, featureGroup) {

        var self = this;

        leafletData.getMap().then(function(map) {
          //
          // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
          //
          map.removeLayer(featureGroup);

          //
          // Convert the GeoJSON to a layer and add it to our FeatureGroup
          //
          // $scope.geojsonToLayer(geojson, featureGroup);
          self.geojsonToLayer(geojson, featureGroup);

          //
          // Add the FeatureGroup to the map
          //
          map.addLayer(featureGroup);
        });
      },
      /**
       * Convert a valid GeoJSON object to a valid Leaflet/Mapbox layer so that
       * it can be displayed on a Leaflet Map
       *
       * @param (object) geojsonObject
       *    A valid GeoJson object
       *
       *    @see http://geojson.org/geojson-spec.html#geojson-objects
       *
       * @param (object) targetLayer
       *    A valid Leaflet LayerGroup or FeatureGroup
       *
       *    @see http://leafletjs.com/reference.html#layergroup
       *    @see http://leafletjs.com/reference.html#featuregroup
       *
       * @param (object) layerStyle
       *
       * @param (boolean) appendToLayer
       *    If set to `true` the object will be appended to the Group and keep
       *    all the other objects that alread exist within the provided Group,
       *    defaults to clearning all content from provided Group
       *
       * @return (implicit)
       *    Adds the requested GeoJSON to the provided layer
       *
       * @required This function requires that Leaflet be loaded into this
       *           application and depends on the AngularLeafletDirective
       *
       */
      geojsonToLayer: function(geojsonObject, targetLayer, layerStyle, appendToLayer) {

        //
        // Should this GeoJSON object be appended to all existing Features or
        // should it replace all other objects?
        //
        // Defaults to clearing the layer and adding only the new geojsonObject
        // defined in the function arguments
        //
        if (!appendToLayer) {
          targetLayer.clearLayers();
        }

        //
        // Determine if the user has defined styles to be applied to this layer
        // if not, then use our default polygon outline
        //
        layerStyle = (layerStyle) ? layerStyle: {
          stroke: true,
          fill: false,
          weight: 3,
          opacity: 1,
          color: 'rgb(255,255,255)',
          lineCap: 'square'
        };

        //
        // Make sure the GeoJSON object is added to the layer with appropriate styles
        //
        L.geoJson(geojsonObject, {
          style: layerStyle
        }).eachLayer(function(newLayer) {
          newLayer.addTo(targetLayer);
        });

      },
      /**
       * Retrieve a list of possible matching geometries based on user defined
       * geometry passed from application
       *
       * @param (array) requestedLocation
       *    A simple object containing a longitude and latitude.
       *
       *    @see http://leafletjs.com/reference.html#latlng-l.latlng
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       */
      intersects: function(requestedLocation, collection) {

        //
        // Check to make sure that the string is not empty prior to submitting
        // it to the Mapbox Geocoding API
        //
        if (!requestedLocation) {
          return;
        }

        //
        // Created a valid Mapbox Geocoding API compatible URL
        //
        var ccGeometryAPI = commonscloud.baseurl.concat(collection, '/', 'intersects', '.geojson');

        //
        // Send a GET request to the Mapbox Geocoding API containing valid user
        // input
        //
        var promise = $http.get(ccGeometryAPI, {
          params: {
            'callback': 'JSON_CALLBACK',
            'geometry': requestedLocation.lng + ' ' + requestedLocation.lat
          }
        })
          .success(function(featureCollection) {
            return featureCollection;
          })
          .error(function(data) {
            console.error('CommonsCloud Geospatial API could not return any results based on your input', data, requestedLocation);
          });

        //
        // Always return Requests in angular.services as a `promise`
        //
        return promise;
      },
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name managerApp.directive:Map
 * @description
 *   Assist Directives in loading templates
 */
angular.module('FieldDoc')
    .service('Map', ['mapbox', function(mapbox) {

        var self = this;

        var Map = {
            defaults: {
                scrollWheelZoom: false,
                maxZoom: 19
            },
            layers: {
                baselayers: {
                    satellite: {
                        name: 'Satellite',
                        type: 'xyz',
                        url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        layerOptions: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.streets-satellite',
                            attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                        }
                    },
                    streets: {
                        name: 'Streets',
                        type: 'xyz',
                        url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        layerOptions: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.streets',
                            attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                        }
                    },
                    terrain: {
                        name: 'Terrain',
                        type: 'xyz',
                        url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        layerOptions: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.run-bike-hike',
                            attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                        }
                    }
                }
            },
            center: {
                lat: 39.828175,
                lng: -98.5795,
                zoom: 4
            },
            styles: {
                icon: {
                    parcel: {
                        iconUrl: '/images/pin-l+cc0000.png?access_token=' + mapbox.access_token,
                        iconRetinaUrl: '/images/pin-l+cc0000@2x.png?access_token=' + mapbox.access_token,
                        iconSize: [35, 90],
                        iconAnchor: [18, 44],
                        popupAnchor: [0, 0]
                    }
                },
                polygon: {
                    parcel: {
                        stroke: true,
                        fill: false,
                        weight: 3,
                        opacity: 1,
                        color: 'rgb(255,255,255)',
                        lineCap: 'square'
                    },
                    canopy: {
                        stroke: false,
                        fill: true,
                        weight: 3,
                        opacity: 1,
                        color: 'rgb(0,204,34)',
                        lineCap: 'square',
                        fillOpacity: 0.6
                    },
                    impervious: {
                        stroke: false,
                        fill: true,
                        weight: 3,
                        opacity: 1,
                        color: 'rgb(204,0,0)',
                        lineCap: 'square',
                        fillOpacity: 0.6
                    }
                }
            },
            geojson: {}
        };

        var southWest = L.latLng(25.837377, -124.211606),
            northEast = L.latLng(49.384359, -67.158958),
            bounds = L.latLngBounds(southWest, northEast);

        console.log('United States bounds', bounds);

        Map.bounds = bounds;

        return Map;

    }]);
'use strict';

/**
 * @ngdoc overview
 * @name WaterReporter
 * @description
 *     The WaterReporter Website and associated User/Manager Site
 * Main module of the application.
 */
angular
  .module('Mapbox', [
    'leaflet-directive'
  ]);

'use strict';

/*jshint camelcase: false */

/**
 * @ngdoc directive
 * @name managerApp.directive:mapboxGeocoder
 * @description
 *   The Mapbox Geocoder directive enables developers to quickly add inline
 *   geocoding capabilities to any HTML <input> or <textarea>
 */
angular.module('Mapbox')
  .directive('mapboxGeocoder', ['$compile', '$http', '$templateCache', '$timeout', 'mapbox', 'geocoding', 'TemplateLoader', function ($compile, $http, $templateCache, $timeout, mapbox, geocoding, TemplateLoader) {

    return {
        restrict: 'A',
        scope: {
          mapboxGeocoderDirection: '=?',
          mapboxGeocoderQuery: '=',
          mapboxGeocoderResponse: '=',
          mapboxGeocoderResults: '=?',
          mapboxGeocoderAppend: '=?'
        },
        link: function(scope, element, attrs) {

          //
          // Setup up our timeout and the Template we will use for display the
          // results from the Mapbox Geocoding API back to the user making the
          // Request
          //
          var timeout;

          //
          // Take the template that we loaded into $templateCache and pull
          // out the HTML that we need to create our drop down menu that
          // holds our Mapbox Geocoding API results
          //
          TemplateLoader.get('/modules/shared/mapbox/geocoderResults--view.html')
            .success(function(templateResult) {
              element.after($compile(templateResult)(scope));
            });

          //
          // This tells us if we are using the Forward, Reverse, or Batch
          // Geocoder provided by the Mapbox Geocoding API
          //
          scope.mapboxGeocoderDirection = (scope.mapboxGeocoderDirection) ? scope.mapboxGeocoderDirection: 'forward';

          //
          // Keep an eye on the Query model so that when it's updated we can
          // execute a the Reuqest agains the Mapbox Geocoding API
          //
          scope.$watch('mapboxGeocoderQuery', function(query) {

            var query_ = (scope.mapboxGeocoderAppend) ? query + ' ' + scope.mapboxGeocoderAppend : query;

            //
            // If the user types, make sure we cancel and restart the timeout
            //
            $timeout.cancel(timeout);

            //
            // If the user stops typing for 500 ms then we need to go ahead and
            // execute the query against the Mapbox Geocoding API
            //
            timeout = $timeout(function () {

              //
              // The Mapbox Geocoding Service in our application provides us
              // with a deferred promise with our Mapbox Geocoding API request
              // so that we can handle the results of that request however we
              // need to.
              //
              if (query && !scope.mapboxGeocoderResponse) {
                var results = geocoding[scope.mapboxGeocoderDirection](query_).success(function(results) {
                  scope.mapboxGeocoderResults = results;
                });
              }

            }, 500);

          });

          //
          // Geocoded Address Selection
          //
          scope.address = {
            select: function(selectedValue) {

              //
              // Assign the selected value to back to our scope. The developer
              // should be able to use the results however they like. For
              // instance they may need to use the `Response` from this request
              // to perform a query against another database for geolookup or
              // save this value to the database.
              //
              scope.mapboxGeocoderQuery = selectedValue.place_name;
              scope.mapboxGeocoderResponse = selectedValue;

              //
              // Once we're finished we need to make sure we empty the result
              // list. An empty result list will be hidden.
              //
              scope.mapboxGeocoderResults = null;
            }
          };

        }
    };
  }]);

'use strict';

/**
 * @ngdoc service
 *
 * @name cleanWaterCommunitiesApp.Geocode
 *
 * @description
 *   The Geocode Service provides access to the Mapbox Geocoding API
 *
 * @see https://www.mapbox.com/developers/api/geocoding/
 */
angular.module('Mapbox')
  .service('geocoding', ['$http', 'mapbox', function Navigation($http, mapbox) {
    return {

      /**
       * Retrieve a list of possible geocoded address from the Mapbox Geocoding
       * API, based on user input.
       *
       * @param (string) requestedLocation
       *    A simple string containing the information you wish to check
       *    against the Mapbox Geocoding API
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       * @see https://www.mapbox.com/developers/api/geocoding/
       *
       */
      forward: function(requestedLocation) {

        //
        // Check to make sure that the string is not empty prior to submitting
        // it to the Mapbox Geocoding API
        //
        if (!requestedLocation) {
          return;
        }

        //
        // Created a valid Mapbox Geocoding API compatible URL
        //
        var mapboxGeocodingAPI = mapbox.geocodingUrl.concat(requestedLocation, '.json');

        //
        // Send a GET request to the Mapbox Geocoding API containing valid user
        // input
        //
        var promise = $http.get(mapboxGeocodingAPI, {
          params: {
            'callback': 'JSON_CALLBACK',
            'access_token': mapbox.access_token
          }
        })
          .success(function(featureCollection) {
            return featureCollection;
          })
          .error(function(data) {
            console.error('Mapbox Geocoding API could not return any results based on your input', data);
          });

        //
        // Always return Requests in angular.services as a `promise`
        //
        return promise;
      },

      /**
       * Retrieve a list of possible addresses from the Mapbox Geocoding
       * API, based on user input.
       *
       * @param (array) requestedCoordinates
       *    A two value array containing the longitude and latitude respectively
       *
       *    Example:
       *    [
       *       '<LONGITUDE>',
       *       '<LATITUDE>',
       *    ]
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       * @see https://www.mapbox.com/developers/api/geocoding/
       *
       */
      reverse: function(requestedCoordinates) {

        //
        // Check to make sure that the string is not empty prior to submitting
        // it to the Mapbox Geocoding API
        //
        if (!requestedCoordinates) {
          return;
        }

        //
        // Created a valid Mapbox Geocoding API compatible URL
        //
        var mapboxGeocodingAPI = mapbox.geocodingUrl.concat(requestedCoordinates[0], ',', requestedCoordinates[1], '.json');

        //
        // Send a GET request to the Mapbox Geocoding API containing valid user
        // input
        //
        var promise = $http.get(mapboxGeocodingAPI, {
          params: {
            'callback': 'JSON_CALLBACK',
            'access_token': mapbox.access_token
          }
        })
          .success(function(featureCollection) {
            //
            // Return the valid GeoJSON FeatureCollection sent by Mapbox to
            // the module requesting the data with this Service
            //
            return featureCollection;
          })
          .error(function(data) {
            console.error('Mapbox Geocoding API could not return any results based on your input', data);
          });

        //
        // Always return Requests in angular.services as a `promise`
        //
        return promise;
      },

      /**
       * Retrieve a list of possible geocoded address from the Mapbox Geocoding
       * API, based on user input.
       *
       * @param (array) requestedQueries
       *    An array of up to 50 queries to perform. Each individual query
       *    should be a simple string containing the information you wish to
       *    check against the Mapbox Geocoding API
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       * @see https://www.mapbox.com/developers/api/geocoding/
       *
       */
      batch: function(requestedQueries) {
        console.log('Mapbox Geocoding Batch Geocoding not implemented, see https://www.mapbox.com/developers/api/geocoding/ for more information.');
      }
    };

  }]);

'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.GeometryService
 * @description
 *
 */
angular.module('Mapbox')
  .service('mapboxGeometry', ['$http', 'leafletData', function Navigation($http, leafletData) {

    var L = L;

    return {
      drawGeoJSON: function(geojson, featureGroup, layerStyle, appendToLayer) {

        var self = this;

        leafletData.getMap().then(function(map) {
          //
          // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
          //
          map.removeLayer(featureGroup);

          //
          // Convert the GeoJSON to a layer and add it to our FeatureGroup
          //
          // $scope.geojsonToLayer(geojson, featureGroup);
          self.geojsonToLayer(geojson, featureGroup);

          //
          // Add the FeatureGroup to the map
          //
          map.addLayer(featureGroup);
        });
      },
      /**
       * Convert a valid GeoJSON object to a valid Leaflet/Mapbox layer so that
       * it can be displayed on a Leaflet Map
       *
       * @param (object) geojsonObject
       *    A valid GeoJson object
       *
       *    @see http://geojson.org/geojson-spec.html#geojson-objects
       *
       * @param (object) targetLayer
       *    A valid Leaflet LayerGroup or FeatureGroup
       *
       *    @see http://leafletjs.com/reference.html#layergroup
       *    @see http://leafletjs.com/reference.html#featuregroup
       *
       * @param (object) layerStyle
       *
       * @param (boolean) appendToLayer
       *    If set to `true` the object will be appended to the Group and keep
       *    all the other objects that alread exist within the provided Group,
       *    defaults to clearning all content from provided Group
       *
       * @return (implicit)
       *    Adds the requested GeoJSON to the provided layer
       *
       * @required This function requires that Leaflet be loaded into this
       *           application and depends on the AngularLeafletDirective
       *
       */
      geojsonToLayer: function(geojsonObject, targetLayer, layerStyle, appendToLayer) {

        //
        // Should this GeoJSON object be appended to all existing Features or
        // should it replace all other objects?
        //
        // Defaults to clearing the layer and adding only the new geojsonObject
        // defined in the function arguments
        //
        if (!appendToLayer) {
          targetLayer.clearLayers();
        }

        //
        // Determine if the user has defined styles to be applied to this layer
        // if not, then use our default polygon outline
        //
        layerStyle = (layerStyle) ? layerStyle: {
          stroke: true,
          fill: false,
          weight: 3,
          opacity: 1,
          color: 'rgb(255,255,255)',
          lineCap: 'square'
        };

        //
        // Make sure the GeoJSON object is added to the layer with appropriate styles
        //
        L.geoJson(geojsonObject, {
          style: layerStyle
        }).eachLayer(function(newLayer) {
          newLayer.addTo(targetLayer);
          newLayer.bindPopup('<strong>' + newLayer.feature.properties.owner.properties.first_name + '</strong> reported on ' + newLayer.feature.properties.report_date + '<br /><small><a href="/reports/' + newLayer.feature.id + '">View Report</a></small>');
        });

      },
      /**
       * Retrieve a list of possible matching geometries based on user defined
       * geometry passed from application
       *
       * @param (array) requestedLocation
       *    A simple object containing a longitude and latitude.
       *
       *    @see http://leafletjs.com/reference.html#latlng-l.latlng
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       */
      intersects: function(requestedLocation, collection) {

        // //
        // // Check to make sure that the string is not empty prior to submitting
        // // it to the Mapbox Geocoding API
        // //
        // if (!requestedLocation) {
        //   return;
        // }

        // //
        // // Created a valid Mapbox Geocoding API compatible URL
        // //
        // var ccGeometryAPI = commonscloud.baseurl.concat(collection, '/', 'intersects', '.geojson');

        // //
        // // Send a GET request to the Mapbox Geocoding API containing valid user
        // // input
        // //
        // var promise = $http.get(ccGeometryAPI, {
        //   params: {
        //     'callback': 'JSON_CALLBACK',
        //     'geometry': requestedLocation.lng + ' ' + requestedLocation.lat
        //   }
        // })
        //   .success(function(featureCollection) {
        //     return featureCollection;
        //   })
        //   .error(function(data) {
        //     console.error('CommonsCloud Geospatial API could not return any results based on your input', data, requestedLocation);
        //   });

        // //
        // // Always return Requests in angular.services as a `promise`
        // //
        // return promise;
      },
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name managerApp.directive:Map
 * @description
 *   Assist Directives in loading templates
 */
angular.module('Mapbox')
    .service('Map', function(mapbox) {

        var Map = {
            defaults: {
                scrollWheelZoom: false,
                maxZoom: 19
            },
            layers: {
                baselayers: {
                    streets: {
                        name: 'Streets',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        options: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.streets'
                        }
                    },
                    terrain: {
                        name: 'Terrain',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        options: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.run-bike-hike'
                        }
                    },
                    satellite: {
                        name: 'Satellite',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        options: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.satellite'
                        }
                    }
                }
            },
            center: {
                lat: 39.828175,
                lng: -98.5795,
                zoom: 4
            },
            markers: {},
            styles: {
                icon: {
                    parcel: {
                        iconUrl: 'https://api.tiles.mapbox.com/v4/marker/pin-l-cc0000.png?access_token=' + mapbox.access_token,
                        iconRetinaUrl: 'https://api.tiles.mapbox.com/v4/marker/pin-l-cc0000@2x.png?access_token=' + mapbox.access_token,
                        iconSize: [35, 90],
                        iconAnchor: [18, 44],
                        popupAnchor: [0, 0]
                    }
                }
            },
            geojson: {}
        };

        var southWest = L.latLng(25.837377, -124.211606),
            northEast = L.latLng(49.384359, -67.158958),
            bounds = L.latLngBounds(southWest, northEast);

        console.log('United States bounds', bounds);

        Map.bounds = bounds;

        return Map;
    });
'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.Site
 * @description
 * # Site
 * Service in the cleanWaterCommunitiesApp.
 */
angular.module('Mapbox')
  .constant('mapbox', {
    geocodingUrl: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/',
    access_token: 'pk.eyJ1IjoicmRhd2VzMSIsImEiOiJjaXBneGlqNG8wMHR5dWduajloZXhyZnZ5In0.mPworUdqIVGkNWGnFRGz9A',
    map_id: 'rdawes1.0dg4d3gd',
    terrain: '',
    street: 'mapbox.mapbox-streets-v7'
  });

'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.state
 * @description
 * # state
 * Service in the cleanWaterCommunitiesApp.
 */
angular.module('Mapbox')
  .constant('states', {
    list: [
      {
        abbr: 'AK',
        name: 'Alaska'
      },
      {
        abbr: 'AL',
        name: 'Alabama'
      },
      {
        abbr: 'AR',
        name: 'Arkansas'
      },
      {
        abbr: 'AZ',
        name: 'Arizona'
      },
      {
        abbr: 'CA',
        name: 'California'
      },
      {
        abbr: 'CO',
        name: 'Colorado'
      },
      {
        abbr: 'CT',
        name: 'Connecticut'
      },
      {
        abbr: 'DE',
        name: 'Delaware'
      },
      {
        abbr: 'DC',
        name: 'District of Columbia'
      },
      {
        abbr: 'FL',
        name: 'Florida'
      },
      {
        abbr: 'GA',
        name: 'Georgia'
      },
      {
        abbr: 'HI',
        name: 'Hawaii'
      },
      {
        abbr: 'IA',
        name: 'Iowa'
      },
      {
        abbr: 'ID',
        name: 'Idaho'
      },
      {
        abbr: 'IL',
        name: 'Illinois'
      },
      {
        abbr: 'IN',
        name: 'Indiana'
      },
      {
        abbr: 'KS',
        name: 'Kansas'
      },
      {
        abbr: 'KY',
        name: 'Kentucky'
      },
      {
        abbr: 'LA',
        name: 'Louisiana'
      },
      {
        abbr: 'MA',
        name: 'Massachusetts'
      },
      {
        abbr: 'MD',
        name: 'Maryland'
      },
      {
        abbr: 'ME',
        name: 'Maine'
      },
      {
        abbr: 'MI',
        name: 'Michigan'
      },
      {
        abbr: 'MN',
        name: 'Minnesota'
      },
      {
        abbr: 'MS',
        name: 'Mississippi'
      },
      {
        abbr: 'MO',
        name: 'Missouri'
      },
      {
        abbr: 'MT',
        name: 'Montana'
      },
      {
        abbr: 'NC',
        name: 'North Carolina'
      },
      {
        abbr: 'ND',
        name: 'North Dakota'
      },
      {
        abbr: 'NE',
        name: 'Nebraska'
      },
      {
        abbr: 'NH',
        name: 'New Hampshire'
      },
      {
        abbr: 'NJ',
        name: 'New Jersey'
      },
      {
        abbr: 'NM',
        name: 'New Mexico'
      },
      {
        abbr: 'NV',
        name: 'Nevada'
      },
      {
        abbr: 'NY',
        name: 'New York'
      },
      {
        abbr: 'OH',
        name: 'Ohio'
      },
      {
        abbr: 'OK',
        name: 'Oklahoma'
      },
      {
        abbr: 'OR',
        name: 'Oregon'
      },
      {
        abbr: 'PA',
        name: 'Pennsylvania'
      },
      {
        abbr: 'RI',
        name: 'Rhode Island'
      },
      {
        abbr: 'SC',
        name: 'South Carolina'
      },
      {
        abbr: 'SD',
        name: 'South Dakota'
      },
      {
        abbr: 'TN',
        name: 'Tennessee'
      },
      {
        abbr: 'TX',
        name: 'Texas'
      },
      {
        abbr: 'UT',
        name: 'Utah'
      },
      {
        abbr: 'VA',
        name: 'Virginia'
      },
      {
        abbr: 'VT',
        name: 'Vermont'
      },
      {
        abbr: 'WA',
        name: 'Washington'
      },
      {
        abbr: 'WI',
        name: 'Wisconsin'
      },
      {
        abbr: 'WV',
        name: 'West Virginia'
      },
      {
        abbr: 'WY',
        name: 'Wyoming'
      }
    ]
  });

'use strict';

angular.module('Mapbox')
  .service('TemplateLoader', function ($compile, $http, $templateCache) {
    return {
      get: function(templateUrl) {

        var promise = $http.get(templateUrl, {
            cache: $templateCache
          }).success(function(html) {
            return html;
          });

        return promise;
      }
    };
  });

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name MapboxGL
   * @description
   */
  angular.module('MapboxGL', []);

})();

'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.Site
 * @description
 * # Site
 * Service in the cleanWaterCommunitiesApp.
 */
angular.module('MapboxGL')
  .constant('MapboxGLSettings', {
    geocodingUrl: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/',
    access_token: 'pk.eyJ1IjoiZGV2ZWxvcGVkc2ltcGxlIiwiYSI6IjQ2YTM3YTdhNGU2NzYyMDc2ZjIzNDM4Yjg2MDc1MzRmIn0.bT4dOk8ewUnhJ3pyyOcWTg',
    // style: 'mapbox://styles/mapbox/dark-v9?optimize=true'
    style: 'mapbox://styles/mapbox/mapbox.mapbox-streets-v7'
  });

(function() {

  "use strict";

  /**
   * @ngdoc directive
   * @name managerApp.directive:mapboxGeocoder
   * @description
   *   The Mapbox GL directive enables developers to quickly add Mapbox GL
   *   maps to an angular project.
   *
   *   Example:
   *   <mapboxgl id="map" class="mapboxgl-map"
   *                          options="page.map.options" model="page.map.data">
   *   </mapboxgl>
   */
  angular.module('MapboxGL')
    .directive('mapboxgl', function ($log, $rootScope) {

      return {
          scope: {
            options: '='
          },
          restrict: 'E',
          link: function(scope, element, attrs) {

            /**
             * Give feedback that the MapboxGL Directive has loaded
             */
            $log.log('Loaded MapboxGL::viableMapboxglDirective')

            /**
             * Instantiate a new MapboxGL Map object
             */
            var map = new mapboxgl.Map(scope.options);

            /**
             * Assign MapboxGL Map object to `scope.model` when map has
             * finished loading.
             */
            map.on('load', function () {

              $rootScope.$broadcast('mapboxgl.loaded', {
                map: map
              });

            });

          }
      };
    });

})();

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name MapboxGL Geocoding Implementation
   * @description Allow for the
   */
  angular.module('MapboxGLGeocoding', []);

})();

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name MapboxGL Geocoding Implementation
   * @description Allow for the
   */
  angular.module('MapboxGLGeocoding')
    .service('MapboxGLGeocodingService', function($http, MapboxGLSettings) {

      return {

        /**
         * Retrieve a list of possible geocoded address from the Mapbox Geocoding
         * API, based on user input.
         *
         * @param (string) requestedLocation
         *    A simple string containing the information you wish to check
         *    against the Mapbox Geocoding API
         *
         * @return (object) featureCollection
         *    A valid GeoJSON Feature Collection containing a list of matched
         *    addresses and their associated geographic information
         *
         * @see https://www.mapbox.com/developers/api/geocoding/
         *
         */
        forward: function(requestedLocation) {

          //
          // Check to make sure that the string is not empty prior to submitting
          // it to the Mapbox Geocoding API
          //
          if (!requestedLocation) {
            return;
          }

          //
          // Created a valid Mapbox Geocoding API compatible URL
          //
          var mapboxGeocodingAPI = MapboxGLSettings.geocodingUrl.concat(requestedLocation, '.json');

          //
          // Send a GET request to the Mapbox Geocoding API containing valid user
          // input
          //
          var promise = $http.get(mapboxGeocodingAPI, {
            params: {
              'callback': 'JSON_CALLBACK',
              'access_token': MapboxGLSettings.access_token
            }
          })
            .then(function(featureCollection) {
              return featureCollection;
            },function(data) {
              console.error('Mapbox Geocoding API could not return any results based on your input', data);
            });

          //
          // Always return Requests in angular.services as a `promise`
          //
          return promise;
        },

        /**
         * Retrieve a list of possible addresses from the Mapbox Geocoding
         * API, based on user input.
         *
         * @param (array) requestedCoordinates
         *    A two value array containing the longitude and latitude respectively
         *
         *    Example:
         *    [
         *       '<LONGITUDE>',
         *       '<LATITUDE>',
         *    ]
         *
         * @return (object) featureCollection
         *    A valid GeoJSON Feature Collection containing a list of matched
         *    addresses and their associated geographic information
         *
         * @see https://www.mapbox.com/developers/api/geocoding/
         *
         */
        reverse: function(requestedCoordinates) {

          //
          // Check to make sure that the string is not empty prior to submitting
          // it to the Mapbox Geocoding API
          //
          if (!requestedCoordinates) {
            return;
          }

          //
          // Created a valid Mapbox Geocoding API compatible URL
          //
          var mapboxGeocodingAPI = MapboxGLSettings.geocodingUrl.concat(requestedCoordinates[0], ',', requestedCoordinates[1], '.json');

          //
          // Send a GET request to the Mapbox Geocoding API containing valid user
          // input
          //
          var promise = $http.get(mapboxGeocodingAPI, {
            params: {
              'callback': 'JSON_CALLBACK',
              'access_token': MapboxGLSettings.access_token
            }
          })
            .then(function(featureCollection) {
              //
              // Return the valid GeoJSON FeatureCollection sent by Mapbox to
              // the module requesting the data with this Service
              //
              return featureCollection;
            },function(data) {
              console.error('Mapbox Geocoding API could not return any results based on your input', data);
            });

          //
          // Always return Requests in angular.services as a `promise`
          //
          return promise;
        },

        /**
         * Retrieve a list of possible geocoded address from the Mapbox Geocoding
         * API, based on user input.
         *
         * @param (array) requestedQueries
         *    An array of up to 50 queries to perform. Each individual query
         *    should be a simple string containing the information you wish to
         *    check against the Mapbox Geocoding API
         *
         * @return (object) featureCollection
         *    A valid GeoJSON Feature Collection containing a list of matched
         *    addresses and their associated geographic information
         *
         * @see https://www.mapbox.com/developers/api/geocoding/
         *
         */
        batch: function(requestedQueries) {
          console.warning('Mapbox Geocoding Batch Geocoding not implemented, see https://www.mapbox.com/developers/api/geocoding/ for more information.');
        }
      };

    });

})();

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name MapboxGL Geocoding Implementation
   * @description Allow for the
   */
  angular.module('MapboxGLGeocoding')
    .directive('mapboxGeocoder', function($compile, $http, $log, $templateCache, $timeout, MapboxGLGeocodingService) {

      return {
          scope: {
            model: '=',
            mapboxGeocoderDirection: '=?',
            mapboxGeocoderQuery: '=',
            mapboxGeocoderResponse: '=',
            mapboxGeocoderResults: '=?',
            mapboxGeocoderAppend: '=?',
            tabindexnumber: '=',
            placeholder: '=',
          },
          templateUrl: '/modules/shared/mapboxgl-geocoding/mapboxglGeocodingResults--view.html',
          restrict: 'E',
          link: function(scope, element, attrs) {

            //
            // Setup up our timeout and the Template we will use for display the
            // results from the Mapbox Geocoding API back to the user making the
            // Request
            //
            var timeout;

            //
            // Take the template that we loaded into $templateCache and pull
            // out the HTML that we need to create our drop down menu that
            // holds our Mapbox Geocoding API results
            //
            // $http.get('/scripts/shared/mapbox/geocoderResults--view.html', {
            //     cache: $templateCache
            //   }).then(function(templateResult) {
            //     // console.log('element', element);
            //     // console.log('templateResult', templateResult);
            //     element.next().after($compile(templateResult)(scope))
            //     //element.after($compile(templateResult)(scope));
            //   });

            //
            // This tells us if we are using the Forward, Reverse, or Batch
            // Geocoder provided by the Mapbox Geocoding API
            //
            scope.mapboxGeocoderDirection = (scope.mapboxGeocoderDirection) ? scope.mapboxGeocoderDirection: 'forward';

            //
            // Keep an eye on the Query model so that when it's updated we can
            // execute a the Reuqest agains the Mapbox Geocoding API
            //
            scope.$watch('geocode_query', function(query) {

              var query_ = (scope.mapboxGeocoderAppend) ? query + ' ' + scope.mapboxGeocoderAppend : query;

              //
              // If the user types, make sure we cancel and restart the timeout
              //
              $timeout.cancel(timeout);

              //
              // If the user stops typing for 500 ms then we need to go ahead and
              // execute the query against the Mapbox Geocoding API
              //
              timeout = $timeout(function () {

                //
                // The Mapbox Geocoding Service in our application provides us
                // with a deferred promise with our Mapbox Geocoding API request
                // so that we can handle the results of that request however we
                // need to.
                //
                if (query) {
                  var results = MapboxGLGeocodingService[scope.mapboxGeocoderDirection](query_).then(function(results) {
                    scope.results = results;
                  });
                }

              }, 500);

            });

            //
            // Geocoded Address Selection
            //
            scope.address = {
              select: function(selectedValue) {

                //
                // Assign the selected value to back to our scope. The developer
                // should be able to use the results however they like. For
                // instance they may need to use the `Response` from this request
                // to perform a query against another database for geolookup or
                // save this value to the database.
                //
                scope.mapboxGeocoderQuery = selectedValue.place_name;
                scope.model = selectedValue;

                //
                // Once we're finished we need to make sure we empty the result
                // list. An empty result list will be hidden.
                //
                scope.geocode_query = null;
                scope.results = null;

              }
            };

          }
      };

    });

})();

'use strict';

/**
 * @ngdoc overview
 * @name WaterReporter
 * @description
 *     The WaterReporter Website and associated User/Manager Site
 * Main module of the application.
 */
angular
  .module('collaborator', []);

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('collaborator')
    .service('Collaborators', function (environment, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/user'), {
        id: '@id'
      }, {
        query: {
          method: 'GET',
          isArray: false
        },
        invite: {
          method: 'POST',
          isArray: false,
          url: environment.apiUrl.concat('/v1/data/collaborator/invite')
        }
      });
    });

}());

(function() {

  'use strict';

  /*jshint camelcase: false */

  /**
   * @ngdoc directive
   * @name managerApp.directive:collaboratorInvite
   * @description
   *   The Mapbox Geocoder directive enables developers to quickly add inline
   *   geocoding capabilities to any HTML <input> or <textarea>
   */
  angular.module('collaborator')
    .directive('collaboratorInvite', function (Collaborators, $compile, $http, $templateCache, $timeout, TemplateLoader) {

      return {
          restrict: 'A',
          scope: {
            collaboratorInviteQuery: '=',
            collaboratorInviteResponse: '=',
            collaboratorInviteResults: '=?'
          },
          link: function(scope, element, attrs) {

            console.log('collaboratorInvite Directive Loaded Successfully');

            //
            // Setup up our timeout and the Template we will use for display the
            // results from the Mapbox Geocoding API back to the user making the
            // Request
            //
            var timeout;

            //
            // Take the template that we loaded into $templateCache and pull
            // out the HTML that we need to create our drop down menu that
            // holds our Mapbox Geocoding API results
            //
            TemplateLoader.get('/modules/shared/collaborator/collaboratorInviteResults--view.html')
              .success(function(templateResult) {
                element.after($compile(templateResult)(scope));
              });

            //
            // Keep an eye on the Query model so that when it's updated we can
            // execute a the Reuqest agains the Mapbox Geocoding API
            //
            scope.$watch('collaboratorInviteQuery', function(query) {

              //
              // If the user types, make sure we cancel and restart the timeout
              //
              $timeout.cancel(timeout);

              //
              // If the user stops typing for 500 ms then we need to go ahead and
              // execute the query against the Mapbox Geocoding API
              //
              timeout = $timeout(function () {

                //
                // The Mapbox Geocoding Service in our application provides us
                // with a deferred promise with our Mapbox Geocoding API request
                // so that we can handle the results of that request however we
                // need to.
                //
                if (query && !scope.collaboratorInviteResponse) {
                  var results = Collaborators.query({
                    q: {
                      filters: [
                        {
                          name: 'email',
                          op: 'ilike',
                          val: '%' + query + '%'
                        }
                      ]
                    }
                  }).$promise.then(function(successResponse) {
                    console.log('successResponse', successResponse);
                    scope.collaboratorInviteResults = successResponse;
                  }, function(errorResponse) {
                    console.error('errorResponse', errorResponse);
                  });
                }

              }, 500);

            });

            //
            // Geocoded Address Selection
            //
            scope.option = {
              select: function(selectedValue, newUser) {

                //
                // Assign the selected value to back to our scope. The developer
                // should be able to use the results however they like. For
                // instance they may need to use the `Response` from this request
                // to perform a query against another database for geolookup or
                // save this value to the database.
                //
                if (newUser) {
                  selectedValue = {
                    properties: {
                      email: selectedValue
                    }
                  }
                }

                scope.collaboratorInviteQuery = selectedValue;
                scope.collaboratorInviteResponse = selectedValue;

                //
                // Once we're finished we need to make sure we empty the result
                // list. An empty result list will be hidden.
                //
                scope.collaboratorInviteResults = null;
              }
            };

          }
      };
    });

}());

(function () {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Notifications', function Notifications($rootScope, $timeout) {

      $rootScope.notifications = {
        objects: [],
        success: function(alertTitle, alertMessage) { // kwargs in this context should be an
          $rootScope.notifications.objects.push({
            type: 'success',
            title: (alertTitle) ? alertTitle : 'Great!',
            message: (alertMessage) ? alertMessage : 'Your report was saved.'
          });
        },
        info: function(alertTitle, alertMessage) {
          $rootScope.notifications.objects.push({
            type: 'info',
            title: (alertTitle) ? alertTitle : 'FYI',
            message: (alertMessage) ? alertMessage : ''
          });
        },
        warning: function(alertTitle, alertMessage) {
          $rootScope.notifications.objects.push({
            type: 'warning',
            title: (alertTitle) ? alertTitle : 'Warning!',
            message: (alertMessage) ? alertMessage : ''
          });
        },
        error: function(alertTitle, alertMessage) {
          $rootScope.notifications.objects.push({
            type: 'error',
            title: (alertTitle) ? alertTitle : 'Uh-oh!',
            message: (alertMessage) ? alertMessage : 'We couldnt save your changes.'
          });
        },
        // dismiss: function($index) {
        //   $timeout(function() {
        //     $rootScope.notifications.objects.splice($index, 1);
        //   }, 5000);
        // },
        dismissAll: function() {
          $rootScope.notifications.objects = [];
        }
      };

    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name WaterReporter.report.controller:SingleReportController
   * @description
   *     Display a single report based on the current `id` provided in the URL
   * Controller of the waterReporterApp
   */
  angular.module('FieldDoc')
    .directive('fileUpload', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);

                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files);
                    });
                });
            }
        };
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Account', function(ipCookie, User) {

            var Account = {
                userObject: {}
            };

            Account.getUser = function() {

                var userId = ipCookie('FIELDSTACKIO_CURRENTUSER');

                if (!userId) {
                    return false;
                }

                var $promise = User.get({
                    id: userId
                });

                return $promise;
            };

            Account.setUserId = function() {
                var $promise = User.me(function(accountResponse) {

                    ipCookie('FIELDSTACKIO_CURRENTUSER', accountResponse.id, {
                        path: '/',
                        expires: 2
                    });

                    return accountResponse.id;
                });

                return $promise;
            };

            Account.hasToken = function() {
                if (ipCookie('FIELDSTACKIO_CURRENTUSER') && ipCookie('FIELDSTACKIO_SESSION')) {
                    return true;
                }

                return false;
            };

            Account.hasRole = function(roleNeeded) {

                var roles = this.userObject.properties.roles;

                if (!roles) {
                    return false;
                }

                for (var index = 0; index < roles.length; index++) {
                    if (roleNeeded === roles[index].properties.name) {
                        return true;
                    }
                }

                return false;
            };

            Account.inGroup = function(userId, group) {

                var return_ = false;

                angular.forEach(group, function(member) {
                    if (member.id === userId) {
                        return_ = true;
                    }
                });

                return return_;
            };

            Account.canEdit = function(resource) {
                if (Account.userObject && !Account.userObject.id) {
                    return false;
                }

                if (Account.hasRole('admin')) {
                    return true;
                } else if (Account.hasRole('manager') && (Account.userObject.id === resource.properties.creator_id || Account.inGroup(resource.properties.organization_id, Account.userObject.properties.account) || Account.inGroup(Account.userObject.id, resource.properties.members))) {
                    return true;
                } else if (Account.hasRole('grantee') && (Account.userObject.id === resource.properties.creator_id || Account.inGroup(Account.userObject.id, resource.properties.members))) {
                    return true;
                }

                return false;
            };

            Account.canDelete = function(resource) {
                if (Account.userObject && !Account.userObject.id) {
                    return false;
                }

                if (Account.hasRole('admin')) {
                    return true;
                } else if (Account.hasRole('manager') && (Account.userObject.id === resource.properties.creator_id || Account.inGroup(Account.userObject.id, resource.properties.members))) {
                    return true;
                } else if (resource && resource.properties && Account.hasRole('grantee') && (Account.userObject.id === resource.properties.creator_id || Account.inGroup(Account.userObject.id, resource.properties.members))) {
                    return true;
                }

                return false;
            };

            return Account;
        });

}());
(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('AnimalManure', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/animal-manure/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
      .service('Efficiency', function (environment, Preprocessors, $resource) {
        return $resource(environment.apiUrl.concat('/v1/data/efficiency/:id'), {
          'id': '@id'
        }, {
          'query': {
            'isArray': false
          },
          'update': {
            'method': 'PATCH',
            transformRequest: function(data) {
              var feature = Preprocessors.geojson(data);
              return angular.toJson(feature);
            }
          }
        });
      });

  }());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
      .service('EfficiencyAgricultureGeneric', function (environment, Preprocessors, $resource) {
        return $resource(environment.apiUrl.concat('/v1/data/efficiency-agriculture-generic/:id'), {
          'id': '@id'
        }, {
          'query': {
            'isArray': false
          },
          'update': {
            'method': 'PATCH',
            transformRequest: function(data) {
              var feature = Preprocessors.geojson(data);
              return angular.toJson(feature);
            }
          }
        });
      });

  }());

(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
     angular.module('FieldDoc')
       .service('File', function (environment, Preprocessors, $resource) {

         return $resource(environment.apiUrl.concat('/v1/media/file/:id'), {
           id: '@id'
         }, {
           query: {
             isArray: false
           },
           upload: {
             method: 'POST',
             transformRequest: angular.identity,
             headers: {
               'Content-Type': undefined
             }
           },
           update: {
             method: 'PATCH',
             transformRequest: function(data) {
               var feature = Preprocessors.geojson(data);
               return angular.toJson(feature);
             }
           }
         });

       });

}());

(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Filters', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/filters'), {
                id: '@id'
            }, {
                projectsByYear: {
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/filters/projects-by-year')
                },
                customGeographies: {
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/filters/program/:id/custom-geographies')
                },
                grantees: {
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/filters/program/:id/grantees')
                },
                practices: {
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/filters/program/:id/practices')
                }
            });

        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('GeographyService', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/program/:id/geographies'), {
                id: '@id'
            }, {
                query: {
                    isArray: false,
                    cache: true
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Image', function(environment, Preprocessors, $resource) {

            return $resource(environment.apiUrl.concat('/v1/media/image/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                upload: {
                    method: 'POST',
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                },
                update: {
                    method: 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data);
                        return angular.toJson(feature);
                    }
                },
                'delete': {
                    method: 'DELETE',
                    url: environment.apiUrl.concat('/v1/data/image/:id')
                }
            });

        });

}());
(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Landuse', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/landuse/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name Media Service
     * @description Enable consistent, system-wide handling of images
     */
    angular.module('FieldDoc')
        .service('Media', function(Image, $q) {
            return {
                images: new Array(), // empty image array for handling files
                preupload: function(filesList, fieldName) {
                    /**Process all media prior to uploading to server.

                    Create a usable array of deferred requests that will allow
                    us to keep tabs on uploads, so that we know when all
                    uploads have completed with an HTTP Response.

                    @param (array) filesList
                        A list of files to process

                    @return (array) savedQueries
                        A list of deferred upload requests
                    */

                    var self = this,
                        savedQueries = [],
                        field = (fieldName) ? fieldName : 'image';

                    angular.forEach(filesList, function(_file) {
                        savedQueries.push(self.upload(_file, field));
                    });

                    return savedQueries;
                },
                upload: function(file, field) {
                    /**Upload a single file to the server.

                    Create a single deferred request that enables us to keep
                    better track of all of the things that are happening so
                    that we are defining in what order things happen.

                    @param (file) file
                        A qualified Javascript `File` object

                    @return (object) defer.promise
                        A promise
                    */

                    var defer = $q.defer(),
                        fileData = new FormData();

                    fileData.append(field, file);

                    var request = Image.upload({}, fileData, function() {
                        defer.resolve(request);
                    });

                    return defer.promise;
                },
                remove: function(fileIndex) {
                    this.images.splice(fileIndex, 1);
                }
            };
        });

}());

(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Shapefile', function(environment, $resource) {

            return $resource(environment.apiUrl.concat('/v1/shape'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                upload: {
                    method: 'POST',
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }
            });

        });

}());
(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('LoadData', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/load-data/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('MetricService', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/metrics'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                }
            });
        });

}());
(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('MetricType', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/metric-type/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('MonitoringType', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/monitoring-type/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Nutrient', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/nutrient/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH'
        }
      });
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Organization', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/organization/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                update: {
                    method: 'PATCH'
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('OutcomeService', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/outcomes'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Practice', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/practice/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                'update': {
                    method: 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data);
                        return angular.toJson(feature);
                    }
                },
                'metrics': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/metrics'),
                    'isArray': false
                },
                'outcomes': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/outcomes'),
                    'isArray': false
                },
                'site': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/site'),
                    'isArray': false
                },
                'custom': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_custom'),
                    'isArray': false
                },
                'agricultureGeneric': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_agriculture_generic'),
                    'isArray': false
                },
                'bankStabilization': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_bank_stabilization'),
                    'isArray': false
                },
                'bioretention': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_bioretention'),
                    'isArray': false
                },
                'enhancedStreamRestoration': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_enhanced_stream_restoration'),
                    'isArray': false
                },
                'forestBuffer': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_forest_buffer'),
                    'isArray': false
                },
                'grassBuffer': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_grass_buffer'),
                    'isArray': false
                },
                'instreamHabitat': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_instream_habitat'),
                    'isArray': false
                },
                'livestockExclusion': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_livestock_exclusion'),
                    'isArray': false
                },
                'urbanHomeowner': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_urban_homeowner'),
                    'isArray': false
                },
                'shorelineManagement': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_shoreline_management'),
                    'isArray': false
                },
                'stormwater': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_stormwater'),
                    'isArray': false
                },
                'wetlandsNontidal': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_wetlands_nontidal'),
                    'isArray': false
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('PracticeCustom', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/bmp-custom/:id'), {
                'id': '@id'
            }, {
                'query': {
                    isArray: false
                },
                'metrics': {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/bmp-custom/:id/metrics')
                },
                'summary': {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/data/summary/custom/:id')
                },
                'update': {
                    method: 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data),
                            json_ = angular.toJson(feature);
                        return json_;
                    }
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('PracticeCustomReading', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/bmp-custom-reading/:id'), {
                'id': '@id'
            }, {
                'query': {
                    isArray: false
                },
                'save': {
                    method: 'POST',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data),
                            json_ = angular.toJson(feature);
                        return json_;
                    }
                },
                'update': {
                    method: 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data),
                            json_ = angular.toJson(feature);
                        return json_;
                    }
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('PracticeCustomMetric', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/bmp-custom-metric/:id'), {
                'id': '@id'
            }, {
                'query': {
                    isArray: false
                },
                'save': {
                    method: 'POST',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data),
                            json_ = angular.toJson(feature);
                        return json_;
                    }
                },
                'update': {
                    method: 'PATCH'
                }
            });
        });

}());
(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeCustomMonitoring', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-custom-monitoring/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'save': {
          method: 'POST',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data),
                json_ = angular.toJson(feature);
            return json_;
          }
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data),
                json_ = angular.toJson(feature);
            return json_;
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeAgricultureGeneric', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-agriculture-generic/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/agriculture-generic/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeUrbanHomeowner', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-urban-homeowner/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/urban-homeowner/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeBioretention', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-bioretention/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/bioretention/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeBankStabilization', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-bank-stabilization/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/bank-stabilization/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeEnhancedStreamRestoration', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-enhanced-stream-restoration/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/enhanced-stream-restoration/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeForestBuffer', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-forest-buffer/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/forest-buffer/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeGrassBuffer', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-grass-buffer/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/grass-buffer/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeInstreamHabitat', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-instream-habitat/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/instream-habitat/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeLivestockExclusion', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-livestock-exclusion/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/livestock-exclusion/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeWetlandsNonTidal', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-wetlands-nontidal/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/wetlands-nontidal/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeShorelineManagement', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-shoreline-management/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/shoreline-management/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeStormwater', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-stormwater/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/stormwater/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeType', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/practice-type/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Project', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/project/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/projects')
                },
                'summary': {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/data/summary/project/:id')
                },
                update: {
                    method: 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data);
                        return angular.toJson(feature);
                    }
                },
                sites: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/project/:id/sites')
                },
                members: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/project/:id/members')
                },
                sites: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/project/:id/sites')
                },
                minimal: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/program/:id/projects')
                },
                'metrics': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/project/:id/metrics'),
                    'isArray': false
                },
                'outcomes': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/project/:id/outcomes'),
                    'isArray': false
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name WaterReporter
     * @description
     * Provides access to the map endpoint of the WaterReporter API
     * Service in the WaterReporter.
     */
    angular.module('FieldDoc')
        .service('SearchService', function(environment, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/search'), {}, {
                query: {
                    isArray: false,
                    cache: true
                },
                users: {
                    method: 'GET',
                    isArray: false,
                    cache: true,
                    url: environment.apiUrl.concat('/v1/data/search/user')
                },
                workspace: {
                    method: 'GET',
                    isArray: false,
                    cache: true,
                    url: environment.apiUrl.concat('/v1/data/search/workspace')
                }
            });
        });

}());
(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Security', function(environment, ipCookie, $http, $resource) {

      var Security = $resource(environment.apiUrl.concat('/v1/auth/account/login'), {}, {
        save: {
          method: 'POST',
          url: environment.apiUrl.concat('/v1/auth/remote'),
          params: {
            response_type: 'token',
            client_id: environment.clientId,
            redirect_uri: environment.siteUrl.concat('/authorize'),
            scope: 'user',
            state: 'json'
          }
        },
        register: {
          method: 'POST',
          url: environment.apiUrl.concat('/v1/auth/account/register')
        },
        reset: {
          method: 'POST',
          url: environment.apiUrl.concat('/v1/auth/password/reset')
        }
      });

      Security.has_token = function() {
        return (ipCookie('FIELDSTACKIO_SESSION')) ? true: false;
      };

      return Security;
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Site', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/site/:id'), {
                id: '@id'
            }, {
                'query': {
                    isArray: false
                },
                'summary': {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/data/summary/site/:id')
                },
                'nodes': {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/data/site/:id/nodes')
                },
                'update': {
                    method: 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data);
                        return angular.toJson(feature);
                    }
                },
                'metrics': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/site/:id/metrics'),
                    'isArray': false
                },
                'outcomes': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/site/:id/outcomes'),
                    'isArray': false
                },
                'practices': {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/site/:id/practices')
                }
            });
        });

}());
(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Segment', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/segment/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        update: {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('UALStateLoad', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/urban-ual-state/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('UnitType', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/unit-type/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.template
 * @description
 * # template
 * Provider in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('Utility', function () {

    return {
      machineName: function(name) {
        if (name) {
          var removeDashes = name.replace(/-/g, ''),
              removeSpaces = removeDashes.replace(/ /g, '-'),
              convertLowerCase = removeSpaces.toLowerCase();

          return convertLowerCase;
        }

        return null;
      },
      camelName: function(name) {
        if (name) {
          return name.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
          }).replace(/\s+/g, '');
        }

        return null;
      }
    };

  });

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Snapshot', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/snapshot/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                geographies: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/snapshot/:id/geographies')
                },
                projects: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/snapshot/:id/projects')
                },
                'update': {
                    method: 'PATCH'
                }
            });
        });

}());
(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
     angular.module('FieldDoc')
       .service('Preprocessors', function ($resource) {

         return {
           geojson: function(raw) {

             var self = this;

             if (raw && raw.id && !raw.properties) {
               return {
                 id: parseInt(raw.id)
               };
             }
             else if (raw && !raw.id && !raw.properties) {
               return;
             }

             var feature = {};

             //
             // Process all of the object, array, string, numeric, and boolean
             // fields; Adding them to the main feature object;
             //
             angular.forEach(raw.properties, function(attribute, index) {

               var value = null;

               if (angular.isArray(attribute)) {
                 var newArray = [];

                 angular.forEach(attribute, function (childObject) {
                   newArray.push(self.geojson(childObject));
                 });

                 value = newArray;
               }
               else if (angular.isObject(attribute)) {
                 value = self.geojson(attribute);
               }
               else {
                 value = attribute;
               }
               feature[index] = value;
             });

             //
             // If a `geometry` attribute is present add it to the main feature
             // object;
             //
             if (raw.geometry) {
               feature.geometry = raw.geometry;
             }

             return feature;
           }
         };

       });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('User', function (environment, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/user/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        update: {
          method: 'PATCH'
        },
        me: {
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/user/me')
        }
      });
    });

}());

(function() {

    'use strict';

    angular.module('FieldDoc')
        .factory('FilterStore', function() {

            return {
                // index: {
                //     'geography': null,
                //     'practice': null,
                //     'project': null,
                //     'organization': null,
                //     'status': null
                // },
                index: [],
                addItem: function(obj) {
                    // this.index[category] = obj;

                    this.index.push(obj);

                    // if (this.index.length < 2) {

                    //     this.index.push(obj);

                    // } else {

                    //     this.index[1] = obj;

                    // }

                },
                clearItem: function(obj) {

                    var items = this.index.filter(function(item) {

                        return (item.name !== obj.name);

                    });

                    this.index = items;

                },
                clearAll: function(obj) {

                    this.index = [];

                }

            };

        });

}());
(function() {

    'use strict';

    angular.module('FieldDoc')
        .service('ProjectStore', function() {

            this.filteredProjects = [];

            this.projects = [];

            this.filterProjects = function($item) {

                console.log('ProjectStore.filterProjects.$item', $item);

                var matches;

                var collection = $item.category;

                switch (collection) {

                    case 'organization':

                        matches = this.projects.filter(function(datum) {

                            return datum.organizations.indexOf($item.name) >= 0;

                        });

                        break;

                    case 'geography':

                        matches = this.projects.filter(function(datum) {

                            return datum.geographies.indexOf($item.name) >= 0;

                        });

                        break;

                    case 'practice':

                        matches = this.projects.filter(function(datum) {

                            return datum.practices.indexOf($item.name) >= 0;

                        });

                        break;

                    case 'project':

                        matches = this.projects.filter(function(datum) {

                            return datum.name === $item.name;

                        });

                        break;

                    case 'project status':

                        matches = this.projects.filter(function(datum) {

                            return datum.workflow_state === $item.name;

                        });

                        break;

                    default:

                        break;

                }

                this.filteredProjects = matches;

                console.log('ProjectStore.filterProjects.organization.matches', matches);

                return matches;

            };

            this.createSet = function(a, b) {

                var primaryIndex = [],
                    secondaryIndex = [],
                    mergedIndex = [],
                    set = [];

                //
                // Create indices of numeric project identifiers
                //

                a.forEach(function(datum) {

                    primaryIndex.push(datum.id);

                });

                console.log('ProjectStore.createSet.primaryIndex', primaryIndex);

                b.forEach(function(datum) {

                    secondaryIndex.push(datum.id);

                });

                console.log('ProjectStore.createSet.secondaryIndex', secondaryIndex);

                //
                // Merge the arrays
                //

                a.concat(b);

                //
                // Populate a new array with projects
                // whose numeric identifiers appear in
                // both indices.
                //

                a.forEach(function(datum) {

                    if ((primaryIndex.indexOf(datum.id) >= 0 &&
                        secondaryIndex.indexOf(datum.id) >= 0) &&
                        mergedIndex.indexOf(datum.id) < 0) {

                        mergedIndex.push(datum.id);

                        set.push(datum);

                    }

                });

                return set;

            };

            this.filterAll = function(list) {

                var a,
                    b;

                if (!list || list.length < 1) {

                    this.reset();

                    return;

                }

                if (list.length === 1) {

                    this.filterProjects(list[0]);

                } else {

                    a = this.filterProjects(list[0]);

                    console.log('ProjectStore.filterAll.a', a);

                    b = this.filterProjects(list[1]);

                    console.log('ProjectStore.filterAll.b', b);

                    this.filteredProjects = this.createSet(a, b);

                }

            };

            this.setProjects = function(list) {

                this.projects = list;

                this.filteredProjects = list;

            };

            this.reset = function() {

                this.filteredProjects = this.projects.slice(0);

            };

        });
}());
(function() {

  'use strict';

  angular.module('FieldDoc')
    .directive('relationship', function (environment, $http, $timeout) {
      return {
        scope: {
          table: '=',
          field: '=',
          display: '=',
          model: '=',
          multiple: '=',
          placeholder: '='
        },
        templateUrl: '/modules/shared/directives/relationship/relationship.html',
        restrict: 'E',
        link: function (scope, el, attrs) {

          var container = el.children()[0],
              input = angular.element(container.children[0]),
              dropdown = angular.element(container.children[1]),
              timeout;

          scope.relationship_focus = false;

          var getFilteredResults = function(table){
            var url = environment.apiUrl.concat('/v1/data/', table);

            $http({
              method: 'GET',
              url: url,
              params: {
                'q': {
                  'filters':
                  [
                    {
                      'name': scope.field,
                      'op': 'ilike',
                      'val': scope.searchText + '%'
                    }
                  ]
                },
                'results_per_page': 25
              }
            }).success(function(data){

              var features = data.features;

              scope.features = [];

              //
              // Process features prior to display
              //
              angular.forEach(features, function(feature, $index) {

                var result = [];

                angular.forEach(scope.display, function(field) {
                  result.push(feature.properties[field]);
                });

                scope.features.push({
                  'id': feature.id,
                  'feature': feature,
                  'text': result.join(', ')
                });
              });

            });
          };

          var set = function(arr) {
            return arr.reduce(function (a, val) {
              if (a.indexOf(val) === -1) {
                  a.push(val);
              }
              return a;
            }, []);
          };

          //search with timeout to prevent it from firing on every keystroke
          scope.search = function(){
            $timeout.cancel(timeout);

            timeout = $timeout(function () {
              getFilteredResults(scope.table);
            }, 200);
          };

          scope.addFeatureToRelationships = function(feature){

            if (angular.isArray(scope.model)) {
              scope.model.push(feature);
              scope.model = set(scope.model);
            } else {
              scope.model = feature;
            }


            // Clear out input field
            scope.searchText = '';
            scope.features = [];
          };

          scope.removeFeatureFromRelationships = function(index) {
            scope.model.splice(index, 1);
          };

          scope.resetField = function() {
            scope.searchText = '';
            scope.features = [];
            scope.relationship_focus = false;
            console.log('Field reset');
          };

        }
      };
  });

}());

(function() {

  'use strict';

  angular.module('FieldDoc')
    .directive('organization', function (environment, $http, $timeout) {
      return {
        scope: {
          table: '=',
          field: '=',
          display: '=',
          model: '=',
          tabindexnumber: '=',
          placeholder: '=',
          addNew: '='
        },
        templateUrl: '/modules/shared/directives/organization/organization.html',
        restrict: 'E',
        link: function (scope, el, attrs) {

          var container = el.children()[0],
              input = angular.element(container.children[0]),
              dropdown = angular.element(container.children[1]),
              timeout;

          scope.relationship_focus = false;

          var getFilteredResults = function(table){
            var url = environment.apiUrl.concat('/v1/data/', table);

            $http({
              method: 'GET',
              url: url,
              params: {
                'q': {
                  'filters':
                  [
                    {
                      'name': scope.field,
                      'op': 'ilike',
                      'val': scope.searchText + '%'
                    }
                  ]
                },
                'results_per_page': 25
              }
            }).success(function(data){

              var features = data.features;

              scope.features = [];

              //
              // Process features prior to display
              //
              angular.forEach(features, function(feature, $index) {

                var result = [];

                angular.forEach(scope.display, function(field) {
                  result.push(feature.properties[field]);
                });

                scope.features.push({
                  'id': feature.id,
                  'feature': feature,
                  'text': result.join(', ')
                });
              });

            });
          };

          var set = function(arr) {
            return arr.reduce(function (a, val) {
              if (a.indexOf(val) === -1) {
                  a.push(val);
              }
              return a;
            }, []);
          };

          //search with timeout to prevent it from firing on every keystroke
          scope.search = function(){
            $timeout.cancel(timeout);

            timeout = $timeout(function () {
              getFilteredResults(scope.table);
            }, 200);
          };

          scope.addNewFeature = function() {
            var _newFeature = {
              properties: {
                name: scope.searchText
              }
            };

            if (angular.isArray(scope.model)) {
              scope.model.push(_newFeature);
              scope.model = set(scope.model);
            } else {
              scope.model = _newFeature;
            }

            // Clear out input field
            scope.searchText = '';
            scope.features = [];
          }

          scope.addFeatureToRelationships = function(feature){

            if (angular.isArray(scope.model)) {
              scope.model.push(feature);
              scope.model = set(scope.model);
            } else {
              scope.model = feature;
            }


            // Clear out input field
            scope.searchText = '';
            scope.features = [];
          };

          scope.removeFeatureFromRelationships = function(index) {
            scope.model.splice(index, 1);
          };

          scope.resetField = function() {
            scope.searchText = '';
            scope.features = [];
            scope.relationship_focus = false;
            console.log('Field reset');
          };

        }
      };
  });

}());

(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('globalSearch', [
            '$window',
            '$location',
            '$filter',
            '$http',
            'SearchService',
            'ProjectStore',
            'FilterStore',
            function($window, $location, $filter, $http, SearchService,
                ProjectStore, FilterStore) {
                return {
                    restrict: 'EA',
                    // scope: {
                    //     filterProjects: '&'
                    // },
                    link: function(scope, element, attrs) {

                        scope.query = undefined;

                        // The user triggered a selection action

                        scope.routeTo = function(item, model, label) {

                            // $window.location.href = item.permalink;

                            console.log('searchItem', item);

                            var path = item.category + 's/' + item.id;

                            // $location.path(item.permalink).search({});

                            $location.path(path).search({});

                        };

                        // Populate a list of possible matches based on the search string

                        scope.fetchSuggestions = function(a, scope_) {

                            var params = {
                                q: a
                            };

                            if (typeof scope_ === 'string' &&
                                scope_.length > 0) {

                                params.scope = scope_;

                            }

                            return SearchService.get(params).$promise.then(function(response) {

                                console.log(response);

                                return response.results;

                            });

                        };

                        scope.setFilter = function($item, $model, $label) {

                            scope.query = undefined;

                            // FilterStore.clearAll();

                            FilterStore.addItem($item);

                            console.log('FilterStore.index', FilterStore.index);

                            // ProjectStore.filterProjects($item);

                            // ProjectStore.filterAll(FilterStore.index);

                        };

                    }

                };
            }
        ]);

}());
(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('viewFrame', ['$window',
            function($window) {
                return {
                    restrict: 'A',
                    scope: {
                        base: '='
                    },
                    link: function(scope, element, attrs) {

                        var winHeight = $window.innerHeight,
                            map = document.getElementById('map--wrapper'),
                            contentHeight = (!map || typeof map === 'undefined') ? winHeight : (winHeight - map.clientHeight);

                        console.log('winHeight', winHeight);
                        console.log('map', map);
                        console.log('contentHeight', contentHeight);

                        element.css('min-height', contentHeight + 'px');

                    }

                };
            }
        ]);

}());
'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.toAcres
 * @description
 * # toAcres
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .filter('toAcres', [function(){

    /**
     * Convert the given whole number (assuming square feet) to acres
     *
     * @param (number) squareFeet
     *    The number of square feet you wish to convert to acres
     *
     * @return (number) acres
     *    The conversion result in acres
     *
     * @see https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=acres%20to%20square%20feet
     */
    return function(squareFeet) {
      var acres = (squareFeet/43560);
      return acres;
    };

  }]);

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .filter('toArray', function(){

    //
    // This function transforms a dictionary or object into an array
    // so that we can use Filters, OrderBy, and other repeater functionality
    // with structured objects.
    //
    return  function(object) {
      
      var result = [];

      angular.forEach(object, function(value) {
        result.push(value);
      });
      
      return result;
    };

  });

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .filter('isArray', function() {
      return function (input) {
        return (angular.isArray(input)) ? true : false;
      };
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .filter('truncate', function() {

            return function(string, length) {

                if (string.length > length) {

                    return string.substr(0, length) + '…';

                } else {

                    return string;

                }

            };

        });

}());