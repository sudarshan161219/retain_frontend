import React from "react";
import styles from "./index.module.css";
import {
  FileText,
  FileImage,
  FileArchive,
  FileAudio,
  FileVideo,
  File,
} from "lucide-react";

export const getFileIcon = (
  type: string | null | undefined
): React.ReactNode => {
  if (!type) return <File className={styles.icon} size={16} />;

  if (type.startsWith("image/"))
    return <FileImage className={styles.icon} size={16} />;
  if (type.startsWith("video/"))
    return <FileVideo className={styles.icon} size={16} />;
  if (type.startsWith("audio/"))
    return <FileAudio className={styles.icon} size={16} />;
  if (
    type === "application/pdf" ||
    type.includes("msword") ||
    type.includes("wordprocessingml") ||
    type.includes("vnd.ms-excel") ||
    type.includes("spreadsheetml")
  )
    return <FileText className={styles.icon} size={16} />;
  if (
    type === "application/zip" ||
    type === "application/x-zip-compressed" ||
    type.includes("rar") ||
    type.includes("tar")
  )
    return <FileArchive className={styles.icon} size={16} />;

  return <File className={styles.icon} size={16} />;
};
