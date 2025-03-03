import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const moment = dayjs;
