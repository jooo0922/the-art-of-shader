import styles from "./WorkPageInfo.module.css";
import WORK_PAGE_INFO_DATA from "./workPageInfoData";

type Props = {
  pathName: string;
};

const WorkPageInfo = ({ pathName }: Props) => {
  const curData = WORK_PAGE_INFO_DATA.find(
    (data) => data.pathName === pathName
  );
  return (
    <div className={styles.WorkPageInfo}>
      <div className={styles.title}>{curData?.title}</div>
      <div className={styles.date}>
        <span>COMPLETED: </span>
        <span>{curData?.date}</span>
      </div>
      <div className={styles.reference}>
        <span>INSPIRED BY: </span>
        <a href={curData?.referenceUrl}>{curData?.referenceUrl}</a>
      </div>
    </div>
  );
};

export default WorkPageInfo;
