import { globalAdapterRegistry } from '../core/adapter';
import { SWEAAdapter } from './swea';
import { JungolAdapter } from './jungol';
import { BOJAdapter } from './boj';

export const sweaAdapter = new SWEAAdapter();
export const jungolAdapter = new JungolAdapter();
export const bojAdapter = new BOJAdapter();

globalAdapterRegistry.register(sweaAdapter);
globalAdapterRegistry.register(jungolAdapter);
globalAdapterRegistry.register(bojAdapter);

export { SWEAAdapter, JungolAdapter, BOJAdapter };
