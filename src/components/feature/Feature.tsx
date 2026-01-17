import styles from "./index.module.css";

export const Feature = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className={styles.feature}>
    <div className={`${styles.featureIcon}`}>
      {icon}
      <h3>{title}</h3>
    </div>
    <p>{text}</p>
  </div>
);
