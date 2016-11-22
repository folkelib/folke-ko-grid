/// <reference types="knockout" />
import * as infiniteScroll from "folke-ko-infinite-scroll";
/** Describes a column */
export interface Column {
    sort?: string;
    text: string;
    cond?: () => boolean;
    css?: string;
    width?: number;
}
export interface SearchArrayParameters<TFilter> extends Parameters {
    filter: TFilter;
}
export interface Parameters extends infiniteScroll.RequestParameters {
    sortColumn: string;
}
/**
 * The options for a SearchArray
 */
export interface Options<T, TU extends Parameters> extends infiniteScroll.Options<T, TU> {
    /** The message to display if the array is empty. */
    emptyMessage?: string;
    /** The columns description */
    columns?: Column[];
}
/**
 * A KnockoutObservableArray with methods to request more data
 */
export declare type SearchArray<T, TU> = Grid<T, SearchArrayParameters<TU>>;
/**
 * A KnockoutObservableArray with methods to request more data
 */
export interface Grid<T, TU extends Parameters> extends infiniteScroll.ScrollableArray<T, TU, Options<T, TU>> {
    sortColumn: KnockoutObservable<string>;
    subscription: KnockoutSubscription;
}
/**
 * Creates an observable array with the SearchArray extensions
 * @param options
 * @param value
 */
export declare function grid<T, TU extends Parameters>(options: Options<T, TU>, value?: T[]): Grid<T, TU>;
/**
 * Creates an observable array with the SearchArray extensions
 * Similar to the grid method, but the parameters implements the SearchArrayParameters interface.
 * @param options The options for the SearchArray (of type SearchArrayParameters<TU>)
 * @param value The initial values
 */
export declare function searchArray<T, TU>(options: Options<T, SearchArrayParameters<TU>>, value?: T[]): Grid<T, SearchArrayParameters<TU>>;
/**
 * Describes an extension to an observable array that adds a method to load more data
 * @param target The observable that is extended
 * @param options The options
 */
export declare function searchArrayExtension<T, TU extends Parameters>(target: Grid<T, TU>, options: Options<T, TU>): void;
export declare class ViewModel {
    rows: SearchArray<any, any>;
    columns: Column[];
    nodes: Node[];
    empty: KnockoutComputed<string | undefined>;
    columnClass: (column: Column) => KnockoutComputed<string> | undefined;
    sort: (column: Column) => void;
    constructor(params: any, nodes: Node[]);
    dispose(): void;
}
declare global  {
    interface KnockoutExtenders {
        searchArray<T, TU extends Parameters>(target: Grid<T, TU>, options: Options<T, TU>): void;
    }
}
/**
 * Register the extensions
 */
export declare function register(): void;
