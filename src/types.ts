export interface Element {
  atomicNumber: number;
  symbol: string;
  nameKey: string;
  period: number;
  group: number;
  category: ElementCategory;
  block: 's' | 'p' | 'd' | 'f';
  atomicMass: number;
  electronegativity?: number;
  atomicRadius?: number;
  ionizationEnergy?: number;
  meltingPoint?: number;
  boilingPoint?: number;
  density?: number;
  yearDiscovered?: number;
  discoverer?: string;
}

export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide'
  | 'unknown';

export type LayerType = 'categorical' | 'continuous' | 'multi-categorical';

export interface Layer {
  id: string;
  titleKey: string;
  descriptionKey: string;
  colorScale: string;
  type: LayerType;
  unit?: string;
  values: Record<string, unknown>;
}

export interface ColorScale {
  type: 'categorical' | 'continuous';
  entries?: CategoricalEntry[];
  stops?: ColorStop[];
  scale?: 'linear' | 'log10';
}

export interface CategoricalEntry {
  key: string;
  colorVar: string;
  labelKey: string;
}

export interface ColorStop {
  value: number;
  color: string;
}

export interface AppState {
  activeLayerId: string;
  language: Language;
  selectedElement: number | null;
}

export type Language = 'en' | 'ru' | 'hy';

export type TranslationCatalog = Record<string, string>;

export type ColorScaleMap = Record<string, ColorScale>;

