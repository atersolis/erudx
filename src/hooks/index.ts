import { useReducer } from "react";
import { reducer, dispatch, define, assertHasReducer } from "../utils";

/**
 * To use the store as a took 
 * @param initValue initial value of store
 */
export function useStore<Store extends object>(initValue: Store): Store {
	assertHasReducer(initValue);
	let [state, disp] = useReducer(initValue.constructor[reducer], initValue);
	define(state, dispatch, disp);
	return state as Store;
}