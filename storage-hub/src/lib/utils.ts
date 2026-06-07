import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseStringify = (value: unknown) => {
  const serialized = JSON.stringify(value);
  return serialized ? JSON.parse(serialized) : undefined;
};

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export {
  calculatePercentage,
  constructDownloadUrl,
  constructFileUrl,
  convertFileSize,
  formatDateTime,
  getFileIcon,
  getFileType,
  getFileTypesParams,
  getUsageSummary,
} from "./file-utils";
