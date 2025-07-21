import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Spinner } from '@fluentui/react/lib/Spinner';
import styles from './SpListCardScroller.module.scss';
import { getSP } from '../../../pnpjsConfig';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface IListCardScrollerProps {
  siteUrl: string;
  listTitle: string;
  viewName: string;
  titleField: string;
  descriptionFields: string[];
  footerField: string;
  fieldLabels: Record<string, string>;
  imageField?: string;
  theme?: IReadonlyTheme;
}

interface IListItem {
  Id: number;
  [key: string]: any;
}

export const ListCardScroller: React.FC<IListCardScrollerProps> = (props) => {
  const [items, setItems] = useState<IListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryColor = props.theme?.palette?.themePrimary || '#0078D4';

  function formatDate(value: any): string {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB');
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
    const loadItems = async () => {
      if (!props.listTitle || !props.viewName) return;
      setLoading(true);

      const sp = getSP();
      try {
        const viewXml = await sp.web.lists.getByTitle(props.listTitle).views.getByTitle(props.viewName).renderAsHtml();
        const result = await sp.web.lists.getByTitle(props.listTitle).renderListDataAsStream({ ViewXml: viewXml });

        setItems(result?.Row || []);
      } catch (err) {
        console.error('Error loading view data', err);
      }

      setLoading(false);
    };

    loadItems();
  }, [props.listTitle, props.viewName]);

  return (
    <div>
      {loading ? (
        <Spinner label="Loading items..." />
      ) : (
        <div className={styles.carouselWrapper}>
          <button
            className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <div className={styles.cardContainer} ref={scrollRef}>
            {items.map((item, index) => (
              <div className={styles.card} style={{ borderTop: `4px solid ${primaryColor}` }} key={index}>
                <h3 className={styles.cardTitle} style={{ color: primaryColor }}>
                  {item[props.titleField]}
                </h3>
                {props.imageField && item[props.imageField] && (
                  <div className={styles.cardImageWrapper}>
                    <img
                      className={styles.cardImage}
                      src={item[props.imageField]?.Url || `${props.siteUrl}/Lists/${props.listTitle}/Attachments/${item.ID}/${item[props.imageField].fileName}`}
                      alt="Card image"
                    />
                  </div>
                )}
                <div className={styles.cardDetails}>
                  {props.descriptionFields.map((fieldKey: string) => (
                    <div key={fieldKey} className={styles.cardRow}>
                      <span className={styles.cardLabel}>
                        {props.fieldLabels[fieldKey] || fieldKey}:
                      </span>
                      <span className={styles.cardValue}>{formatDate(item[fieldKey])}</span>
                    </div>
                  ))}
                </div>
                {props.footerField && item[props.footerField] && (
                  <div className={styles.cardFooter}>
                    <span className={styles.cardLabel}>
                      {props.fieldLabels[props.footerField] || props.footerField}:{' '}
                    </span>
                    <span className={styles.footerDate} style={{ color: primaryColor }}>
                      {formatDate(item[props.footerField])}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};
