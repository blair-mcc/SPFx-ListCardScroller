import * as React from 'react';
import { useEffect, useState } from 'react';
import { Spinner } from '@fluentui/react/lib/Spinner';
import styles from './SpListCardScroller.module.scss';
import { getSP } from '../../../pnpjsConfig';
import { IReadonlyTheme } from '@microsoft/sp-component-base';


export interface IListCardScrollerProps {
  siteUrl: string;
  listTitle: string;
  titleField: string;
  descriptionFields: string[];
  footerField: string;
  theme?: IReadonlyTheme
}

interface IListItem {
  Id: number;
  [key: string]: any;
}

export const ListCardScroller: React.FC<IListCardScrollerProps> = (props) => {
  const [items, setItems] = useState<IListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const primaryColor = props.theme?.palette?.themePrimary || '#0078D4';

  function formatDate(value: any): string {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB'); // dd/MM/yyyy
      }
    } catch {}
    return value;
  }


  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -scrollRef.current.offsetWidth, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: scrollRef.current.offsetWidth, behavior: 'smooth' });
  };


  useEffect(() => {
  if (
    props.listTitle &&
    props.titleField &&
    props.footerField &&
    props.descriptionFields?.length
  ) {
    setLoading(true);
    const sp = getSP();
    const selectFields = [
      'Id',
      props.titleField,
      props.footerField,
      ...props.descriptionFields
    ];

    sp.web.lists
      .getByTitle(props.listTitle)
      .items.select(...selectFields)()
      .then((data: IListItem[]) => {
        setItems(data);
        setLoading(false);
      });
  }
}, [
  props.listTitle,
  props.titleField,
  props.footerField,
  props.descriptionFields
]);


  return (
  <div>
    {loading ? (
      <Spinner label="Loading items..." />
    ) : (
      <div className={styles.carouselWrapper}>
        <button className={`${styles.scrollButton} ${styles.scrollButtonLeft}`} onClick={scrollLeft} aria-label="Scroll left">‹</button>
          <div className={styles.cardContainer} ref={scrollRef}>
            {items.map((item, index) => (
              <div className={styles.card} style={{ borderTop: `4px solid ${primaryColor}` }} key={index}>
                <h3 className={styles.cardTitle} style={{ color: `${primaryColor}` }} >{formatDate(item[props.titleField])}</h3>
                <div className={styles.cardDetails}>
                  {props.descriptionFields.map((fieldKey: string) => (
                    <div key={fieldKey} className={styles.cardRow}>
                      <span className={styles.cardLabel}>
                        {fieldKey.replace(/_/g, ' ').replace(/x002f/g, '/')}:
                      </span>
                      <span className={styles.cardValue}>
                        {formatDate(item[fieldKey])}
                      </span>
                    </div>
                  ))}
                </div>

                {props.footerField && item[props.footerField] && (
                  <div className={styles.cardFooter}>
                    Est. Arrival:{' '}
                    <span className={styles.footerDate} style={{ color: `${primaryColor}` }} >
                      {formatDate(item[props.footerField])}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        <button className={`${styles.scrollButton} ${styles.scrollButtonRight}`} onClick={scrollRight} aria-label="Scroll right">›</button>
      </div>
    )}
  </div>
);

};
