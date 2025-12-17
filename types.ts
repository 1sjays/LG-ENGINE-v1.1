export interface StagedFile {
  file: File;
  previewUrl?: string;
}

export interface ProcessedFile {
  original: File;
  newName: string;
}

export interface ArchiveBatch {
  id: string;
  sku: string;
  files: ProcessedFile[];
  timestamp: number;
}

export interface CsvItem {
  id: string;
  title: string;
  sku: string;
  cost: string;
  links: string[];
}

export interface ProductIdentification {
  options: string[];
  selected?: string;
}

export const CSV_CONSTANTS = {
  category: "Bags & Accessories",
  subCategory: "Luxury Bags & Accessories",
  description: "Pre-Owned",
  quantity: "1",
  type: "Auction",
  price: "1",
  shipping: "1lbs",
  offerable: "TRUE",
  hazmat: "Not Hazardous",
  condition: "Very Good"
};