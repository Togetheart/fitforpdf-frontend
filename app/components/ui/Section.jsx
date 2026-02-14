import React from 'react';

export default function Section({
  id,
  index = 0,
  children,
  testId,
  className = '',
  bg,
  maxWidth = 'max-w-[960px]',
}) {
  const resolvedBg = bg ?? (index % 2 === 0 ? 'bg-white' : 'bg-gray-50');
  const testIdValue = testId ?? `section-${id}`;

  return (
    <section
      id={id}
      className={`${resolvedBg} ${className}`}
      data-section-bg={resolvedBg === 'bg-gray-50' ? 'gray' : 'white'}
      data-testid={testIdValue}
    >
      <div className={`mx-auto flex w-full flex-col gap-6 ${maxWidth} px-4 py-10 sm:px-6 sm:py-12`}>
        {children}
      </div>
    </section>
  );
}
