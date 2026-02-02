export interface Icon {
  id: string;
  name: string;
  src: string;
  category: string;
}

export interface TouchPanel {
  id: string;
  size: '2' | '4' | '6' | '8';
  variant: string;
  glass: string;
  frame: string;
  icons: Icon[];
}

export type ModuleSize = '4' | '6' | '8' | '10';

export interface BuilderState {
  selectedSize: ModuleSize;
  selectedVariant: string;
  selectedGlass: string;
  selectedFrame: string;
  selectedIcons: Icon[];
}