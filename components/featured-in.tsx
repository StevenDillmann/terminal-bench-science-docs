import { FEATURED_IN } from '@/lib/featured-in';

/**
 * Inline list of the model releases that featured the benchmark, as links:
 * "Claude Fable 5.1 and GPT-6 Astra". Reads oldest-first so it scans as a
 * timeline inside a sentence.
 */
export function FeaturedInLinks() {
  const items = [...FEATURED_IN].reverse();
  return (
    <>
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0
            ? index === items.length - 1
              ? items.length > 2
                ? ', and '
                : ' and '
              : ', '
            : null}
          <a href={item.href} target="_blank" rel="noreferrer">
            {item.model}
          </a>
        </span>
      ))}
    </>
  );
}
