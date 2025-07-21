export const safeJsonParse = (
  str: string
): { message: string; status: number } | null => {
  try {
    const parsed = JSON.parse(str);
    return parsed &&
      typeof parsed === "object" &&
      parsed.message &&
      parsed.status
      ? parsed
      : null;
  } catch {
    return null;
  }
};
