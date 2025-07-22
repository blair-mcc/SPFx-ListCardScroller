import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { ChevronLeft20Regular, ChevronRight20Regular } from '@fluentui/react-icons';
import styles from './SpListCardScroller.module.scss';
import { getSP } from '../../../pnpjsConfig';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { parseISO, isValid, format } from 'date-fns';

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
  const [cardWidth, setCardWidth] = useState(260);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryColor = props.theme?.palette?.themePrimary || '#0078D4';

  function formatDate(value: any): string {
    try {
      const parsed = typeof value === 'string' ? parseISO(value) : new Date(value);
      if (isValid(parsed)) {
        return format(parsed, 'dd/MM/yyyy');
      }
    } catch {}
    return value;
  }

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -scrollRef.current.offsetWidth, behavior: 'smooth' });
    setTimeout(() => checkForOverflow(), 300);
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: scrollRef.current.offsetWidth, behavior: 'smooth' });
    setTimeout(() => checkForOverflow(), 300);
  };

  
  const checkForOverflow = () => {
    const container = scrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 1);
  };


  const calculateCardWidth = (itemCount?: number) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const containerWidth = container.clientWidth;

    const spacing = 16; // spacing between cards (e.g., margin or gap)
    // const padding = 20; // total horizontal padding *inside* each card (10 left + 10 right)
    const minCardWidth = 220;
    const maxCardWidth = 300;

    // Calculate how many cards we can *try* to fit
    const actualCount = itemCount ?? items.length;
    const maxCards = Math.min(actualCount, 5);

    for (let cards = maxCards; cards >= 1; cards--) {
      const totalSpacing = (cards - 1) * spacing;
      const availableWidth = containerWidth - totalSpacing;

      const proposedCardWidth = Math.floor(availableWidth / cards);

      console.log(items)

      console.log({
        cards,
        containerWidth,
        totalSpacing,
        availableWidth,
        proposedCardWidth
      });

      if (proposedCardWidth >= minCardWidth && proposedCardWidth <= maxCardWidth) {
        setCardWidth(proposedCardWidth);
        checkForOverflow();
        return;
      }
    }

    // Fallback if none fit within constraints
    setCardWidth(minCardWidth);
    checkForOverflow();
};

useEffect(() => {
  const container = scrollRef.current;
  if (!container) return;

  let resizeObserver: ResizeObserver;

  const handleScroll = () => {
    checkForOverflow();
  };

  const loadItems = async () => {
    if (!props.listTitle || !props.viewName) return;
    setLoading(true);

    const sp = getSP();
    try {
      const viewXml = await sp.web.lists
        .getByTitle(props.listTitle)
        .views.getByTitle(props.viewName)
        .renderAsHtml();

      const result = await sp.web.lists
        .getByTitle(props.listTitle)
        .renderListDataAsStream({ ViewXml: viewXml });

      const loadedItems = result?.Row || [];
      setItems(loadedItems);

      // Wait for render before calculating
      setTimeout(() => {
        calculateCardWidth(loadedItems.length);
        checkForOverflow();
      }, 50);
    } catch (err) {
      console.error("Error loading view data", err);
    }

    setLoading(false);
  };

  resizeObserver = new ResizeObserver(() => {
    calculateCardWidth();
    checkForOverflow();
  });

  resizeObserver.observe(container);
  container.addEventListener('scroll', handleScroll);

  void loadItems();

  return () => {
    container.removeEventListener('scroll', handleScroll);
    resizeObserver.disconnect();
  };
}, [props.listTitle, props.viewName]);






  return (
    <div>
      {loading ? (
        <Spinner label="Loading items..." />
      ) : (
        <div className={styles.carouselWrapper}>
          {canScrollLeft && (
            <button
              className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft20Regular />
            </button>
          )}
          <div className={styles.cardContainer} ref={scrollRef}>
            {items.map((item, index) => (
              <div className={styles.card} style={{ width: `${cardWidth}px`, flex: `0 0 ${cardWidth}px`, borderTop: `4px solid ${primaryColor}` }} key={index}>
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
          {canScrollRight && (
            <button
              className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight20Regular />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
