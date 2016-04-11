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

import * as ko from 'knockout';
import * as infiniteScroll from "../folke-ko-infinite-scroll/infinite-scroll";

/** Describes a column */
export interface Column {
    sort?: string;
    text: string;
    cond?: () => boolean;
    css?: string;
    width?: number;
}

export interface SearchArrayParameters<TU> extends infiniteScroll.RequestParameters {
    sortColumn: string;
    filter: TU;
}

/**
 * The options for a SearchArray
 */
export interface Options<T, TU> extends infiniteScroll.Options<T, SearchArrayParameters<TU>> {
    /** The message to display if the array is empty. */
    emptyMessage?: string;

    /** The columns description */
    columns?: Column[];
}

/**
 * A KnockoutObservableArray with methods to request more data
 */
export interface SearchArray<T, TU> extends infiniteScroll.ScrollableArray<T, SearchArrayParameters<TU>, Options<T, TU>> {
    sortColumn: KnockoutObservable<string>;
    subscription: KnockoutSubscription;
}

/**
 * Creates an observable array with the SearchArray extensions
 * @param options The options for the SearchArray
 * @param value The initial values
 */
export function searchArray<T, TU>(options: Options<T, TU>, value?: T[]) {
    return <SearchArray<T,TU>> ko.observableArray(value).extend({ searchArray: options });
}

/**
 * Describes an extension to an observable array that adds a method to load more data
 * @param target The observable that is extended
 * @param options The options
 */
export function searchArrayExtension<T, TU>(target: SearchArray<T,TU>, options:Options<T,TU>) {
    target.sortColumn = ko.observable(options.parameters.sortColumn);
    target.subscription = target.sortColumn.subscribe(newValue => {
        options.parameters.sortColumn = newValue;
        target.refresh();
    });
    infiniteScroll.scrollableArrayExtension(target, options);    
};

export class ViewModel {
    public rows: SearchArray<any, any>;
    public columns: Column[];
    public nodes: Node[];
    public empty: KnockoutComputed<string>;

    public columnClass = (column: Column) => {
        const sortElement = column.sort;
        if (sortElement == null) return;
        return ko.pureComputed(() => {
            const value = this.rows.sortColumn();
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
    }

    public sort = (column: Column) => {
        if (!column.sort) return;
        const value = this.rows.sortColumn();
        if (value === column.sort + '-asc') {
            this.rows.sortColumn(column.sort + '-desc');
        }
        else {
            this.rows.sortColumn(column.sort + '-asc');
        }
    }

    constructor(params: any, nodes: Node[]) {
        this.rows = params['rows'];
        var emptyMessage = this.rows.options.emptyMessage;
        this.empty = ko.computed(() => !this.rows.updating() && this.rows().length === 0 ? emptyMessage : null);
        this.columns = params['columns'] || this.rows.options.columns;
        this.nodes = nodes;
    }

    public dispose() { }
}

var viewModel = {
    createViewModel(params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) {
        var nodes = componentInfo.templateNodes;
        // Petite bidouille pour se débarrasser du tbody qui est rajouté automatiquement si on met un tr dans un table
        var tbody = nodes.filter(x => x.localName === 'tbody')[0];
        if (tbody) {
            nodes = [];
            var childNodes = tbody.childNodes;
            for (var i = 0; i < childNodes.length; i++) nodes.push(childNodes[i]);
        }
        return new ViewModel(params, nodes);
    }
}

var template = `<!-- ko if: empty -->
<div class="emptylist" data-bind="text: empty"></div>
<!-- /ko -->
<!-- ko ifnot: empty -->
<table class="grid">
    <thead>
    <tr data-bind="foreach: columns">
        <!-- ko if: $data.cond == null || $data.cond() -->
        <!-- ko if: $data.sort -->
        <th data-bind="click: $parent.sort, css: $data.css, css: $parent.columnClass($data)"><span data-bind="text: text"></span></th>
        <!-- /ko -->
        <!-- ko ifnot: $data.sort -->
        <th data-bind="css: $data.css, text: text"></th>
        <!-- /ko -->
        <!-- /ko -->
    </tr>
    </thead>
    <tbody data-bind="template: { nodes: nodes, foreach : rows }">
    </tbody>
</table>
<div data-bind="infiniteScroll: rows">&nbsp;</div>
<!-- /ko -->`;

/**
 * Register the extensions
 */
export function register() {
    ko.extenders['searchArray'] = searchArrayExtension;
    ko.components.register('grid', {
        template: template,
        viewModel: viewModel
    });
}