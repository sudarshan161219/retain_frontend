export const truncateFileName = (name: string, maxLength = 25): string => {
  const dotIndex = name.lastIndexOf(".");

  // Remove extension
  const baseName = dotIndex !== -1 ? name.slice(0, dotIndex) : name;

  if (baseName.length <= maxLength) return baseName;

  return `${baseName.slice(0, maxLength - 3)}...`;
};
