import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import AppPage from '../app/page.jsx';

function createPdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="report.pdf"',
    },
  });
}

function mockFetch(handler) {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = vi.fn(async (url, options = {}) => {
    const call = { url: String(url), options };
    calls.push(call);
    return handler(call);
  });
  return {
    calls,
    restore: () => {
      global.fetch = originalFetch;
    },
  };
}

function configureMatchMedia({ mobile = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: mobile,
      media: '(max-width: 768px)',
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

beforeEach(() => {
  configureMatchMedia({ mobile: false });
});

afterEach(() => {
  cleanup();
});

describe('/app tool-first workbench shell', () => {
  test('renders the workbench shell with the conversion tool', () => {
    render(<AppPage />);
    expect(screen.getByTestId('app-workbench')).toBeTruthy();
    expect(screen.getByRole('main', { name: /fitforpdf conversion workbench/i })).toBeTruthy();
    // The existing UploadCard is reused inside the shell (no rebuild).
    expect(screen.getByTestId('tool')).toBeTruthy();
  });

  test('renders immersive workbench regions instead of a centered page card', () => {
    render(<AppPage />);
    expect(screen.getByTestId('app-toolbar')).toBeTruthy();
    expect(screen.getByTestId('app-left-rail')).toBeTruthy();
    expect(screen.getByTestId('app-canvas')).toBeTruthy();
    expect(screen.getByTestId('app-inspector')).toBeTruthy();
    expect(screen.getByRole('complementary', { name: /recent exports and outline/i })).toBeTruthy();
    expect(screen.getByRole('complementary', { name: /conversion settings/i })).toBeTruthy();
  });

  test('matches the finalized app chrome structure', () => {
    render(<AppPage />);
    const toolbar = screen.getByTestId('app-toolbar');
    // Brand is now the centered pictogram (the wordmark stays on the marketing
    // header); the empty "New export" breadcrumb is dropped at the empty state.
    expect(within(toolbar).getByRole('img', { name: /fitforpdf/i })).toBeTruthy();
    expect(screen.queryByTestId('app-crumb')).toBeNull();
    expect(screen.getByTestId('plan-badge').textContent).toMatch(/free/i);
    expect(screen.getByRole('link', { name: /se connecter/i }).getAttribute('href')).toBe('/login');
  });

  test('shows admin unlimited quota when backend returns api_enterprise', async () => {
    const mock = mockFetch((call) => {
      if (call.url.includes('/api/quota')) {
        return new Response(JSON.stringify({
          plan: 'api_enterprise',
          apiEnterprise: { unlimited: true, usedInPeriod: 42 },
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'unexpected fetch' }), { status: 500 });
    });

    render(<AppPage />);

    await waitFor(() => {
      expect(screen.getByTestId('plan-badge').textContent).toMatch(/Admin\s*[·-]\s*unlimited/i);
    });

    mock.restore();
  });

  test('matches the finalized empty center canvas', () => {
    render(<AppPage />);
    const canvas = screen.getByTestId('app-canvas');
    expect(within(canvas).getByRole('heading', { name: /Start a new export/i })).toBeTruthy();
    expect(within(canvas).getByText(/Nothing cut off/i)).toBeTruthy();
    expect(within(canvas).getByText('Drop your Excel or CSV here')).toBeTruthy();
    expect(within(canvas).getByText('Try a sample')).toBeTruthy();
    expect(within(canvas).getByText(/id,name,region,plan,mrr/i)).toBeTruthy();
    // The demo-only "First screen / After render" mode switch was removed: it
    // had no onClick (dead control). State is driven by the render, not a toggle.
    expect(within(canvas).queryByRole('button', { name: /First screen/i })).toBeNull();
    expect(within(canvas).queryByRole('button', { name: /After render/i })).toBeNull();
  });

  test('shows the inspector header + a calm pre-render footer (no action buttons, no status badges)', () => {
    render(<AppPage />);
    const inspector = screen.getByTestId('app-inspector');
    expect(within(inspector).getByText('Adjust output')).toBeTruthy();
    // Pre-render the canvas owns "Generate". The inspector footer carries NO action
    // buttons — Download / Update preview / Render another all appear only once a PDF
    // exists (a dimmed primary pre-render reads as broken).
    expect(within(inspector).queryByRole('button', { name: /Download PDF/i })).toBeNull();
    expect(within(inspector).queryByRole('button', { name: /Update preview/i })).toBeNull();
    expect(within(inspector).queryByRole('button', { name: /Render another file/i })).toBeNull();
    // Section editing (names/colors/custom grouping) is derived from the first render,
    // so it stays absent pre-render — the panel stays calm.
    expect(within(inspector).queryByText('Section name & color')).toBeNull();
    expect(within(inspector).queryByText('Custom sections')).toBeNull();
    // The per-section "Live"/"Soon" status badges were removed (noise when all live).
    expect(within(inspector).queryByText('Live')).toBeNull();
    expect(within(inspector).queryByText('Soon')).toBeNull();
    // Export tab (Phase 3) houses Report title + Branding.
    fireEvent.click(within(inspector).getByRole('tab', { name: 'Export' }));
    expect(within(inspector).getByText('Report title')).toBeTruthy();
    expect(within(inspector).getByText('Branding')).toBeTruthy();
  });

  test('keeps inspector actions permanent below a scrollable options area', () => {
    render(<AppPage />);
    const inspector = screen.getByTestId('app-inspector');
    const options = screen.getByTestId('app-inspector-options');
    const actions = screen.getByTestId('app-inspector-actions');
    expect(inspector.contains(options)).toBe(true);
    expect(inspector.contains(actions)).toBe(true);
    expect(options.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(options.className).toMatch(/overflow-y-auto/);
    expect(actions.className).toMatch(/sticky/);
    expect(actions.className).toMatch(/bottom-0/);
    // Pre-render the action area carries the quota/pricing line (the action buttons
    // themselves appear only once a PDF exists).
    expect(within(actions).getByText(/View pricing/i)).toBeTruthy();
  });

  test('mobile-first workbench: full-width center canvas plus off-canvas rail/inspector drawers (Phase 2)', () => {
    // matchMedia mock here matches:false for every query, so useIsDesktop() is
    // false and the workbench renders the MOBILE off-canvas-drawer layout.
    render(<AppPage />);
    expect(screen.getByTestId('app-workbench').className).toMatch(/min-h-screen/);
    expect(screen.getByTestId('app-workbench').className).toMatch(/lg:h-screen/);
    // The center workspace is full width and always rendered (not in a drawer).
    expect(screen.getByTestId('app-canvas').className).toMatch(/w-full/);
    // The rail + inspector are now off-canvas drawers: fixed, dialog-role panels
    // that slide via translate-x and stay mounted regardless of open state.
    const leftDrawer = screen.getByTestId('app-drawer-left');
    const rightDrawer = screen.getByTestId('app-drawer-right');
    expect(leftDrawer.getAttribute('role')).toBe('dialog');
    expect(rightDrawer.getAttribute('role')).toBe('dialog');
    expect(leftDrawer.className).toMatch(/fixed/);
    expect(rightDrawer.className).toMatch(/fixed/);
    // Closed by default: off-screen via translate-x-full / -translate-x-full.
    expect(leftDrawer.className).toMatch(/-translate-x-full/);
    expect(rightDrawer.className).toMatch(/translate-x-full/);
    // The rail + inspector content live inside the drawers (still mounted).
    expect(leftDrawer.contains(screen.getByTestId('app-left-rail'))).toBe(true);
    expect(rightDrawer.contains(screen.getByTestId('app-inspector'))).toBe(true);
  });

  test('renders from the finalized center canvas after file selection', async () => {
    const fetchMock = mockFetch(({ url }) => {
      if (url.includes('/api/quota')) {
        return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 2 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('/api/render')) return createPdfResponse();
      return new Response('', { status: 404 });
    });

    render(<AppPage />);
    const file = new File(['a,b\n1,2'], 'customers.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByTestId('generate-file-input'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /Generate PDF/i }));

    await waitFor(() => {
      expect(fetchMock.calls.some((call) => call.url.includes('/api/render'))).toBe(true);
    });
    const renderCall = fetchMock.calls.find((call) => call.url.includes('/api/render'));
    expect(renderCall.options.body).toBeInstanceOf(FormData);
    expect(renderCall.options.body.get('file').name).toBe('customers.csv');

    fetchMock.restore();
  });

  test('sends footer text from the workbench branding control', async () => {
    const fetchMock = mockFetch(({ url }) => {
      if (url.includes('/api/quota')) {
        return new Response(JSON.stringify({ plan_type: 'credits', credits: { remaining: 5 } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('/api/render')) return createPdfResponse();
      return new Response('', { status: 404 });
    });

    render(<AppPage />);
    // Footer text lives behind the inspector's "Export" tab (Phase 3).
    fireEvent.click(screen.getByRole('tab', { name: 'Export' }));
    fireEvent.change(screen.getByLabelText(/Footer text/i), { target: { value: 'Prepared for ACME' } });
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [new File(['a,b\n1,2'], 'customers.csv', { type: 'text/csv' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: /Generate PDF/i }));

    await waitFor(() => {
      const renderCall = fetchMock.calls.find((call) => call.url.includes('/api/render'));
      expect(renderCall?.options.body.get('footerText')).toBe('Prepared for ACME');
    });

    fetchMock.restore();
  });

  test('layout toggles in the workbench Export tab reach the render payload', async () => {
    const fetchMock = mockFetch(({ url }) => {
      if (url.includes('/api/quota')) {
        return new Response(JSON.stringify({ plan_type: 'credits', credits: { remaining: 5 } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('/api/render')) return createPdfResponse();
      return new Response('', { status: 404 });
    });

    render(<AppPage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Export' }));
    // Paid plan: once the plan loads there is no Pro upsell and controls are usable.
    await waitFor(() => expect(screen.queryByTestId('app-pro-upsell')).toBeNull());
    // Drop the summary page, repeated headers, and the footer.
    fireEvent.click(screen.getByTestId('app-layout-overview-toggle'));
    fireEvent.click(screen.getByTestId('app-layout-headers-toggle'));
    fireEvent.click(screen.getByTestId('app-layout-footer-toggle'));
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [new File(['a,b\n1,2'], 'customers.csv', { type: 'text/csv' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: /Generate PDF/i }));

    await waitFor(() => {
      const renderCall = fetchMock.calls.find((call) => call.url.includes('/api/render'));
      expect(renderCall?.options.body.get('keep_overview')).toBe('0');
      expect(renderCall?.options.body.get('keep_headers')).toBe('0');
      expect(renderCall?.options.body.get('keep_footer')).toBe('0');
    });

    fetchMock.restore();
  });

  test('free plan locks branding & layout behind a Pro upsell in the workbench', async () => {
    const fetchMock = mockFetch(({ url }) => {
      if (url.includes('/api/quota')) {
        return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 3, free: { limit: 3, remaining: 3 } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('/api/render')) return createPdfResponse();
      return new Response('', { status: 404 });
    });

    render(<AppPage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByTestId('app-pro-upsell')).toBeTruthy();
    });
    // Branding + Layout controls stay visible but are wrapped in a disabled fieldset.
    expect(screen.getByTestId('app-branding-toggle').closest('fieldset')?.hasAttribute('disabled')).toBe(true);
    expect(screen.getByTestId('app-layout-overview-toggle').closest('fieldset')?.hasAttribute('disabled')).toBe(true);

    fetchMock.restore();
  });

  test('shows the quota paywall in the workbench instead of silently blocking generation', async () => {
    const fetchMock = mockFetch(({ url }) => {
      if (url.includes('/api/quota')) {
        return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 0 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('/api/render')) return createPdfResponse();
      return new Response('', { status: 404 });
    });

    render(<AppPage />);
    await waitFor(() => {
      expect(screen.getByTestId('plan-badge').textContent).toMatch(/Free\s*[·-]\s*0\s*exports?/i);
    });

    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [new File(['sku,name\n1,Widget'], 'products-100.csv', { type: 'text/csv' })] },
    });

    const canvas = screen.getByTestId('app-canvas');
    expect(within(canvas).getByTestId('workbench-quota-paywall')).toBeTruthy();
    expect(within(canvas).getByRole('button', { name: /Get 10 exports/i })).toBeTruthy();
    expect(fetchMock.calls.some((call) => call.url.includes('/api/render'))).toBe(false);

    fetchMock.restore();
  });

  test('surfaces the API path as a secondary route, not a primary CTA', () => {
    render(<AppPage />);
    const apiLinks = screen.getAllByRole('link', { name: /API/i });
    expect(apiLinks.length).toBeGreaterThanOrEqual(1);
    expect(apiLinks.every((link) => link.getAttribute('href') === '/developers')).toBe(true);
  });

  test('frames itself as a tool, not a landing page (no hero marketing sections)', () => {
    render(<AppPage />);
    // The landing-only proof/comparison sections must NOT be present on /app.
    expect(screen.queryByTestId('early-feedback-section')).toBeNull();
  });

  test('exposes a pre-render Report title control (Kunj custom title)', () => {
    render(<AppPage />);
    expect(screen.getByTestId('app-inspector')).toBeTruthy();
    // Report title lives behind the inspector's "Export" tab (Phase 3).
    fireEvent.click(screen.getByRole('tab', { name: 'Export' }));
    const input = screen.getByLabelText(/Report title/i);
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: 'Acme Q4' } });
    expect(input.value).toBe('Acme Q4');
  });

  test('exposes a pre-render column-grouping toggle (auto default, selectable)', () => {
    render(<AppPage />);
    const group = screen.getByTestId('app-columnmap');
    const auto = within(group).getByRole('button', { name: 'Auto' });
    expect(auto.getAttribute('aria-pressed')).toBe('true');
    const off = within(group).getByRole('button', { name: 'Off' });
    fireEvent.click(off);
    expect(off.getAttribute('aria-pressed')).toBe('true');
    expect(auto.getAttribute('aria-pressed')).toBe('false');
  });

  test('column-grouping toggle reaches the render URL (Off → columnMap=off)', async () => {
    const fetchMock = mockFetch(({ url }) => {
      if (url.includes('/api/quota')) {
        return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 5 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('/api/render')) return createPdfResponse();
      return new Response('', { status: 404 });
    });

    render(<AppPage />);
    // Choosing "Off" must actually flow into the request, not just flip aria-pressed.
    fireEvent.click(within(screen.getByTestId('app-columnmap')).getByRole('button', { name: 'Off' }));
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [new File(['a,b\n1,2'], 'customers.csv', { type: 'text/csv' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: /Generate PDF/i }));

    await waitFor(() => {
      const renderCall = fetchMock.calls.find((call) => call.url.includes('/api/render'));
      expect(renderCall).toBeTruthy();
      expect(renderCall.url).toMatch(/columnMap=off/);
    });

    fetchMock.restore();
  });
});
