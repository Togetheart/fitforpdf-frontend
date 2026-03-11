/**
 * Renders a JSON-LD structured data script tag.
 * Data comes from trusted static objects defined in our own codebase
 * (siteCopy.mjs) — never from user input — so serialising is safe.
 */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- static schema objects, no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
