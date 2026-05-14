import type { Layer } from './types';

export class LayerRegistry {
  private layers: Map<string, Layer> = new Map();

  register(layer: Layer): void {
    if (this.layers.has(layer.id)) {
      throw new Error(`Layer "${layer.id}" has already been registered.`);
    }

    this.layers.set(layer.id, layer);
  }

  get(id: string): Layer | undefined {
    return this.layers.get(id);
  }

  getAll(): Layer[] {
    return Array.from(this.layers.values());
  }
}

