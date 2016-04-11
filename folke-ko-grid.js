/*Copyright (C) 2016 Sidoine De Wispelaere

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.*/
define(["require", "exports", 'knockout', "../folke-ko-infinite-scroll/infinite-scroll"], function (require, exports, ko, infiniteScroll) {
    "use strict";
    /**
     * Creates an observable array with the SearchArray extensions
     * @param options The options for the SearchArray
     * @param value The initial values
     */
    function searchArray(options, value) {
        return ko.observableArray(value).extend({ searchArray: options });
    }
    exports.searchArray = searchArray;
    /**
     * Describes an extension to an observable array that adds a method to load more data
     * @param target The observable that is extended
     * @param options The options
     */
    function searchArrayExtension(target, options) {
        target.sortColumn = ko.observable(options.parameters.sortColumn);
        target.subscription = target.sortColumn.subscribe(function (newValue) {
            options.parameters.sortColumn = newValue;
            target.refresh();
        });
        infiniteScroll.scrollableArrayExtension(target, options);
    }
    exports.searchArrayExtension = searchArrayExtension;
    ;
    var ViewModel = (function () {
        function ViewModel(params, nodes) {
            var _this = this;
            this.columnClass = function (column) {
                var sortElement = column.sort;
                if (sortElement == null)
                    return;
                return ko.pureComputed(function () {
                    var value = _this.rows.sortColumn();
                    if (value === sortElement + '-asc') {
                        return sortElement + ' asc';
                    }
                    else if (value === sortElement + '-desc') {
                        return sortElement + ' desc';
                    }
                    else {
                        return sortElement + ' asc-desc';
                    }
                });
            };
            this.sort = function (column) {
                if (!column.sort)
                    return;
                var value = _this.rows.sortColumn();
                if (value === column.sort + '-asc') {
                    _this.rows.sortColumn(column.sort + '-desc');
                }
                else {
                    _this.rows.sortColumn(column.sort + '-asc');
                }
            };
            this.rows = params['rows'];
            var emptyMessage = this.rows.options.emptyMessage;
            this.empty = ko.computed(function () { return !_this.rows.updating() && _this.rows().length === 0 ? emptyMessage : null; });
            this.columns = params['columns'] || this.rows.options.columns;
            this.nodes = nodes;
        }
        ViewModel.prototype.dispose = function () { };
        return ViewModel;
    }());
    exports.ViewModel = ViewModel;
    var viewModel = {
        createViewModel: function (params, componentInfo) {
            var nodes = componentInfo.templateNodes;
            // Petite bidouille pour se débarrasser du tbody qui est rajouté automatiquement si on met un tr dans un table
            var tbody = nodes.filter(function (x) { return x.localName === 'tbody'; })[0];
            if (tbody) {
                nodes = [];
                var childNodes = tbody.childNodes;
                for (var i = 0; i < childNodes.length; i++)
                    nodes.push(childNodes[i]);
            }
            return new ViewModel(params, nodes);
        }
    };
    var template = "<!-- ko if: empty -->\n<div class=\"emptylist\" data-bind=\"text: empty\"></div>\n<!-- /ko -->\n<!-- ko ifnot: empty -->\n<table class=\"grid\">\n    <thead>\n    <tr data-bind=\"foreach: columns\">\n        <!-- ko if: $data.cond == null || $data.cond() -->\n        <!-- ko if: $data.sort -->\n        <th data-bind=\"click: $parent.sort, css: $data.css, css: $parent.columnClass($data)\"><span data-bind=\"text: text\"></span></th>\n        <!-- /ko -->\n        <!-- ko ifnot: $data.sort -->\n        <th data-bind=\"css: $data.css, text: text\"></th>\n        <!-- /ko -->\n        <!-- /ko -->\n    </tr>\n    </thead>\n    <tbody data-bind=\"template: { nodes: nodes, foreach : rows }\">\n    </tbody>\n</table>\n<div data-bind=\"infiniteScroll: rows\">&nbsp;</div>\n<!-- /ko -->";
    /**
     * Register the extensions
     */
    function register() {
        ko.extenders['searchArray'] = searchArrayExtension;
        ko.components.register('grid', {
            template: template,
            viewModel: viewModel
        });
    }
    exports.register = register;
});
