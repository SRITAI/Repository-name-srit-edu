import { z } from "zod";
export function cursor(created_at: string, id: string) {
  return `${created_at}|${id}`;
}
export function cursorFilter(value: string) {
  const [created, id] = value.split("|");
  z.iso.datetime({ offset: true }).parse(created);
  z.uuid().parse(id);
  return `created_at.lt.${created},and(created_at.eq.${created},id.lt.${id})`;
}
