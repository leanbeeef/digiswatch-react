export type BoardItemType = 'color' | 'image' | 'text';

export interface BoardItemBase {
  id: string;
  type: BoardItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number; // degrees
  groupId?: string; // optional grouping key
}

export interface ColorItem extends BoardItemBase {
  type: 'color';
  colorHex: string;
  label?: string;
  radius?: number;
  borderColor?: string;
}

export interface ImageItem extends BoardItemBase {
  type: 'image';
  src: string;
  alt?: string;
}

export interface TextItem extends BoardItemBase {
  type: 'text';
  content: string;
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  textBgTransparent?: boolean;
}

export type BoardItem = ColorItem | ImageItem | TextItem;

export interface MoodBoard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: BoardItem[];
}
